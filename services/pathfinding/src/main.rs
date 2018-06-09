extern crate protobuf;
extern crate pathfinder;
extern crate hyper;
extern crate futures;
extern crate tokio_core;

#[macro_use]
extern crate serde_json;

mod messages {
    pub mod interop;
    pub mod telemetry;
    pub mod pathfinding;
}

use std::{env, str, thread};
use std::cell::RefCell;
use std::collections::LinkedList;
use std::io;
use std::rc::Rc;
use std::time::{Duration, SystemTime};

use protobuf::*;
use messages::telemetry::*;
use messages::interop::*;
use messages::pathfinding::*;
use pathfinder::{Obstacle, Pathfinder, Plane, Point, Waypoint};

use futures::future;
use futures::future::Future;
use futures::stream::Stream;
use hyper::client::Client;
use hyper::server::{Http, Request, Response, Service};
use hyper::header::{Accept, ContentLength, ContentType, Date, Headers};
use hyper::{Method, StatusCode, Uri};
use tokio_core::reactor::{Core, Handle};

const PROTOCOL: &str = "http://";
const DEFAULT_TELEMETRY_URL: &str = "0.0.0.0:5000";
const DEFAULT_INTEROP_PROXY_URL: &str = "0.0.0.0:8000";

fn set_json_header(header: &mut Headers, message: &String) {
    header.set(ContentType::json());
    header.set(ContentLength(message.len() as u64));
    header.set(Date(SystemTime::now().into()));
}

fn set_protobuf_header(header: &mut Headers, message: &Vec<u8>) {
    header.set(ContentType("application/x-protobuf".parse().unwrap()));
    header.set(ContentLength(message.len() as u64));
    header.set(Date(SystemTime::now().into()));
}

#[derive(Clone)]
struct Autopilot {
    handle: Handle,
    telemetry_host: String,
    interop_proxy_host: String,
    pathfinder: Rc<RefCell<Pathfinder>>
}

impl Autopilot {
    pub fn new(core: &mut Core) -> Autopilot {
        let autopilot = Autopilot {
            handle: core.handle(),
            telemetry_host: PROTOCOL.to_string() + &env::var("TELEMETRY_URL").
                unwrap_or(String::from(DEFAULT_TELEMETRY_URL)),
            interop_proxy_host: PROTOCOL.to_string() + &env::var("INTEROP_PROXY_URL").
                unwrap_or(String::from(DEFAULT_INTEROP_PROXY_URL)),
            pathfinder: Rc::new(RefCell::new(Pathfinder::new()))
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
            // Test data
            // println!("flyzone:");
            // for flyzone in &flyzones {
            //     for point in flyzone {
            //         println!("{:.5}, {:.5}", point.lat_degree(), point.lon_degree());
            //     }
            // }
            //
            // println!("obstacles");
            // for obstacle in &obstacles {
            //     println!("{:.5}, {:.5}", obstacle.coords.lat_degree(), obstacle.coords.lon_degree());
            // }

            // let flyzones = vec!(vec!(
            //     Point::from_degrees(30.32521, -97.6023, 0f32),
            //     Point::from_degrees(30.32466, -97.59856, 0f32),
            //     Point::from_degrees(30.32107, -97.60032, 0f32),
            //     Point::from_degrees(30.32247, -97.60325, 0f32),
            //     Point::from_degrees(30.32473, -97.6041, 0f32)
            // ));
            // let obstacles = vec!(
            //     Obstacle{coords: Point::from_degrees(30.32457, -97.60254, 0f32), radius: 50.0, height: 1.0},
            //     Obstacle{coords: Point::from_degrees(30.32429, -97.60166, 0f32), radius: 50.0, height: 1.0},
            //     Obstacle{coords: Point::from_degrees(30.32405, -97.60015, 0f32), radius: 50.0, height: 1.0},
            //     Obstacle{coords: Point::from_degrees(30.32344, -97.60077, 0f32), radius: 50.0, height: 1.0},
            //     Obstacle{coords: Point::from_degrees(30.32466, -97.60327, 0f32), radius: 50.0, height: 1.0}
            // );

            let mut pathfinder = autopilot.pathfinder.borrow_mut();
            pathfinder.init(1.0, flyzones, obstacles);
        }
        eprintln!("Initialization complete.");
        autopilot
    }

    // #TODO implement redialing after timeout
    fn get(&self, uri: Uri)
        -> Box<Future<Item = hyper::Chunk, Error = hyper::Error>> {
        let client = Client::new(&self.handle);
        Box::new(client.get(uri).and_then(|res| {
            res.body().concat2()
        }))
    }

    fn post(&self, request: Request) -> Box<Future<Item = (), Error = hyper::Error>> {
        let client = Client::new(&self.handle);
        Box::new(client.request(request).and_then(|res| {
            if res.status() != StatusCode::Ok {
                return Err(hyper::Error::Status)
            }
            Ok(())
        }))
    }

