var request = require('request');
var suppFunc = require('./supportingFunctions');
var sendResponse = suppFunc.sendResponse;
var containsErrors = suppFunc.containsErrors;
var getPersonRequestOptions = suppFunc.getPersonRequestOptions;
var informationNotFound = suppFunc.informationNotFound;

/**
* Locate the first actor by scraping IMDb
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieCast(req, res){
    console.log('Request received for movieCast');
    // list of actors requested by the user
    var actors = req.body.result.parameters.actorName;
    // to map each movie to the number of occurrences
    var movieMap = new Map();

    var url = 'http://www.imdb.com/find?q=' +
                encodeURIComponent(actors[0]) +
                '&s=nm&ref_=fn_nm';

    request(url, function(err, response, body){
        if (!containsErrors(res, response, err)){
            var $ = cheerio.load(body);
            var result = $('.result_text a').first();
            var resultName = result.text();
            if (resultName.toLowerCase() !== actors[0].toLowerCase()) {
                console.log('Actor not found');
                informationNotFound(res, actors[0]);
            } else {
                var resultLink = result.attr('href');
                console.log('Information found');
                findMovies(resultLink, res, actors, 0, movieMap);
            }
        }
    });
};

/**
* Find movies for an actor
* @param {String} url - URL for actor's IMDb page
* @param {Object} res - Response
* @param {Array.<String>} actors - List of actors requested by the user
* @param {Number} counter - Current actor being looked up
* @param {Map.<String, number>} movieMap - Movie names mapped to counters
*   to check if the movie is common between multiple actors
*/
function findMovies(url, res, actors, counter, movieMap){
    request(url, function(err, response, body){
        if (!containsErrors(res, response, err)){
            console.log('Getting movies by ' + actors[counter]);
            var $ = cheerio.load(body);
            var result = $('#filmo-head-actor').next().find('a');
            result.each(function(index, element){
                if (!$(this).hasClass('in_production')){
                    var movieName = $(this).text();
                    if (movieMap.has(movieName) || counter === 0){
                        if (counter === 0){
                            movieMap.set(movieName, 1);
                        }
                        if (movieMap.get(movieName) == counter){
                            movieMap.set(movieName, counter + 1);
                        }
                    }
                }
            });
            findOtherActors(res, actors, counter + 1, movieMap);
        }
    });
}

/**
* Find other actors requested by the user
* @param {String} url - URL for actor's IMDb page
* @param {Object} res - Response
* @param {Array.<String>} actors - List of actors requested by the user
* @param {Number} counter - Current actor being looked up
* @param {Map.<String, number>} movieMap - Movie names mapped to counters
*   to check if the movie is common between multiple actors
*/
function findOtherActors(url, res, actors, counter, movieMap){
    if (counter >= actors.length){ // if all actors have been looked up
        // delete movies that don't contain all actors
        movieMap.forEach(function(value, key, map){
            if (map.get(key) != actors.length){
                map.delete(key);
            }
        });
    } else {
        console.log('Finding movies with ' + actors[counter]);
        var url = 'http://www.imdb.com/find?q=' +
                    encodeURIComponent(actors[counter]) +
                    '&s=nm&ref_=fn_nm';

        request(url, function(err, response, body){
            if (!containsErrors(res, response, err)){
                var $ = cheerio.load(body);
                var result = $('.result_text a').first();
                var resultName = result.text();
                if (resultName.toLowerCase() !== actors[counter].toLowerCase()) {
                    console.log('Actor not found');
                    informationNotFound(res, actors[counter]);
                } else {
                    var resultLink = result.attr('href');
                    console.log('Information found');
                    findMovies(resultLink, res, actors, counter, movieMap);
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
    console.log('Generating movie cast response');
    // maximum number of movies to show is 3
    var numMovies = (movieMap.size > 3 ? 3 : movieMap.size);
    var speechText;
    contextOut = [
        {name: 'actor-context', parameters: {actorName: actors[0]}}
    ];

    if (numMovies === 0) { // if no movies with all actors were found
        console.log('No common movies found');
        speechText = "I could not find any movies starring "
                    + actors.join(',');
    } else {
        console.log('Common movies found');
        var movies = movieMap.entries();
        speechText = movies.next().value[0];
        contextOut.push(
            {name: 'movie-details-context', parameters: {movieName: speechText}}
        );

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
        "contextOut": contextOut,
        "source":""
    };

    sendResponse(res, speechResponse);
};

module.exports = movieCast;
