import Service from '../src/service';

// data for service creation is hard-coded (for now) because
// docker environment has not been configured yet.
const service = new Service({
    port: process.env.PORT,
    serviceTimeout: process.env.SERVICE_TIMEOUT,
});
service.start();
