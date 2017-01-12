sendResponse = (require('./supportingFunctions')).sendResponse;

// pre: takes request and response objects as parameters
// post: sends details regarding the movie the user asked for
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
        console.log('Request sent to api');
        if (err || res.statusCode !== 200){
            console.log('Error from api: ' + err);
            res.status(400);
        } else {
            console.log('Request successful');
            generateMovieDetailResponse(req, res, body);
        }
    });
};

function generateMovieDetailResponse(req, res, data){
    var speechText;
    switch (req.body.result.parameters.movieDetails) {
        case "director":
            speechText = data.Title + " is directed by " + data.Director;
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
        "contextOut":[],
        "source":""
    };

    sendResponse(res, speechResponse);
}

module.exports = movieDetails;
