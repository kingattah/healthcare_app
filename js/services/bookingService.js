import { supabase } from "../supabaseClient.js";

export async function getDepartments() {
  const { data, error } = await supabase
    .from("doctors")
    .select("department")
    .order("department", { ascending: true });
  if (error) throw error;
  return [...new Set((data || []).map((d) => d.department).filter(Boolean))];
}

export async function getDoctorsByDepartment(department) {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("department", department)
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getDoctorSchedules(doctorId, date) {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("available_date", date)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createAppointment(payload) {
  const { data, error } = await supabase
    .from("appointments")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPatientAppointments(patientId) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, doctors(name, specialization, department), schedules(available_date, start_time, end_time)")
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateAppointment(appointmentId, payload) {
  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", appointmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
