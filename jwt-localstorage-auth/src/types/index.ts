import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserResponse;
}
