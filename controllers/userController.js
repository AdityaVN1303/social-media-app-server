import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import multer from 'multer'
import upload from '../middleware/multer.js'
import {v2 as cloudinary} from 'cloudinary'
import bcrypt from 'bcryptjs'


export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } } , {new : true});
			const authUser = await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } } , {new : true});

			res.status(200).json({ message: "User unfollowed successfully" , authUser });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } } , {new : true});
			const authUser = await User.findByIdAndUpdate(req.user._id, { $push: { following: id } } , {new : true});
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" , authUser });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		// 1,2,3,4,5,6,
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

const uploadData = upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }])
export const updateUser = async (req, res) => {

	try {

		uploadData(req, res, async function(err) {

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image/Song less than 150kb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }

		const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
		let profileImg = req.files?.profileImage?.[0];
		let coverImg = req.files?.coverImage?.[0];
		const userId = req.user._id;

		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const profileUpload = await cloudinary.uploader.upload(profileImg.path, { resource_type: "image" });
			profileImg = profileUpload.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const coverUpload = await cloudinary.uploader.upload(coverImg.path, { resource_type: "image" });
			coverImg = coverUpload.secure_url;
		}

		console.log(req.body);
		user.fullname = fullName || user.fullname;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);

	})
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const toggleBookmark = async (req , res)=>{
	try {

		const {id} = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({error : "User not found !"})
		}

		if (user.bookmarks.includes(id)) {
			const newUser = await User.findByIdAndUpdate(userId, { $pull: { bookmarks: id } } , {new : true});
			return res.status(200).json({message : "Post Removed from Bookmarks !" , newUser , bookmark:false })
		}
		else{
			const newUser = await User.findByIdAndUpdate(userId, { $push: { bookmarks: id } } , {new : true});
			return res.status(200).json({message : "Post Bookmarked Successfully !" , newUser , bookmark:true })
		}


	} catch (error) {
		console.log(error);
		return res.statsu(400).json({error : "Internal Server Error"});
	}
}

export const getBookmark = async (req , res)=>{
	try {

		const userId = req.user._id;

		const user = await User.findById(userId).populate({
			path: "bookmarks",
			populate: { path: 'user', select: '-password' }
		})
		if (!user) {
			return res.status(400).json({error : "User not found !"})
		}

		return res.status(200).json(user.bookmarks);


	} catch (error) {
		console.log(error);
		return res.status(400).json({error : "Internal Server Error"});
	}
}

export const getAllUsers = async (req , res)=>{
	try {
		const users = await User.find().select('-password');
		// console.log(users);
		return res.status(200).json(users);
	} catch (error) {
		console.log(error);
		res.status(400).json({error : "Internal Server Error"})
	}
}

