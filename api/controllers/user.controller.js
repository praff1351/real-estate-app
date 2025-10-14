import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import User from "../models/user.model.js";

export const test = (req, res)=>{
  res.json({
    message:"Hello World!",
  })
};


export const updateUser = async(req, res, next)=>{
  if(req.user.id !== req.params.id) return next(errorHandler(401, "You can only update your own account!"));
  try {
    if(req.body.password){
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updateData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      };
    
      //only update avatar if it is provided
      if(req.body.avatar){
        updateData.avatar = req.body.avatar;
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {$set: updateData},
        {new:true}
      );

    const {password, ...rest} = updatedUser._doc;
    res.status(200).json(rest)
  } catch (error) {
    next(error);
    
  }

};