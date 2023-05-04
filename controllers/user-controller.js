const HttpError = require("../models/Http-error");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");

    if (users.length === 0) {
      return next(new HttpError("Users cannot be found,Please try later", 404));
    }
  } catch (error) {
    return next(new HttpError("Users cannot be fetched,Please try later", 500));
  }
  res.json({ users: users.map((item) => item.toObject({ getters: true })) });
};

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const error = validationResult(req);

  const erroMsg = error.errors.map((item) => item.msg);
  if (!error.isEmpty()) {
    return next(new HttpError(erroMsg.join("."), 422));
  }
  let user;
  let hashPassword;
  try {
    user = await User.findOne({ email: email });
    if (user) {
      return next(new HttpError("User with same email exists", 422));
    }
  } catch (err) {
    return next(new HttpError("Could not find place with that Id", 500));
  }
  try {
       console.log(password);
    hashPassword = await bcrypt.hash(password, 12);
 

  } catch (err) {
    return next(new HttpError("Could not create usesr", 500));
  }

  const createUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashPassword,
    places: [],
  });
  let token;
  try {
    await createUser.save();
  token = jwt.sign(
    { userId: createUser.id, email: createUser.email },
    process.env.SECRET_KEY ,
    { expiresIn: "1h" }
  );
  } catch (err) {
    const error = new HttpError("User cannot created,Please try again", 500);
    return next(error);
  }
  res.status(201).json({ token: token });
};
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return next(new HttpError("User does not exist", 401));
    }
  } catch (err) {
    return next(new HttpError("Cannot login,Something went wrong", 500));
  }
  let isValidPassword;
  let token;
  try {
    
    isValidPassword = await bcrypt.compare(password, existingUser.password);
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
  } catch (err) {
    return next(
      new HttpError(
        "Could not logged you in please check your credentials and try again",
        500
      )
    );
  }
  if (!isValidPassword) {
    return next(new HttpError("Password doesnot match", 401));
  }

  res.json({
    message: "logedin",
    token: token,
  });
};

exports.getUserInfo = async (req, res, next) => {
  try{
 
   const user=await User.findById(req.userData.userId)
   
   if(!user){
    return next(new HttpError('User not found',422))
   }
   res.status(200).json({user:user.toObject({getters:true})})
  }
  catch(err){
    return next(new HttpError("Something went wrong", 401));
  }
};
