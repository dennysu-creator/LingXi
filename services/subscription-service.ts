// ═══════════════════════════════════════
// 訂閱服務（RevenueCat SDK 串接）
// ═══════════════════════════════════════

import { Platform } from 'react-native';
import type { PlanType } from '@/stores/user-store';

// ─── Native-only: react-native-purchases（Web 不支援） ───
let Purchases: any = null;
let LOG_LEVEL: any = null;

if (Platform.OS !== 'web') {
  try {
    const mod = require('react-native-purchases');
    Purchases = mod.default;
    LOG_LEVEL = mod.LOG_LEVEL;
  } catch {
    // Not available (e.g. Expo Go)
  }
}

type PurchasesPackage = any;
type CustomerInfo = any;

// ─── 方案定義 ───

export interface SubscriptionPlan {
  id: string;
  type: PlanType;
  name: string;
  priceMonthly: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    type: 'free',
    name: '免費版',
    priceMonthly: 0,
    features: [
      '每功能每日 1 次',
      '靈寵等級上限 Lv.10',
      '基礎模板解讀',
    ],
  },
  {
    id: 'lingxi_member_monthly',
    type: 'member',
    name: '靈犀會員',
    priceMonthly: 390,
    features: [
      '每功能每日 5 次',
      '靈寵等級上限 Lv.20',
      'AI Haiku 解讀',
      '完整占星分析',
    ],
  },
  {
    id: 'lingxi_supreme_monthly',
    type: 'supreme',
    name: '靈犀至尊',
    priceMonthly: 1990,
    features: [
      '所有功能無限次',
      '靈寵等級無上限',
      'AI Sonnet 深度解讀',
      '跨系統深度分析',
      '含首飾珠寶建議',
    ],
  },
];

// ─── RevenueCat Entitlement → PlanType 映射 ───

function mapEntitlementToPlanType(customerInfo: CustomerInfo): PlanType {
  if (customerInfo.entitlements.active['supreme']) return 'supreme';
  if (customerInfo.entitlements.active['member']) return 'member';
  return 'free';
}

// ─── 初始化 ───

let isInitialized = false;

export async function initSubscriptionService(): Promise<void> {
  if (isInitialized || Platform.OS === 'web' || !Purchases) return;

  const apiKey = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : '';

  if (!apiKey) {
    console.warn('[SubscriptionService] No RevenueCat API key configured');
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    await Purchases.configure({ apiKey });
    isInitialized = true;
  } catch (err) {
    // RevenueCat 在 Expo Go 中不可用，跳過初始化
    console.warn('[SubscriptionService] RevenueCat init failed (expected in Expo Go):', (err as Error).message);
  }
}

/**
 * 設定 RevenueCat 用戶 ID（登入後呼叫）
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!isInitialized) return;
  await Purchases.logIn(userId);
}

/**
 * 取得可購買的方案
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!isInitialized) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages || [];
}

/**
 * 購買訂閱方案
 */
export async function purchasePlan(planId: string): Promise<PlanType | null> {
  if (!isInitialized) {
    console.warn('[SubscriptionService] Not initialized');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages || [];
    const pkg = packages.find((p: any) => p.product.identifier === planId);

    if (!pkg) {
      console.error(`[SubscriptionService] Package not found: ${planId}`);
      return null;
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const planType = mapEntitlementToPlanType(customerInfo);

    return planType;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'userCancelled' in err && (err as Record<string, unknown>).userCancelled) return null;
    throw err;
  }
}

/**
 * 恢復購買
 */
export async function restorePurchases(): Promise<PlanType> {
  if (!isInitialized) return 'free';

  const customerInfo = await Purchases.restorePurchases();
  return mapEntitlementToPlanType(customerInfo);
}

/**
 * 檢查當前訂閱狀態
 */
export async function checkSubscriptionStatus(): Promise<PlanType> {
  if (!isInitialized) return 'free';

  const customerInfo = await Purchases.getCustomerInfo();
  return mapEntitlementToPlanType(customerInfo);
}
