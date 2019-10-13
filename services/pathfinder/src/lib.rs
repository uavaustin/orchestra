#[macro_use]
extern crate tower_web;
extern crate tower_service;
extern crate prost;
extern crate pathfinder;

pub mod telemetry {
    include!(concat!(env!("OUT_DIR"), "/telemetry.rs"));
}

pub mod interop {
    include!(concat!(env!("OUT_DIR"), "/interop.rs"));
}

pub mod pathfinder_types {
    include!(concat!(env!("OUT_DIR"), "/pathfinder.rs"));
}

use std::hash::{Hash, Hasher};
use std::net::SocketAddr;
use pathfinder::{AlgorithmConstructor, AlgorithmConfig, AlgorithmAdjustPathQualified, Obstacle, Algorithm, Pathfinder, Waypoint, Location, Plane, Tanstar};
use std::sync::{Arc, Mutex};
use std::collections::{HashMap, LinkedList};
use crate::pathfinder_types::{Request, Response};
use tower_web::ServiceBuilder;
use tower_web_protobuf::{Proto, ProtobufMiddleware};

// type AlgoName = &'static str;
type AlgoName = String;
type AdjustReqCacheParams = (AlgoName, Vec<interop::interop_mission::FlyZone>, interop::Obstacles);

type ChoosenAlgorithm = Tanstar;
const ALGO: &'static str = "tanstar";

#[derive(Debug)]
struct Service {
    cache: Arc<Mutex<HashMap<AdjustReqCacheParams, Pathfinder<ChoosenAlgorithm>>>>,
    // pfinder: Pathfinder<ChoosenAlgorithm>,
    // yo: Arc<Mutex<RefCell<String>>>,
    // We're going to forfeit type safety for a bit..
    // cache: Arc<HashMap<AdjustReqCacheParams, Box<dyn Pathfinder>>>,
}


// Crimes:
impl Hash for interop::interop_mission::FlyZone {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.alt_msl_max.to_bits().hash(state);
        self.alt_msl_min.to_bits().hash(state);
        self.boundary.hash(state);
    }
}

impl Hash for interop::Position {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.lat.to_bits().hash(state);
        self.lon.to_bits().hash(state);
    }
}

impl Eq for interop::interop_mission::FlyZone { }

impl Hash for interop::Obstacles {
    fn hash<H: Hasher>(&self, state: &mut H) {
        // Specifically excluding time.
        self.stationary.hash(state)
    }
}

impl Hash for interop::obstacles::StationaryObstacle {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.pos.hash(state);
        self.height.to_bits().hash(state);
        self.radius.to_bits().hash(state);
    }
}

// todo: manually implement Eq/PartialEq for Obstacles and FlyZone
impl Eq for interop::Obstacles { }

// fn test(a: impl Algorithm) -> String {
//     let l: Vec<Box<dyn AlgorithmAdjustPathQualified<()>>> = Vec::new();

//     l.push(Box::new(&a as &AlgorithmAdjustPathQualified<()>));

//     String::from("yo")
// }

impl Service {
    fn new() -> Self {
        // let flyzones: Vec<Vec<Location>> = Vec::new();
        // let obstacles = Vec:

        Self {
            cache: Arc::new(Mutex::new(HashMap::new()))
            // pfinder: Pathfinder::new(ChoosenAlgorithm::new(), <ChoosenAlgorithm as Algorithm>::Config::default(), Vec::new(), Vec::new())
            // yo: Arc::new(Mutex::new(RefCell::new(String::from("hi"))))
        }
    }
}

type In<M> = Proto<M>;
type Out<M> = Result<Proto<M>, ()>;

type DefaultAlgo = pathfinder::Tanstar;

// fn coerce_to_pathfinder(p: &dyn Any) -> Pathfinder<impl Algorithm> {
//     match
// }

// enum Algos {
//     Tanstar(Pathfinder<Tanstar>),
// }

// struct QualifiedAlgorithm<A: Algorithm, W> {
//     inner: A,
//     _waypoint: PhantomData<W>,
// }

// // trait QualifiedAlgorithm<A: Algorithm, W> {
// //     fn inner(&sef) -> &inner
// // }

// // impl<A: Algorithm, W: Sized> QualifiedAlgorithm<A, W> for A { }

// impl<A: Algorithm, W> Algorithm for QualifiedAlgorithm<A, W> {
//     type Config = A::Config;
// }

// impl<A: Algorithm, W> Deref for QualifiedAlgorithm<A, W> {
//     type Target = A;

//     fn deref(&self) -> &Self::Target {
//         &self.inner
//     }
// }

// fn map(name: String) -> Box<dyn QualifiedAlgorithm> {

// }

// fn test(p: Box<QualifiedAlgorithm<Box<dyn Algorithm<Config = Box<dyn Any>>>, Box<dyn Any>>>) {

// }

// fn get_algorithm(name: String) -> impl Algorithm {
//     // match string_to_type(name) {
//     //     pathfinder::Algos::TanStar(t) =>
//     // }
//     string_to_ctor(name)
// }

// fn demystify_algo_type(alg: impl Algorithm)

// Should eventually use env variables (and optional fields in the protobuf message) to configure the algorithm
// for now, just uses defaults.
// fn init_pathfinder<A: Algorithm>() -> Pathfinder<A> {

