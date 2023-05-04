const multer=require("multer");
const MIME_TYPE={
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',
    'image/png':'png'
}
 const fileUpload=multer({
    limits:500000,
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'uploads/images')
        },
        filename:(req,file,cb)=>{
            const ext=MIME_TYPE[file.mimetype];
            cb(null, `${new Date().toISOString()}.${ext}`);
        }
    }),
    fileFilter:(req,file,cb)=>{
        const isValid = !!MIME_TYPE[file.mimetype];
        const error=isValid?null:new Error("Invaid file type");
        cb(error,isValid)
    }
})
module.exports=fileUpload