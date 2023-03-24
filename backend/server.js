const app = require ("./app");
const dotenv = require("dotenv");
const connectionDatabase = require("./db/BDD.js");
const cloudinary = require("cloudinary");
// Handling uncaught Exception
process.on("uncaughtException",(err) =>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server for Handling uncaught Exception`);
})


dotenv.config({
    path:'backend/config/.env'
})

connectionDatabase();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT, () => {
    console.log(`Serveur est sur le serveur http://localhost:${process.env.PORT}`)
})

process.on("uncaughtException",(err) =>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server for Handling uncaught Exception`);
    server.close(() => {
        process.exit(1);
    });
});