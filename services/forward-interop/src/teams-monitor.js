import { interop, stats } from './messages';
import LinkedList from 'linkedlist';

/**
 * Provides team telemetry information for the tanstar service.
 * Team information fed upon each fetch in service.
 *
 * Rates are given over 1 and 5 seconds before the rate is requested
 * and both a raw rate and one for only fresh telemetry are
 * available.
 */
export default class TeamMonitor {
    /**
     * Create a new TeamMonitor.
     */
    constructor(telemLength) {
      this._teams = Map();
      this._telemLength = telemLength;
    }

    updateTeams(interopTeams) {
      let mapping = this._teams;
      for (let interopTeam of interopTeams) {
        
        // Generalized function for assigning, in case
        // we want to add more stuff to keep track of
        const assignProps = (obj, ...props) => {
          let assignee = {};
          for (let prop of props) {
            assignee[prop] = obj[prop];
          }
          return assignee;
        };
        
        let teamID = assignProps(
          interopTeam, 
          'id', 
          'username', 
          'name', 
          'university'
        );
        
        let telemDeque;
        // Hash key using stringified JSON, do not track if not in air
        if (mapping.has(JSON.stringify(teamID) && interopTeam.in_air)) {
          // Not the first time receiving info about the team, update
          telemDeque = mapping.get(teamID.toString());
          this._addTelem(telemDeque, interopTeams.telem);
        } else if (interopTeam.in_air) {
          // First time receiving info, new list
          telemDeque = new LinkedList();
          telemDeque.push(interopTeams.telem);
          mapping.set(teamID.toString(), telemDeque);
        }
      }
    }

    _addTelem(telemDeque, teamTelem){
      // Check for uniqueness
      const checkUnique = (obj1, obj2, ...props) => {
        for (let prop of props){
          if (obj1[prop] == obj2[prop])
            return false;
        }
        return true;
      }

      // Check between this teamTelem and the most recent teamTelem
      // which is always at the head of the linked list.
      fresh = checkUnique(
        teamTelem, 
        telemDeque.head, 
        'id', 
        'age_sec', 
        'timestamp'
      );
      if (!fresh)
        return;
    
      // Check if telemetry data is too long, if so, then trim
      if (telemDeque.length > this._telemLength)
        telemDeque.pop();
      telemDeque.shift(teamTelem);

    }
  
    /**
     * Feed new telemetry to the monitor.
     *
     * @param {Object} telem
     * @param {number} telem.lat
     * @param {number} telem.lon
     * @param {number} telem.alt_msl
     * @param {number} telem.yaw
     */
    addTelem(telem) {
      this._times1.push(time());
      this._times5.push(time());
  
      // Check if any updates were made to the telemety.
      if (this._isFresh(telem)) {
        this._fresh1.push(true);
        this._fresh5.push(true);
  
        // Record this telemetry as the new last.
        this._last = JSON.parse(JSON.stringify(telem));
      } else {
        this._fresh1.push(false);
        this._fresh5.push(false);
      }
  
      this._trimArrays();
    }
  
    /**
     * Get the upload rates over the last 1 and 5 seconds.
     *
     * A raw rate and one for only fresh telemetry are given.
     *
     * @returns {stats.InteropUploadRate}
     */
    getUploadRate() {
      this._trimArrays();
  
      // The total rate is simply the number of times over the
      // range.
      let total1 = this._times1.length / TIME_LIMIT_1;
      let total5 = this._times5.length / TIME_LIMIT_5;
  
      // Count how many are true and divide by the time for the
      // freshrate.
      let fresh1 = this._fresh1.reduce((acc, curr) => {
        return curr ? acc + 1 : acc;
      }, 0) / TIME_LIMIT_1;
      let fresh5 = this._fresh5.reduce((acc, curr) => {
        return curr ? acc + 1 : acc;
      }, 0) / TIME_LIMIT_5;
  
      return stats.InteropUploadRate.create({
        time: time(),
        total_1: total1,
        fresh_1: fresh1,
        total_5: total5,
        fresh_5: fresh5
      });
    }
  
    // Return whether this telemetry is different from the last.
    _isFresh(telem) {
      if (this._last === null)
        return true;
  
      return this._last.lat !== telem.lat || this._last.lon !== telem.lon ||
          this._last.alt_msl !== telem.alt_msl || this._last.yaw !== telem.yaw;
    }
  
    // Clip off times outside of the time ranges on the arrays.
    _trimArrays() {
      let curr = time();
      let threshold1 = curr - TIME_LIMIT_1;
      let threshold5 = curr - TIME_LIMIT_5;
  
      // Removing old times until there are none for 1 sec.
      while (this._times1[0] <= threshold1) {
        this._times1.shift();
        this._fresh1.shift();
      }
  
      // Removing old times until there are none for 5 sec.
      while (this._times5[0] <= threshold5) {
        this._times5.shift();
        this._fresh5.shift();
      }
    }
  }
  