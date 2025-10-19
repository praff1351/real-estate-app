import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";

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

export const deleteUser = async(req, res, next)=>{
  if(req.user.id!==req.params.id){
    return next(errorHandler(401, "You can delete only your own account!"));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json({message:"User has been deleted..."});
    
  } catch (error) {
    next(error);
    
  }

};

export const getUserListings = async(req, res, next)=>{
  if(req.user.id === req.params.id){
    try {
      const listings = await Listing.find({userRef: req.params.id});
      res.status(200).json(listings);
      
    } catch (error) {
      console.error("Error fetching listings:, error");
      res.status(500).json({
        success:false,
        message: error.message,
      });
      
    }
  }else{
    return next(errorHandler(401, 'You can only view your own listings.'));
  }

};
export const getUser = async(req, res, next)=>{
  try {
    
  
  const user = await User.findById(req.params.id);

  if(!user) return next(errorHandler(404, 'User not found!'));

  const {password: pass, ...rest} = user._doc;

  res.status(200).json(rest);
} catch (error) {
  next(error);

}
}
