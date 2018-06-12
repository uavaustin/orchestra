extern crate pathfinder;

mod header_preset;

use std::cell::RefCell;
use std::collections::LinkedList;
use std::rc::Rc;
use std::time::Duration;
use std::{env, io, str, thread};

use futures::{future, Future, Stream};
use hyper::header::Accept;
use hyper::server::Service;
use hyper::{self, Client, Method, Request, Response, StatusCode, Uri};
use serde_json;
use tokio_core::reactor::{Core, Handle};

use self::header_preset::HeaderPreset;
use self::pathfinder::{Obstacle, Pathfinder, Plane, Point, Waypoint};
use messages::interop::*;
use messages::pathfinding::*;
use messages::telemetry::*;
use protobuf::{self, *};

const PROTOCOL: &str = "http://";
const DEFAULT_TELEMETRY_URL: &str = "0.0.0.0:5000";
const DEFAULT_INTEROP_PROXY_URL: &str = "0.0.0.0:8000";

#[derive(Clone)]
pub struct Autopilot {
    handle: Handle,
    telemetry_host: String,
    interop_proxy_host: String,
    pathfinder: Rc<RefCell<Pathfinder>>,
}

impl Autopilot {
    pub fn new(core: &mut Core) -> Autopilot {
        let autopilot = Autopilot {
            handle: core.handle(),
            telemetry_host: PROTOCOL.to_string()
                + &env::var("TELEMETRY_URL").unwrap_or(String::from(DEFAULT_TELEMETRY_URL)),
            interop_proxy_host: PROTOCOL.to_string()
                + &env::var("INTEROP_PROXY_URL").unwrap_or(String::from(DEFAULT_INTEROP_PROXY_URL)),
            pathfinder: Rc::new(RefCell::new(Pathfinder::new())),
        };

        let object_requests = autopilot.get_mission().join(autopilot.get_obstacles());
        let (mission, obstacles) = core.run(object_requests).unwrap();
        let raw_flyzones = &mission.get_fly_zones();
        let mut flyzones = Vec::new();
        for i in 0..raw_flyzones.len() {
            let boundary = raw_flyzones[i].get_boundary();
            let mut flyzone = Vec::new();
            for j in 0..boundary.len() {
                flyzone.push(Point::from_degrees(boundary[j].lat, boundary[j].lon, 0f32));
            }
            flyzones.push(flyzone);
        }

        {
            let mut pathfinder = autopilot.pathfinder.borrow_mut();
            pathfinder.init(5f32, flyzones, obstacles);
        }
        eprintln!("Initialization complete.");
        autopilot
    }

    // #TODO implement redialing after timeout
    fn get(&self, uri: Uri) -> Box<Future<Item = hyper::Chunk, Error = hyper::Error>> {
        let client = Client::new(&self.handle);
        Box::new(client.get(uri).and_then(|res| res.body().concat2()))
    }

    fn post(&self, request: Request) -> Box<Future<Item = (), Error = hyper::Error>> {
        let client = Client::new(&self.handle);
        Box::new(client.request(request).and_then(|res| {
            if res.status() != StatusCode::Ok {
                return Err(hyper::Error::Status);
            }
            Ok(())
        }))
    }

    fn get_object<T: protobuf::MessageStatic>(
        &self,
        uri: Uri,
    ) -> Box<Future<Item = T, Error = io::Error>> {
        Box::new(self.get(uri).then(|res| {
            match res {
                Ok(res) => parse_from_bytes::<T>(&res)
                    .map_err(|err| io::Error::new(io::ErrorKind::Other, err.to_string())),
                Err(err) => {
                    eprintln!("Error getting object: {}", err);
                    Err(io::Error::new(io::ErrorKind::Other, err.to_string()))
                }
            }
        }))
    }

    fn get_current(&self) -> Box<Future<Item = u64, Error = io::Error>> {
        let uri = format!("{}/api/current-waypoint", self.telemetry_host)
            .parse()
            .unwrap();
        Box::new(self.get(uri).then(|res| {
            let json: Result<serde_json::Value, _>;
            match res {
                Ok(res) => json = serde_json::from_slice(&res).map_err(|err| io::Error::from(err)),
                Err(err) => {
                    eprintln!("Error getting current waypoint: {}", err);
                    return Err(io::Error::new(io::ErrorKind::Other, err.to_string()));
                }
            }
            match json {
                Ok(val) => val["seq"]
                    .as_u64()
                    .ok_or(io::Error::new(io::ErrorKind::Other, "Error parsing json")),
                Err(err) => Err(err),
            }
        }))
    }

