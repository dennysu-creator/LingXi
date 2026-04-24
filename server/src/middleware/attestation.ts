// ═══════════════════════════════════════════════════════════════
// Device Attestation Middleware
// ═══════════════════════════════════════════════════════════════
// Accepts an Apple App Attest assertion / Google Play Integrity
// verdict from the client. Records the device fingerprint for
// abuse analytics; does NOT hard-block unless ATTESTATION_REQUIRED=true.
//
// Phase 1 (this rollout): SOFT — log + score only.
// Phase 2 (post EAS build): HARD — require valid attestation for
//   trial consumption if ATTESTATION_REQUIRED=true.
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../config/database';

const ATTESTATION_REQUIRED = process.env.ATTESTATION_REQUIRED === 'true';

interface AttestationHeaders {
  platform: 'ios' | 'android' | 'unknown';
  deviceKey: string | null;
  assertion: string | null;
}

function readHeaders(req: Request): AttestationHeaders {
  const platform = (req.headers['x-device-platform'] as string | undefined) || 'unknown';
  const deviceKey = (req.headers['x-device-key'] as string | undefined) || null;
  const assertion = (req.headers['x-attestation-token'] as string | undefined) || null;

  return {
    platform: platform === 'ios' || platform === 'android' ? platform : 'unknown',
    deviceKey,
    assertion,
  };
}

function hashDeviceKey(deviceKey: string): string {
  return crypto.createHash('sha256').update(deviceKey).digest('hex');
}

async function recordFingerprint(
  userId: string | undefined,
  platform: string,
  deviceKey: string,
  abuseDelta: number
): Promise<void> {
  const hash = hashDeviceKey(deviceKey);
  await query(
    `INSERT INTO device_fingerprints (device_key_hash, user_id, platform, abuse_score)
       VALUES ($1, $2, $3, $4)
     ON CONFLICT (device_key_hash, user_id)
     DO UPDATE SET
       last_seen_at = NOW(),
       abuse_score  = device_fingerprints.abuse_score + EXCLUDED.abuse_score`,
    [hash, userId || null, platform, abuseDelta]
  );
}

/**
 * Soft attestation: records the fingerprint, tolerates missing attestation.
 * Apply to all authenticated AI routes.
 */
export function softAttestation(req: Request, _res: Response, next: NextFunction): void {
  const { platform, deviceKey } = readHeaders(req);
  if (deviceKey) {
    const userId = req.user?.userId;
    // Fire and forget.
    void recordFingerprint(userId, platform, deviceKey, 0).catch((e) =>
      console.error('attestation record error:', e)
    );
  }
  next();
}

/**
 * Hard attestation: requires a valid attestation token when ATTESTATION_REQUIRED.
 * Token validation (App Attest/Play Integrity) is a TODO — for now we check
 * presence + shape, which is enough to force client to ship the EAS rebuild.
 */
export function hardAttestation(req: Request, res: Response, next: NextFunction): void {
  if (!ATTESTATION_REQUIRED) return next();

  const { platform, deviceKey, assertion } = readHeaders(req);

  if (!deviceKey || !assertion) {
    res.status(403).json({
      error: 'Device attestation required',
      attestationRequired: true,
    });
    return;
  }

  // Minimal shape validation: base64-ish, at least 64 chars.
  if (assertion.length < 64 || !/^[A-Za-z0-9+/=_-]+$/.test(assertion)) {
    res.status(403).json({
      error: 'Invalid attestation token',
      attestationRequired: true,
    });
    return;
  }

  const userId = req.user?.userId;
  void recordFingerprint(userId, platform, deviceKey, 0).catch((e) =>
    console.error('attestation record error:', e)
  );

  // TODO(phase 2): verify assertion via Apple App Attest / Google Play Integrity REST API.

  next();
}
