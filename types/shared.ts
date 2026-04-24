// ─── Plan tier ─────────────────────────────────────────────────
// 'free'   → 3 lifetime trial uses total
// 'paid'   → NT$199/month or NT$1999/year, unlimited (subject to fair-use cap)
// Legacy values 'member' | 'supreme' kept only so older persisted state /
// older JWTs don't crash type-narrows; always treated as 'paid' at runtime.
export type PlanType = 'free' | 'paid' | 'member' | 'supreme';

export function normalizePlan(plan: PlanType | string | undefined): 'free' | 'paid' {
  if (plan === 'paid' || plan === 'member' || plan === 'supreme') return 'paid';
  return 'free';
}

// ─── Subscription snapshot (from RevenueCat via server) ────────
export type SubscriptionStatus = 'free' | 'active' | 'in_grace' | 'expired' | 'refunded';

export function hasActiveSubscription(status: SubscriptionStatus | string | undefined): boolean {
  return status === 'active' || status === 'in_grace';
}

// ─── AI features ───────────────────────────────────────────────
export type FeatureType = 'heart' | 'eye' | 'soul';

// ─── Birth calendar ────────────────────────────────────────────
export type CalendarType = 'solar' | 'lunar';

// ─── Product IDs (App Store Connect + RevenueCat) ──────────────
export const PRODUCT_ID_MONTHLY = 'lingxi_monthly_199';
export const PRODUCT_ID_YEARLY = 'lingxi_yearly_1999';

// ─── Entitlement (single tier) ─────────────────────────────────
export const ENTITLEMENT_PAID = 'paid';
