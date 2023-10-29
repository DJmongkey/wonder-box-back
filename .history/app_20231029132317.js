require("dotenv").config()
const express = require("express")

const connectMongoDB = require("./db");

const indexRouter = require("/")

const app = express()

connectMongoDB();

app.use("/", index)

const server = app.listen(3030);
