import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName, role, inviteCode } = req.body;
    
    if (role === 'admin') {
      const secretCode = process.env.ADMIN_INVITE_CODE || 'CAMPUS_ADMIN_2024';
      if (inviteCode !== secretCode) {
        return res.status(400).json({ message: 'Invalid admin invite code' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, displayName, role });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
