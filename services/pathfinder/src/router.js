import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';



// router: "routes" server endpoints

const router = new Router(); // creates new router instance

router.use(koaProtobuf.protobufSender()); // encodes outbound message as protobuff

const timeout = async (ctx, next) => {
  try{
    await next();
  } catch (err) {
    logger.error(err.message);
    ctx.status = 504 // figure out later
  }
};

let router = new Router(); // creates new router instance

router.use(koaProtobuf.protobufSender()); // encodes outbound message as protobuff

// need timeout error handling?

/*

get WPs from pixhawk through telemetry

<<<<<<< HEAD
gets:
- WPs

set:
- flyzone
- obstacle
- plane
- enemy
- waypoint

router.get('')
=======





>>>>>>> 32a6d2d0934943806087818f757568df9c96e4a0


*/
