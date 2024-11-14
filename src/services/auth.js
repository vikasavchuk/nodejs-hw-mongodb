import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import createHttpError from 'http-errors';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

export const createUser = async (userData) => {
  const { name, email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new createHttpError.Conflict('Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  return await user.save();
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new createHttpError.Unauthorized('Invalid email or password');
  }

  await Session.deleteOne({ userId: user._id });
  const tokens = generateTokens(user._id);
  const session = new Session({ userId: user._id, ...tokens });
  await session.save();

  return tokens;
};

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new createHttpError.Unauthorized('Access token expired');
  }
};

export const refreshSession = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const userId = decoded.userId;
    await Session.deleteOne({ userId });

    const tokens = generateTokens(userId);
    const session = new Session({ userId, ...tokens });
    await session.save();

    return tokens;
  } catch {
    throw new createHttpError.Unauthorized('Invalid refresh token');
  }
};

export const logoutUser = async (userId) => {
  await Session.deleteOne({ userId });
};
