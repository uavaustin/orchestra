import { interop, telemetry } from './messages';
import LinkedList from 'linkedlist';

// Utility functions
const time = () => Date.now() / 1000;

const assignProps = (obj, ...props) => {
  let assignee = {};
  for (let prop of props) {
    assignee[prop] = obj[prop];
  }
  return assignee;
};

const checkUnique = (obj1, obj2, ...props) => {
  for (let prop of props){
    if (obj1[prop] == obj2[prop])
      return false;
  }
  return true;
}

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
      let teamID = assignProps(
        interopTeam, 
        'id', 
        'username', 
        'name', 
        'university'
      );
      
      let telemDeque;
      let hashKey = JSON.stringify(teamID);

      // Hash key using stringified JSON, do not track if not in air
      if (mapping.has(hashKey) && interopTeam.in_air) {
        // Not the first time receiving info about the team, update

        telemDeque = mapping.get(teamID.toString());
        this._addTelem(telemDeque, interopTeams.telem);
      } else if (mapping.has(hashKey)){
        // We have previously recorded team information but they are
        // no longer in flight. Ok to remove data.

        mapping.delete(hashKey);
      } else if (interopTeam.in_air) {
        // First time receiving info, new list

        telemDeque = new LinkedList();
        telemDeque.push(interopTeams.telem);
        mapping.set(teamID.toString(), telemDeque);
      }
    }
  }

  _addTelem(telemDeque, teamTelem){
    // Check between this teamTelem and the most recent teamTelem
    // which is always at the head of the linked list.
    let fresh_stamp = checkUnique(
      teamTelem, 
      telemDeque.head, 
      'id', 
      'age_sec', 
      'timestamp',
      'yaw'
    );
    let fresh_telem = checkUnique(
      teamTelem.pos,
      telemDeque.head.pos,
      'lat',
      'lon',
      'alt_msl'
    )

    // Two layers of checking, return silently if
    // not fresh or unique telemetry
    if (!fresh_stamp || !fresh_telem)
      return;
  
    // Check if telemetry data is too long, if so, then trim
    // the oldest telemetry info
    if (telemDeque.length > this._telemLength)
      telemDeque.pop();
    
    // Add telemtry to list
    telemDeque.shift(teamTelem);
  }

  getTeams(){
    let processedTeams = [];
    // Generate protobuf message for each team being tracked in 
    // our hashmap
    for (let team of this._teams.keys()){
      let telemDeque = this._teams.get(team);
      let teamID = JSON.parse(team);

      let teamMsg = assignProps(
        teamID,
        "id",
        "username",
        "name",
        "university"
      );

      // Convert our deque into a list
      let telemList = [];
      while (telemDeque.next()){
        // Create appropriate telem message
        const telemMsg = 
          telemetry.ProcessedTeams.ProcessedTeam.TeamTelem
          .create(telemDeque.current);
        telemList.push(telemMsg);
      }

      teamMsg.telem_list = telemList;

      const processedTeam = 
        telemetry.ProcessedTeams.ProcessedTeam
        .create(teamMsg);

      processedTeams.push(processedTeam);
    }

    return ProcessedTeams.create({
      time: time(),
      teams: processedTeams
    });
  }

}