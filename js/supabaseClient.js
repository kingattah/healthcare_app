const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in dev so misconfiguration is obvious.
  console.warn("Supabase config missing. Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY in config.js.");
}

if (!window.supabase) {
  throw new Error("Supabase SDK missing. Ensure @supabase/supabase-js CDN is loaded.");
}

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
