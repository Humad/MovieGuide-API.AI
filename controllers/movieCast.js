var request = require('request');
var suppFunc = require('./supportingFunctions')
var sendResponse = suppFunc.sendResponse;
var containsErrors = suppFunc.containsErrors;
var getPersonRequestOptions = suppFunc.getPersonRequestOptions;
var informationNotFound = suppFunc.informationNotFound;
let API_KEY = process.env.API_KEY;

/**
* Finds the movies that ONE actor is known for
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieCast(req, res){
    // list of actors requested by the user
    var actors = req.body.result.parameters.actorName;
    // to map each movie to the number of occurrences
    var movieMap = new Map();

    request(getPersonRequestOptions(actors[0]), function(err, response, body){
        if (!containsErrors(res, response, err)){
            if (body.results.length > 0){

                // list of movies the actor is known for
                var movies = body.results[0].known_for;

                // mapping each movie to one occurrence
                for (var i = 0; i < movies.length; i++){
                    movieMap.set(movies[i].title, 1);
                }

                getUpdatedActorList(res, movieMap, actors, 1);
            } else {
                informationNotFound(res, actors[0]);
            }
        }
    });
};

/**
* Finds movies by other actors and checks if there are any shared movies
* @param {Object} res - Response
* @param {Map.<String, number>} movieMap - Movie names mapped to counters
*   to check if the movie is common between multiple actors
* @param {Array.<String>} actors - List of actors requested by the user
* @param {number} counter - Counter that keeps track of what actor is being
*   looked up
*/
function getUpdatedActorList(res, movieMap, actors, counter){

    if (counter >= actors.length){ // if all actors have been looked up
        // delete movies that don't contain all actors
        movieMap.forEach(function(value, key, map){
            if (map.get(key) != actors.length){
                map.delete(key);
            }
        });

        generateMovieCastResponse(res, movieMap, actors);
    } else {
        request(getPersonRequestOptions(actors[counter]), function(err, response, body){
            if (!containsErrors(res, response, err)){
                if (body.results.length > 0){

                    var movies = body.results[0].known_for;

                    // only update number of occurrences if the movie exists in
                    // the map
                    for (var i = 0; i < movies.length; i++){
                        if (movieMap.has(movies[i].title)){
                            if (movieMap.get(movies[i].title) == counter){
                                movieMap.set(movies[i].title, counter + 1);
                            }
                        }
                    }

                    getUpdatedActorList(res, movieMap, actors, counter + 1);
                } else {
                    informationNotFound(actors[counter]);
                }
            }
        });
    }
}

/**
* Generates a response to be sent to the agent
* @param {Object} res - Response
* @param {Map.<String, number>} movieMap - Movie names mapped to counters
*   to check if the movie is common between multiple actors
* @param {Array.<String>} actors - List of actors requested by the user
*/
function generateMovieCastResponse(res, movieMap, actors){
    // maximum number of movies to show is 3
    var numMovies = (movieMap.size > 3 ? 3 : movieMap.size);
    var speechText;

    if (numMovies === 0) { // if no movies with all actors were found
        speechText = "I could not find any movies starring "
                    + actors.join(',');
    } else {
        var movies = movieMap.entries();
        speechText = movies.next().value[0];

        for (var i = 1; i < numMovies; i++){
            speechText += (i !== 1 && i === numMovies - 1 ? " and" : "");
            speechText += (", " + movies.next().value[0]);
        }

        if (actors.length == 1){
            speechText = actors[0] + " has starred in movies such as " + speechText;
        } else {
            speechText = actors.join(',') + " have starred in movies such as " + speechText;
        }
    }

    var speechResponse = {
        "speech": speechText,
        "displayText": speechText,
        "data": {},
        "contextOut":[],
        "source":""
    };

    sendResponse(res, speechResponse);
};

module.exports = movieCast;
