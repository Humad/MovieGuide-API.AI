var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// pre: takes request and response objects as parameters
// post: sends instructions to the user about how to use the agent
function howToUse(req, res){
    console.log('This is the howToUse function');
    sendResponse(res);
};

// pre: takes request and response objects as parameters
// post: sends details regarding the movie the user asked for
function movieDetails(req, res){
    console.log('This is the movie details function');
    var response = {
        "speech": "You asked for details about " + req.body.result.parameters.movieName,
        "displayText": "You asked for details about " + req.body.result.parameters.movieName,
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
