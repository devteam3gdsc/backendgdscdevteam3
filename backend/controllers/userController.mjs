import User from "../models/Users.mjs"   
import { v2 } from "cloudinary";
const userController ={
// GET /user/detail
getUserInfo: async (req,res)=>{
    try {
        const userId = req.user.id;
      // nếu muốn chỉnh lại quyền thành chính chủ mới xem được thì ở đây lấy userId để xác thực từ cookies? hay nói cách khác là lấy userId từ cookies
      const user = await User.findById(userId)
      const displayname = user.displayname;
      const avatar = user.avatar;
      return res.status(200).json({
        displayname:displayname,
        avatar:avatar
      })
    } catch (error) {
      res.status(500).json(error)
    }
  },

  // PUT /user/update
  updateUserInfo: async (req,res)=>{
    try {
        const userId = req.user.id;
      const displayname = req.body.displayname;
      const avatarURL = req.file.path;
      console.log(displayname);
      const user = await User.findById(userId);
      if (user.avatar){
        const URLparts = user.avatar.split('/');
        const URLlastPart = URLparts[URLparts.length - 1].split('.')
        const anotherURL = URLlastPart[0];
        const publicId = URLparts[URLparts.length - 2] + '/' + anotherURL;
        await v2.uploader.destroy(publicId,{resource_type:"raw"})
      };

      await user.updateOne({$set:{displayname:displayname,avatar:avatarURL}});
      await Post.updateMany({author:userId},{authorname:displayname,avatar:avatarURL});
      console.log(1);
      await Comment.updateMany({author:userId},{authorname:displayname,avatar:avatarURL});
      return res.status(200).json("Updated success!")
    } catch (error) {
      res.status(500).json(error)
    }
  } 
}
export default userController;
   