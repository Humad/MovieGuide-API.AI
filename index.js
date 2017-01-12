var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// A map that stores the function for each action
var actionMap = new Map();
actionMap.set('movie.details', require('./controllers/movieDetails'));
actionMap.set('movie.cast', require('./controllers/movieCast'));
actionMap.set('movie.director', require('./controllers/movieDirector'));
actionMap.set('movie.recommendation', require('./controllers/movieRecommendation'));

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
