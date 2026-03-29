export function normalizeSubscriptionTier(raw) {
  const s = String(raw ?? "Free").trim();
  const l = s.toLowerCase();
  if (l === "basic") return "Basic";
  if (l === "premium") return "Premium";
  if (l === "pro") return "Pro";
  return "Free";
}

export function tierCanUseImage(tier) {
  return ["Basic", "Premium", "Pro"].includes(normalizeSubscriptionTier(tier));
}

export function tierCanUseVideoScript(tier) {
  return ["Premium", "Pro"].includes(normalizeSubscriptionTier(tier));
}
