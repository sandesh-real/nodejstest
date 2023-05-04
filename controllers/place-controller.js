const { validationResult } = require("express-validator");
const HttpError = require("../models/Http-error");
const Place = require("../models/Place");
const User=require("../models/User");
const mongoose=require("mongoose");
const fs=require("fs")
exports.getPlaces=async (req,res,next)=>{
    let places;
    try{
        places=await Place.find()
    }
    catch(err){
            return next(
              new HttpError("Something went wrong cannot find places", 500)
            );

    }
    res
      .status(200)
      .json({ places: places.map((item) => item.toObject({ getters: true })) });
}
exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
    if (!place) {
      return next(new HttpError("Could not find place with that Id", 404));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong cannot find place", 500));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
      return next(new HttpError("Could not find place with that Id", 404));
    }
  } catch (error) {
    return next(
      new HttpError("Could not find place,Something went wrong", 500)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

exports.createPlace = async (req, res, next) => {

  let { title, description, address, creator } = req.body;
  const coordinated = {
    lat: 40.7484405,
    lng: -73.9878584,
  };

  const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
  return next(new HttpError("invalid data,please check your data", 422));
  }
  let createdPlace = new Place({
    title,
    description,
    location: coordinated,
    creator,
    address,
    image:req.file.path,
  });

  let user;
  try{
    user=await User.findById(creator);
      if (!user) {
        return next(new HttpError("Could not find user with that Id", 404));
      }
  }
  catch(err){
    
   const error = new HttpError("Place cannot created,Please try again", 500);
   return next(error);
  }

  try {
    // await createdPlace.save();
    
    const sess=await mongoose.startSession();
     sess.startTransaction();
   
     await createdPlace.save({session:sess})
      
     user.places.push(createdPlace)
     
      await user.save({session:sess})
     
      await sess.commitTransaction()

  } catch (err) {
    console.log(err)
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};
exports.updatePlace = async (req, res, next) => {
  console.log('updatePlaces')
  const placeId = req.params.pid;
  const { title, description } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("invaid data, please check your data", 422);
  }
  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
    if (!updatedPlace) {
      return next(new HttpError("Could not find place with that Id", 404));
    }
  } catch (err) {
    const error = new HttpError("Place cannot update,Please try again", 500);
    return next(error);
  }
  if(updatedPlace.creator.toString()!==req.userData.userId.toString()){
    const error=new HttpError("You are not allowed to edi",401)
    return next(error)
  }
  updatedPlace.title = title;
  updatedPlace.description = description;
  try {
    await updatedPlace.save();
  } catch (err) {
    const error = new HttpError("Place cannot update,Please try again", 500);
    return next(error);
  }
  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  let path;
  try {
    place = await Place.findById({_id:placeId}).populate('creator')
     path=place.image;
    if (!place) {
      return next(new HttpError("Could not find place with that Id", 404));
    }
    
  } catch (err) {
    return next(new HttpError("Could not delete place with that Id", 404));
  }
    if (place.creator.id.toString() !== req.userData.userId.toString()) {
      const error = new HttpError("You are not allowed to delete", 401);
      return next(error);
    }
  try{
    sess=await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session:sess})
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction()

  }
  catch(err){
 const error = new HttpError("Place cannot delete,Please try again", 500);
 return next(error);
  }
  fs.unlink(path,err=>{
    console.log(err)
  })
  res.status(200).json({message:"Delete successfully"})
  
};
