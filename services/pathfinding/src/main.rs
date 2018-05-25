extern crate protobuf;
extern crate Obstacle_Path_Finder;
extern crate hyper;
extern crate futures;
extern crate tokio_core;

mod messages { pub mod interop; pub mod telemetry; }

use std::{env,str};
use std::cell::RefCell;
use std::rc::Rc;
use std::thread;
use std::time::{Duration, SystemTime};

use protobuf::*;
use messages::telemetry::*;
use messages::interop::*;
use Obstacle_Path_Finder::{Obstacle, PathFinder, Plane, Point};

use futures::future::Future;
use futures::stream::Stream;
use hyper::client::Client;
use hyper::server::{Http, Request, Response, Service};
use hyper::header::{ContentLength, ContentType, Date};
use hyper::{Method, StatusCode, Uri};
use tokio_core::reactor::Core;

const PROTOCOL: &str = "http://";
const DEFAULT_TELEMETRY_URL: &str = "0.0.0.0:5000";
const DEFAULT_INTEROP_PROXY_URL: &str = "0.0.0.0:8000";

#[derive(Clone)]
struct Autopilot {
    telemetry_host: String,
    interop_proxy_host: String,
    pathfinder: Option<Rc<RefCell<PathFinder>>>
}

impl Autopilot {
    pub fn new() -> Autopilot {
        let mut autopilot = Autopilot {
            telemetry_host: PROTOCOL.to_string() + &env::var("TELEMETRY_URL").
                unwrap_or(String::from(DEFAULT_TELEMETRY_URL)),
            interop_proxy_host: PROTOCOL.to_string() + &env::var("INTEROP_PROXY_URL").
                unwrap_or(String::from(DEFAULT_INTEROP_PROXY_URL)),
            pathfinder: None
        };

        eprintln!("Getting flyzone...");

        let mission = autopilot.get_mission();
        let raw_flyzones = &mission.get_fly_zones();
        let mut flyzones = Vec::new();
        for i in 0..raw_flyzones.len() {
            let boundary = raw_flyzones[i].get_boundary();
            let mut flyzone = Vec::new();
            for j in 0..boundary.len() {
                flyzone.push(Point::from_degrees(boundary[j].lat, boundary[j].lon));
            }
            flyzones.push(flyzone);
        }
        let mut pathfinder = PathFinder::new(1.0, flyzones);
        let obstacle_list = autopilot.get_obstacles();
        pathfinder.set_obstacle_list(obstacle_list);
        autopilot.pathfinder = Some(Rc::new(RefCell::new(pathfinder)));

        eprintln!("Initialization complete.");
        autopilot
    }

    fn get<T: protobuf::MessageStatic>(&self, uri: Uri)
        -> Result<hyper::Chunk, hyper::Error> {
        let mut core = Core::new()?;
        let client = Client::new(&core.handle());
        let request = client.get(uri).and_then(|res| {
            eprintln!("{:?}", &res);
            res.body().concat2()
        });
        core.run(request)
        // core::parse_from_bytes::<T>(&response)
    }

    fn post(&self, uri: Uri, message: Vec<u8>)
        -> Result<(), hyper::Error> {
        let mut core = Core::new()?;
        let client = Client::new(&core.handle());
        let mut request = Request::new(Method::Post, uri);
        {
            let header = request.headers_mut();
            header.set(ContentType("application/x-protobuf".parse().unwrap()));
            header.set(ContentLength(message.len() as u64));
            header.set(Date(SystemTime::now().into()));
        }
        request.set_body(message);
        eprintln!("{:?}", request.headers());
        eprintln!("{:?}", request.body_ref().unwrap());
        eprintln!("{:?}", &request);
        let post = client.request(request);
        let response = core.run(post)?;
        eprintln!("{:?}", response);
        if response.status() != StatusCode::Ok {
            return Err(hyper::Error::Status)
        }
        Ok(())
    }

    fn get_object<T: protobuf::MessageStatic>(&self, uri: Uri) -> T {
        match self.get::<T>(uri.clone()) {
            Ok(res) => {
                eprintln!("{:?}", &res);
                parse_from_bytes::<T>(&res).unwrap()
            },
            Err(e) => {
                eprintln!("Error getting object: {}", e);
                eprintln!("Attempting connection in 20 seconds");
                thread::sleep(Duration::new(20, 0));
                parse_from_bytes::<T>(&self.get::<T>(uri).unwrap()).unwrap()
            }
        }
    }

    fn get_telemetry(&self) -> InteropTelem {
        let uri = format!("{}/api/interop-telem", self.telemetry_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_raw_mission(&self) -> RawMission {
        let uri = format!("{}/api/raw-mission", self.telemetry_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_mission(&self) -> InteropMission {
        let uri = format!("{}/api/mission", self.interop_proxy_host).parse().unwrap();
        self.get_object(uri)
    }

    fn get_obstacles(&self) -> Vec<Obstacle> {
        let uri = format!("{}/api/obstacles", self.interop_proxy_host).parse().unwrap();
        let obstacles : Obstacles = self.get_object(uri);
        let mut obstacle_list = Vec::new();
        for obstacle in obstacles.get_stationary() {
            obstacle_list.push(
                Obstacle{
                    coords: Point::from_degrees(
                        obstacle.get_pos().lat, obstacle.get_pos().lon),
                    radius: obstacle.radius as f32,
                    height: obstacle.height as f32}
            );
        }

        obstacle_list
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
            (&Method::Post, "/api/update_path") => {
                response.set_status(StatusCode::Ok);
                let raw_mission = self.get_raw_mission();
                println!("{:?}", &raw_mission);
                println!("missions length: {:?}", raw_mission.get_commands().len());
                for mission in raw_mission.get_commands() {
                    println!("{:?}", &mission);
                }
                println!("current; {:?}", raw_mission.get_next());
                let telemetry = self.get_telemetry();
                let pos = telemetry.get_pos();
                let pathfinder = self.pathfinder.clone().unwrap();
                // let path = pathfinder.borrow_mut().adjust_path(
                //     Plane::new(pos.lat, pos.lon, pos.alt_msl as f32));
                //
                // if let Some(path) = path {
                //     println!("A* Result");
                //     for node in path {
                //         println!("{:.5}, {:.5}", node.location.lat_degree(), node.location.lon_degree());
                //     }
                // }
                self.post_mission(raw_mission);
            }
            _ => {
                response.set_status(StatusCode::NotFound);
            }
        }
        Box::new(futures::future::ok(response))
    }
}

fn main() {
    println!("Initializing...");
    let autopilot = Autopilot::new();
    let addr = "0.0.0.0:7500".parse().unwrap();
    let server = Http::new().bind(&addr, move || Ok(autopilot.clone())).unwrap();
    server.run().unwrap();
}
