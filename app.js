var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');

// Actions SDK
var ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('This is the webhook for the JARVIS assistant. Please send a post request');
})

app.post('/', function(req, res){
    var assistant = new ActionsSdkAssistant({request: req, response: res});
    welcomeIntent(assistant);
});

function welcomeIntent(assistant){
    let inputPrompt = assistant.buildInputPrompt(false,
        'Hello, this is Jarvis. What can I do for you today?',
        ['Are you still there?', 'My audio sensors seem to have failed, can you repeat that?',
        'Do you want me to do something?']);
    assistant.ask(inputPrompt);
};

app.listen(port, function(){
    console.log('Listening on port ' + port);
});
