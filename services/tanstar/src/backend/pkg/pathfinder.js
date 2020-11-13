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

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

function logError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            let error = (function () {
                try {
                    return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
                } catch(_) {
                    return "<failed to stringify thrown value>";
                }
            }());
            console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
            throw e;
        }
    };
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error('expected a boolean argument');
    }
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error('expected a number argument');
}
/**
*/
module.exports.init_panic_hook = function() {
    wasm.init_panic_hook();
};

let WASM_VECTOR_LEN = 0;

let cachegetNodeBufferMemory0 = null;
function getNodeBufferMemory0() {
    if (cachegetNodeBufferMemory0 === null || cachegetNodeBufferMemory0.buffer !== wasm.memory.buffer) {
        cachegetNodeBufferMemory0 = Buffer.from(wasm.memory.buffer);
    }
    return cachegetNodeBufferMemory0;
}

function passStringToWasm0(arg, malloc) {

    if (typeof(arg) !== 'string') throw new Error('expected a string argument');

    const len = Buffer.byteLength(arg);
    const ptr = malloc(len);
    getNodeBufferMemory0().write(arg, ptr, len);
    WASM_VECTOR_LEN = len;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
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
        if (algo.ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
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
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        var ret = wasm.pathfinderwrapper_getAdjustPath(this.ptr, addHeapObject(plane), addHeapObject(wp_list));
        return takeObject(ret);
    }
    /**
    * @param {any} config
    */
    set config(config) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        wasm.pathfinderwrapper_set_config(this.ptr, addHeapObject(config));
    }
    /**
    * @param {Array<any>} flyzone
    */
    set flyzone(flyzone) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        wasm.pathfinderwrapper_set_flyzone(this.ptr, addHeapObject(flyzone));
    }
    /**
    * @param {Array<any>} obstacles
    */
    set obstacles(obstacles) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        wasm.pathfinderwrapper_set_obstacles(this.ptr, addHeapObject(obstacles));
    }
    /**
    * @returns {any}
    */
    get get_config() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        var ret = wasm.pathfinderwrapper_get_config(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    get get_flyzone() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        var ret = wasm.pathfinderwrapper_get_flyzone(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    get get_obstacle() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        var ret = wasm.pathfinderwrapper_get_obstacle(this.ptr);
        return takeObject(ret);
    }
}
module.exports.PathfinderWrapper = PathfinderWrapper;
/**
*/
class Tanstar {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

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

module.exports.__wbg_newlocationwrapper_2aa3cd4e7b2493ec = logError(function(arg0, arg1, arg2) {
    var ret = new LocationWrapper(arg0, arg1, arg2);
    return addHeapObject(ret);
});

module.exports.__wbg_getlat_711eb4305bc9ce6e = logError(function(arg0) {
    var ret = getObject(arg0).get_lat;
    return ret;
});

module.exports.__wbg_getlon_bd5f57f9bd021eb7 = logError(function(arg0) {
    var ret = getObject(arg0).get_lon;
    return ret;
});

module.exports.__wbg_getalt_7eb108d851f99ebc = logError(function(arg0) {
    var ret = getObject(arg0).get_alt;
    return ret;
});

module.exports.__wbg_newobstaclewrapper_6625bc8225196bec = logError(function(arg0, arg1, arg2) {
    var ret = new ObstacleWrapper(getObject(arg0), arg1, arg2);
    return addHeapObject(ret);
});

module.exports.__wbg_location_acb4d002c6256261 = logError(function(arg0) {
    var ret = getObject(arg0).location;
    return addHeapObject(ret);
});

module.exports.__wbg_radius_4e3b19e9e7f5d873 = logError(function(arg0) {
    var ret = getObject(arg0).radius;
    return ret;
});

module.exports.__wbg_getheight_de080252c226accb = logError(function(arg0) {
    var ret = getObject(arg0).get_height;
    return ret;
});

module.exports.__wbg_location_7105d9dbe1904c04 = logError(function(arg0) {
    var ret = getObject(arg0).location;
    return addHeapObject(ret);
});

module.exports.__wbg_getyaw_9831d31e91fe3748 = logError(function(arg0) {
    var ret = getObject(arg0).get_yaw;
    return ret;
});

module.exports.__wbg_getpitch_72337219bc2967e0 = logError(function(arg0) {
    var ret = getObject(arg0).get_pitch;
    return ret;
});

module.exports.__wbg_getroll_9a252f7ff3a6db22 = logError(function(arg0) {
    var ret = getObject(arg0).get_roll;
    return ret;
});

module.exports.__wbg_getairspeed_c0e3c1ab2d9af9ae = logError(function(arg0) {
    var ret = getObject(arg0).get_airspeed;
    return ret;
});

module.exports.__wbg_getgroundspeed_f900cb327243e6e0 = logError(function(arg0) {
    var ret = getObject(arg0).get_groundspeed;
    return ret;
});

module.exports.__wbg_windDir_ca84b18a6503665a = logError(function(arg0) {
    var ret = getObject(arg0).windDir;
    return ret;
});

module.exports.__wbg_newtconfigwrapper_5a6f8dca35c8f7bb = logError(function(arg0, arg1, arg2, arg3, arg4) {
    var ret = new TConfigWrapper(arg0, arg1, arg2, arg3, arg4 !== 0);
    return addHeapObject(ret);
});

module.exports.__wbg_bufferSize_104973b4831e1fe3 = logError(function(arg0) {
    var ret = getObject(arg0).bufferSize;
    return ret;
});

module.exports.__wbg_maxProcessTime_2490b8fcc951a320 = logError(function(arg0) {
    var ret = getObject(arg0).maxProcessTime;
    return ret;
});

module.exports.__wbg_turningRadius_6b56a698e93f971d = logError(function(arg0) {
    var ret = getObject(arg0).turningRadius;
    return ret;
});

module.exports.__wbg_vertexMergeThreshold_c610bcaf3fcc5975 = logError(function(arg0) {
    var ret = getObject(arg0).vertexMergeThreshold;
    return ret;
});

module.exports.__wbg_virtualizeFlyzone_54e264050501732c = logError(function(arg0) {
    var ret = getObject(arg0).virtualizeFlyzone;
    _assertBoolean(ret);
    return ret;
});

module.exports.__wbg_newwaypointwrapper_aa834bd0d9211732 = logError(function(arg0, arg1) {
    var ret = new WaypointWrapper(getObject(arg0), arg1);
    return addHeapObject(ret);
});

module.exports.__wbg_location_45306164486525e1 = logError(function(arg0) {
    var ret = getObject(arg0).location;
    return addHeapObject(ret);
});

module.exports.__wbg_radius_9e24b0143cefcdf0 = logError(function(arg0) {
    var ret = getObject(arg0).radius;
    return ret;
});

module.exports.__wbg_new_e13110f81ae347cf = logError(function() {
    var ret = new Array();
    return addHeapObject(ret);
});

module.exports.__wbg_get_27693110cb44e852 = logError(function(arg0, arg1) {
    var ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
});

module.exports.__wbg_from_2a5d647e62275bfd = logError(function(arg0) {
    var ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
});

module.exports.__wbg_length_079c4e509ec6d375 = logError(function(arg0) {
    var ret = getObject(arg0).length;
    _assertNum(ret);
    return ret;
});

module.exports.__wbg_push_b46eeec52d2b03bb = logError(function(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    _assertNum(ret);
    return ret;
});

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbg_error_4bb6c2a97407129a = logError(function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
});

module.exports.__wbg_new_59cb74e423758ede = logError(function() {
    var ret = new Error();
    return addHeapObject(ret);
});

module.exports.__wbg_stack_558ba5917b466edd = logError(function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
});

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'pathfinder_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

