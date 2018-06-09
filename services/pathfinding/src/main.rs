extern crate futures;
extern crate hyper;
extern crate protobuf;
extern crate tokio_core;

#[macro_use]
extern crate serde_json;

mod autopilot;
mod messages {
    pub mod interop;
    pub mod telemetry;
    pub mod pathfinding;
}

use futures::future;
use futures::future::Future;
use futures::stream::Stream;
use tokio_core::reactor::Core;

use autopilot::Autopilot;

fn main() {
    eprintln!("Initializing...");
    let mut core = Core::new().unwrap();
    let handle = core.handle().clone();
    let autopilot = Autopilot::new(&mut core);
    let addr = "0.0.0.0:7500".parse().unwrap();
    let server = hyper::server::Http::new().serve_addr_handle(&addr, &core.handle(),
        move || Ok(autopilot.clone())).unwrap();
    core.handle().spawn(server.for_each(move |connection| {
        handle.spawn(connection.map_err(|err| eprintln!("Error: {:?}", err)));
        Ok(())
    }).map_err(|_| ()));
    core.run(future::empty::<(),()>()).unwrap();
    // core.run(server).unwrap();
}
