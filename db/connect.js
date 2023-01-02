const mongoose = require('mongoose');

const connectMongooseDB = (url) => {
    return mongoose.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
}

module.exports = connectMongooseDB;
