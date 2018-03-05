extern crate reqwest;
extern crate protobuf;
extern crate Obstacle_Path_Finder;

mod messages { pub mod interop; pub mod telemetry; }

use std::env;
use protobuf::*;
use reqwest::*;
use messages::telemetry::*;
use messages::interop::*;
use std::result;

const PROTOCOL: &str = "http://";
const DEFAULT_TELEMETRY_URL: &str = "127.0.0.1:5000";
const DEFAULT_INTEROP_PROXY_URL: &str = "127.0.0.1:8000";

type Result<T> = result::Result<T, String>;

fn heartbeat_test(host: &Url) -> Result<()> {
    let client = Client::new();

    let url = host.join("/api/alive").expect("Appending URL");
    let response = client.get(url).send();
    println!("raw = {:?}", response);
    let mut resp = response.expect("Response Error");

    assert!(resp.status().is_success());
    println!("resp = {:?}", resp.text());

    // println!("body = {}", body);
    Ok(())
}

fn get_raw_mission(host: &Url) -> Result<RawMission> {
    let client = Client::new();

    let url = host.join("/api/raw-mission").expect("Appending URL");
    let response = client.get(url).send();
    let mut resp = response.expect("Response Error");
    match core::parse_from_reader::<RawMission>(&mut resp) {
        Ok(resp) => Ok(resp),
        Err(e) => Err(e.to_string())
    }
}

fn get_telemetry(host: &Url) -> Result<InteropTelem> {
    let client = Client::new();

    let url = host.join("/api/interop-telem").expect("URL Error");
    let response = client.get(url).send();
    let mut resp = response.expect("Response Error");
    match core::parse_from_reader::<InteropTelem>(&mut resp) {
        Ok(resp) => Ok(resp),
        Err(e) => Err(e.to_string())
    }
}

fn get_obstacle(host: &Url) -> Result<Obstacles> {
    let client = Client::new();

    let url = host.join("/api/obstacles").expect("Apeending URL");
    let response = client.get(url).send();
    let mut resp = response.expect("Reponse Error");
    match core::parse_from_reader::<Obstacles>(&mut resp) {
        Ok(resp) => Ok(resp),
        Err(e) => Err(e.to_string())
    }
}

fn main() {
    let mut buffer = PROTOCOL.to_string() + &env::var("TELEMETRY_URL").unwrap_or(String::from(DEFAULT_TELEMETRY_URL));
    println!("{}", buffer);
    let telemtry_host = Url::parse(&buffer).unwrap();
    buffer = PROTOCOL.to_string() + &env::var("INTEROP_PROXY_URL").unwrap_or(String::from(DEFAULT_INTEROP_PROXY_URL));
    let interop_proxy_host = Url::parse(&buffer).unwrap();
    assert!(heartbeat_test(&telemtry_host).is_ok());
    assert!(get_raw_mission(&telemtry_host).is_ok());
    assert!(get_telemetry(&telemtry_host).is_ok());
    assert!(get_obstacle(&interop_proxy_host).is_ok());
}
