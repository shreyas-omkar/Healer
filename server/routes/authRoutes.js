import express from 'express';
import { signup, login, logout, checkAuth, deleteAccount } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-auth', checkAuth);
router.delete('/delete-account', deleteAccount);

export default router; 