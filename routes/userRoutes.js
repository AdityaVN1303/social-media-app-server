import express from 'express'
import { signup , login , logout , getMe } from '../controllers/authController.js';
import {protectedRoute} from '../middleware/protectedRoute.js';
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/:username' , protectedRoute , getUserProfile);
router.get('/suggested' , protectedRoute , getSuggestedUsers)
router.post('/follow/:id' , protectedRoute , followUnfollowUser)
router.post('/update' , protectedRoute , updateUser)


export default router;