import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

router.use(authenticate);

// ─── GET /user/profile ───
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const result = await query(
      `SELECT id, email, name, birth_year, birth_month, birth_day, birth_hour,
              calendar_type, gender, destiny_data, plan_type, language,
              created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0]!;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      birthYear: user.birth_year,
      birthMonth: user.birth_month,
      birthDay: user.birth_day,
      birthHour: user.birth_hour,
      calendarType: user.calendar_type,
      gender: user.gender,
      destinyData: user.destiny_data,
      planType: user.plan_type,
      language: user.language,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ─── PUT /user/profile ───
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      name,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      calendarType,
      gender,
      destinyData,
      language,
    } = req.body as {
      name?: string;
      birthYear?: number;
      birthMonth?: number;
      birthDay?: number;
      birthHour?: number;
      calendarType?: string;
      gender?: string;
      destinyData?: Record<string, unknown>;
      language?: string;
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (birthYear !== undefined) {
      setClauses.push(`birth_year = $${paramIndex++}`);
      values.push(birthYear);
    }
    if (birthMonth !== undefined) {
      setClauses.push(`birth_month = $${paramIndex++}`);
      values.push(birthMonth);
    }
    if (birthDay !== undefined) {
      setClauses.push(`birth_day = $${paramIndex++}`);
      values.push(birthDay);
    }
    if (birthHour !== undefined) {
      setClauses.push(`birth_hour = $${paramIndex++}`);
      values.push(birthHour);
    }
    if (calendarType !== undefined) {
      setClauses.push(`calendar_type = $${paramIndex++}`);
      values.push(calendarType);
    }
    if (gender !== undefined) {
      setClauses.push(`gender = $${paramIndex++}`);
      values.push(gender);
    }
    if (destinyData !== undefined) {
      setClauses.push(`destiny_data = $${paramIndex++}`);
      values.push(JSON.stringify(destinyData));
    }
    if (language !== undefined) {
      setClauses.push(`language = $${paramIndex++}`);
      values.push(language);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    setClauses.push('updated_at = NOW()');
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, name, birth_year, birth_month, birth_day, birth_hour,
                 calendar_type, gender, destiny_data, plan_type, language, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0]!;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      birthYear: user.birth_year,
      birthMonth: user.birth_month,
      birthDay: user.birth_day,
      birthHour: user.birth_hour,
      calendarType: user.calendar_type,
      gender: user.gender,
      destinyData: user.destiny_data,
      planType: user.plan_type,
      language: user.language,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
