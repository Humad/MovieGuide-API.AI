var request = require('request');

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

module.exports = movieRecommendation;
