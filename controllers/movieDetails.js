var request = require('request');
sendResponse = (require('./supportingFunctions')).sendResponse;


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
        if (!containsErrors(res, response, err)){
            generateMovieDetailResponse(req, res, body);
        }
    });
};

/**
* Gets particular movie details requested by the user
* @param {Object} req - Request
* @param {Object} res - Response
* @param {Object} data - Movie details as JSON
*/
function generateMovieDetailResponse(req, res, data){
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

    var speechResponse = {
        "speech": speechText,
        "displayText": speechText,
        "data": {},
        "contextOut":contextOut,
        "source":""
    };

    sendResponse(res, speechResponse);
}

module.exports = movieDetails;
