import express from 'express'
import {protectedRoute} from '../middleware/protectedRoute.js';
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser , toggleBookmark , getBookmark , getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/:username' , protectedRoute , getUserProfile);
router.get('/suggested' , protectedRoute , getSuggestedUsers)
router.post('/follow/:id' , protectedRoute , followUnfollowUser)
router.post('/update' , protectedRoute , updateUser)
router.post('/toggle/:id' , protectedRoute , toggleBookmark);
router.get('/bookmark' , protectedRoute , getBookmark);
router.get('/all' , protectedRoute , getAllUsers);


export default router;