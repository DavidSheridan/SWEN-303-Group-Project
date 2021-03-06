// load initial data
onStartup(2008);

/**
 * Loads initial data on the page.
 */
function onStartup(year){
  redraw(year);
     dataset = [];
     teams = [];
     d3.json("json/"+year+"-Table1.json", function(data){
       dataset = data.rounds;
     
       d3.json("json/teams.json", function(data){
        teams = data.teams;
 	
        points = createEmptyPointsData(teams)
        calculatePoints(dataset, points, teams);
        points.sort(comparePoints);
 	
        var data = constructData(points);
        var cols = ["Placings", "Team", "Points", "Placings", "Team", "Points"];
 	
        var peopleTable = tabl(data, cols);
       
       });
     });
}

function redraw(year){
  document.getElementById("placings_table").innerHTML="";
  document.getElementById("title").innerHTML="<h2 font-color= black>Final results for the year "+year+"</h2>";
  document.getElementById("finals_graph").innerHTML="<h3 font-color= black>Graph displaying the finals for the year "+year+"</h3> <br>";
}

/**
 * Constructs a table from the specified data and
 * column headings.
 */
function tabl(data, columns){
	var table = d3.select("#placings_table").append("table")
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

    for(var z = 0; z<5; z++){
      da = data[z];
      da2 = data[z+5]
      for (var q=0; q<da2.length; q++){
        da[q+3]=da2[q];
      }
      tbody.append("tr")
      .selectAll("td")
      .data(da)
      .enter()
      .append("td")
      .text(function(d) { return d;});
    }
    return table;
}

function createEmptyPointsData(teams){
  //window.alert(teams.length);
  var points = [teams.length];
  for(var i = 0; i < teams.length; i++){
    //window.alert(i);
    points[i] = {
      "team": teams[i].team,
      "points": 0
    };
  }
  return points;
}

/**
 * Calculates the points received from data and stores
 * them in results.
 */
function calculatePoints(data, points, teams){
  // iterate through rounds
  for(var i = 0; i < 14; i++){
    // iterate through games in current round
    var games = data[i].round.games;
    for(var j = 0; j < games.length; j++){
      // get teams data from current game
      var home = games[j]["Home Team"];
      var away = games[j]["Away Team"];
      var homeIndex = convertTeamToInt(home, teams);
      var awayIndex = convertTeamToInt(away, teams);
      var result = determineWinner(games[j].Score);
      if(result === -1){
        points[homeIndex].points = +points[homeIndex].points + 2;
      }
      else if(result === 1){
        points[awayIndex].points = +points[awayIndex].points + 2;
      }
      else{
        points[homeIndex].points = +points[homeIndex].points + 1;
        points[awayIndex].points = +points[awayIndex].points + 1;
      }
    }
  }
}

/**
 * Determines the winner of the game.
 * 
 * Returns:
 *  -1 : if home team won
 *  0  : if game was a draw
 *  1  : if away team won
 */
function determineWinner(score){
  // check if the game was a draw
  if(score.contains("draw")){
    return 0;  
  }
  // get home and away scores
  var data = score.split("-")
 
  var homeScore = +data[0];
  var awayScore = +data[1];
  // determine which team won
  if(homeScore > awayScore){
    // home team won
    return -1;  
  }
  // away team won
  return 1;
  
}

/**
 * Constructs the data to be displayed by the table
 * from the data specified in points.
 */
function constructData(points){
  var data = []
  for(var i = 0; i < points.length; i++){
    data[i] = [(i + 1), points[i].team, points[i].points];
  }
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

/**
 * Compares two points. Returns a positive integer 
 * if p2 is greater than p1, a negative integer if
 * p1 is greater than p2 and zero if both p1 and p2
 * are equal.
 */
function comparePoints(p1, p2){
  return ((+p2.points) - (+p1.points));  
}