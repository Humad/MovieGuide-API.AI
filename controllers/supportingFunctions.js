// pre: takes the server response object and a custom response object
// post: sends the custom response object through the server response object as JSON
function sendResponse(res, response){
    console.log(response);
    console.log('Sending response');
    res.json(response);
};

module.exports.sendResponse = sendResponse;
