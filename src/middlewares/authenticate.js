import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { env } from '../utils/env.js';

const { Unauthorized } = createHttpError;

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new Unauthorized('No token provided'));

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env('JWT_ACCESS_SECRET'));
    const user = await User.findById(decoded.id);
    if (!user) throw new Unauthorized('User not found');

    req.user = user;
    next();
  } catch (error) {
    next(new Unauthorized('Access token expired'));
  }
};
