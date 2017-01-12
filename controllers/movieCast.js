sendResponse = (require('./supportingFunctions')).sendResponse;
let API_KEY = process.env.API_KEY;

// pre: takes response and request objects as parameters
// post: sends the names of movies starring the actor(s) requested by the user
function movieCast(req, res){
    console.log('This is the movie cast function');

    var actors = req.body.result.parameters.actorName;

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
            generateMovieCastResponse(req, res, body);
        }
    });
};

function generateMovieCastResponse(req, res, body){
    var movies = body.results[0].known_for;
    var numMovies = (movies.length > 3 ? 3 : movies.length);
    var actor = req.body.result.parameters.actorName[0];

    var speechText;
    if (numMovies === 0) {
        speechText = "I could not find any movies starring"
                    + actor;
    } else {
        speechText = movies[0].title;
        for (var i = 1; i < numMovies; i++){
            speechText += (i !== 1 && i === numMovies - 1 ? " and " : "");
            speechText += (", " + movies[i].title);
        }
    }

    speechText = actor + " has starred in movies such as " + speechText;

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