    fn get_telemetry(&self) -> Box<Future<Item = InteropTelem, Error = io::Error>> {
        let uri = format!("{}/api/interop-telem", self.telemetry_host)
            .parse()
            .unwrap();
        self.get_object(uri)
    }

    fn get_raw_mission(&self) -> Box<Future<Item = RawMission, Error = io::Error>> {
        let uri = format!("{}/api/raw-mission", self.telemetry_host)
            .parse()
            .unwrap();
        self.get_object(uri)
    }

    fn get_mission(&self) -> Box<Future<Item = InteropMission, Error = io::Error>> {
        let uri = format!("{}/api/mission", self.interop_proxy_host)
            .parse()
            .unwrap();
        self.get_object(uri)
    }

    fn get_obstacles(&self) -> Box<Future<Item = Vec<Obstacle>, Error = io::Error>> {
        let uri = format!("{}/api/obstacles", self.interop_proxy_host)
            .parse()
            .unwrap();
        let res: Box<Future<Item = Obstacles, Error = io::Error>> = self.get_object(uri);
        Box::new(res.then(|obstacles| match obstacles {
            Ok(obstacles) => {
                let mut obstacle_list = Vec::new();
                for obstacle in obstacles.get_stationary() {
                    obstacle_list.push(Obstacle::from_degrees(
                        obstacle.get_pos().lat,
                        obstacle.get_pos().lon,
                        obstacle.radius as f32,
                        obstacle.height as f32,
                    ));
                }

                Ok(obstacle_list)
            }
            Err(err) => Err(err),
        }))
    }

    #[allow(dead_code)]
    fn post_current(&self, seq: u32) -> Box<Future<Item = (), Error = hyper::Error>> {
        let uri: Uri = format!("{}/api/current-waypoint", self.telemetry_host)
            .parse()
            .unwrap();
        let mut request = Request::new(Method::Post, uri);
        let body = json!({ "seq": seq }).to_string();
        request.set_json_header(&body);
        request.set_body(body);
        self.post(request)
    }

    fn post_mission(&self, message: RawMission) -> Box<Future<Item = (), Error = hyper::Error>> {
        let uri: Uri = format!("{}/api/raw-mission", self.telemetry_host)
            .parse()
            .unwrap();
        let mut request = Request::new(Method::Post, uri);
        let body = message.write_to_bytes().unwrap();
        request.set_protobuf_header(&body);
        request.set_body(body);
        self.post(request)
    }

    fn parse_waypoint(&self, raw_mission: &RawMission, current: u32) -> LinkedList<Waypoint> {
        let mut waypoints = LinkedList::new();
        let mut iter: Box<Iterator<Item = &RawMission_RawMissionItem>>;
        if raw_mission
            .get_mission_items()
            .iter()
            .any(|mission| mission.current == 1)
        {
            iter = Box::new(
                raw_mission
                    .get_mission_items()
                    .iter()
                    .skip_while(|mission| mission.current == 0),
            );
        } else {
            let mut start = 1;
            if current != 0 {
                start = current;
            } else {
                eprintln!("No current set, defaulting to first waypoint");
            }
            iter = Box::new(raw_mission.get_mission_items().iter().skip(start as usize));
        }

        while let Some(mission) = iter.next() {
            if mission.command != 16 {
                continue;
            }
            waypoints.push_back(Waypoint::from_degrees(
                mission.seq,
                mission.x as f64,
                mission.y as f64,
                mission.z,
                mission.param_2,
            ));
        }

        waypoints
    }

    fn extend_command(
        &self,
        seq: u32,
        waypoint: &Waypoint,
        command: &RawMission_RawMissionItem,
    ) -> RawMission_RawMissionItem {
        let mut new: RawMission_RawMissionItem = command.clone();
        new.seq = seq;
        new.x = waypoint.location.lat_degree() as f32;
        new.y = waypoint.location.lon_degree() as f32;
        new.z = waypoint.location.alt();
        new
    }

    fn update_mission(&self, path: &LinkedList<Waypoint>, mission: &mut RawMission) -> u32 {
        let mut new_mission: Vec<RawMission_RawMissionItem> = Vec::new();
        let mut seq = 0;
        let mut cur = 0;
        {
            let mut iter = path.iter();
            let mut current_wp;
            match iter.next() {
                Some(wp) => current_wp = wp,
                None => return cur,
            }
            for command in mission.get_mission_items().iter() {
                let mut new_command = command.clone();
                new_command.set_seq(seq);
                while command.seq == current_wp.index {
                    new_mission.push(self.extend_command(seq, &current_wp, &command));

                    // currrent already inherited from extension
                    if command.current == 1 {
                        new_command.set_current(0);
                        cur = seq;
                    }

                    seq += 1;
                    match iter.next() {
                        Some(wp) => current_wp = wp,
                        None => break,
                    }
                }

                new_command.set_seq(seq);
                seq += 1;
                new_mission.push(new_command);
            }
        }

        mission.set_mission_items(RepeatedField::from_vec(new_mission));
        cur
    }

