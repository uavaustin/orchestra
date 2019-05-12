#[macro_use]
extern crate tower_web;
extern crate tower_service;
extern crate prost;
extern crate pathfinder as realPathfinder;

use tower_web::ServiceBuilder;
use tower_web_protobuf::{Proto, ProtobufMiddleware};
use std::collections::LinkedList;

pub mod telemetry {
    include!(concat!(env!("OUT_DIR"), "/telemetry.rs"));
}

pub mod interop {
    include!(concat!(env!("OUT_DIR"), "/interop.rs"));
}

pub mod pathfinder {
    include!(concat!(env!("OUT_DIR"), "/pathfinder.rs"));
}

use crate::pathfinder::{Request, Response};

#[derive(Clone, Debug)]
struct HelloWorld;
type In<M> = Proto<M>;
type Out<M> = Result<Proto<M>, ()>;

impl_web! {
    impl HelloWorld {
        #[get("/do_a_thing/")]
        fn pathy(&self, path: In<Request>) -> Out<Response>{
            let flyzone = vec!(vec!(
                realPathfinder::Location::from_degrees(30.32469, -97.60466, 0f32),
                realPathfinder::Location::from_degrees(30.32437, -97.60367, 0f32),
                realPathfinder::Location::from_degrees(30.32356, -97.60333, 0f32)
            ));
            let obstacles = vec!(
                realPathfinder::Obstacle::from_degrees(30.32228, -97.60198, 50f32, 10f32)
            );

            let mut pathfinder = realPathfinder::Pathfinder::new();
            pathfinder.init(5.0, flyzone, obstacles);

            match path.mission {
                Some(ref p) => {
                    let a = &p.mission_items;
                    let mut index: u32 = 0;
                    let mut waypoints: LinkedList<realPathfinder::Waypoint> = LinkedList::new();
                    for i in a{
                        waypoints.push_back(realPathfinder::Waypoint::new(index, realPathfinder::Location::from_radians(i.x.into(), i.y.into(), i.z.into()), i.param_2));
                        index = index + 1;
                    }
                    println!("Calculated Waypoints");
                    let result = pathfinder.get_adjust_path(
                            realPathfinder::Plane::from_degrees(30.32298, -97.60310, 100.0),
                            waypoints);
                    Ok(Response{mission:path.mission.clone(), time_to_adjust:0.0}.into())
                },
                None => {
                    println!("Uh oh");
                    Err(())
                },
            }

        }
    }
}

pub fn main() {
    let addr = "127.0.0.1:8085".parse().expect("Invalid address");
    println!("Listening on http://{}", addr);

    ServiceBuilder::new()
        .resource(HelloWorld)
        .middleware(ProtobufMiddleware::new(true, true))
        .run(&addr) 
        .unwrap();
}
