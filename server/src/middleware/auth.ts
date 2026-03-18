import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  planType: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header is required' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Authorization header must be in format: Bearer <token>' });
    return;
  }

  const token = parts[1]!;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (!decoded.userId || !decoded.email || !decoded.planType) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token has expired' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function generateToken(payload: JwtPayload): string {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const options: jwt.SignOptions = { expiresIn: expiresIn as unknown as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET environment variable is required in production');
    }
    // Dev fallback only — never use in production
    return getJwtSecret() + '_refresh_dev';
  }
  return secret;
}

export function generateRefreshToken(payload: JwtPayload): string {
  const secret = getRefreshSecret();
  const options: jwt.SignOptions = { expiresIn: '30d' as unknown as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = getRefreshSecret();
  return jwt.verify(token, secret) as JwtPayload;
}
