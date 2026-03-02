import crypto from 'crypto';
import { query } from '../config/database';

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  entitlement_ids?: string[];
  product_id?: string;
  expiration_at_ms?: number;
}

interface RevenueCatWebhookBody {
  api_version: string;
  event: RevenueCatEvent;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined
): boolean {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) {
    console.error('REVENUECAT_WEBHOOK_SECRET is not set');
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expectedSignature)
  );
}

export function mapEntitlementToPlanType(entitlementIds: string[]): string {
  if (entitlementIds.includes('supreme') || entitlementIds.includes('至尊')) {
    return 'supreme';
  }
  if (entitlementIds.includes('member') || entitlementIds.includes('會員')) {
    return 'member';
  }
  return 'free';
}

export async function handleWebhookEvent(body: RevenueCatWebhookBody): Promise<void> {
  const { event } = body;
  const appUserId = event.app_user_id;

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'NON_RENEWING_PURCHASE': {
      const planType = mapEntitlementToPlanType(event.entitlement_ids || []);
      await query(
        `UPDATE users SET plan_type = $1, revenuecat_id = $2, updated_at = NOW()
         WHERE id = $3 OR revenuecat_id = $2`,
        [planType, appUserId, appUserId]
      );
      console.log(`User ${appUserId} plan updated to: ${planType}`);
      break;
    }

    case 'CANCELLATION':
    case 'EXPIRATION': {
      const hasActiveEntitlements =
        event.entitlement_ids && event.entitlement_ids.length > 0;

      if (!hasActiveEntitlements) {
        await query(
          `UPDATE users SET plan_type = 'free', updated_at = NOW()
           WHERE id = $1 OR revenuecat_id = $1`,
          [appUserId]
        );
        console.log(`User ${appUserId} plan reverted to free`);
      } else {
        const planType = mapEntitlementToPlanType(event.entitlement_ids || []);
        await query(
          `UPDATE users SET plan_type = $1, updated_at = NOW()
           WHERE id = $2 OR revenuecat_id = $2`,
          [planType, appUserId]
        );
        console.log(`User ${appUserId} plan updated to: ${planType} (partial cancellation)`);
      }
      break;
    }

    case 'BILLING_ISSUE': {
      console.warn(`Billing issue for user ${appUserId}`);
      break;
    }

    case 'SUBSCRIBER_ALIAS': {
      console.log(`Subscriber alias event for user ${appUserId}`);
      break;
    }

    default: {
      console.log(`Unhandled RevenueCat event type: ${event.type}`);
    }
  }
}
