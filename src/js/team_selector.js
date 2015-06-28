"use strict";

function createTeamSelector(){
    d3.json("json/teams.json", function(data){
    
        var svg = d3.select("body").select("#team_select").append("svg")
            .attr("class", "team_select")
            .attr("width", 900)
            .attr("height", 67)
                .append("g")
                    .attr("transform", "translate(0, 0)");
        
        var teams = data.teams;

        svg.selectAll("svg.team_select").data(teams).enter()
            .append("svg:image")
                .attr("x", function(d, i){return i * 90;})
                .attr("y", 0)
                .attr("width", 90)
                .attr("height", 67)
                .on("click", function(d){performFunction(d.team);})
                .attr("xlink:href", function(d, i){return ("images/"+d.team+".png");});
    
    });
}