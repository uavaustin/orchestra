use std::time::SystemTime;

use hyper::{Request, Response};
use hyper::header::{ContentLength, ContentType, Date, Headers};

pub trait HeaderPreset {
    fn set_json_header(&mut self, &String);
    fn set_protobuf_header(&mut self, &Vec<u8>);
}

impl HeaderPreset for Headers {
    fn set_json_header(&mut self, message: &String) {
        self.set(ContentType::json());
        self.set(ContentLength(message.len() as u64));
        self.set(Date(SystemTime::now().into()));
    }

    fn set_protobuf_header(&mut self, message: &Vec<u8>) {
        self.set(ContentType("application/x-protobuf".parse().unwrap()));
        self.set(ContentLength(message.len() as u64));
        self.set(Date(SystemTime::now().into()));
    }
}

impl HeaderPreset for Request {
    fn set_json_header(&mut self, message: &String) {
        self.headers_mut().set_json_header(message);
    }

    fn set_protobuf_header(&mut self, message: &Vec<u8>) {
        self.headers_mut().set_protobuf_header(message);
    }
}

impl HeaderPreset for Response {
    fn set_json_header(&mut self, message: &String) {
        self.headers_mut().set_json_header(message);
    }

    fn set_protobuf_header(&mut self, message: &Vec<u8>) {
        self.headers_mut().set_protobuf_header(message);
    }
}
