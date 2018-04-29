import {
    Position, Rotation, Altitude,
    Velocity, Speed, CameraTelem
} from './messages/telemetry_pb';
import { AerialPosition, InteropTelem } from './messages/interop_pb';

export default class PlaneState {
    constructor() {
        this.lat = null;
        this.lon = null;
        this.altMSL = null;
        this.altAGL = null;
        this.vx = null;
        this.vy = null;
        this.vz = null;
        this.roll = null;
        this.pitch = null;
        this.yaw = null;
        this.airspeed = null;
        this.groundSpeed = null;
    }

    getPositionProto() {
        let pos = new Position();
        pos.setLat(this.lat);
        pos.setLon(this.lon);
        return pos;
    }

    getAerialPositionProto() {
        let aerpos = new AerialPosition();
        aerpos.setLat(this.lat);
        aerpos.setLon(this.lon);
        aerpos.setAltMsl(this.altMSL);
        return aerpos;
    }

    getRotationProto() {
        let rot = new Rotation();
        rot.setYaw(this.yaw);
        rot.setPitch(this.pitch);
        rot.setRoll(this.roll);
        return rot;
    }

    getAltitudeProto() {
        let alt = new Altitude();
        alt.setMsl(this.altMSL);
        alt.setAgl(this.altAGL);
        return alt;
    }

    getVelocityProto() {
        let vel = new Velocity();
        vel.setX(this.vx);
        vel.setY(this.vy);
        vel.setZ(this.vz);
        return vel;
    }

    getSpeedProto() {
        let speed = new Speed();
        speed.setAirspeed(this.airspeed);
        speed.setGroundSpeed(this.groundSpeed);
        return speed;
    }

    getInteropTelemProto() {
        let telem = new InteropTelem();
        // Unix time in seconds, with decimal precision
        telem.setTime(Date.now() / 1000);
        telem.setPos(this.getAerialPositionProto());
        telem.setYaw(this.yaw);
        return telem;
    }

    getCameraTelemProto() {
        let telem = new CameraTelem();
        telem.setTime(Date.now() / 1000);
        telem.setLat(this.lat);
        telem.setLon(this.lon);
        telem.setAlt(this.altAGL);
        telem.setYaw(this.yaw);
        telem.setPitch(this.pitch);
        telem.setRoll(this.roll);
        return telem;
    }

    /*
     * Returns whether or not enough telemetry data has been received.
     */
    isPopulated() {
        return !([this.lat, this.lon, this.yaw,
            this.roll, this.pitch, this.altAGL].includes(null));
    }
}
