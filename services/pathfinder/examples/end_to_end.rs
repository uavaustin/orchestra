extern crate pathfinder_service;
#[macro_use] extern crate serde;

pub mod telemetry {
    include!(concat!(env!("OUT_DIR"), "/telemetry.rs"));
}

pub mod interop {
    include!(concat!(env!("OUT_DIR"), "/interop.rs"));
}

pub mod pathfinder_types {
    include!(concat!(env!("OUT_DIR"), "/pathfinder.rs"));
}

use std::io::Read;
use bytes::buf::IntoBuf;
use std::net::{IpAddr, Ipv4Addr, SocketAddr, TcpListener};
use pathfinder_service::start_service;
use reqwest::{Client, StatusCode};
use prost::Message;

const TELEMETRY_SERVICE_URL: &'static str = "127.0.0.1:5000";
const INTEROP_PROXY_URL: &'static str = "127.0.0.1:8000";

fn get_next_unused_port() -> Option<u16> {
    (1025..65535).find(|p| TcpListener::bind(("127.0.0.1", *p)).is_ok())
}

fn get_proto<T: Message + Default>(base_url: &str, uri: &str) -> Option<T> {
    println!("GET from {}", format!("http://{}/{}", base_url, uri));
    let mut resp = Client::new()
        .get(format!("http://{}/{}", base_url, uri).as_str())
        // .header("Accept", "application/x-protobuf")
        .send()
        .unwrap();

    let mut buf = Vec::new();
    resp.read_to_end(&mut buf).unwrap();
    Some(T::decode(&mut buf.into_buf()).unwrap())
}

fn get_proto_with_body<S: Message + Default, R: Message + Default>(base_url: &str, uri: &str, body: S) -> Option<R> {
    let mut buf = Vec::new();
    body.encode(&mut buf).unwrap();

    let mut resp = Client::new()
        .get(format!("http://{}/{}", base_url, uri).as_str())
        // .header("Accept", "application/x-protobuf")
        .header("Content-Type", "application/x-protobuf")
        .body(buf)
        .send()
        .unwrap();

    let mut buf = Vec::new();
    resp.read_to_end(&mut buf).unwrap();
    Some(R::decode(&mut buf.into_buf()).unwrap())
}

fn post_proto<T: Message>(base_url: &str, uri: &str, body: T) -> Option<StatusCode> {
    let mut buf = Vec::new();
    body.encode(&mut buf).unwrap();

    let resp = Client::new()
        .post(format!("http://{}/{}", base_url, uri).as_str())
        .header("Content-Type", "application/x-protobuf")
        .body(buf)
        .send()
        .unwrap();

    Some(resp.status())
}

fn roundtrip(pathfinder_service_base_url: &str) {
    let mission: telemetry::RawMission = get_proto(TELEMETRY_SERVICE_URL, "api/raw-mission").unwrap();
    let overview: telemetry::Overview = get_proto(TELEMETRY_SERVICE_URL, "api/overview").unwrap();

    let obstacles: interop::Obstacles = get_proto(INTEROP_PROXY_URL, "api/obstacles").unwrap();
    let flyzones: interop::InteropMission = get_proto(INTEROP_PROXY_URL, "api/mission").unwrap();
    let flyzones = flyzones.fly_zones;

    println!("mission: {:?}", mission);
    println!("overview: {:?}", overview);
    println!("obstacles: {:?}", obstacles);
    println!("flyzones: {:?}", flyzones);

    let request = pathfinder_types::Request {
        algorithm: String::from("tanstar"),
        buffer_size: 0.0,
        process_time: 0,
        flyzones,
        obstacles: Some(obstacles),
        mission: Some(mission),
        overview: Some(overview),
    };

    println!("request: {:#?}", request);

    // let response: pathfinder_types::Response = get_proto_with_body(pathfinder_service_base_url, "api/adjust_path", request).unwrap();

    // let new_mission = response.mission.unwrap();
    // post_proto(TELEMETRY_SERVICE_URL, "api/raw-mission", new_mission).unwrap();
}

fn main() {
    // Setup (start up the server):
    let ip = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
    let addr = SocketAddr::new(ip, get_next_unused_port().unwrap());

    std::thread::spawn(move || start_service(&addr));

    let pathfinder_service_base_url = format!("{}:{}", addr.ip(), addr.port());
    roundtrip(pathfinder_service_base_url.as_ref());
}