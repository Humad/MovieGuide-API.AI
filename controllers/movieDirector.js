var request = require('request');
sendResponse = (require('./supportingFunctions')).sendResponse;
let API_KEY = process.env.API_KEY;

/**
* Finds the movies that a director is known for
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieDirector(req, res){
    console.log('This is the movie director function');
    var director = req.body.result.parameters.directorName;

    var requestOptions = {
        url: "https://api.themoviedb.org/3/search/person",
        method: "GET",
        json: {},
        qs: {
            api_key: API_KEY,
            language: "en-US",
            query: director,
            page: 1,
            include_adult: false
        }
    };

    request(requestOptions, function(err, response, body){
        console.log('Request sent to api');
        if (err || res.statusCode !== 200){
            console.log('Error from api: ' + err);
            res.status(400);
        } else {
            console.log('Request successful');
            console.log(body);
            if (body.results.length > 0){
                var movies = body.results[0].known_for;
                getUpdatedDirectorList(res, movies, director, [], 0);
            } else {
                couldNotFind(res, director);
            }
        }
    });
};

/**
* Checks which of the found movies are directed by the director
* @param {Object} res - Response
* @param {Array.<String>} movies - List of movies the director is known for
* @param {String} director - Name of the director requested by the user
* @param {Array.<String>} updatedMovies - List of movies directed by the
*   director
* @param {number} i - Counter to keep track of movies being looked up
*/
function getUpdatedDirectorList(res, movies, director, updatedMovies, i){
    var requestOptions = {
        url: "http://www.omdbapi.com/",
        method: "GET",
        json: {},
        qs: {
            t: movies[i].title,
            type: "movie",
            plot: "short",
            r: "json",
            tomatoes: "true",
            y: ""
        }
    };

    console.log('Searching for ' + movies[i]);

    request(requestOptions, function(err, response, body){
        console.log('Request sent to api');
        if (err || res.statusCode !== 200){
            console.log('Error from api: ' + err);
            res.status(400);
        } else {
            console.log('Request successful');
            console.log(body);
            if (body.Director.toLowerCase() === director.toLowerCase()){
                updatedMovies.push(movies[i]);
            }
            i++;
            if (i >= movies.length || updatedMovies.length > 3){
                generateMovieDirectorResponse(res, updatedMovies, director);
            } else {
                getUpdatedDirectorList(res, movies, director, updatedMovies, i);
            }
        }
    });
}

/**
* Generates a response for the agent
* @param {Object} res - Response
* @param {Array.<String>} movies - List of movies the director has directed
* @param {String} director - Name of the director requested by the user
*/
function generateMovieDirectorResponse(res, movies, director){

    var numMovies = (movies.length > 3 ? 3 : movies.length);

    var speechText;
    if (numMovies === 0) {
        speechText = "I could not find any movies directed by "
                    + director;
    } else {
        speechText = movies[0].title;
        for (var i = 1; i < numMovies; i++){
            speechText += (i !== 1 && i === numMovies - 1 ? " and " : "");
            speechText += (", " + movies[i].title);
        }
        speechText = director + " has directed movies such as " + speechText;
    }

    var speechResponse = {
        "speech": speechText,
        "displayText": speechText,
        "data": {},
        "contextOut":[],
        "source":""
    };

    sendResponse(res, speechResponse);
}

module.exports = movieDirector;
