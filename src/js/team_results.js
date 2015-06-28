"use strict";

// global variables
var DATA = [];
var TEAMS = [];
var START_YEAR = 2008;
var PRIMARY = "Primary";
var current = 0;

var pieChart1, pieChart2;

var width = 450;
var height = 300;
var radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        return d.value;
    });

var arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

var key = function(d){ return d.data.label; };

var color = d3.scale.ordinal()
    .domain(["Wins", "Loses", "Draws"])
    .range(["red", "blue", "green"]);

function loadData(team, year){
    redraw(year);
    setupSVG();
    // load team data
    (function(){d3.json("json/teams.json", function(data){TEAMS = data.teams;});})();
    
    // load in netball data
    var filename = "json/data.json";
    (function(){d3.json(filename, function(error, data){
        DATA = data.championships;
        var data = getData(team, year - START_YEAR);
        var pieData = constructPieChartData(data);
        updatePieChart(pieData.data, PRIMARY);
    });})();
}

function redraw(year){
    document.getElementById("pie_primary").innerHTML="";
    document.getElementById("title").innerHTML="<h2 font-color= #000000>Team Results for the year "+year+"</h2>";
}

function getData(team, id){
    console.log("team: "+team+", id: "+id);
    var data = createEmptyData(team);
    calculateStatistics(data);
    return data;
    
    /**
     * Returns an array with the specified
     */
    function createEmptyData(team){
        var temp = {
            name: team,
            wins: 0,
            loses: 0,
            draws: 0,
            teams: [],
            points: [],
            count: 0
        };
        
        for(var i = 0; i < TEAMS.length; i++){
            temp.teams[i] = {
                name: TEAMS[i].team,
                wins: 0,
                loses: 0,
                draws: 0
            }
        }
        
        return temp;
    }

    function calculateStatistics(data){
        // iterate through the rounds
        for(var i = 0; i < DATA[id].rounds.length; i++){
            // iterate through games in the current round
            var games = DATA[id].rounds[i].round.games;
            for(var j = 0; j < games.length; j++){
                // check if team actually played in this game
                if(!containsTeam(games[j], data.name)){
                    continue;
                }
                var isHome = (games[j]["Home Team"] === data.name) ? true : false;
                var index = (isHome) ? convertTeamToInt(games[j]["Away Team"], TEAMS) : convertTeamToInt(games[j]["Home Team"], TEAMS);
                // determine the winner of the match
                var scores = getScores(games[j].Score);
                var isDraw = getScores[2];
                
                if(isDraw){
                    data.draws = +data.draws + 1;
                    data.teams[index].draws = + data.teams[index].draws + 1;
                }
                else if((isHome && +scores[0] > +scores[1]) || (!isHome && +scores[0] < +scores[1])){
                    data.wins = +data.wins + 1;
                    data.teams[index].loses = +data.teams[index].loses + 1;
                }
                else{
                    data.loses = +data.loses + 1;
                    data.teams[index].wins = +data.teams[index].wins + 1;
                }
                
                data.points[data.count] = (isHome) ? +scores[0] : +scores[1];
                data.count = + data.count + 1;
                
            }
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
                label: "wins",
                value: data.wins
            },
            {
                label: "loses",
                value: data.loses
            },
            {
                label: "draws",
                value: data.draws
            }
        ]
    };
    return pieChart;
}

/** DRAWING PIE CHART **/

function setupSVG(){
    pieChart1 = d3.select("#pie_primary")
        .append("svg")
            .attr("class", "pie_primary")
            .attr("width", width)
            .attr("height", height)
            .append("g");

    pieChart1.append("g").attr("class", "slices");
    pieChart1.append("g").attr("class", "labels");
    pieChart1.append("g").attr("class", "lines");
    
    pieChart1.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    pieChart2 = d3.select("#pie_secondary")
        .append("svg")
            .attr("class", "pie_secondary")
            .attr("width", width)
            .attr("height", height)
            .append("g");
            
    pieChart2.append("g").attr("class", "slices");
    pieChart2.append("g").attr("class", "labels");
    pieChart2.append("g").attr("class", "lines");

    pieChart2.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
}

function updatePieChart(data, chart){
    var svg = pieChart1;//(chart === "Primary") ? pieChart1 : pieChart2;
    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .style("opacity", 0.63)
        .style("stroke", "black")
        .attr("class", "slice");

    slice.transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })

    slice.exit().remove();

	/* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
        .data(pie(data), key);

    text.enter()
        .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
                return d.data.label;
            });
	
    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    text.exit().remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);
	
    polyline.enter().append("polyline")
        .attr("fill", "blue");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };			
        });
	
    polyline.exit().remove();
};