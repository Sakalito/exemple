const express = require("express");
const app = express();
const ErrorHandLer = require("./middleware/error");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/build")));


const product = require("./routes/ProductRoutes");
const user = require("./routes/UserRoutes");
const order = require("./routes/OrderRoutes");
const payment = require("./routes/PaymentRoutes");
app.use("/api", product);
app.use("/api", user);
app.use("/api", order);
app.use("/api", payment);
app.use(ErrorHandLer);

module.exports = app;
