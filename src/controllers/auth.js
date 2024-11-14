import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { env } from '../utils/env.js';

const { Conflict, Unauthorized } = createHttpError;

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Conflict('Email in use');
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: { id: user._id, name: user.name, email: user.email },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Unauthorized('Invalid email or password');
  }

  const accessToken = jwt.sign({ id: user._id }, env('JWT_ACCESS_SECRET'), { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, env('JWT_REFRESH_SECRET'), { expiresIn: '30d' });
  const session = new Session({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await session.save();

  res.cookie('refreshToken', refreshToken, { httpOnly: true });
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: { accessToken },
  });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new Unauthorized('Refresh token missing');

  const decoded = jwt.verify(refreshToken, env('JWT_REFRESH_SECRET'));
  const session = await Session.findOne({ userId: decoded.id, refreshToken });

  if (!session || session.refreshTokenValidUntil < new Date()) {
    throw new Unauthorized('Invalid or expired refresh token');
  }

  await session.deleteOne();

  const newAccessToken = jwt.sign({ id: decoded.id }, env('JWT_ACCESS_SECRET'), { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ id: decoded.id }, env('JWT_REFRESH_SECRET'), { expiresIn: '30d' });

  const newSession = new Session({
    userId: decoded.id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await newSession.save();

  res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: newAccessToken },
  });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  await Session.findOneAndDelete({ refreshToken });
  res.clearCookie('refreshToken');
  res.status(204).send();
};
