import { supabase } from "../supabaseClient.js";
import { appPath } from "../utils/paths.js";

export async function signUp({ email, password, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  });
  if (error) {
    if (error.status === 429) {
      throw new Error("Too many signup attempts. Please wait 30-60 seconds, then try again.");
    }
    throw error;
  }
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUserProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const user = authData.user;
  if (!user) return null;

  const { data: appUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;

  return { user, appUser };
}

export async function requireRole(roles = []) {
  const profile = await getCurrentUserProfile();
  if (!profile || !roles.includes(profile.appUser.role)) {
    window.location.href = appPath("login.html");
    return null;
  }
  return profile;
}
