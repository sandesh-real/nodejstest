const express=require("express");
const router=express.Router();
const placeController=require("../controllers/place-controller")
const fileUpload=require("../middleware/file-upload")
const {check}=require('express-validator')
const authMiddleware=require("../middleware/auth");

router.get('/',placeController.getPlaces)
router.get("/:pid", placeController.getPlaceById);   
router.get('/user/:uid',placeController.getPlacesByUserId);
router.use(authMiddleware)
router.post('/',fileUpload.single('image'),[
  check('title').not().isEmpty(),
  check("description").isLength({min:5}),
],placeController.createPlace);
router.patch('/:pid',[
  check('title').not().isEmpty(),
  check("description").isLength({min:5}),
],placeController.updatePlace);
router.delete('/:pid',placeController.deletePlace)

module.exports=router;