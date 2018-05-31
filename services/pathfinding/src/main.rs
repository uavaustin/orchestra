extern crate protobuf;
extern crate Obstacle_Path_Finder;
extern crate hyper;
extern crate futures;
extern crate tokio_core;

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
use Obstacle_Path_Finder::{Obstacle, PathFinder, Plane, Point};

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

#[derive(Clone)]
struct Autopilot {
    handle: Handle,
    telemetry_host: String,
    interop_proxy_host: String,
    pathfinder: Rc<RefCell<PathFinder>>
}

impl Autopilot {
    pub fn new(core: &mut Core) -> Autopilot {
        let autopilot = Autopilot {
            handle: core.handle(),
            telemetry_host: PROTOCOL.to_string() + &env::var("TELEMETRY_URL").
                unwrap_or(String::from(DEFAULT_TELEMETRY_URL)),
            interop_proxy_host: PROTOCOL.to_string() + &env::var("INTEROP_PROXY_URL").
                unwrap_or(String::from(DEFAULT_INTEROP_PROXY_URL)),
            pathfinder: Rc::new(RefCell::new(PathFinder::new()))
        };

        let object_requests = autopilot.get_mission().join(autopilot.get_obstacles());
        let (mission, obstacles) = core.run(object_requests).unwrap();
        println!("{:?}", mission);
        // eprintln!("Getting mission...");
        // let mission = autopilot.get_mission();
        // eprintln!("Getting flyzone...");
        // let raw_flyzones = &mission.get_fly_zones();
        // let mut flyzones = Vec::new();
        // for i in 0..raw_flyzones.len() {
        //     let boundary = raw_flyzones[i].get_boundary();
        //     let mut flyzone = Vec::new();
        //     for j in 0..boundary.len() {
        //         flyzone.push(Point::from_degrees(boundary[j].lat, boundary[j].lon));
        //     }
        //     flyzones.push(flyzone);
        // }
        //
        // {
        //     let mut pathfinder = autopilot.pathfinder.borrow_mut();
        //     pathfinder.init(1.0, flyzones);
        //     let obstacle_list = autopilot.get_obstacles();
        //     pathfinder.set_obstacle_list(obstacle_list);
        // }
        eprintln!("Initialization complete.");
        autopilot
    }

    fn set_handle(&mut self, handle: Handle) {
        self.handle = handle;
    }

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

    fn get(&self, uri: Uri)
        -> Box<Future<Item = hyper::Chunk, Error = hyper::Error>> {
        let client = Client::new(&self.handle);
        let mut request = client.get(uri).and_then(|res| {
            res.body().concat2()
        });

        Box::new(request)
        // core.run(request)
    }

    fn post(&self, uri: Uri, message: Vec<u8>)
        -> Result<(), hyper::Error> {
        let client = Client::new(&self.handle);
        let mut request = Request::new(Method::Post, uri);
        Autopilot::set_protobuf_header(request.headers_mut(), &message);
        request.set_body(message);

        let post = client.request(request).wait()?;
        // let response = core.run(post)?;
        if post.status() != StatusCode::Ok {
            return Err(hyper::Error::Status)
        }
        Ok(())
    }

    fn get_object<T: protobuf::MessageStatic>(&self, uri: Uri) ->
        Box<Future<Item = T, Error = ProtobufError>> {
        let res = self.get(uri.clone());
        let obj: Box<Future<Item = T, Error = ProtobufError>>;
        Box::new(res.then(|res| {
            match res {
                Ok(res) => parse_from_bytes::<T>(&res),
                Err(err) => {
                    eprintln!("Error getting object: {}", err);
                    Err(ProtobufError::IoError(io::Error::new(io::ErrorKind::Other, err.to_string())))
                    // eprintln!("Attempting connection in 20 seconds");
                    // thread::sleep(Duration::from_secs(20));
                    // self.get(uri).then(|res| {
                    //     match res {
                    //         Ok(res) => parse_from_bytes::<T>(&res),
                    //         Err(err) => Err(ProtobufError::IoError)
                    //     }
                    // })
                }
            }
        }))
    }

