import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all profile endpoints

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
