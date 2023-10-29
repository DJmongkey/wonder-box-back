require("dotenv").config();
const express = require("express");

const connectMongoDB = require("./db");

const indexRouter = require("./routes/indexRoutes");
const authRouter = require("./routes/authRoutes");

const app = express();

app.use(express.json())

connectMongoDB();

app.use("/", indexRouter);
app.use("/auth", authRouter);

const server = app.listen(3030);
