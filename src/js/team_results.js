var HOME_WON = -1;
var AWAY_WON = 1;
var DRAW = 0;
var DURATION = 1500;
var DELAY = 500;

onStartup();

var dataset;
var teams;
var team;
var pie;

function onStartup(){
    d3.json("json/2008-Table1.json", function(data){
        dataset = data.rounds;
        d3.json("json/teams.json", function(data){
            teams = data.teams;
            team = constructEmptyWinStatisticsData("Adelaide Thunderbirds", teams);
            calculateWinStatisticsData(dataset, team);

            drawPieChart(constructPieChartData(team));
            testFunction();
            drawLineChart(team);
        });
    });
}

/**
 * Returns an array with the specified
 */
function constructEmptyWinStatisticsData(teamName, teams){
    // keeps track of total wins, loses and draws
    var data = {
        name: teamName,
        wins: 0,
        loses: 0,
        draws: 0,
        teams: [],
        points: [],
        count: 0
    };

    // keeps track of total wins, loses and draws to individual teams
    for(var i = 0; i < teams.length && teams[i] != teamName; i++){
        data.teams[i] = {
            team: teams[i].team,
            wins: 0,
            loses: 0,
            draws: 0
        };
    }

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
            var results = getTeamsPlaying(games[game]);
            var winner = results[0];
            var loser = results[1];
            var isDraw = results[3];
            
            var opposingTeams = team.teams;
            
            // was a draw
            if(isDraw){
                team.draw = +team.draw + 1;
                // increment opposing teams draw count
                for(var i = 0; i < team.teams.length; i++){
                    if(opposingTeams[i].team != team.name){
                        if(winner == opposingTeams[i].team || loser == opposingTeams[i].team){
                            team.teams[i].draws = +team.teams[i] + 1;
                            break;
                        }
                    }
                }
            }
            // team won
            else if(winner == team.name){
                team.wins = +team.wins + 1;
                // increment opposing teams loss count
                for(var i = 0; i < team.teams.length; i++){
                    if(opposingTeams[i].team == loser){
                        opposingTeams[i].wins = +opposingTeams[i].wins + 1;
                        break;
                    }
                }
            }
            // team lost
            else{
                team.loses = +team.loses + 1;
                // increment opposing teams win count
                for(var i = 0; i < team.teams.length; i++){
                    if(opposingTeams[i].team == winner){
                        opposingTeams[i].loses = +opposingTeams[i].loses + 1;
                        break;
                    }
                }
            }
            
            // get the points scored by team in game
            var score = getScore(games[game], team.name);
            team.points[team.count] = score;
            team.count = +team.count + 1;
        }
    }
}

/**
 * Constructs an array which can be used to construct a pie chart
 * which displays the specified data.
 */
function constructPieChartData(data){
    var pieChart = {
        data: [
            {
                fill: "red",
                title: "wins",
                value: data.wins
            },
            {
                fill: "blue",
                title: "loses",
                value: data.loses
            },
            {
                fill: "orange",
                title: "draws",
                value: data.draws
            }
        ]
    };
    return pieChart;
}

function constructPieChartWinsData(data){
    var pieChart = {
        data: []
    };
    for(var i = 0; i < teams.length; i++){
        pieChart.data[i] = {
            fill: teams[i].fill,
            title: data[i].team,
            value: data[i].wins
        };
    }
    return pieChart;
}

function constructPieChartLoseData(data){
    var pieChart = {
        data: []
    };
    for(var i = 0; i < teams.length; i++){
        pieChart.data[i] = {
            fill: teams[i].fill,
            title: data[i].team,
            value: data[i].loses
        };
    }
    return pieChart;
}

function drawPieChart(data){
    var width = 460;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    
    var pie = d3.layout.pie()
        .sort(null);
        
    var fill = d3.scale.ordinal()
        .domain(d3.range(10))
        .range(getColorRange(data));
    
    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 50);
    
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + width / 2+", "+ height / 2 +")");
    
    var pieData = pie(constructPieChartDataArray(data));
    var path = svg.selectAll("path")
        .data(pieData)
            .enter()
                .append("path")
                    .attr("fill", function(d, i){return fill(i)})
                    .attr("opacity", 0.63)
                    .attr("stroke", "black")
                    .attr("d", arc)
                    .on("mouseover", function(d, i){
                            d3.select(this).transition().style("opacity", 1);
                            if(i == 0){
                                drawSecondaryPieChart(constructPieChartWinsData(team.teams));
                            }
                            else{
                                drawSecondaryPieChart(constructPieChartLoseData(team.teams));
                            }
                        })
                    .on("mouseout", function(d){
                            d3.select(this).transition().style("opacity", 0.63);
                            d3.selectAll("svg.pie-text").selectAll("*").remove();
                        });
    
    function getColorRange(data){
        var fill = [];
        for(var i = 0; i < data.data.length; i++){
            fill[i] = data.data[i].fill;
        }
        return fill;
    }
    
    function constructPieChartDataArray(data){
        var array = [];
        for(var i = 0; i < data.data.length; i++){
            array[i] = data.data[i].value;
        }
        return array;
    }
}

function drawSecondaryPieChart(data){
    var width = 460;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    
    var pie = d3.layout.pie()
        .sort(null);
        
    var fill = d3.scale.ordinal()
        .domain(d3.range(10))
        .range(getColorRange(data));
    
    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 50);
    
    var svg = d3.select("body").selectAll("svg.pie-text")
        .attr("width", width)
        .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + width / 2+", "+ height / 2 +")");
    
    var pieData = pie(constructPieChartDataArray(data));
    var path = svg.selectAll("path")
        .data(pieData)
            .enter()
                .append("path")
                    .attr("fill", function(d, i){return fill(i)})
                    .attr("opacity", 0.63)
                    .attr("stroke", "black")
                    .attr("d", arc);
    
    function getColorRange(data){
        var fill = [];
        for(var i = 0; i < data.data.length; i++){
            fill[i] = data.data[i].fill;
        }
        return fill;
    }
    
    function constructPieChartDataArray(data){
        var array = [];
        for(var i = 0; i < data.data.length; i++){
            array[i] = data.data[i].value;
        }
        return array;
    }
}

function testFunction(){
    var svg = d3.select("body").append("svg")
        .attr("class", "pie-text")
        .attr("width", 460)
        .attr("height", 300)
}

function drawLineChart(data){
    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    
    var x = d3.scale.linear()
        .range([0, width]);
        
    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var line = d3.svg.line()
        .x(function(d){return x(d.game)})
        .y(function(d){return y(d.points)});
    
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.right +")");
            
    var lineChartData = constructLineChartData(data);
    
    x.domain(d3.extent(lineChartData, function(d){return d.game;}));
    y.domain(d3.extent(lineChartData, function(d){return d.points;}));
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);
        
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Points Scored");
    
    svg.append("path")
        .datum(lineChartData)
        .attr("class", "line")
        .attr("d", line);
    
    function constructLineChartData(data){
        var array = [];
        for(var i = 0; i < data.points.length; i++){
            array[i] = {
              points: data.points[i],
              game: i + 1
            };
        }
        return array;
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
 * Returns the teams playing in the order of [winning team, losing team, isDraw]
 */
function getTeamsPlaying(game){
    var winner = determineWinner(game.Score);
    if(winner == HOME_WON){
        return [game["Home Team"], game["Away Team"], false];
    }
    else if(winer = AWAY_WON){
        return [game["Away Team"], game["Home Team"], false];
    }
    // was a draw
    return [game["Home Team"], game["Away Team"], true];
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