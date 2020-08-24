const DB = require('./env.json').DB;

module.exports = {
    mongodb: {
        URI: DB
    }
};