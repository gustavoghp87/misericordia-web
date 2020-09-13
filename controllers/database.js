const mongoose = require('mongoose');
const { mongodb } = require('./keys');

mongoose
    .set("useCreateIndex", true)
    .connect(mongodb.URI, {useNewUrlParser: true, useUnifiedTopology: true} )
    .then(db => console.log('Database is connected'))
    .catch(error => console.error(error));
