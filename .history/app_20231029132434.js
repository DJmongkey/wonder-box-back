require("dotenv").config()
const express = require("express")

const connectMongoDB = require("./db");

const indexRouter = require("./routes/indexRoutes");

const app = express()

connectMongoDB();

app.use("/", indexRouter)

const server = app.listen(3030);
