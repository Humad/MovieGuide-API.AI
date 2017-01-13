/**
* Sends response to the agent as JSON
* @param {Object} res - Response
*/
function sendResponse(res, speechResponse){
    console.log('Sending response');
    res.json(speechResponse);
};

/**
* Gets particular movie details requested by the user
* @param {Object} res - Response
* @param {Object} response - Response object from the movie database
* @param {Object} err - Error object
* @return {boolean} - True if error found, false otherwise
*/
function containsErrors(res, response, err){
    if (err || response.statusCode !== 200){
        res.status(400);
        res.send(err);
        return true;
    }
    return false;
}

/**
* Creates options for the request module to send a request
* @param {String} qry - The user's search query
* @return {Object} requestOptions - Object with options for request module
*/
function getPersonRequestOptions(qry){
    var requestOptions = {
        url: "https://api.themoviedb.org/3/search/person",
        method: "GET",
        json: {},
        qs: {
            api_key: process.env.API_KEY,
            language: "en-US",
            query: qry,
            page: 1,
            include_adult: false
        }
    };
    return requestOptions;
}

/**
* Generates a response for when information requested is not found
* @param {Object} res - Response
* @param {String} query - User's search query
*/
function informationNotFound(res, query){
    var speechResponse = {
        "speech": "I'm sorry, but I couldn't find anything on " + query,
        "displayText": "I'm sorry, but I couldn't find anything on " + query,
        "data": {},
        "contextOut":[],
        "source":""
    };
    sendResponse(res, speechResponse);
}

module.exports.sendResponse = sendResponse;
module.exports.containsErrors = containsErrors;
module.exports.getPersonRequestOptions = getPersonRequestOptions;
module.exports.informationNotFound = informationNotFound;
