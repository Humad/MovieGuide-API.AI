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

function sendResponse(res){
    var response = {
        "speech": "You can ask me to help you with Movies!",
        "displayText": "You can ask me to help you with Movies!",
        "data": {},
        "contextOut":{},
        "source":""
    };

    res.json(response);
}

var actionMap = new Map();
actionMap.set('howToUse', howToUse);

app.get('/', function(req, res){
    res.send('This is the webhook for MovieBuff. Send a POST request');
});

app.post('/', function(req, res){
    if (!req.body.result){
        console.log('Incorrect JSON object send');
    } else {
        var actionName = req.body.result.action;
        if (actionMap.has(actionName)){
            actionMap.get(actionName)(req, res);
        } else {
            sendResponse(res);
        }
    }
});



app.listen(port, function(){
    console.log('App listening on ' + port);
});
