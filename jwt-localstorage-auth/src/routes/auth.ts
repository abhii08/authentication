import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser } from '../models/user.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest, RegisterRequest, LoginRequest, AuthResponse, UserResponse } from '../types/index.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req: express.Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = createUser({ email, password: hashedPassword, name });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    const response: AuthResponse = {
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req: express.Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    const response: AuthResponse = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = findUserById(req.user!.userId);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const response: { user: UserResponse } = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };

  res.json(response);
});

// Logout endpoint (client-side will remove token from localStorage)
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logout successful' });
});

// Refresh token endpoint
router.post('/refresh', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const token = jwt.sign(
      { userId: req.user!.userId, email: req.user!.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
