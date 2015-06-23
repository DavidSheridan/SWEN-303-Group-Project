function make_season_filter(){
	var margin = {top: 0, right: 40, bottom: 30, left: 10},
	    width = 900 - margin.left - margin.right,
	    height = 80 - margin.top - margin.bottom;
	
	var x = d3.scale.quantile()
		.range([0, width - (width/5)*4, width - (width/5)*3, 
	    	width - (width/5)*2, width - (width/5)*1, 
	    	width - (width/5)*0])
	    .domain([2008, 2009, 2010, 2011, 2012, 2013]);

	var brush = d3.svg.brush()
	    .x(x)
	    .extent([0, width/5-30])
	    .on("brushstart", brushstart)
	    .on("brush", brushmove)
	    .on("brushend", brushend);

	var svg = d3.select("#filters").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.svg.axis().scale(x).orient("bottom"));

	
	var brushg = svg.append("g")
	    .attr("class", "brush")
	    .call(brush);
	
	brushg.selectAll(".resize").append("path")
	    .attr("transform", "translate(0," +  height / 2 + ")")
	
	brushg.selectAll("rect")
	    .attr("height", height);

	
	brushstart();
	brushmove();
	
	function brushstart() {
	  svg.classed("selecting", true);
	}
	
	function brushmove() {
	  var s = brush.extent();

	}
	
	function brushend() {
	  svg.classed("selecting", !d3.event.target.empty());
	}

}