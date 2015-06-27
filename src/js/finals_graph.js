function make_finals_graph(data){
	var units = "";
	 
	var margin = {top: 10, right: 40, bottom: 10, left: 10},
	    width = 900 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;
	 
	var formatNumber = d3.format(",.0f"),    // zero decimal places
	    format = function(d) { return formatNumber(d) + " " + units; },
	    color = d3.scale.category20();
	 
	// append the svg canvas to the page
	var svg = d3.select("#graph_border").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", 
	          "translate(" + margin.left + "," + margin.top + ")");
	 
	// Set the sankey diagram properties
	var sankey = d3.sankey()
	    .nodeWidth(36)
	    .nodePadding(10)
	    .size([width, height]);
	 
	var path = sankey.link();
	 	 
	    var nodeMap = {};
	    data.nodes.forEach(function(x) { nodeMap[x.name] = x; });
	    data.links = data.links.map(function(x) {
	      return {
	        source: nodeMap[x.source],
	        target: nodeMap[x.target],
	        value: x.value
	      };
	    });
	 
	  sankey
	      .nodes(data.nodes)
	      .links(data.links)
	      .layout(32);
	 
	// add in the links
	  var link = svg.append("g").selectAll(".link")
	      .data(data.links)
	    .enter().append("path")
	      .attr("class", "link")
	      .attr("d", path)
	      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
	      .sort(function(a, b) { return b.dy - a.dy; });
	 
	// add the link titles
	  link.append("title")
	        .text(function(d) {
	      	return d.source.name + " → " + 
	                d.target.name + "\n" + format(d.value); });
	 
	// add in the nodes
	  var node = svg.append("g").selectAll(".node")
	      .data(data.nodes)
	    .enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { 
			  return "translate(" + d.x + "," + d.y + ")"; })
	    .call(d3.behavior.drag()
	      .origin(function(d) { return d; })
	      .on("dragstart", function() { 
			  this.parentNode.appendChild(this); })
	      .on("drag", dragmove));
	 
	// add the rectangles for the nodes
	  node.append("rect")
	      .attr("height", function(d) { return d.dy; })
	      .attr("width", sankey.nodeWidth())
	      .style("fill", function(d) { 
			  return d.color = color(d.name.replace(/ .*/, "")); })
	      .style("stroke", function(d) { 
			  return d3.rgb(d.color).darker(2); })
	    .append("title")
	      .text(function(d) { 
			  return d.name;});// + "\n" + format(d.value); });
	 
	// add in the title for the nodes
	  node.append("text")
	      .attr("x", -6)
	      .attr("y", function(d) { return d.dy / 2; })
	      .attr("dy", ".35em")
	      .attr("text-anchor", "end")
	      .attr("transform", null)
	      .text(function(d) { return d.who; })
	    .filter(function(d) { return d.x < width / 2; })
	      .attr("x", 6 + sankey.nodeWidth())
	      .attr("text-anchor", "start");
	 
	// the function for moving the nodes
	  function dragmove(d) {
	    d3.select(this).attr("transform", 
	        "translate(" + (
	        	   d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
	        	) + "," + (
	                   d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
	            ) + ")");
	    sankey.relayout();
	    link.attr("d", path);
	  }
}

/**
 *Redraw the graph with new values
**/
function update_finals_graph (filename){
	d3.json("json/"+filename, function(error, data){
		d3.select('#graph_border')
			.remove();
		d3.select('#finals_graph')
			.append('div')
			.attr('id', 'graph_border');

		data = make_finals_graph_data(data.rounds);
		make_finals_graph(data);

	});
}

