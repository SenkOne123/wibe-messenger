import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (username: string, passwordPlain: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
    },
  });

  return { id: user.id };
};

export const login = async (username: string, passwordPlain: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshTokenValue = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: refreshTokenValue };
};

export const refresh = async (refreshTokenValue: string) => {
  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!existingToken) {
    throw new Error('Invalid refresh token');
  }

  if (existingToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: existingToken.id } });
    throw new Error('Refresh token expired');
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { id: existingToken.id } });

  // Generate new tokens
  const accessToken = jwt.sign({ userId: existingToken.user.id, username: existingToken.user.username }, JWT_SECRET, {
    expiresIn: '15m',
  });

  const newRefreshTokenValue = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshTokenValue,
      userId: existingToken.user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: newRefreshTokenValue };
};

export const logout = async (refreshTokenValue: string) => {
  if (refreshTokenValue) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenValue },
    });
  }
};
