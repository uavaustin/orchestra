/* tslint:disable */
/* eslint-disable */
/**
*/
export function init_panic_hook(): void;
/**
* A wrapper for `wasm-bindgen` to interact with
*
* Due to `wasm-bindgen`'s current inability to handle generic structures, the `pathfinder`
* and implementation definitions must be changed when the Pathfinder implementation changes.
*/
export class PathfinderWrapper {
  free(): void;
/**
* @param {Tanstar} algo
* @param {any} config
* @param {Array<any>} flyzones
* @param {Array<any>} obstacles
*/
  constructor(algo: Tanstar, config: any, flyzones: Array<any>, obstacles: Array<any>);
/**
* @param {any} plane
* @param {Array<any>} wp_list
* @returns {Array<any>}
*/
  getAdjustPath(plane: any, wp_list: Array<any>): Array<any>;
/**
* @param {any} config
*/
  config: any;
/**
* @param {Array<any>} flyzone
*/
  flyzone: Array<any>;
/**
* @returns {any}
*/
  readonly get_config: any;
/**
* @returns {Array<any>}
*/
  readonly get_flyzone: Array<any>;
/**
* @returns {Array<any>}
*/
  readonly get_obstacle: Array<any>;
/**
* @param {Array<any>} obstacles
*/
  obstacles: Array<any>;
}
/**
*/
export class Tanstar {
  free(): void;
/**
* @returns {Tanstar}
*/
  static new(): Tanstar;
/**
* Creates a `Tanstar` without intentions for timing
*
* Sets `start_time` to be the Unix epoch. This should be used when timing shouldn't be handled
* by pathfinder.
* @returns {Tanstar}
*/
  static untimed(): Tanstar;
}