function make_finals_graph_data (data){
	var temp = {
		"links":[
		],
		"nodes":[
		]
	};

	var i = 0;
	var points = 1;
	var rounds = [];
	for (; i < data.length; i++){
		var j = 0;
			if (Number(data[i].round.games[j].Round) >= 15){
				rounds.push(data[i].round);
			}
	}
	console.log(rounds);
	for (i = rounds.length -1; i >= 0; i--){
		for (var j = rounds[i].games.length-1; j >= 0; j--){
			var round_number = 0;
			if (Number(rounds[i].games[j].Round) == 17){
				console.log("This");
				var game = rounds[i].games[j];
				if (determineWinner(game.Score) == (-1)){
					temp.nodes.push({
						"name":"finals",
						"who":game["Home Team"],
						"played":game["Home Team"] + "vs" + game["Away Team"]
					});
				}
				else {
					temp.nodes.push({
						"name":"finals",
						"who":game["Away Team"],
						"played":game["Home Team"] + "vs" + game["Away Team"]
					});
				}
			}
			if (Number(rounds[i].games[j].Round) == 16){
				var game = rounds[i].games[j];
				console.log("Then This");
				if (determineWinner(game.Score) == (-1)){
					temp.links.push({
						"source":"semifinals"+round_number,
						"target":"finals",
						"value":"4"
					});
					temp.nodes.push({
						"name":"semifinals"+round_number,
						"who":game["Home Team"],
						"played":game["Home Team"] + "vs" + game["Away Team"]
					});
					console.log(game["Home Team"] + "vs" + game["Away Team"]);
				}
				else {
					temp.links.push({
						"source":"semifinals"+round_number,
						"target":"finals",
						"value":"3"
					});
					temp.nodes.push({
						"name":"semifinals"+round_number,
						"who":game["Away Team"],
						"played":game["Home Team"] + "vs" + game["Away Team"]
					});
				}
			}
			if (Number(rounds[i].games[j].Round) == 15){
				var game = rounds[i].games[j];
				console.log("And Then This");
				if (determineWinner(game.Score) == (-1)){
					temp.links.push({
						"source":game["Home Team"],
						"target":game["Home Team"] + " vs "+game["Away Team"],
						"value":"2"
					});
					temp.links.push({
						"source":game["Away Team"],
						"target":game["Home Team"] + " vs "+game["Away Team"],
						"value":"2"
					});
					temp.links.push({
						"source":game["Home Team"] + " vs "+game["Away Team"],
						"target":find_target(game["Home Team"], temp.nodes),
						"value":"2"
					});
					temp.nodes.push({
						"name":game["Home Team"],
						"who":game["Home Team"],
						"played":""
					});
					temp.nodes.push({
						"name":game["Away Team"],
						"who":game["Away Team"],
						"played":""
					});
					temp.nodes.push({
						"name":game["Home Team"] + " vs "+game["Away Team"],
						"who":game["Home Team"],
						"played":game["Home Team"] + " vs "+game["Away Team"]
					});
				}
				else {
					temp.links.push({
						"source":game["Home Team"],
						"target":game["Home Team"] + " vs "+game["Away Team"],
						"value":"2"
					});
					temp.links.push({
						"source":game["Away Team"],
						"target":game["Home Team"] + " vs "+game["Away Team"],
						"value":"2"
					});
					temp.links.push({
						"source":game["Home Team"] + " vs "+game["Away Team"],
						"target":find_target(game["Away Team"], temp.nodes),
						"value":"2"
					});
					temp.nodes.push({
						"name":game["Home Team"],
						"who":game["Home Team"],
						"played":""
					});
					temp.nodes.push({
						"name":game["Away Team"],
						"who":game["Away Team"],
						"played":""
					});
					temp.nodes.push({
						"name":game["Home Team"] + " vs "+game["Away Team"],
						"who":game["Away Team"],
						"played":game["Home Team"] + " vs "+game["Away Team"]
					});
				}
			}
		}
	}
	temp.links.push(find_and_link(temp.links, temp.nodes));
	console.log(temp);
	return temp;
}

function find_target(team_name, nodes){
	var target;
	for (var i = 0; i < nodes.length; i++){
		if (nodes[i].name.indexOf("semifinals") > -1 && 
			nodes[i].played.indexOf(team_name) > -1){
			return nodes[i].name;
		}
	}
	for (var i = 0; i < nodes.length; i++){
		if (nodes[i].name.indexOf("finals") > -1 && 
			nodes[i].played.indexOf(team_name) > -1){
			return nodes[i].name;
		}
	}
	return target;
}

function find_and_link(links, nodes){
	for (var i = 0; i < nodes.length; i++){
		if (nodes[i].name.indexOf("semifinals") > -1){
			var temp = nodes[i].played.split("vs");
			console.log(temp);
			for (var j = 0; j < links.length; j++){
				if (links[j].target.indexOf("semifinals")  > -1 &&
					links[j].source.indexOf(temp[0]) > -1){
					console.log(links[j].target +" "+temp[1]);
					return {
						"source":temp[1],
						"target":links[j].target,
						"value":"2"
					}
				}
				if (links[j].target.indexOf("semifinals")  > -1 &&
					links[j].source.indexOf(temp[1]) > -1){
					console.log(links[j].target +" "+temp[0]);
					return {
						"source":temp[0],
						"target":links[j].target,
						"value":"2"
					}
				}
			}
		}
	}
}



