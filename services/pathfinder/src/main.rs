extern crate pathfinder_service;

use pathfinder_service::start_service;

pub fn main() {
    // Todo: get port from env
    // Todo: config options w/defaults + from env
    let addr = "127.0.0.1:8085".parse().expect("Invalid address");

    start_service(&addr)
}
