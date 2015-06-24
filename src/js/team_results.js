var HOME_WON = -1;
var AWAY_WON = 1;
var DRAW = 0;

onStartup();

var dataset;
var teams;
var team;

function onStartup(){
    d3.json("json/2008-Table1.json", function(data){
        dataset = data.rounds;
        d3.json("json/teams.json", function(data){
            teams = data.teams;
            team = constructEmptyWinStatisticsData("Adelaide Thunderbirds");
            calculateWinStatisticsData(dataset, team);
        });
    });
}

/**
 * Returns an array with the specified
 */
function constructEmptyWinStatisticsData(teamName){
    var data = {
        name: teamName,
        wins: 0,
        loses: 0,
        draws: 0,
        points: [],
        count: 0
    };
    return data;
}

function calculateWinStatisticsData(data, team){
    // iterate through the rounds
    for(var round = 0; round < data.length; round++){
        // iterate through games in the current round
        var games = data[round].round.games;
        for(var game = 0; game < games.length; game++){
            // check if team actually played in this game
            if(!containsTeam(games[game], team.name)){
                continue;
            }
            // determine the winner of the match
            var winner = getWinningTeam(games[game]);
            // was a draw
            if(winner == null){
                team.draw = +team.draw + 1;
            }
            // team won
            else if(winner == team.name){
                team.wins = +team.wins + 1;
            }
            // team lost
            else{
                team.loses = +team.loses + 1;
            }
            
            // get the points scored by team in game
            var score = getScore(games[game], team.name);
            team.points[team.count] = score;
            team.count = +team.count + 1;
        }
    }
}

// helper methods

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
 * Returns true if team was the home team in the specified game,
 * otherwise returns false.
 */
function isHomeTeam(game, team){
    if(game["Home Team"] == team){
        return true;
    }
    return false;
}

/**
 * Returns true if the specified team won the match,
 * otherwise returns false.
 */
function teamWon(isHome, score){
    var winner = determineWinner(score);
    if(isHome && winner == HOME_WON){
        return true;
    }
    return false;
}

/**
 * Returns the name of the winning team from the specified game.
 */
function getWinningTeam(game){
    var winner = determineWinner(game.Score);
    if(winner == HOME_WON){
        return game["Home Team"];
    }
    else if(winer = AWAY_WON){
        return game["Away Team"];
    }
    // was a draw
    return null;
}

/**
 * Determines the winner of the game.
 * 
 * Returns:
 *  -1 : if home team won
 *  0  : if game was a draw
 *  1  : if away team won
 */
function determineWinner(score){
  // check if the game was a draw
  if(score.contains("draw")){
    return DRAW; 
  }
  // get home and away scores
  var data = score.split("-");
  var homeScore = +data[0];
  var awayScore = +data[1];
  // determine which team won
  if(homeScore > awayScore){
    return HOME_WON;
  }
  // away team won
  return AWAY_WON;
  
}

/**
 * Get separate scores from the specified score value.
 */
function getScores(score){
    // if score contains draw then remove it
    if(score.contains("draw")){
        score = score.substring(4);
    }
    var data = score.split("-");
    return data;    
}

/**
 * Returns the score of the specified team from the game.
 */
function getScore(game, team){
    score = getScores(game.Score);
    if(isHomeTeam(game, team)){
        return score[0];
    }
    return score[1];
}