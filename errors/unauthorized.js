const { StatusCodes } = require('http-status-codes');
const CustomApiError = require('./custom-api');

class UnauthorizedError extends CustomApiError {
    constructor(msg){
        super(msg);
        this.statusCode = StatusCodes.FORBIDDEN;
    }
}

module.exports = UnauthorizedError;