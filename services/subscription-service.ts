// ═══════════════════════════════════════════════════════════════
// 訂閱服務 — 單一 'paid' entitlement，月/年 2 個產品
// ═══════════════════════════════════════════════════════════════

import { Platform } from 'react-native';
import {
  ENTITLEMENT_PAID,
  PRODUCT_ID_MONTHLY,
  PRODUCT_ID_YEARLY,
  type PlanType,
} from '@/types/shared';

// ─── Native-only dynamic import ────────────────────────────────
let Purchases: any = null;
let LOG_LEVEL: any = null;

if (Platform.OS !== 'web') {
  try {
    const mod = require('react-native-purchases');
    Purchases = mod.default;
    LOG_LEVEL = mod.LOG_LEVEL;
  } catch {
    // Not available (e.g. Expo Go).
  }
}

type PurchasesPackage = any;
type CustomerInfo = any;

// ─── Product catalog ───────────────────────────────────────────

export interface PaidProduct {
  id: string;
  cadence: 'monthly' | 'yearly';
  priceDisplay: string;   // "NT$199" / "NT$1999"
  periodLabel: string;    // i18n key 'subscription.perMonth' / 'perYear'
  badge?: string;         // "省 16%" for yearly
}

export const PAID_PRODUCTS: PaidProduct[] = [
  {
    id: PRODUCT_ID_MONTHLY,
    cadence: 'monthly',
    priceDisplay: 'NT$199',
    periodLabel: 'subscription.perMonth',
  },
  {
    id: PRODUCT_ID_YEARLY,
    cadence: 'yearly',
    priceDisplay: 'NT$1999',
    periodLabel: 'subscription.perYear',
    badge: 'subscription.savingsBadge',
  },
];

// ─── Entitlement mapping ───────────────────────────────────────

export function mapEntitlementToPlanType(customerInfo: CustomerInfo): PlanType {
  return customerInfo?.entitlements?.active?.[ENTITLEMENT_PAID] ? 'paid' : 'free';
}

export function getActiveProductCadence(customerInfo: CustomerInfo | null): 'monthly' | 'yearly' | null {
  const ent = customerInfo?.entitlements?.active?.[ENTITLEMENT_PAID];
  if (!ent) return null;
  if (ent.productIdentifier === PRODUCT_ID_MONTHLY) return 'monthly';
  if (ent.productIdentifier === PRODUCT_ID_YEARLY) return 'yearly';
  return null;
}

// ─── Initialization ────────────────────────────────────────────

let isInitialized = false;

export async function initSubscriptionService(): Promise<void> {
  if (isInitialized || Platform.OS === 'web' || !Purchases) return;

  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';

  if (!apiKey) {
    console.warn('[SubscriptionService] No RevenueCat API key configured for', Platform.OS);
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    await Purchases.configure({ apiKey });
    isInitialized = true;
  } catch (err) {
    console.warn(
      '[SubscriptionService] RevenueCat init failed (expected in Expo Go):',
      (err as Error).message
    );
  }
}

/** Identify RC user = backend user id. MUST be called before any purchase. */
export async function identifyUser(userId: string): Promise<void> {
  if (!isInitialized) return;
  try {
    await Purchases.logIn(userId);
  } catch (err) {
    console.warn('[SubscriptionService] logIn failed:', (err as Error).message);
  }
}

export async function logOutUser(): Promise<void> {
  if (!isInitialized) return;
  try {
    await Purchases.logOut();
  } catch {
    // ignore
  }
}

// ─── Offerings ─────────────────────────────────────────────────

export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!isInitialized) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch (err) {
    console.warn('[SubscriptionService] getOfferings failed:', (err as Error).message);
    return [];
  }
}

/** Find the RC package for a product id. */
async function findPackage(productId: string): Promise<PurchasesPackage | null> {
  const packages = await getOfferings();
  return packages.find((p: any) => p.product.identifier === productId) || null;
}

// ─── Purchase ──────────────────────────────────────────────────

export interface PurchaseResult {
  planType: PlanType;
  productId: string | null;
  customerInfo: CustomerInfo | null;
  cancelled: boolean;
}

export async function purchasePlan(productId: string): Promise<PurchaseResult> {
  if (!isInitialized) {
    return { planType: 'free', productId: null, customerInfo: null, cancelled: false };
  }

  try {
    const pkg = await findPackage(productId);
    if (!pkg) {
      console.error('[SubscriptionService] Package not found:', productId);
      return { planType: 'free', productId: null, customerInfo: null, cancelled: false };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return {
      planType: mapEntitlementToPlanType(customerInfo),
      productId,
      customerInfo,
      cancelled: false,
    };
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'userCancelled' in err && (err as any).userCancelled) {
      return { planType: 'free', productId: null, customerInfo: null, cancelled: true };
    }
    throw err;
  }
}

// ─── Restore ───────────────────────────────────────────────────

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isInitialized) return { planType: 'free', productId: null, customerInfo: null, cancelled: false };

  const customerInfo = await Purchases.restorePurchases();
  const cadence = getActiveProductCadence(customerInfo);
  return {
    planType: mapEntitlementToPlanType(customerInfo),
    productId: cadence === 'monthly' ? PRODUCT_ID_MONTHLY : cadence === 'yearly' ? PRODUCT_ID_YEARLY : null,
    customerInfo,
    cancelled: false,
  };
}

// ─── Status ────────────────────────────────────────────────────

export async function checkSubscriptionStatus(): Promise<PurchaseResult> {
  if (!isInitialized) return { planType: 'free', productId: null, customerInfo: null, cancelled: false };

  const customerInfo = await Purchases.getCustomerInfo();
  const cadence = getActiveProductCadence(customerInfo);
  return {
    planType: mapEntitlementToPlanType(customerInfo),
    productId: cadence === 'monthly' ? PRODUCT_ID_MONTHLY : cadence === 'yearly' ? PRODUCT_ID_YEARLY : null,
    customerInfo,
    cancelled: false,
  };
}
