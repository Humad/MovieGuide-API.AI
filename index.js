var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
    res.send('This is a webhook for the MovieBuff API. Send a POST request');
});

app.post('/', function(req, res){
    res.send(req.body);
    console.log(req.body);
});

app.listen(port, function(){
    console.log('App listening on ' + port);
});
