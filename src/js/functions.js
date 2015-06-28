/**
 * Returns an integer referencing the index where
 * that team is located in the array.
 */
function convertTeamToInt(name, teams){
  // iterate through teams list until team is found
  for(var i = 0; i < teams.length; i++){
    if(name === teams[i].team){
      // return index of team
      return i;  
    }
  }
  // incorrect team name passed in
  return -1;
}

/**
 * Returns true if the specified team played in the specified game,
 * otherwise returns false.
 */
function containsTeam(game, team){
    if(game["Home Team"] == team || game["Away Team"] == team){
        return true;
    }
    return false;
}

/**
 * Returns the specified score as an array of the type:
 * [home score, away score, is draw]
 */
function getScores(score){
    var isDraw = (score.contains("draw")) ? true : false;
    var temp = score.split("-");
    return [temp[0], temp[1], isDraw];
}