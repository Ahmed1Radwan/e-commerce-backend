const { StatusCodes } = require('http-status-codes');
const CustomApiError = require('./custom-api');

class BadRequestError extends CustomApiError{
    constructor(msg){
        super(msg);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}

module.exports = BadRequestError;