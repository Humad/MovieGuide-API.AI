var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let API_KEY = process.env.API_KEY;

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

// pre: takes request and response objects as parameters
// post: sends the names of movies directed by the director requested by the user
function movieDirector(req, res){
    console.log('This is the movie director function');
    var director = req.body.result.parameters.directorName;

    var requestOptions = {
        url: "https://api.themoviedb.org/3/search/person",
        method: "GET",
        json: {},
        qs: {
            api_key: API_KEY,
            language: "en-US",
            query: director,
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
            var director = req.body.result.parameters.directorName;
            getUpdatedMovieList(res, movies, director, [], 0);
        }
    });
};

// to-do: this is a redundant function; find a way to merge with moviecastresponse
function generateMovieDirectorResponse(res, movies, director){

    var numMovies = (movies.length > 3 ? 3 : movies.length);

    var speechText;
    if (numMovies === 0) {
        speechText = "I could not find any movies directed by "
                    + director;
    } else {
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
        "contextOut":[],
        "source":""
    };

    sendResponse(res, speechResponse);
}

function getUpdatedMovieList(res, movies, director, updatedMovies, i){
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

    console.log('Searching for ' + movies[i]);

    request(requestOptions, function(err, response, body){
        console.log('Request sent to api');
        if (err || res.statusCode !== 200){
            console.log('Error from api: ' + err);
            res.status(400);
        } else {
            console.log('Request successful');
            console.log(body);
            if (body.Director === director){
                updatedMovies.push(movies[i]);
            }
            i++;
            if (i >= movies.length || updatedMovies.length > 3){
                generateMovieDirectorResponse(res, updatedMovies, director);
            } else {
                getUpdatedMovieList(res, movies, director, updatedMovies, i);
            }
        }
    });
}

// pre: takes request and response objects as parameters
// post: gives a movie recommendation to the user
function movieRecommendation(req, res){
    console.log('This is the movie recommendation function');
    var response = {
        "speech": "You asked for a recommendation",
        "displayText": "You asked for a recommendation",
        "data": {},
        "contextOut":[],
        "source":""
    };
    sendResponse(res, response);
};

// pre: takes the server response object and a custom response object
// post: sends the custom response object through the server response object as JSON
function sendResponse(res, response){
    console.log(response);
    console.log('Sending response');
    res.json(response);
};

// A map that stores the function for each action
var actionMap = new Map();
actionMap.set('movie.details', movieDetails);
actionMap.set('movie.cast', movieCast);
actionMap.set('movie.director', movieDirector);
actionMap.set('movie.recommendation', movieRecommendation);


app.get('/', function(req, res){
    res.send('This is the webhook for MovieBuff. Send a POST request');
});

app.post('/', function(req, res){
    if (!req.body.result){
        console.log('Incorrect JSON object sent');
    } else {
        var actionName = req.body.result.action;
        if (actionMap.has(actionName)){
            actionMap.get(actionName)(req, res);
        } else {
            console.log('No function found for requested action');
            sendResponse(res, response);
        }
    }
});



app.listen(port, function(){
    console.log('App listening on ' + port);
});
