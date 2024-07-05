import User from "../models/userModel.js";
import * as EmailValidator from 'email-validator';
import bcrypt from 'bcryptjs'
import {generateTokenAndSetCookie} from '../lib/utils/generateToken.js'

export const getMe = async (req , res)=>{
    try {
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json(user);
    } catch (error) {
        console.log(`Error in getMe Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}


export const signup = async (req , res)=>{
   try {
    const {fullname , username , email , password} = req.body;
   const validate =  EmailValidator.validate(email);

   if(!validate){
    return res.status(400).json({error : "Please enter a Valid Email"});
   }

   const existingUser = await User.findOne({username});
   if (existingUser) {
    return res.status(400).json({error : "Username already Taken!"})
   }

   const existingEmail = await User.findOne({email});
   if (existingEmail) {
    return res.status(400).json({error : "Email already Exists!"})
   }

   if(password.length < 6){
    return res.status(400).json({error : "Password Must be atleast 6 letters Long !"})
   }

   const salt = await bcrypt.genSalt(10)
   const hashedPass = await bcrypt.hash(password , salt);

   const newUser = new User({
    username , 
    password : hashedPass ,
    fullname , 
    email
   });

   if (newUser) {
    generateTokenAndSetCookie(newUser._id , res);
    await newUser.save();

    res.status(201).json({
        _id : newUser._id , 
        username : newUser.username,
        fullname : newUser.fullname , 
        email : newUser.email, 
        profileImg : newUser.profileImg, 
        coverImg : newUser.coverImg, 
        bio : newUser.bio , 
        followers : newUser.followers, 
        following : newUser.following
    })

   } else {
    return res.status(500).json({error : "Invalid User Data"});
   }


   } catch (error) {
    console.log(`Error in signup Controller : ${error.message}`);
    return res.status(400).json({error : "Internal Server Error"});
   }
}

export const login = async (req , res)=>{
    try {
        const {username , password} = req.body;

        const existingUser = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password , existingUser?.password || "");

        if (!existingUser || !isPasswordCorrect) {
            return res.status(400).json({error : "Invalid Username or Password"});
        }

        generateTokenAndSetCookie(existingUser._id , res);

        res.status(200).json({
            _id : existingUser._id , 
            username : existingUser.username,
            fullname : existingUser.fullname , 
            email : existingUser.email, 
            profileImg : existingUser.profileImg, 
            coverImg : existingUser.coverImg, 
            bio : existingUser.bio , 
            followers : existingUser.followers, 
            following : existingUser.following
        })


    } catch (error) {
        console.log(`Error in Login Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

export const logout = async (req , res)=>{
    try {
        res.cookie("jwt" , "", {
            maxAge : 0
        })
        res.status(200).json({message : "Logged Out Successfully !"});
    } catch (error) {
        console.log(`Error in Logout Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}


