var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let API_KEY = "7532c5a122204ba501be1d49beed6b53";

// pre: takes request and response objects as parameters
// post: sends instructions to the user about how to use the agent
function howToUse(req, res){
    console.log('This is the howToUse function');
    sendResponse(res);
};

// pre: takes request and response objects as parameters
// post: sends details regarding the movie the user asked for
function movieDetails(req, res){
    console.log('Request received for movie details');

    var requestOptions = {
        url: "https://api.themoviedb.org/3/search/movie",
        method: "GET",
        json: {},
        qs: {
            api_key: API_KEY,
            language: "en-us",
            query: req.body.result.parameters.movieName,
            page: 1,
            include_adult:false
        }
    };

    request(requestOptions, function(err, response, body){
        console.log('Request sent to api');
        if (err || res.statusCode !== 200){
            console.log('Error from api: ' + err);
            res.status(400);
        } else {
            console.log('Request successful');
            var movieData = body.results[0];

            var speechText = movieData.title + " was released on "
                            + movieData.release_date + ". Here is what I found about the plot,"
                            + movieData.overview;


            var speechResponse = {
                "speech": speechText,
                "displayText": speechText,
                "data": {},
                "contextOut":[],
                "source":""
            };

            sendResponse(res, speechResponse);
        }
    });
};

// pre: takes response and request objects as parameters
// post: sends the names of movies starring the actor(s) requested by the user
function movieCast(req, res){
    console.log('This is the movie cast function');
    var response = {
        "speech": "You asked for details about " + req.body.result.parameters.actorName[0],
        "displayText": "You asked for details about " + req.body.result.parameters.actorName[0],
        "data": {},
        "contextOut":[],
        "source":""
    };
    sendResponse(res,response);
};

// pre: takes request and response objects as parameters
// post: sends the names of movies directed by the director requested by the user
function movieDirector(req, res){
    console.log('This is the movie director function');
    var response = {
        "speech": "You asked for details about " + req.body.result.parameters.directorName[0],
        "displayText": "You asked for details about " + req.body.result.parameters.directorName[0],
        "data": {},
        "contextOut":[],
        "source":""
    };
    sendResponse(res, response);
};

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
actionMap.set('howToUse', howToUse);
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
