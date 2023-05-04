const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const placeRouter = require("./routes/place-routes");
const userRouter = require("./routes/user-routes");
const HttpError = require("./models/Http-error");
const fs=require('fs');
const path=require("path")
const dotenv = require("dotenv");
dotenv.config();
const port=5000;
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,PUT");
  next();
});
app.use('/uploads/images',express.static(path.join('uploads','images')))
app.use("/api/places", placeRouter);
app.use("/api/users", userRouter);
app.use((req, res, next) => {
  throw new HttpError("Page could not found", 404);
});
app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path,err=>{
      console.log(err)
    })
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "Something went wrong" });
});
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wpjondw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("connected");
    app.listen(process.env.port || port);
  })
  .catch((err) => console.log(err));
