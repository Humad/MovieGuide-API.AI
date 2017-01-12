// pre: takes the server response object and a custom response object
// post: sends the custom response object through the server response object as JSON
function sendResponse(res, speechResponse){
    console.log('Sending response');
    res.json(speechResponse);
};

function containsErrors(res, response, err ){
    if (err || response.statusCode !== 200){
        res.status(400);
        res.send(err);
        return true;
    }
    return false;
}

function getPersonRequestOptions(qry){
    var requestOptions = {
        url: "https://api.themoviedb.org/3/search/person",
        method: "GET",
        json: {},
        qs: {
            api_key: API_KEY,
            language: "en-US",
            query: qry,
            page: 1,
            include_adult: false
        }
    };
    return requestOptions;
}

function informationNotFound(res, query){
    var speechResponse = {
        "speech": "I'm sorry, but I couldn't find anything on " + query,
        "displayText": "I'm sorry, but I couldn't find anything on " + query,
        "data": {},
        "contextOut":[],
        "source":""
    };
}

module.exports.sendResponse = sendResponse;
module.exports.containsErrors = containsErrors;
module.exports.getPersonRequestOptions = getPersonRequestOptions;
module.exports.informationNotFound = informationNotFound;
