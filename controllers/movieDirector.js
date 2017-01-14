var request = require('request');
var suppFunc = require('./supportingFunctions')
var sendResponse = suppFunc.sendResponse;
var containsErrors = suppFunc.containsErrors;
var getPersonRequestOptions = suppFunc.getPersonRequestOptions;
var informationNotFound = suppFunc.informationNotFound;

/**
* Finds the movies that a director is known for
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieDirector(req, res){
    console.log('Request received for movieDirector');
    // name of the director requested by the user
    var director = req.body.result.parameters.directorName;

    request(getPersonRequestOptions(director), function(err, response, body){
        console.log('Attempting to connect to API');
        if (!containsErrors(res, response, err)){
            console.log('Successfully connected to API');
            if (body.results.length > 0){ // if found the person
                console.log('Information found');
                var movies = body.results[0].known_for;

                getUpdatedDirectorList(res, movies, director, [], 0);
            } else { // person could not be found; likely a spelling mistake
                informationNotFound(res, director);
            }
        }
    });
};

/**
* Checks which of the found movies are directed by the director
* @param {Object} res - Response
* @param {Array.<String>} movies - List of movies the director is known for
* @param {String} director - Name of the director requested by the user
* @param {Array.<String>} updatedMovies - List of movies directed by the
*   director
* @param {number} i - Counter to keep track of movies being looked up
*/
function getUpdatedDirectorList(res, movies, director, updatedMovies, i){
    console.log('Getting an updated list of directors');
    // uses a different API than other requests
    // this API gives more details about a movie
    var requestOptions = {
        url: "http://www.omdbapi.com/",
        method: "GET",
        json: {},
        qs: {
            t: movies[i].title,
            type: "movie",
            plot: "short",
            r: "json",
            tomatoes: "true",
            y: ""
        }
    };

    request(requestOptions, function(err, response, body){
        console.log('Attempting to connect to API');
        if (!containsErrors(res, response, err)){
            console.log('No errors found');
            if (body.Director.toLowerCase() === director.toLowerCase()){
                updatedMovies.push(movies[i]);
            }

            i++;

            if (i >= movies.length || updatedMovies.length > 3){
                generateMovieDirectorResponse(res, updatedMovies, director);
            } else {
                getUpdatedDirectorList(res, movies, director, updatedMovies, i);
            }
        }
    });
}

/**
* Generates a response for the agent
* @param {Object} res - Response
* @param {Array.<String>} movies - List of movies the director has directed
* @param {String} director - Name of the director requested by the user
*/
function generateMovieDirectorResponse(res, movies, director){
    console.log('Generating director response');
    // maximum number of movies to show is 3
    var numMovies = (movies.length > 3 ? 3 : movies.length);
    var speechText;

    if (numMovies === 0) { // if no movies were found
        console.log('No movies found');
        speechText = "I could not find any movies directed by "
                    + director;
    } else {
        console.log('Movies found');
        speechText = movies[0].title;
        for (var i = 1; i < numMovies; i++){
            speechText += (i !== 1 && i === numMovies - 1 ? " and " : "");
            speechText += (", " + movies[i].title);
        }
        speechText = director + " has directed movies such as " + speechText;
    }

    var speechResponse = {
        "speech": speechText,
        "displayText": speechText,
        "data": {},
        "contextOut":[{
            name: 'director-context',
            parameters: {
                directorName: director
            }
        }],
        "source":""
    };

    sendResponse(res, speechResponse);
}

module.exports = movieDirector;
