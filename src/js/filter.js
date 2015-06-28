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

function make_filter_buttons(button_name, filename) {
	d3.select("#filters")
		.append('button')
		.attr('type', 'button')
		.style('width', '25%')
		.style('border-radius', '10')
		.style('background-color', '#00aeef')
		.style('border-color', '#000')
		.style('border-style', 'ridge')
		.style('border-width', '2')
		.classed('btn btn-primary btn-lg', true)
		.text(button_name)
		.on('click', function() {
			update_finals_graph(filename);
			onStartup(button_name);
			bi_partite(button_name);
		});
}

function make_bip_filter_buttons(button_name, filename) {
	d3.select("#filters")
		.append('button')
		.attr('type', 'button')
		.style('width', '25%')
		.style('border-radius', '10')
		.style('background-color', '#00aeef')
		.style('border-color', '#000')
		.style('border-style', 'ridge')
		.style('border-width', '2')
		.classed('btn btn-primary btn-lg', true)
		.text(button_name)
		.on('click', function() {
			bi_partite(button_name);
		});
}

function make_win_filter_buttons(button_name, filename){
	d3.select("#filters")
		.append('button')
		.attr('type', 'button')
		.style('width', '25%')
		.style('border-radius', '10')
		.style('background-color', '#00aeef')
		.style('border-color', '#000')
		.style('border-style', 'ridge')
		.style('border-width', '2')
		.classed('btn btn-primary btn-lg', true)
		.text(button_name)
		.on('click', function() {
			constructChordDiagram(button_name);
		});
}

function make_team_filter_buttons(button_name, filename){
	d3.select("#filters")
		.append('button')
		.attr('type', 'button')
		.style('width', '25%')
		.style('border-radius', '10')
		.style('background-color', '#00aeef')
		.style('border-color', '#000')
		.style('border-style', 'ridge')
		.style('border-width', '2')
		.classed('btn btn-primary btn-lg', true)
		.text(button_name)
		.on('click', function() {
			loadData("Adelaide Thunderbirds", button_name);
		});
}