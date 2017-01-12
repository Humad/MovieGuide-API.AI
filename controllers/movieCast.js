var request = require('request');
sendResponse = (require('./supportingFunctions')).sendResponse;
let API_KEY = process.env.API_KEY;

/**
* Finds the movies that ONE actor is known for
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieCast(req, res){
    console.log('This is the movie cast function');

    var actors = req.body.result.parameters.actorName;
    var movieMap = new Map();

    var requestOptions = {
        url: "https://api.themoviedb.org/3/search/person",
        method: "GET",
        json: {},
        qs: {
            api_key: API_KEY,
            language: "en-US",
            query: actors[0],
            page: 1,
            include_adult: false
        }
    };

    request(requestOptions, function(err, response, body){
        console.log('Request sent to api');
        if (err || res.statusCode !== 200){
            console.log('Error from api: ' + err);
            res.status(400);
        } else {
            console.log('Request successful');
            console.log(body);
            var movies = body.results[0].known_for;
            for (var i = 0; i < movies.length; i++){
                movieMap.set(movies[i].title, 1);
            }

            getUpdatedActorList(res, movieMap, actors, 1);
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
    if (counter >= actors.length){
        movieMap.forEach(function(value, key, map){
            if (map.get(key) != actors.length){
                map.delete(key);
            }
        });
        generateMovieCastResponse(res, movieMap, actors);
    } else {
        var requestOptions = {
            url: "https://api.themoviedb.org/3/search/person",
            method: "GET",
            json: {},
            qs: {
                api_key: API_KEY,
                language: "en-US",
                query: actors[counter],
                page: 1,
                include_adult: false
            }
        };

        request(requestOptions, function(err, response, body){
            console.log('Request sent to api');
            if (err || res.statusCode !== 200){
                console.log('Error from api: ' + err);
                res.status(400);
            } else {
                console.log('Request successful');
                console.log(body);
                var movies = body.results[0].known_for;
                for (var i = 0; i < movies.length; i++){
                    if (movieMap.has(movies[i].title)){
                        if (movieMap.get(movies[i].title) == counter){
                            movieMap.set(movies[i].title, counter + 1);
                        }
                    }
                }
                getUpdatedActorList(res, movieMap, actors, counter + 1);
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
    var numMovies = (movieMap.size > 3 ? 3 : movieMap.size);

    var speechText;
    if (numMovies === 0) {
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