    fn get_object<T: protobuf::MessageStatic>(&self, uri: Uri) ->
        Box<Future<Item = T, Error = io::Error>> {
        Box::new(self.get(uri).then(|res| {
            match res {
                Ok(res) => parse_from_bytes::<T>(&res).map_err(|err| {
                    io::Error::new(io::ErrorKind::Other, err.to_string())
                }),
                Err(err) => {
                    eprintln!("Error getting object: {}", err);
                    Err(io::Error::new(io::ErrorKind::Other, err.to_string()))
                }
            }
        }))
    }

    fn get_current(&self) -> Box<Future<Item = u64, Error = io::Error>> {
        let uri = format!("{}/api/current-waypoint", self.telemetry_host).parse().unwrap();
        Box::new(self.get(uri).then(|res| {
            let json: Result<serde_json::Value, _>;
            match res {
                Ok(res) => json = serde_json::from_slice(&res).map_err(|err| {
                    io::Error::from(err)
                }),
                Err(err) => {
                    eprintln!("Error getting current waypoint: {}", err);
                    return Err(io::Error::new(io::ErrorKind::Other, err.to_string()))
                }
            }
            match json {
                Ok(val) => val["seq"].as_u64().ok_or(
                    io::Error::new(io::ErrorKind::Other, "Error parsing json")
                ),
                Err(err) => Err(err)
            }
        }))
    }

