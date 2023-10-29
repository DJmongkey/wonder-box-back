require("dotenv").config()
const express = require("express")

const app = express()

connectMongoDB();

const server = app.listen(3030);
