let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { LocationWrapper, ObstacleWrapper, TConfigWrapper, WaypointWrapper } = require(String.raw`./snippets/pathfinder-c95de41a900aea80/src/wrap/pfwrapper.js`);
const { TextDecoder } = require(String.raw`util`);

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* A wrapper for `wasm-bindgen` to interact with
*
* Due to `wasm-bindgen`'s current inability to handle generic structures, the `pathfinder`
* and implementation definitions must be changed when the Pathfinder implementation changes.
*/
class PathfinderWrapper {

    static __wrap(ptr) {
        const obj = Object.create(PathfinderWrapper.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_pathfinderwrapper_free(ptr);
    }
    /**
    * @param {Tanstar} algo
    * @param {any} config
    * @param {Array<any>} flyzones
    * @param {Array<any>} obstacles
    */
    constructor(algo, config, flyzones, obstacles) {
        _assertClass(algo, Tanstar);
        var ptr0 = algo.ptr;
        algo.ptr = 0;
        var ret = wasm.pathfinderwrapper_new(ptr0, addHeapObject(config), addHeapObject(flyzones), addHeapObject(obstacles));
        return PathfinderWrapper.__wrap(ret);
    }
    /**
    * @param {any} plane
    * @param {Array<any>} wp_list
    * @returns {Array<any>}
    */
    getAdjustPath(plane, wp_list) {
        var ret = wasm.pathfinderwrapper_getAdjustPath(this.ptr, addHeapObject(plane), addHeapObject(wp_list));
        return takeObject(ret);
    }
    /**
    * @param {any} config
    */
    setConfig(config) {
        wasm.pathfinderwrapper_setConfig(this.ptr, addHeapObject(config));
    }
    /**
    * @param {Array<any>} flyzone
    */
    setFlyzone(flyzone) {
        wasm.pathfinderwrapper_setFlyzone(this.ptr, addHeapObject(flyzone));
    }
    /**
    * @param {Array<any>} obstacles
    */
    setObstacles(obstacles) {
        wasm.pathfinderwrapper_setObstacles(this.ptr, addHeapObject(obstacles));
    }
    /**
    * @returns {any}
    */
    get getConfig() {
        var ret = wasm.pathfinderwrapper_getConfig(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    getFlyzone() {
        var ret = wasm.pathfinderwrapper_getFlyzone(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    getObstacle() {
        var ret = wasm.pathfinderwrapper_getObstacle(this.ptr);
        return takeObject(ret);
    }
}
module.exports.PathfinderWrapper = PathfinderWrapper;
/**
*/
class Tanstar {

    static __wrap(ptr) {
        const obj = Object.create(Tanstar.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_tanstar_free(ptr);
    }
    /**
    * @returns {Tanstar}
    */
    static new() {
        var ret = wasm.tanstar_new();
        return Tanstar.__wrap(ret);
    }
    /**
    * Creates a `Tanstar` without intentions for timing
    *
    * Sets `start_time` to be the Unix epoch. This should be used when timing shouldn't be handled
    * by pathfinder.
    * @returns {Tanstar}
    */
    static untimed() {
        var ret = wasm.tanstar_untimed();
        return Tanstar.__wrap(ret);
    }
}
module.exports.Tanstar = Tanstar;

module.exports.__wbg_getLat_711eb4305bc9ce6e = function(arg0) {
    var ret = getObject(arg0).getLat();
    return ret;
};

module.exports.__wbg_getLon_bd5f57f9bd021eb7 = function(arg0) {
    var ret = getObject(arg0).getLon();
    return ret;
};

module.exports.__wbg_getAlt_7eb108d851f99ebc = function(arg0) {
    var ret = getObject(arg0).getAlt();
    return ret;
};

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbg_getLocation_acb4d002c6256261 = function(arg0) {
    var ret = getObject(arg0).getLocation();
    return addHeapObject(ret);
};

module.exports.__wbg_getRadius_4e3b19e9e7f5d873 = function(arg0) {
    var ret = getObject(arg0).getRadius();
    return ret;
};

module.exports.__wbg_getHeight_de080252c226accb = function(arg0) {
    var ret = getObject(arg0).getHeight();
    return ret;
};

module.exports.__wbg_getLocation_45306164486525e1 = function(arg0) {
    var ret = getObject(arg0).getLocation();
    return addHeapObject(ret);
};

module.exports.__wbg_getRadius_9e24b0143cefcdf0 = function(arg0) {
    var ret = getObject(arg0).getRadius();
    return ret;
};

module.exports.__wbg_newtconfigwrapper_5a6f8dca35c8f7bb = function(arg0, arg1, arg2, arg3, arg4) {
    var ret = new TConfigWrapper(arg0, arg1, arg2, arg3, arg4 !== 0);
    return addHeapObject(ret);
};

module.exports.__wbg_newlocationwrapper_2aa3cd4e7b2493ec = function(arg0, arg1, arg2) {
    var ret = new LocationWrapper(arg0, arg1, arg2);
    return addHeapObject(ret);
};

module.exports.__wbg_newwaypointwrapper_aa834bd0d9211732 = function(arg0, arg1) {
    var ret = new WaypointWrapper(takeObject(arg0), arg1);
    return addHeapObject(ret);
};

module.exports.__wbg_newobstaclewrapper_6625bc8225196bec = function(arg0, arg1, arg2) {
    var ret = new ObstacleWrapper(takeObject(arg0), arg1, arg2);
    return addHeapObject(ret);
};

module.exports.__wbg_getLocation_7105d9dbe1904c04 = function(arg0) {
    var ret = getObject(arg0).getLocation();
    return addHeapObject(ret);
};

module.exports.__wbg_getYaw_9831d31e91fe3748 = function(arg0) {
    var ret = getObject(arg0).getYaw();
    return ret;
};

module.exports.__wbg_getPitch_72337219bc2967e0 = function(arg0) {
    var ret = getObject(arg0).getPitch();
    return ret;
};

module.exports.__wbg_getRoll_9a252f7ff3a6db22 = function(arg0) {
    var ret = getObject(arg0).getRoll();
    return ret;
};

module.exports.__wbg_getAirspeed_c0e3c1ab2d9af9ae = function(arg0) {
    var ret = getObject(arg0).getAirspeed();
    return ret;
};

module.exports.__wbg_getGroundspeed_f900cb327243e6e0 = function(arg0) {
    var ret = getObject(arg0).getGroundspeed();
    return ret;
};

module.exports.__wbg_getWindDir_ca84b18a6503665a = function(arg0) {
    var ret = getObject(arg0).getWindDir();
    return ret;
};

module.exports.__wbg_getBufferSize_104973b4831e1fe3 = function(arg0) {
    var ret = getObject(arg0).getBufferSize();
    return ret;
};

module.exports.__wbg_getMaxProcessTime_2490b8fcc951a320 = function(arg0) {
    var ret = getObject(arg0).getMaxProcessTime();
    return ret;
};

module.exports.__wbg_getTurningRadius_6b56a698e93f971d = function(arg0) {
    var ret = getObject(arg0).getTurningRadius();
    return ret;
};

module.exports.__wbg_getVertexMergeThreshold_c610bcaf3fcc5975 = function(arg0) {
    var ret = getObject(arg0).getVertexMergeThreshold();
    return ret;
};

module.exports.__wbg_getVirtualizeFlyzone_54e264050501732c = function(arg0) {
    var ret = getObject(arg0).getVirtualizeFlyzone();
    return ret;
};

module.exports.__wbg_get_27693110cb44e852 = function(arg0, arg1) {
    var ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

module.exports.__wbg_length_079c4e509ec6d375 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_new_e13110f81ae347cf = function() {
    var ret = new Array();
    return addHeapObject(ret);
};

module.exports.__wbg_from_2a5d647e62275bfd = function(arg0) {
    var ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_push_b46eeec52d2b03bb = function(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'pathfinder_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

