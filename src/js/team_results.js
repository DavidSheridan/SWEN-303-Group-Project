"use strict";

// global variables
var DATA = [];
var TEAMS = [];
var START_YEAR = 2008;
var PRIMARY = "Primary";
var CURRENT_TEAM;
var CURRENT_YEAR;

var pieChart1, pieChart2, lineChart; // svgs

function loadData(team, year){
    redraw(year);
    setupSVG();
    // load team data
    (function(){d3.json("json/teams.json", function(data){TEAMS = data.teams;});})();
    
    CURRENT_TEAM = convertTeamToInt(team, TEAMS);
    CURRENT_YEAR = year;
    
    // load in netball data
    var filename = "json/data.json";
    (function(){d3.json(filename, function(error, data){
        DATA = data.championships;
        var data = getData(team, year - START_YEAR);
        console.log(data.points);
        var primary = constructPieChartData(data);
        var secondary = constructSecondaryPieChartData(data.teams, "wins");
        var lineData = constructLineChartData(data.points);
        console.log(lineData);
        updatePieChart(primary, PRIMARY);
        updatePieChart(secondary, "Secondary");
        updateLineChart(lineData);
    });})();
}

function redraw(year){
    CURRENT_YEAR = year;
    document.getElementById("pie_primary").innerHTML="";
    document.getElementById("pie_secondary").innerHTML="";
    document.getElementById("title").innerHTML="<h2 font-color= #000000>Team Results for the year "+year+"</h2>";
}

function getData(team, id){
    //console.log("team: "+team+", id: "+id);
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
                    data.teams[index].wins = +data.teams[index].wins + 1;
                }
                else{
                    data.loses = +data.loses + 1;
                    data.teams[index].loses = +data.teams[index].loses + 1;
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
                label: "Wins",
                value: data.wins,
                fill: "red"
            },
            {
                label: "Loses",
                value: data.loses,
                fill: "blue"
            },
            {
                label: "Draws",
                value: data.draws,
                fill: "orange"
            }
        ]
    };
    return pieChart.data;
}

function constructSecondaryPieChartData(data, type){
    var pieChart = {
        data: []
    };
    
    for(var i = 0; i < TEAMS.length; i++){
        pieChart.data[i] = {
            label: abbreviateName(TEAMS[i].team),
            value: getValue(data[i], type),
            fill : TEAMS[i].fill
        };
    }
    
    return pieChart.data;
    
    function getValue(d, type){
        if(type === "wins"){
            return d.wins;
        }
        else if(type === "loses"){
            return d.loses;
        }
        else{
            return d.draws;
        }
    }
}

function constructLineChartData(data){
    var temp = [];
    for(var i = 0; i < data.length; i++){
        temp[i] = {
            points: data[i],
            game: i + 1
        }
    }
    return temp;
}

function getSelection(index){
    if(index === 0){
        return "wins";
    }
    else if(index === 1){
        return "loses";
    }
    return "draws";
}

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
    
    lineChart = d3.select("#line_chart")
        .append("svg")
            .attr("class", "line_chart")
            .attr("width", lWidth + margin.left + margin.right)
            .attr("height", lHeight + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + lWidth / 4 + ", " + lHeight / 4 + ")");
            
}

/** DRAWING PIE CHART **/

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

function updatePieChart(data, chart){
    var svg = (chart === PRIMARY) ? pieChart1 : pieChart2;
    var data = data.filter(function(d){return d.value > 0;});
    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);
    
    if(chart === PRIMARY){
        slice.enter()
            .insert("path")
            .style("fill", function(d){return d.data.fill;})
            .style("opacity", 0.63)
            .style("stroke", "black")
            .on("mouseover", function(d, i){
                d3.select(this).transition().style("opacity", 1);
                var selected = getSelection(i);
                var data = (getData(TEAMS[CURRENT_TEAM].team, CURRENT_YEAR - START_YEAR));
                var pie = constructSecondaryPieChartData(data.teams, selected);
                updatePieChart(pie, "Secondary");
            })
            .on("mouseout", function(d){d3.select(this).style("opacity", 0.63);})
            .attr("class", "slice");
    }
    else{
        slice.enter()
            .insert("path")
            .style("fill", function(d){return d.data.fill;})
            .style("stroke", "black")
            .attr("class", "slice");
    }

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
                return d.data.label + " ("+d.data.value+")";
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

/** DRAWING LINE CHART **/

var margin = {top: 20, right: 20, bottom: 30, left: 50};
var lWidth = 900;
var lHeight = 400;

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
    .x(function(d){return x(d.game);})
    .y(function(d){return y(d.points);});

function updateLineChart(data){
    x.domain(d3.extent(data, function(d){return d.game;}));
    y.domain(d3.extent(data, function(d){return d.points;}));

    lineChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height +")")
        .call(xAxis);

    lineChart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Points Scored Per Game");
            
    lineChart.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
}