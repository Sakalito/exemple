const mongoose = require("mongoose");

const connectionDatabase = () => {
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((data) => {
        console.log(`MongoDB est connecté au serveur ${data.connection.host}`)
    })
}

module.exports = connectionDatabase