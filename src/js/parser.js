"use strict";

// global variables
var DATA = [];
var TEAMS;
var START_YEAR = 2008;
var END_YEAR;

// call main to start loading files        
main();

/**
 * Load in data from json files. Wraps d3.json calls in functions
 * to ensure that they are loaded correctly.
 */
function main(){        
    // load team data
    (function(){
        d3.json("json/teams.json", function(data){
            TEAMS = data.teams;
        });
    })();
    
    // load in netball data
    var filesLoaded = false;
    for(var i = 0; !filesLoaded; i++){
        var filename = "json/"  + (i + START_YEAR) + "-Table1.json";
        console.log(filename);
        (function(j){
            d3.json(filename, function(error, data){
                // do not continue if the current file is unavailable
                if(error){
                    END_YEAR = i + START_YEAR;
                    filesLoaded = true;
                }
                DATA[j] = data.rounds;
            });
        })(i);
    }
}

