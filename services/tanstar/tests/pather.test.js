import flightField1 from './fixtures/test1/flight-field1.json';
import plane1 from './fixtures/test1/plane1.json';
import mission1 from './fixtures/test1/mission1.json';

import Pather from '../src/pather';

const protobuf = require('protobufjs');

// TODO: Move these tests to service.test.js ("return mission 1 adjusted" etc.)

// Reused variables
var flightField;
var plane;
var mission;
var pather;

test('create protobufjs protos', async () => {
  // Load pathfinder.proto as a protobuffer
  const pathfinder = await protobuf.load('src/messages/pathfinder.proto');

  // Load FlightField type
  const FlightField = pathfinder.lookupType('pathfinder.FlightField');
  // Create a FlightField from a json file
  flightField = FlightField.fromObject(flightField1);

  // Load Plane type
  const Plane = pathfinder.lookupType('pathfinder.Plane');
  // Create a Plane from a json file
  plane = Plane.fromObject(plane1);

  // Load Mission type
  const Mission = pathfinder.lookupType('pathfinder.Mission');
  // Create a Mission from a json file
  mission = Mission.fromObject(mission1);
});

// Fill Pather with previously created protos
test('create and fill Pather', async () => {
  pather = new Pather();
  pather.setFlightField(flightField);
  pather.setPlane(plane);
  pather.setRawPath(mission);
});

// Tests Pather.fieldsToHex() and Pather.hexToFields() together
test('fields to hex to fields', async () => {
  // Convert Pather fields to hexadecimal encoding then convert back to protobufs
//  const fields = [flightField, plane, mission];
  const fieldsHex = pather.fieldsToHex();
  pather.missionHexToField(fieldsHex[2]);

  expect(pather.getAdjusted()).toEqual(pather.getRawPath());
});
