import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

router.use(authenticate);

interface PetRow {
  id: string;
  user_id: string;
  pet_id: string;
  name: string;
  creature: string;
  element: string;
  solar_term: string;
  season: string;
  zodiac: string;
  personality: string;
  emoji: string;
  level: number;
  exp: number;
  exp_to_next: number;
  evolution: number;
  power: number;
  affinity: number;
  wisdom: number;
  mood: string;
  updated_at: string;
}

function formatPetResponse(pet: PetRow) {
  return {
    id: pet.id,
    petId: pet.pet_id,
    name: pet.name,
    creature: pet.creature,
    element: pet.element,
    solarTerm: pet.solar_term,
    season: pet.season,
    zodiac: pet.zodiac,
    personality: pet.personality,
    emoji: pet.emoji,
    level: pet.level,
    exp: pet.exp,
    expToNext: pet.exp_to_next,
    evolution: pet.evolution,
    power: pet.power,
    affinity: pet.affinity,
    wisdom: pet.wisdom,
    mood: pet.mood,
    updatedAt: pet.updated_at,
  };
}

function calculateLevelUp(
  currentLevel: number,
  currentExp: number,
  currentExpToNext: number,
  currentEvolution: number,
  addedExp: number
): { level: number; exp: number; expToNext: number; evolution: number; leveledUp: boolean } {
  let level = currentLevel;
  let exp = currentExp + addedExp;
  let expToNext = currentExpToNext;
  let evolution = currentEvolution;
  let leveledUp = false;

  while (exp >= expToNext) {
    exp -= expToNext;
    level += 1;
    leveledUp = true;

    expToNext = Math.floor(100 * Math.pow(1.15, level - 1));

    if (level % 10 === 0 && evolution < 4) {
      evolution += 1;
    }
  }

  return { level, exp, expToNext, evolution, leveledUp };
}

// ─── GET /pet ───
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const result = await query('SELECT * FROM pets WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found. Create a pet first.' });
      return;
    }

    res.json(formatPetResponse(result.rows[0] as PetRow));
  } catch (err) {
    console.error('Get pet error:', err);
    res.status(500).json({ error: 'Failed to get pet' });
  }
});

// ─── POST /pet/feed ───
router.post('/feed', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const EXP_GAIN = 50;

    const petResult = await query('SELECT * FROM pets WHERE user_id = $1', [userId]);
    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = petResult.rows[0] as PetRow;
    const { level, exp, expToNext, evolution, leveledUp } = calculateLevelUp(
      pet.level,
      pet.exp,
      pet.exp_to_next,
      pet.evolution,
      EXP_GAIN
    );

    const newPower = Math.min(100, pet.power + 5);

    const updateResult = await query(
      `UPDATE pets SET level = $1, exp = $2, exp_to_next = $3, evolution = $4,
       power = $5, mood = 'happy', updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [level, exp, expToNext, evolution, newPower, userId]
    );

    res.json({
      ...formatPetResponse(updateResult.rows[0] as PetRow),
      expGained: EXP_GAIN,
      leveledUp,
      action: 'feed',
    });
  } catch (err) {
    console.error('Feed pet error:', err);
    res.status(500).json({ error: 'Failed to feed pet' });
  }
});

// ─── POST /pet/play ───
router.post('/play', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const EXP_GAIN = 30;

    const petResult = await query('SELECT * FROM pets WHERE user_id = $1', [userId]);
    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = petResult.rows[0] as PetRow;
    const { level, exp, expToNext, evolution, leveledUp } = calculateLevelUp(
      pet.level,
      pet.exp,
      pet.exp_to_next,
      pet.evolution,
      EXP_GAIN
    );

    const newAffinity = Math.min(100, pet.affinity + 5);

    const updateResult = await query(
      `UPDATE pets SET level = $1, exp = $2, exp_to_next = $3, evolution = $4,
       affinity = $5, mood = 'excited', updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [level, exp, expToNext, evolution, newAffinity, userId]
    );

    res.json({
      ...formatPetResponse(updateResult.rows[0] as PetRow),
      expGained: EXP_GAIN,
      leveledUp,
      action: 'play',
    });
  } catch (err) {
    console.error('Play with pet error:', err);
    res.status(500).json({ error: 'Failed to play with pet' });
  }
});

// ─── POST /pet/meditate ───
router.post('/meditate', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const EXP_GAIN = 20;

    const petResult = await query('SELECT * FROM pets WHERE user_id = $1', [userId]);
    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = petResult.rows[0] as PetRow;
    const { level, exp, expToNext, evolution, leveledUp } = calculateLevelUp(
      pet.level,
      pet.exp,
      pet.exp_to_next,
      pet.evolution,
      EXP_GAIN
    );

    const newWisdom = Math.min(100, pet.wisdom + 5);

    const updateResult = await query(
      `UPDATE pets SET level = $1, exp = $2, exp_to_next = $3, evolution = $4,
       wisdom = $5, mood = 'calm', updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [level, exp, expToNext, evolution, newWisdom, userId]
    );

    res.json({
      ...formatPetResponse(updateResult.rows[0] as PetRow),
      expGained: EXP_GAIN,
      leveledUp,
      action: 'meditate',
    });
  } catch (err) {
    console.error('Meditate with pet error:', err);
    res.status(500).json({ error: 'Failed to meditate with pet' });
  }
});

export default router;
