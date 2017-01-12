var request = require('request');
sendResponse = (require('./supportingFunctions')).sendResponse;
let API_KEY = process.env.API_KEY;

// pre: takes response and request objects as parameters
// post: sends the names of movies starring the actor(s) requested by the user
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

function getUpdatedActorList(res, movieMap, actors, counter){
    if (counter >= actors.length){
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

function generateMovieCastResponse(res, movieMap, actors){
    var numMovies = (movieMap.size > 3 ? 3 : movieMap.size);

    var speechText;
    if (numMovies === 0) {
        speechText = "I could not find any movies starring"
                    + actors.join(',');
    } else {
        var movies = movieMap.entries();
        speechText = movies.next().value;

        for (var i = 1; i < numMovies; i++){
            speechText += (i !== 1 && i === numMovies - 1 ? " and " : "");
            speechText += (", " + movies.next().value);
        }
    }

    if (actors.length == 1){
        speechText = actors[0] + " has starred in movies such as " + speechText;
    } else {
        speechText = actors.join(',') + " have starred in movies such as " + speechText;
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
