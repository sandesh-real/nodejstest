const express=require("express");
const {check} =require("express-validator")
const fileUpload =require("../middleware/file-upload");
const router=express.Router();
const userController=require("../controllers/user-controller");
const auth=require("../middleware/auth");
router.get("/", userController.getUsers);
router.post(
  "/signup",
  fileUpload.single('image'),[
    (check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password", "invaid password. length should be 6").isLength({
      min: 6,
    }))
  ],
  userController.signup
);
router.post('/login',userController.login)
router.use(auth);
router.get("/userInfo",userController.getUserInfo);

module.exports=router;