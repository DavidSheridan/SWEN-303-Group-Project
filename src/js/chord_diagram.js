
var matrix = [];
var dataset = [];
var teams = [];

function constructChordDiagram(){
    d3.json("json/2008-Table1.json", function(data){
        dataset = data.rounds;
        
        d3.json("json/teams.json", function(data){
            teams = data.teams;
            matrix = createEmptyAdjacencyMatrix(teams.length);
            populateAdjacencyMatrix(dataset, teams, matrix);
            
            var m = [
                [0, 44, 61, 138, 85, 48, 113, 54, 91, 120],
                [32, 0, 99, 33, 30, 76, 28, 79, 78, 16],
                [41, 105, 0, 50, 50, 94, 36, 93, 94, 44],
                [138, 50, 58, 0, 102, 56, 113, 46, 47, 111],
                [101, 59, 44, 114, 0, 64, 113, 53, 172, 129],
                [47, 96, 94, 47, 62, 0, 40, 97, 97, 45],
                [88, 56, 50, 112, 125, 46, 0, 52, 50, 113],
                [41, 93, 99, 47, 42, 89, 54, 0, 94, 58],
                [97, 100, 123, 40, 159, 115, 56, 99, 0, 61],
                [91, 33, 50, 92, 108, 49, 92, 43, 47, 0]
            ];
            
            drawChordDiagram(m);
        });
    });
}

function drawChordDiagram(matrix){
    var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending)
        .matrix(matrix);
        
    var width = 960;
    var height = 500;
    var innerRadius = Math.min(width, height) * 0.41;
    var outerRadius = innerRadius * 1.1;
    
    var fill = d3.scale.ordinal()
        .domain(d3.range(10))
        .range(["#FF00FF", "#FFFF00", "#800033", "#003366", "#FF0000", "#0066FF", "#993399", "#33CCFF", "#808033", "#004C4C"]);
    
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
    
    svg.append("g").selectAll("path")
        .data(chord.groups)
            .enter()
                .append("path")
                    .style("fill", function(d){return fill(d.index);})
                    .style("stroke", function(d){return fill(d.index);})
                    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
                    .on("mouseover", fade(0.1, svg))
                    .on("mouseout", fade(1, svg));
    
    var ticks = svg.append("g").selectAll("g")
        .data(chord.groups)
            .enter()
                .append("g")
                .selectAll("g")
                    .data(groupTicks)
                        .enter()
                            .append("g")
                                .attr("transforn", function(d){
                                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                        + "translate(" + outerRadius + ", 0)";
                                });
    ticks.append("line")
        .attr("x1", 1)
        .attr("x2", 0)
        .attr("y1", 5)
        .attr("y2", 0)
        .style("stroke", "#000");
        
    ticks.append("text")
        .attr("x", 8)
        .attr("dy", ".35em")
        .attr("transform", function(d){return d.angle > Math.PI ? "rotate(180)translate(-16)" : null})
        .style("text-anchor", function(d){return d.angle > Math.PI ? "end" : null});
        
    svg.append("g")
        .attr("class", "chord")
        .selectAll("path")
            .data(chord.chords)
                .enter()
                    .append("path")
                        .attr("d", d3.svg.chord().radius(innerRadius))
                        .style("fill", function(d){return fill(d.target.index);})
                        .style("opacity", 1);
}

/**
 * Returns an array of tick angles and labels, given a group
 *
 * Code from http://bl.ocks.org/mbostock/4062006
 */
function groupTicks(d){
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 1000).map(function(v, i){
        return{
            angle: v * k + d.startAngle,
            label: i % 5 ? null : v / 1000 + "k"
        };
    });
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

function populateAdjacencyMatrix(data, teams, matrix){
    // iterate through rounds
    for(var round = 0; round < data.length; round++){
        // iterate through games in current round
        var games = data[round].round.games;
        for(var game = 0; game < games.length; game++){
            // get team data from current game
            var home = games[game]["Home Team"];
            var away = games[game]["Away Team"];
            var homeIndex = convertTeamToInt(home, teams);
            var awayIndex = convertTeamToInt(away, teams);
            
            // get points scored for each team
            var scores = getScores(games[game].Score);
            var homeScore = +scores[0];
            var awayScore = +scores[1];

            // update adjacency matrix with new data
            matrix[homeIndex][awayIndex].points = +matrix[homeIndex][awayIndex].points + +homeScore;
            matrix[awayIndex][homeIndex].points = +matrix[awayIndex][homeIndex].points + +awayScore;             
        }
    }
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

