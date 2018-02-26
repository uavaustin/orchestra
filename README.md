# Orchestra

Implementation-level repository for UAV Austin. Communications between
different runtime services are managed here.

# Building Services

This repository heavily depends on Docker. Make sure both Docker and Docker
Compose (which is used for testing) are installed on your machine.

To build all the images at once, simply run `make` in the top-level directory.
If you would like to build specific images, you can either pass the name of the
service (e.g. `make interop-proxy`) or you can call `make` from inside the
service's directory. Note that calling `make` from the service directory does
not ensure that build-time prerequisites are satisfied.

When Docker images are being created, the `services/` directory is being used
as the build context each time, this is because the images depend on things in
the `services/common/` directory.

Docker flags can be passed into `make` in case you need to configure the
building process a bit. For example, to prevent using the cache when building,
you can run `make DOCKERFLAGS=--no-cache`.

# Testing

There are two kinds of tests in the repository:

- Unit tests can be found inside some of the service directories.

  Running `make test` inside those directories will run the tests.

- An end-to-end test configuration can be found in `test/`.

  Services there are set up to mock a real runtime setup. To start all the
  containers at once, you can run `docker-compose up` from inside the `test`
  directory. See the [`docker-compose` documentation](
  https://docs.docker.com/compose/reference/push/) for more options.

  Images must be built with `make` before running this suite.

# Directory Structure

- `services/` - location of all the services, for descriptions of each service,
  see the README located inside each sub-folder.
- `test/` - end-to-end test configuration with services on one large network.
- `tools/` - contains prerequisites for building containers.
