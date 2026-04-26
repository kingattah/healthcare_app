import { supabase } from "../supabaseClient.js";

export async function createSchedule(payload) {
  const { data, error } = await supabase.from("schedules").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function getDoctorAppointments(doctorId) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(full_name, phone), schedules(available_date, start_time, end_time)")
    .eq("doctor_id", doctorId)
    .order("appointment_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function setAppointmentStatus(appointmentId, status) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
