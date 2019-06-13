const interop = require('./proto/messages').interop;

const request = require('superagent');
const addProtobuf = require('superagent-protobuf');
addProtobuf(request);

async function generateWaypointFile(server) {
  console.log('QGC WPL 110');
  console.error('Getting mission...')
  const mission = (await request.get(`http://${server}/api/mission`)
    .proto(interop.InteropMission)
    .timeout(5000)).body;

  let index = 0;
  for (const pos of mission.waypoints) {
    const { current_wp, coord_frame, command, param1, param2, param3,
      param4, lon, lat, alt_msl, autocontinue } = {
        current_wp: index === 0 ? 1 : 0,
        coord_frame: 0, // MAV_FRAME_GLOBAL (WGS84 + MSL)
        command: 16, // MAV_CMD_NAV_WAYPOINT
        param1: 0, // hold time; not for fixed wing
        param2: 5, // acceptance radius; i dunno lol
        param3: 0, // pass radius (0 = pass through the WP)
        param4: 0, // desired yaw angle; not for fixed wing
        lat: pos.lat,
        lon: pos.lon,
        alt_msl: pos.alt_msl,
        autocontinue: 1
    };
    console.log(`${index}\t${current_wp}\t${coord_frame}\t${command}\t` +
                `${param1}\t${param2}\t${param3}\t${param4}\t${lon}\t` +
                `${lat}\t${alt_msl}\t${autocontinue}`);
    index++;
  }
  console.error('The suffering is complete. Enjoy your day!');
}

const server = process.argv[2];
if (!server) {
  console.error(`${process.argv[1]} <interop-host:port>`);
  console.error('Exports mission waypoints from the interop proxy to the ' +
                'prehistoric QGroundControl Waypoint file format.');
  console.error('It is a good idea to pipe the output to a text file.');
  console.error('\nDon\'t screw this up or else');
}

generateWaypointFile().catch((err) => {
  console.error(err);
  console.error('You screwed it up, bro!');
  process.exitCode = 1;
});
