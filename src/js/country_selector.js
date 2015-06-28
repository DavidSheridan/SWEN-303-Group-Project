"use strict";

function createCountrySelector(){
    var svg = d3.select("body").select("#country_select").append("svg")
        .attr("class", "country_select")
        .attr("width", 270)
        .attr("height", 67)
            .append("g")
                .attr("transform", "translate(0, 0)");
        
        var data = ["AUS", "ALL", "NZ"];
        
        svg.selectAll("svg.country_select").data(data).enter()
            .append("rect")
                .attr("x", function(d, i){return i * 90})
                .attr("y", 0)
                .attr("width", 90)
                .attr("height", 67)
                .attr("fill", "white")
                .on("click", function(d){performFunction(convert(d));})
                .attr("stroke", "black");
        
        svg.selectAll("svg.country_select").data(data).enter()
            .append("text")
                .attr("x", function(d, i){return (i * 90) + 35;})
                .attr("y", 40)
                .attr("fill", "black")
                .text(function(d){return d});
}

function convert(s){
    if(s === "AUS"){
        return "Australia";
    }
    else if(s === "NZ"){
        return "New Zealand";
    }
    else{
        return "All";
    }
}