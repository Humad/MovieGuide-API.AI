var request = require('request');
var suppFunc = require('./supportingFunctions')
var cheerio = require('cheerio');
var sendResponse = suppFunc.sendResponse;
var containsErrors = suppFunc.containsErrors;
var getPersonRequestOptions = suppFunc.getPersonRequestOptions;
var informationNotFound = suppFunc.informationNotFound;

/**
* Finds the movies that a director is known for by scraping IMDb
* @param {Object} req - Request
* @param {Object} res - Response
*/
function movieDirector(req, res){
    console.log('Request received for movieDirector');
    // name of the director requested by the user
    var director = req.body.result.parameters.directorName
    var url = 'http://www.imdb.com/find?q=' +
                encodeURIComponent(req.body.result.parameters.directorName) +
                '&s=nm&ref_=fn_nm';

    request(url, function(err, response, body){
        if (!containsErrors(res, response, err)){
            var $ = cheerio.load(body);
            var result = $('.result_text a').first();
            var resultName = result.text();
            if (resultName.toLowerCase() !== director.toLowerCase()) {
                console.log('Director not found');
                informationNotFound(res, director);
            } else {
                var resultLink = result.attr('href');
                console.log('Information found');
                findDirected('http://www.imdb.com' + resultLink, res, director);
            }
        }
    });
};

/**
* Finds the movies directed by the requested director by scraping IMDb
* @param {String} url - URL for director's IMDb page
* @param {Array.<String>} movies - List of movies the director has directed
* @param {String} director - Name of the director requested by the user
*/
function findDirected(url, res, director){
    console.log('Finding movies directed by ' + director);
    console.log(url);
    var movies = [];
    request(url, function(err, response, body){
        if (!containsErrors(res, response, err)){
            console.log('Getting movies by ' + director);
            var $ = cheerio.load(body);
            var result = $('#filmo-head-director').next().find('a');
            result.each(function(index, element){
                console.log($(this).text());
                movies.push($(this).text());
            });
            if (movies.length > 0){
                console.log(movies.length + ' movies found');
                console.log(movies);
                generateMovieDirectorResponse(res, movies, director);
            } else {
                informationNotFound(res, director);
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
    console.log('Generating director response');
    // maximum number of movies to show is 3
    var numMovies = (movies.length > 3 ? 3 : movies.length);
    var speechText;
    contextOut = [
        {name: 'director-context', parameters: {directorName: director}}
    ];

    if (numMovies === 0) { // if no movies were found
        console.log('No movies found');
        speechText = "I could not find any movies directed by "
                    + director;
    } else {
        console.log('Movies found');
        speechText = movies[0];
        contextOut.push(
            {name: 'movie-details-context', parameters: {movieName: movies[0]}}
        );
        for (var i = 1; i < numMovies; i++){
            speechText += (i !== 1 && i === numMovies - 1 ? " and " : "");
            speechText += (", " + movies[i]);
        }
        speechText = director + " has directed movies such as " + speechText;
    }

    var speechResponse = {
        "speech": speechText,
        "displayText": speechText,
        "data": {},
        "contextOut": contextOut,
        "source":""
    };

    sendResponse(res, speechResponse);
}

module.exports = movieDirector;
