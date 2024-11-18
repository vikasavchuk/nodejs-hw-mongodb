import fs from 'node:fs';
import path from 'node:path';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';

import createHttpError from 'http-errors';
import crypto from 'crypto';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';

import { sendEmail } from '../utils/sendMail.js';

const RESET_PASSWORD_TEMPLATE = fs.readFileSync(
  path.resolve('src/templates/reset-password.hbs'),
  { encoding: 'utf-8' },
);

export const registerUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (user !== null) {
    throw createHttpError(409, 'Email in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);

  return User.create(payload);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(401);
  }
  await Session.deleteOne({ userId: user._id });

  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 60 * 60 * 1000),
  });
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshToken !== refreshToken) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token is expired');
  }

  await Session.deleteOne({ _id: session._id });

  return Session.create({
    userId: session.userId,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 60 * 60 * 1000),
  });
};

export const logoutUser = async (sessionId) => {
  return await Session.deleteOne({ _id: sessionId });
};

export const requestResetEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    { sub: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '5m' },
  );
  const html = handlebars.compile(RESET_PASSWORD_TEMPLATE);
  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset',
      html: html({ resetToken }),
    });
  } catch (error) {
    console.error(error);

    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (password, token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.sub, email: decoded.email });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    await Session.deleteOne({ userId: user._id });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      throw createHttpError(401, 'Token is expired or invalid.');
    }

    throw error;
  }
};