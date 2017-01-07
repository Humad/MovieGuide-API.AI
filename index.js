var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function howToUse(req, res){
    console.log('This is the howToUse function');
    sendResponse(res);
};

function movieDetails(req, res){
    console.log('This is the movie details function');
    var response = {
        "speech": "You asked for details about " + req.body.result.parameters,
        "displayText": "You asked for details about " + req.body.result.parameters,
        "data": {},
        "contextOut":[],
        "source":""
    };
    sendResponse(res, response);
};

function sendResponse(res, response){
    console.log(response);
    console.log('Sending response');
    res.json(response);
};

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
