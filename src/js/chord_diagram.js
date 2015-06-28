"use strict";

var DATA;
var TEAMS;
var START_YEAR = 2008;
var PRIMARY = "Primary";
var CURRENT_COUNTRY;
var CURRENT_YEAR;

var ALL = "All";
var AUS = "Australia";
var NZ = "New Zealand";

var pieChart1, pieChart2, lineChart; // svgs

function loadData(country, year){
    redraw(year);
    setupSVG();
    // load team data
    (function(){d3.json("json/teams.json", function(data){TEAMS = data.teams;});})();
    
    CURRENT_COUNTRY = country;
    CURRENT_YEAR = year;
    
    // load in netball data
    var filename = "json/"+CURRENT_YEAR+"-Table1.json";

    (function(){d3.json(filename, function(error, data){
        DATA = data.rounds;
        
        var d = filterByCountry(data.rounds, CURRENT_COUNTRY);
        var chordData = constructAdjacencyMatrix(d, TEAMS.length);
        updateChordDiagram(chordData);

    });})();
}

function filterByCountry(data, country){
    var temp = [];
    var index = 0;
    for(var i = 0; i < data.length; i++){
        var games = data[i].round.games;
        for(var j = 0; j < games.length; j++){
            if(country === ALL){
                temp[index] = games[j];
                index++;
            }
            else{
                // get team data from current game
                var home = games[j]["Home Team"];
                var away = games[j]["Away Team"];
                var homeIndex = convertTeamToInt(home, TEAMS);
                var awayIndex = convertTeamToInt(away, TEAMS);
                var homeCountry = TEAMS[homeIndex].country;
                var awayCountry = TEAMS[awayIndex].country;
                if(homeCountry === country && awayCountry === country){
                    temp[index] = games[j];
                    index++;
                }
            }
        }
    }
    return temp;
}

function redraw(year){
    document.getElementById("win_stats").innerHTML="";
    document.getElementById("title").innerHTML="<h2 font-color= black>Win Statistics for the year "+year+"</h2>";
    document.getElementById("win_stats").innerHTML="<h3 font-color=black>Points scored for each team in the year "+year+"</h3> <br>";
}

var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending);
        
var width = 450;
var height = 450;
var radius = Math.min(width, height) / 2;
var innerRadius = Math.min(width, height) * 0.41;
var outerRadius = innerRadius * 1.1;
    
var fill = d3.scale.ordinal()
    .domain(d3.range(10))
    .range(["#FF00FF", "#FFFF00", "#800033", "#003366", "#FF0000", "#0066FF", "#993399", "#33CCFF", "#808033", "#004C4C"]);
    
var svg;
    
var text = d3.select("#win_stats").append("svg")
    .attr("class", "chord-text")
    .attr("width", width)
    .attr("height", height)
    .append("g")
        .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");

var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

function setupSVG(){
    svg = d3.select("#win_stats").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");    
}
        
function updateChordDiagram(data){
    chord.matrix(data);
    
    svg.append("g").selectAll("path")
        .data(chord.groups)
            .enter()
                .append("path")
                    .style("fill", function(d){return fill(d.index);})
                    .style("stroke", function(d){return fill(d.index);})
                    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
                    .on("mouseover", fade(0.1, svg))
                    .on("mouseout", fade(1, svg));
        
    svg.append("g")
        .attr("class", "chord")
        .selectAll("path")
            .data(chord.chords)
                .enter()
                    .append("path")
                        .attr("d", d3.svg.chord().radius(innerRadius))
                        .style("fill", function(d){return fill(d.source.index);})
                        .style("opacity", 1);
}

/**
 * Returns an event handler for fading into a given chord group
 *
 * Code from http://bl.ocks.org/mbostock/4062006
 */
function fade(opacity, svg){
    return function(g, i){
        svg.selectAll(".chord path")
            .filter(function(d){return d.source.index != i && d.target.index != i;})
            .transition()
            .style("opacity", opacity);
    };
}

function constructAdjacencyMatrix(data, size){
    var temp = createEmptyAdjacencyMatrix(size);
    // iterate through rounds
    for(var i = 0; i < data.length; i++){
        // get team data from current game
        var home = data[i]["Home Team"];
        var away = data[i]["Away Team"];
        var homeIndex = convertTeamToInt(home, TEAMS);
        var awayIndex = convertTeamToInt(away, TEAMS);
                        
        // get points scored for each team
        var scores = getScores(data[i].Score);
        var homeScore = +scores[0];
        var awayScore = +scores[1];

        // update adjacency matrix with new data
        temp[homeIndex][awayIndex].points = +temp[homeIndex][awayIndex].points + +homeScore;
        temp[awayIndex][homeIndex].points = +temp[awayIndex][homeIndex].points + +awayScore;
    }
    return convertDataToMatrix(temp);
}

/**
 * Constructs an empty adjacency matrix to store win data.
 */
function createEmptyAdjacencyMatrix(size){
    var data = [];
    for(var i = 0; i < size; i++){
        data[i] = [];
        for(var j = 0; j < size; j++){
            data[i][j] = {
                points: 0
            }
        }
    }
    return data;
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
 * Returns the specified data in the form of a number matrix
 */
function convertDataToMatrix(data){
    var matrix = [];
    for(var i = 0; i < data.length; i++){
        matrix[i] = [];
        for(var j = 0; j < data[i].length; j++){
            matrix[i][j] = +data[i][j].points;
        }
    }
    return matrix;
}

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
 * Returns the team name which is referenced by
 * the specified index position.
 */
function convertIntToTeam(index, teams){
  // check if index is in bounds
  if(index < 0 || index >= teams.length){
    // outside of bounds, return error
    return "Error";  
  }
  // return team name
  return teams[index];
}

