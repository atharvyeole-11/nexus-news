import { createClient } from "@supabase/supabase-js";

export function createSupabaseForRequest(accessToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

/**
 * Resolves the caller's subscription_tier using the Bearer JWT and RLS on user_profiles.
 */
export async function getUserSubscriptionTier(request) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) {
    return { tier: "Free", userId: null };
  }

  const supabase = createSupabaseForRequest(token);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { tier: "Free", userId: null };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  return {
    tier: profile?.subscription_tier ?? "Free",
    userId: user.id,
  };
}
