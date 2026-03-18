import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import appleSignin from 'apple-signin-auth';
import { query } from '../config/database';
import {
  authenticate,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '../middleware/auth';

const router = Router();

const BCRYPT_ROUNDS = 12;

// ─── POST /auth/apple ───
router.post('/apple', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identityToken, fullName } = req.body as {
      identityToken: string;
      fullName?: { givenName?: string; familyName?: string };
    };

    if (!identityToken) {
      res.status(400).json({ error: 'identityToken is required' });
      return;
    }

    const applePayload = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID || 'com.youquan.lingxi',
      ignoreExpiration: false,
    });

    const appleId = applePayload.sub;
    const email = applePayload.email || `${appleId}@privaterelay.appleid.com`;

    const existingUser = await query(
      'SELECT id, email, name, plan_type FROM users WHERE apple_id = $1',
      [appleId]
    );

    let userId: string;
    let userName: string;
    let planType: string;
    let isNewUser = false;

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0]!;
      userId = user.id;
      userName = user.name;
      planType = user.plan_type;

      await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [userId]);
    } else {
      isNewUser = true;
      const displayName =
        fullName?.givenName && fullName?.familyName
          ? `${fullName.familyName}${fullName.givenName}`
          : fullName?.givenName || '靈犀用戶';

      const insertResult = await query(
        `INSERT INTO users (email, apple_id, name, birth_year, birth_month, birth_day, destiny_data, plan_type)
         VALUES ($1, $2, $3, 1990, 1, 1, '{"onboarded": false}'::jsonb, 'free')
         ON CONFLICT (apple_id) DO UPDATE SET updated_at = NOW()
         RETURNING id, name, plan_type`,
        [email, appleId, displayName]
      );

      const newUser = insertResult.rows[0]!;
      userId = newUser.id;
      userName = newUser.name;
      planType = newUser.plan_type;
    }

    const payload: JwtPayload = { userId, email, planType };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      isNewUser,
      user: { id: userId, email, name: userName, planType },
    });
  } catch (err) {
    console.error('Apple Sign-In error:', err);
    const message = err instanceof Error ? err.message : 'Apple Sign-In failed';
    res.status(401).json({ error: message });
  }
});

// ─── POST /auth/register ───
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, birthYear, birthMonth, birthDay, birthHour, gender } =
      req.body as {
        email: string;
        password: string;
        name: string;
        birthYear: number;
        birthMonth: number;
        birthDay: number;
        birthHour?: number;
        gender?: string;
      };

    if (!email || !password || !name || !birthYear || !birthMonth || !birthDay) {
      res.status(400).json({
        error: 'email, password, name, birthYear, birthMonth, birthDay are required',
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Birth data range validation
    if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31 || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      res.status(400).json({ error: 'Invalid birth date values' });
      return;
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, birth_year, birth_month, birth_day, birth_hour, gender, destiny_data, plan_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '{"onboarded": false}'::jsonb, 'free')
       RETURNING id, plan_type`,
      [email, passwordHash, name, birthYear, birthMonth, birthDay, birthHour ?? 11, gender ?? 'male']
    );

    const user = result.rows[0]!;
    const payload: JwtPayload = { userId: user.id, email, planType: user.plan_type };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email, name, planType: user.plan_type },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /auth/login ───
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const result = await query(
      'SELECT id, email, password_hash, name, plan_type FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0]!;

    if (!user.password_hash) {
      res.status(401).json({ error: 'This account uses Apple Sign-In' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

    const payload: JwtPayload = { userId: user.id, email: user.email, planType: user.plan_type };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, planType: user.plan_type },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── POST /auth/refresh ───
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      res.status(400).json({ error: 'refreshToken is required' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    const result = await query(
      'SELECT id, email, plan_type FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0]!;
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      planType: user.plan_type,
    };

    const newAccessToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// ─── POST /auth/logout ───
// TODO: A proper implementation would add the refresh token to a blacklist table
// (e.g., `token_blacklist`) and check it in the /auth/refresh endpoint to reject
// revoked tokens. For now, the client simply discards its stored tokens.
router.post('/logout', authenticate, async (_req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out' });
});

export default router;
