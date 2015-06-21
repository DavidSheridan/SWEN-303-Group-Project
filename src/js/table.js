var dat = [["1", "Vixen", "16"], ["2", "Magick", "15"]];
var cols = ["Placings", "Team", "Points"];

function tabl(data, columns){
	var table = d3.select("body").append("table")
            .attr("style", "margin-left: 250px"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    for(var z = 0; z<10; z++){
    	da = data[z];

	tbody.append("tr")
   		.selectAll("td")
   		.data(da)
   		.enter()
   		.append("td")
   		.text(function(d) { return d;});
    }
    return table;
}

var peopleTable = tabl(dat, cols);