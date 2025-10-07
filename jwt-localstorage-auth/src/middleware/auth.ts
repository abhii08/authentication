import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthRequest, JWTPayload } from '../types/index.js';

// Middleware to authenticate JWT token
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user as JWTPayload;
    next();
  });
};
