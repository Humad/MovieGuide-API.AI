var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');

// Actions SDK
let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let assistant;


let intents = [
                "FIND_NEARBY_MOVIES",
                "FIND_RATING",
                "FIND_BY_DIRECTOR",
                "FIND_BY_ACTOR",
                "GIVE_DETAILS",
                "FIND_UPCOMING",
                "GIVE_RECOMMENDATION"];

let actionMap = new Map();
actionMap.set(intents[0], findNearbyMovies);
actionMap.set(intents[1], findRating);
actionMap.set(intents[2], findByDirector);
actionMap.set(intents[3], findByActor);
actionMap.set(intents[4], giveDetails);
actionMap.set(intents[5], findUpcoming);
actionMap.set(intents[6], giveRecommendation);

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('This is the webhook for the MovieBuff assistant. Please send a post request');
});

app.post('/', function(req, res){
    assistant = new ActionsSdkAssistant({request: req, response: res});
    console.log('Current intent: ' + assistant.getIntent());
    actionMap.set(assistant.StandardIntents.MAIN, welcomeIntent);
    console.log('Current action version label: ' + assistant.getActionVersionLabel());
    console.log('Current conversation ID: ' + assistant.getConversationId());
    assistant.handleRequest(actionMap);
});

function welcomeIntent(assistant){
    let inputPrompt = assistant.buildInputPrompt(false,
        'Hey there, this is Movie Buff. What\'s up?',
        ['Not in the mood to watch movies anymore?',
        'Did you leave to get some popcorn?',
        'Do you want me to do something?']);
    assistant.ask(inputPrompt);
}

function findNearbyMovies(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked to find nearby movies');
}

function findRating(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked to find rating for ' + assistant.getArgument("movieName"));
}

function findByDirector(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked to find movies by director ' + assistant.getArgument("directorName"));
}

function findByActor(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked to find movies by actor ' + assistant.getArgument("actorName"));
}

function giveDetails(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked for details for movie ' + assisant.getArgument("movieName"));
}

function findUpcoming(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked for upcoming movies');
}

function giveRecommendation(assistant){
    console.log('Current intent: ' + assistant.getIntent());
    console.log('User asked for recommendation');
}

app.listen(port, function(){
    console.log('Listening on port ' + port);
});
