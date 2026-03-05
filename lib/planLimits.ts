// Plan-based QR code limits
// Free: 3, Starter: 20, Pro: Unlimited (using large number for JSON compatibility)

export const PLAN_LIMITS: Record<string, number> = {
    free: 3,
    starter: 20,
    pro: 999999,
};

export function getQrLimit(plan: string): number {
    const normalizedPlan = (plan || "free").toLowerCase();
    return PLAN_LIMITS[normalizedPlan] ?? 3; // Default to free limit
}
