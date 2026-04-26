import { supabase } from "../supabaseClient.js";

export async function getAllUsers() {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDoctors() {
  const { data, error } = await supabase.from("doctors").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createDoctor(payload) {
  const { data, error } = await supabase.from("doctors").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(full_name), doctors(name)")
    .order("appointment_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAnalytics() {
  const [users, appointments] = await Promise.all([getAllUsers(), getAppointments()]);
  return {
    totalUsers: users.length,
    activeDoctors: users.filter((u) => u.role === "doctor").length,
    totalBookings: appointments.length
  };
}
