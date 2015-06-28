Team 29 consists of Shane Brewer, Harry King and David Sheridan.

INDEX:

The entry point to the website is from index.html which is located in the src folder.

CONVERTING CSV DATA TO JSON:

-Insert new CSV file into the data folder
-In the terminal change directory to the directory containing the csv-json-converter.pl script
-Use the following command replacing FILENAME with the name of the csv file (including the csv extension):

	perl csv-json-converter.pl data/FILENAME

-This creates a json file in the data folder. This needs to be copied to src/html/json/ to be accessed
 by the application.

NB: converter is unable to convert the 2009 data.