    fn process_mission(
        &self,
        mut raw_mission: RawMission,
        telemetry: InteropTelem,
        current_wp: u32,
    ) -> Box<Future<Item = Response, Error = hyper::Error>> {
        let mut response = Response::new();
        response.set_status(StatusCode::Ok);
        eprintln!("Objects retrieved.");

        if raw_mission.get_mission_items().len() == 0 {
            eprintln!("Empty Mission.");
            response.set_status(StatusCode::PreconditionFailed);
            response.set_body("Empty Mission");
            return Box::new(future::ok(response));
        }

        eprintln!("Initial mission:");
        for mission in raw_mission.get_mission_items() {
            eprintln!("{:?}", mission);
        }
        eprintln!();

        let pos = telemetry.get_pos();
        let mut pathfinder = self.pathfinder.borrow_mut();
        let waypoints = self.parse_waypoint(&raw_mission, current_wp);
        let path = pathfinder.get_adjust_path(
            Plane::from_degrees(pos.lat, pos.lon, pos.alt_msl as f32),
            waypoints,
        );
        let current = self.update_mission(&path, &mut raw_mission);

        eprintln!("Processed mission:");
        for mission in raw_mission.get_mission_items() {
            eprintln!("{:?}", mission);
        }
        eprintln!();

        // let mut future = self.post_mission(raw_mission);
        // if current_wp != 0 && current != current_wp {
        //     future = Box::new(self.post_current(current).and_then(|_| future));
        // }

        Box::new(self.post_mission(raw_mission).then(|res| {
            if res.is_err() {
                let errlog = format!("Failed to post mission: {}", res.unwrap_err());
                eprintln!("{}", errlog);
                response.set_status(StatusCode::ServiceUnavailable);
                response.set_body(errlog);
            } else {
                eprintln!("Path updated.");
            }
            future::ok(response)
        }))

        // Box::new(future::ok(response))
    }
}

impl Service for Autopilot {
    type Request = Request;
    type Response = Response;
    type Error = hyper::Error;
    type Future = Box<Future<Item = Self::Response, Error = Self::Error>>;

    fn call(&self, req: Request) -> Self::Future {
        let mut response = Response::new();
        response.set_status(StatusCode::BadRequest);

        match (req.method(), req.path()) {
            (&Method::Get, "/api/alive") => {
                response.set_status(StatusCode::Ok);
                response.set_body("Alive and well!");
            }
            (&Method::Post, "/api/update-path") => {
                let autopilot = self.clone();
                eprintln!("Retrieving objects...");
                return Box::new(
                    self.get_raw_mission()
                        .join3(self.get_telemetry(), self.get_current())
                        .then(move |res| {
                            match res {
                                Ok(result) => {
                                    let (mission, telemetry, current) = result;
                                    return autopilot.process_mission(
                                        mission,
                                        telemetry,
                                        current as u32,
                                    );
                                }
                                Err(err) => {
                                    let errlog = format!("Failed to get objects: {}", err);
                                    eprintln!("{}", errlog);
                                    response.set_status(StatusCode::PreconditionFailed);
                                    response.set_body(errlog);
                                }
                            }

                            Box::new(future::ok(response))
                        }),
                );
            }
            (&Method::Get, "/api/pathfinder-parameter") => {
                let process_time = self.pathfinder.borrow().get_process_time();
                if let Some(accept) = req.headers().get::<Accept>() {
                    if accept.eq(&Accept::json()) {
                        let json = json!({ "process_time": process_time }).to_string();
                        response.set_json_header(&json);
                        response.set_status(StatusCode::Ok);
                        response.set_body(json);
                    }
                } else {
                    let mut param = PathfinderParameter::new();
                    param.set_process_time(process_time);
                    let body = param.write_to_bytes().unwrap();
                    response.set_protobuf_header(&body);
                    response.set_status(StatusCode::Ok);
                    response.set_body(body);
                }
            }
            (&Method::Post, "/api/pathfinder-parameter") => {
                if let Ok(body) = req.body().concat2().wait() {
                    if let Ok(param) = parse_from_bytes::<PathfinderParameter>(&body) {
                        response.set_status(StatusCode::Ok);
                        self.pathfinder
                            .borrow_mut()
                            .set_process_time(param.get_process_time());
                    }
                }
            }
            _ => {
                response.set_status(StatusCode::NotFound);
            }
        }
        Box::new(future::ok(response))
    }
}
