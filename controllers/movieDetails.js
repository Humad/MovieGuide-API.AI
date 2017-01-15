var request = require('request');
var suppFunc = require('./supportingFunctions');
var sendResponse = suppFunc.sendResponse;
var containsErrors = suppFunc.containsErrors;

/**
* Gets particular movie details requested by the user
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieDetails(req, res){
    console.log('Request received for movie details');

    var requestOptions = {
        url: "http://www.omdbapi.com/",
        method: "GET",
        json: {},
        qs: {
            t: req.body.result.parameters.movieName,
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
            generateMovieDetailResponse(req, res, body);
        } // add else clause!
    });
};

/**
* Gets particular movie details requested by the user
* @param {Object} req - Request
* @param {Object} res - Response
* @param {Object} data - Movie details as JSON
*/
function generateMovieDetailResponse(req, res, data){
    console.log('Generating movie details response');
    var speechText;
    var contextOut = [];
    switch (req.body.result.parameters.movieDetails) {
        case "director":
            speechText = data.Title + " is directed by " + data.Director;
            contextOut = [{
                name: "director-context",
                parameters: {
                    directorName: data.Director
                }
            }];
            break;
        case "year":
            speechText = data.Title + " was released in the year " + data.Year;
            break;
        case "cast":
            speechText = data.Title + " stars " + data.Actors;
            contextOut = [{
                name: "actor-context",
                parameters: {
                    actorName: data.Actors.split(',')
                }
            }];
            break;
        case "plot":
            speechText = data.Plot;
            break;
        case "score":
            speechText = data.Title + " has a score of " + data.tomatoMeter
                        + " percent on Rotten Tomatoes. " + data.tomatoConsensus;
            break;
        default:
            speechText = data.Title + " was released in "
                        + data.Year + ". It is directed by " + data.Director
                        + " and stars " + data.Actors + ". " + data.Plot
                        + ". The movie has a rating of " + data.tomatoMeter
                        + " percent on Rotten Tomatoes";
        }

    contextOut.push({name: 'movie-details-context', parameters: {movieName: data.Title}});

    var speechResponse = {
        "speech": speechText,
        "displayText": speechText,
        "data": {},
        "contextOut": contextOut,
        "source":""
    };

    sendResponse(res, speechResponse);
}

module.exports = movieDetails;
