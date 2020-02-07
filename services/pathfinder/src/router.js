import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';



// router: "routes" server endpoints

let router = new Router(); // creates new router instance

router.use(koaProtobuf.protobufSender()); // encodes outbound message as protobuff

// need timeout error handling?

/*

get WPs from pixhawk through telemetry








*/
