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

app.listen(3030, () => {
  console.log(`Server runnig at http://localhost:3030`);
});