    fn get_telemetry(&self) -> Box<Future<Item = InteropTelem, Error = ProtobufError>> {
        let uri = format!("{}/api/interop-telem", self.telemetry_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_raw_mission(&self) -> Box<Future<Item = RawMission, Error = ProtobufError>> {
        let uri = format!("{}/api/raw-mission", self.telemetry_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_mission(&self) -> Box<Future<Item = InteropMission, Error = ProtobufError>> {
        let uri = format!("{}/api/mission", self.interop_proxy_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_obstacles(&self) -> Box<Future<Item = Vec<Obstacle>, Error = ProtobufError>> {
        let uri = format!("{}/api/obstacles", self.interop_proxy_host).parse().unwrap();
        let res: Box<Future<Item = Obstacles, Error = ProtobufError>> = self.get_object(uri);
        Box::new(res.then(|obstacles| {
            match obstacles {
                Ok(obstacles) => {
                    let mut obstacle_list = Vec::new();
                    for obstacle in obstacles.get_stationary() {
                        obstacle_list.push(
                            Obstacle{
                                coords: Point::from_degrees(
                                    obstacle.get_pos().lat, obstacle.get_pos().lon),
                                radius: obstacle.radius as f32,
                                height: obstacle.height as f32
                            }
                        );
                    }

                    Ok(obstacle_list)
                }
                Err(err) => Err(err)
            }
        }))
    }

    fn post_mission(&self, message: RawMission) {
        let uri: Uri = format!("{}/api/raw-mission", self.telemetry_host).parse().unwrap();
        let body = message.write_to_bytes().unwrap();
        match self.post(uri.clone(), body.clone()) {
            Ok(res) => res,
            Err(e) => {
                eprintln!("Error posting mission: {}", e);
                eprintln!("Attempting connection in 20 seconds");
                thread::sleep(Duration::new(20, 0));
                self.post(uri, body).unwrap();
            }
        }
    }
}

impl Service for Autopilot {
    type Request = Request;
    type Response = Response;
    type Error = hyper::Error;
    type Future = Box<Future<Item=Self::Response, Error=Self::Error>>;

    fn call(&self, req: Request) -> Self::Future {
        let mut response = Response::new();
        match (req.method(), req.path()) {
            (&Method::Get, "/api/alive") => {
                response.set_body("Alive and well!");
            }
            (&Method::Post, "/api/update-path") => {
                let pathfinder = self.pathfinder.clone();
                return Box::new(self.get_raw_mission().join(self.get_telemetry()).then(move |res| {
                    match res {
                        Ok(result) => {
                            response.set_status(StatusCode::Ok);
                            let (raw_mission, telemetry) = result;
                            if raw_mission.get_mission_items().len() == 0 {
                                eprintln!("Empty Mission.");
                                response.set_status(StatusCode::PreconditionFailed);
                                response.set_body("Empty Mission");
                            } else {
                                println!("Mission Received:");
                                println!("{:?}", &raw_mission);
                                println!("missions length: {:?}", raw_mission.get_mission_items().len());
                                for mission in raw_mission.get_mission_items() {
                                    println!("{:?}", &mission);
                                }
                                let pos = telemetry.get_pos();
                                let mut path_ref = pathfinder.borrow_mut();
                                let path = path_ref.get_adjust_path(
                                    Plane::new(pos.lat, pos.lon, pos.alt_msl as f32),
                                    LinkedList::new()
                                );

                        //         if let Some(path) = path {
                        //             println!("A* Result");
                        //             for node in path {
                        //                 println!("{:.5}, {:.5}", node.location.lat_degree(), node.location.lon_degree());
                        //             }
                        //         }
                        //         let commands = raw_mission.mut_mission_items();
                        //
                        //         self.post_mission(raw_mission);
                        //             println!("Done!");
                            }
                        }
                        Err(_err) => {
                            response.set_status(StatusCode::PreconditionFailed);
                        }
                    }

                    future::ok(response)
                }));
            }
            (&Method::Get, "/api/pathfinder-parameter") => {
                let process_time = self.pathfinder.borrow().get_process_time();
                if let Some(accept) = req.headers().get::<Accept>() {
                    if accept.eq(&Accept::json()) {
                        let json = format!("{{\"process_time\": \"{}\"}}", process_time.to_string());
                        Autopilot::set_json_header(response.headers_mut(), &json);
                        response.set_body(json);
                    }
                } else {
                    let mut param = PathfinderParameter::new();
                    param.set_process_time(process_time);
                    let body = param.write_to_bytes().unwrap();
                    Autopilot::set_protobuf_header(response.headers_mut(), &body);
                    response.set_body(body);
                }
            }
            (&Method::Post, "/api/pathfinder-parameter") => {
                response.set_status(StatusCode::BadRequest);
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
    let mut autopilot = Autopilot::new(&mut core);
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
