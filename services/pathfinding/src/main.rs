extern crate protobuf;
extern crate Obstacle_Path_Finder;
extern crate hyper;
extern crate futures;
extern crate tokio_core;

mod messages { pub mod interop; pub mod telemetry; }

use std::{env,str};
use protobuf::*;
use messages::telemetry::*;
use messages::interop::*;

use futures::future::Future;
use futures::stream::Stream;
use hyper::client::Client;
use hyper::server::{Http, Request, Response, Service};
use hyper::{Method, StatusCode, Uri};
use tokio_core::reactor::Core;

const PROTOCOL: &str = "http://";
const DEFAULT_TELEMETRY_URL: &str = "0.0.0.0:5000";
const DEFAULT_INTEROP_PROXY_URL: &str = "0.0.0.0:8000";

struct Autopilot {
    telemetry_host: String,
    interop_proxy_host: String
}

impl Autopilot {
    fn get_object<T: protobuf::MessageStatic>(&self, uri: Uri) -> Result<T, hyper::Error> {
        let mut core = Core::new()?;
        let client = Client::new(&core.handle());
        let request = client.get(uri).and_then(|res| {
            res.body().concat2()
        });
        let response = core.run(request)?;
        match core::parse_from_bytes::<T>(&response) {
            Ok(res) => Ok(res),
            Err(_e) => Err(hyper::Error::Incomplete)
        }
    }

    fn get_telemetry(&self) -> Result<InteropTelem, hyper::Error> {
        let uri = format!("{}/api/interop-telem", self.telemetry_host).parse()?;
        self.get_object(uri)
    }

    fn get_mission(&self) -> Result<InteropMission, hyper::Error> {
        let uri = format!("{}/api/mission", self.interop_proxy_host).parse()?;
        self.get_object(uri)
    }

    fn get_obstacles(&self) -> Result<Obstacles, hyper::Error> {
        let uri = format!("{}/api/obstacles", self.interop_proxy_host).parse()?;
        self.get_object(uri)
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
                let obj1 = self.get_obstacles();
                let obj2 = self.get_telemetry();
                let obj3 = self.get_mission();
                println!("{:?}\n{:?}\n{:?}", obj1, obj2, obj3);
            }
            _ => {
                response.set_status(StatusCode::NotFound);
            }
        }
        Box::new(futures::future::ok(response))
    }
}

fn main() {
    let addr = "0.0.0.0:7500".parse().unwrap();
    let server = Http::new().bind(&addr, || Ok(Autopilot {
        telemetry_host: PROTOCOL.to_string() + &env::var("TELEMETRY_URL").
            unwrap_or(String::from(DEFAULT_TELEMETRY_URL)),
        interop_proxy_host: PROTOCOL.to_string() + &env::var("INTEROP_PROXY_URL").
            unwrap_or(String::from(DEFAULT_INTEROP_PROXY_URL))
    })).unwrap();
    server.run().unwrap();
}