    fn get_telemetry(&self) -> Box<Future<Item = InteropTelem, Error = io::Error>> {
        let uri = format!("{}/api/interop-telem", self.telemetry_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_raw_mission(&self) -> Box<Future<Item = RawMission, Error = io::Error>> {
        let uri = format!("{}/api/raw-mission", self.telemetry_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_mission(&self) -> Box<Future<Item = InteropMission, Error = io::Error>> {
        let uri = format!("{}/api/mission", self.interop_proxy_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_obstacles(&self) -> Box<Future<Item = Vec<Obstacle>, Error = io::Error>> {
        let uri = format!("{}/api/obstacles", self.interop_proxy_host).parse().unwrap();
        let res: Box<Future<Item = Obstacles, Error = io::Error>> = self.get_object(uri);
        Box::new(res.then(|obstacles| {
            match obstacles {
                Ok(obstacles) => {
                    let mut obstacle_list = Vec::new();
                    for obstacle in obstacles.get_stationary() {
                        obstacle_list.push(
                            Obstacle::from_degrees(
                                obstacle.get_pos().lat,
                                obstacle.get_pos().lon,
                                obstacle.radius as f32,
                                obstacle.height as f32
                            )
                        );
                    }

                    Ok(obstacle_list)
                }
                Err(err) => Err(err)
            }
        }))
    }

    fn post_current(&self, seq: u32) -> Box<Future<Item = (), Error = hyper::Error>> {
        let uri: Uri = format!("{}/api/current-waypoint", self.telemetry_host).parse().unwrap();
        let mut request = Request::new(Method::Post, uri);
        let body = json!({
            "seq": seq
        }).to_string();
        set_json_header(request.headers_mut(), &body);
        request.set_body(body);
        self.post(request)
    }

    fn post_mission(&self, message: RawMission) -> Box<Future<Item = (), Error = hyper::Error>> {
        let uri: Uri = format!("{}/api/raw-mission", self.telemetry_host).parse().unwrap();
        let mut request = Request::new(Method::Post, uri);
        let body = message.write_to_bytes().unwrap();
        set_protobuf_header(request.headers_mut(), &body);
        request.set_body(body);
        self.post(request)
    }

    fn parse_waypoint(&self, raw_mission: &RawMission, current: u32)
        -> LinkedList<Waypoint> {
        let mut waypoints = LinkedList::new();
        let mut iter: Box<Iterator<Item = &RawMission_RawMissionItem>>;
        if raw_mission.get_mission_items().iter().any(|mission| mission.current == 1) {
            iter = Box::new(raw_mission.get_mission_items()
            .iter().skip_while(|mission| mission.current == 0));
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
                mission.param_2
            ));
        }

        waypoints
    }

    fn extend_command(&self, seq: u32, waypoint: &Waypoint, command: &RawMission_RawMissionItem)
        -> RawMission_RawMissionItem {
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
                None => return cur
            }
            for command in mission.get_mission_items().iter() {
                // println!("{}", seq);
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
                        None => {
                            break
                        }
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

    fn process_mission(&self, mut raw_mission: RawMission, telemetry: InteropTelem, current_wp: u32)
        -> Box<Future<Item = Response, Error = hyper::Error>> {
        let mut response = Response::new();
        response.set_status(StatusCode::Ok);

        // let mut wp0 = RawMission_RawMissionItem::new();
        // wp0.seq = 0;
        // wp0.command = 16;
        // let mut wp1 = RawMission_RawMissionItem::new();
        // wp1.seq = 1;
        // wp1.command = 16;
        // wp1.x = 30.322280883789063;
        // wp1.y = -97.60298156738281;
        // wp1.z = 100f32;
        // wp1.param_2 = 10f32;
        // let mut wp2 = RawMission_RawMissionItem::new();
        // wp2.seq = 2;
        // wp2.command = 16;
        // wp2.x = 30.322280883789063;
        // wp2.y = -97.60098266601564;
        // wp2.z = 150f32;
        // wp2.param_2 = 10f32;
        // let test_mission = vec!(wp0, wp1, wp2);
        // raw_mission.set_mission_items(RepeatedField::from_vec(test_mission));

        if raw_mission.get_mission_items().len() == 0 {
            eprintln!("Empty Mission.");
            response.set_status(StatusCode::PreconditionFailed);
            response.set_body("Empty Mission");
            return Box::new(future::ok(response));
        }

        println!("Before");
        println!("Current waypoint: {}", current_wp);
        for mission in raw_mission.get_mission_items() {
            println!("{:?}", mission);
        }
        println!();

        let pos = telemetry.get_pos();
        // println!("{:?}", pos);
        let mut pathfinder = self.pathfinder.borrow_mut();
        let waypoints = self.parse_waypoint(&raw_mission, current_wp);
        // println!("Waypoint Inputs");
        // for waypoint in &waypoints {
        //     println!("{} {:?} {}", waypoint.index, waypoint.location, waypoint.radius);
        // }
        let path = pathfinder.get_adjust_path(
            Plane::from_degrees(pos.lat, pos.lon, pos.alt_msl as f32),
            waypoints
        );

        // println!("A* Result");
        // for node in path {
        //     println!("{} {:.5}, {:.5} {:.5}",node.index, node.location.lat_degree(), node.location.lon_degree(), node.location.alt());
        // }

        let current = self.update_mission(&path, &mut raw_mission);

        println!("After");
        println!("Current waypoint: {}", current);
        for mission in raw_mission.get_mission_items() {
            println!("{:?}", mission);
        }
        println!();

        let mut future = self.post_mission(raw_mission);
        if current != current_wp {
            future = Box::new(self.post_current(current).and_then(|_| future));
        }

        Box::new(future.then(|res| {
            if res.is_err() {
                let errlog = format!("Failed to post mission: {}",
                res.unwrap_err());
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
    type Future = Box<Future<Item=Self::Response, Error=Self::Error>>;

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
                    self.get_raw_mission().join3(self.get_telemetry(), self.get_current())
                    .then(move |res| {
                    match res {
                        Ok(result) => {
                            let (mission, telemetry, current) = result;
                            return autopilot.process_mission(mission, telemetry, current as u32);
                        }
                        Err(err) => {
                            let errlog = format!("Failed to get objects: {}", err);
                            eprintln!("{}", errlog);
                            response.set_status(StatusCode::PreconditionFailed);
                            response.set_body(errlog);
                        }
                    }

                    Box::new(future::ok(response))
                }));
            }
            (&Method::Get, "/api/pathfinder-parameter") => {
                let process_time = self.pathfinder.borrow().get_process_time();
                if let Some(accept) = req.headers().get::<Accept>() {
                    if accept.eq(&Accept::json()) {
                        let json = json!({
                            "process_time": process_time
                        }).to_string();
                        set_json_header(response.headers_mut(), &json);
                        response.set_status(StatusCode::Ok);
                        response.set_body(json);
                    }
                } else {
                    let mut param = PathfinderParameter::new();
                    param.set_process_time(process_time);
                    let body = param.write_to_bytes().unwrap();
                    set_protobuf_header(response.headers_mut(), &body);
                    response.set_status(StatusCode::Ok);
                    response.set_body(body);
                }
            }
            (&Method::Post, "/api/pathfinder-parameter") => {
                if let Ok(body) = req.body().concat2().wait() {
                    if let Ok(param) = parse_from_bytes::<PathfinderParameter>(&body) {
                        response.set_status(StatusCode::Ok);
                        self.pathfinder.borrow_mut().set_process_time(param.get_process_time());
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

fn main() {
    eprintln!("Initializing...");
    let mut core = Core::new().unwrap();
    let handle = core.handle().clone();
    let autopilot = Autopilot::new(&mut core);
    let addr = "0.0.0.0:7500".parse().unwrap();
    let server = Http::new().serve_addr_handle(&addr, &core.handle(),
        move || Ok(autopilot.clone())).unwrap();
    core.handle().spawn(server.for_each(move |connection| {
        handle.spawn(connection.map_err(|err| eprintln!("Error: {:?}", err)));
        Ok(())
    }).map_err(|_| ()));
    core.run(future::empty::<(),()>()).unwrap();
    // core.run(server).unwrap();
}