// }

trait LocalInto<Target> {
    fn alt_into(self) -> Target;
}

trait LocalFrom<Source> {
    fn alt_from(source: Source) -> Self;
}

impl<S, T: LocalFrom<S>> LocalInto<T> for S {
    fn alt_into(self) -> T {
        <T as LocalFrom<S>>::alt_from(self)
    }
}

impl LocalFrom<interop::interop_mission::FlyZone> for Vec<Location> {
    fn alt_from(flyzone: interop::interop_mission::FlyZone) -> Self {
        let alt = flyzone.alt_msl_max as f32; // TODO: resolve f32
        // let locs = Vec::new();

        flyzone.boundary.iter().map(|p| Location::from_degrees(p.lat, p.lon, alt)).collect()
    }
}

impl<Target: LocalFrom<Source>, Source: Clone> LocalFrom<&Source> for Target {
    fn alt_from(source: &Source) -> Target {
        <Target as LocalFrom<Source>>::alt_from(source.clone())
    }
}

impl LocalFrom<Vec<interop::interop_mission::FlyZone>> for Vec<Vec<Location>> {
    fn alt_from(flyzones: Vec<interop::interop_mission::FlyZone>) -> Self {
        flyzones.iter().map(LocalInto::<Vec<Location>>::alt_into).collect()
    }
}

impl LocalFrom<interop::Obstacles> for Vec<Obstacle> {
    fn alt_from(obstacles: interop::Obstacles) -> Self {
        obstacles.stationary.iter().map(LocalInto::alt_into).collect()
    }
}

impl LocalFrom<interop::obstacles::StationaryObstacle> for Obstacle {
    fn alt_from(obstacle: interop::obstacles::StationaryObstacle) -> Self {
        let pos = obstacle.pos.unwrap(); // TODO: use TryFrom

        // TODO: resolve f64 -> f32
        Obstacle::from_degrees(pos.lon, pos.lat, obstacle.radius as f32, obstacle.height as f32)
    }
}

impl LocalFrom<crate::pathfinder_types::Plane> for pathfinder::Plane {
    fn alt_from(plane: crate::pathfinder_types::Plane) -> Self {
        let pos = plane.pos.unwrap();
        let alt = plane.alt.unwrap(); // Using MSL for now, verify
        let rot = plane.rot.unwrap();

        // TODO: resolve f64 -> f32
        Self::from_degrees(pos.lon, pos.lat, alt.msl as f32).yaw(rot.yaw as f32)
    }
}

// fn raw_mission_to_waypoints(mission: telemetry::RawMission, overview: telemetry::Overview) -> LinkedList<Waypoint<telemetry::raw_mission::RawMissionItem>> {
//     // Set last_pos to the plane's current position to start with:
//     let mut last_pos = {
//         (Location::from_degrees(overview.pos.unwrap().lat, overview.pos.unwrap().lon, overview.alt.unwrap().msl as f32), overview.alt.unwrap().msl)
//     };

//     for item in mission.mission_items.iter() {
//         item
//     }
// }

impl_web! {
    impl Service {
        #[get("/api/adjust_path")]
        fn adjust_path(&self, req: In<Request>) -> Out<Response>{
            let req_params = (req.algorithm.clone(), req.flyzones.clone(), req.obstacles.clone());

            let pathfinder = Pathfinder::new(
                ChoosenAlgorithm::new(),
                <ChoosenAlgorithm as Algorithm>::Config::default(),
                req.flyzones.clone().alt_into(),
                req.obstacles.clone().unwrap().alt_into()
            );

            let plane = req.overview.unwrap().alt_into();
            let waypoints = raw_mission_to_waypoints(req.mission, req.plane);

            let mut cache = self.cache.lock().unwrap();

            // *cache.entry(req_params).or_insert_with(|| {
            //     Pathfinder::new(ChoosenAlgorithm::new(), <ChoosenAlgorithm as Algorithm>::Config::default(), path.flyzones.alt_into(), )
            // })

            // pathfinder::ALGORITHMS;
            // let mut pathfinder = Pathfinder::new(Algo, <Algo as Algorithm>::Config());
            // pathfinder.init(5.0, flyzone, obstacles);

            // match path.mission {
            //     Some(ref p) => {
            //         let a = &p.mission_items;
            //         let mut index: u32 = 0;
            //         let mut waypoints: LinkedList<Waypoint<_>> = LinkedList::new();
            //         for i in a{
            //             waypoints.push_back(Waypoint::new(index, Location::from_radians(i.x.into(), i.y.into(), i.z.into()), i.param_2));
            //             index = index + 1;
            //         }
            //         println!("Calculated Waypoints");
            //         let result = pathfinder.get_adjust_path(
            //                 Plane::from_degrees(30.32298, -97.60310, 100.0),
            //                 waypoints);
            //         Ok(Response{mission:path.mission.clone(), time_to_adjust:0.0}.into())
            //     },
            //     None => {
            //         println!("Uh oh");
            //         Err(())
            //     },
            // }
            Err(())
        }
    }
}

pub fn start_service(addr: &SocketAddr) {
    println!("Listening on http://{}", addr);

    ServiceBuilder::new()
        .resource(Service::new())
        .middleware(ProtobufMiddleware::new(true, true))
        .run(&addr)
        .unwrap();
}