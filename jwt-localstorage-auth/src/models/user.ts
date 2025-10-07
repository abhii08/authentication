import { User } from '../types/index.js';

// In-memory user storage (replace with database in production)
const users: User[] = [];
let userIdCounter = 1;

// Find user by email
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

// Find user by ID
export const findUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

// Create new user
export const createUser = ({ email, password, name }: Omit<User, 'id' | 'createdAt'>): User => {
  const user: User = {
    id: userIdCounter++,
    email,
    password,
    name,
    createdAt: new Date()
  };
  users.push(user);
  return user;
};
