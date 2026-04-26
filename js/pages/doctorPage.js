import { requireRole, signOut } from "../services/authService.js";
import { createSchedule, getDoctorAppointments, setAppointmentStatus } from "../services/doctorService.js";
import { notify, formatDate, formatTime, showLoading, hideLoading } from "../services/uiService.js";
import { renderNavbar } from "../../components/navbar.js";
import { supabase } from "../supabaseClient.js";

const state = { doctorId: null };

function getStatusClass(status) {
  const value = String(status || "pending").toLowerCase();
  if (value.includes("confirm")) return "confirmed";
  if (value.includes("complete")) return "completed";
  if (value.includes("cancel")) return "cancelled";
  return "pending";
}

async function init() {
  const profile = await requireRole(["doctor"]);
  if (!profile) return;

  document.getElementById("navRoot").innerHTML = renderNavbar({ role: "doctor", showLogout: true });
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut();
    window.location.href = "/login.html";
  });

  const { data: doctor, error } = await supabase.from("doctors").select("*").eq("user_id", profile.user.id).maybeSingle();
  if (error) throw error;
  if (!doctor) {
    throw new Error("Doctor profile not found. Contact admin to assign your doctor account.");
  }
  state.doctorId = doctor.id;

  document.getElementById("availabilityForm")?.addEventListener("submit", handleAvailability);
  await loadAppointments();
  subscribeRealtime();
}

async function handleAvailability(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  try {
    showLoading("Saving schedule...");
    await createSchedule({
      doctor_id: state.doctorId,
      available_date: formData.get("available_date"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time")
    });
    notify("Availability saved.", "success");
    event.target.reset();
  } catch (error) {
    notify(error.message || "Failed to save schedule.", "danger");
  } finally {
    hideLoading();
  }
}

async function loadAppointments() {
  const appointments = await getDoctorAppointments(state.doctorId);
  const table = document.getElementById("doctorAppointments");
  table.innerHTML = "";
  if (!appointments.length) {
    table.innerHTML = `<tr><td colspan="5" class="empty-row">No appointments assigned yet for this schedule period.</td></tr>`;
    return;
  }
  appointments.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.patients?.full_name || "-"}</td>
      <td>${formatDate(item.appointment_date)}</td>
      <td>${formatTime(item.schedules?.start_time)}</td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-outline-primary" data-status="${item.id}|Confirmed">Confirm</button>
          <button class="btn btn-sm btn-outline-success" data-status="${item.id}|Completed">Complete</button>
          <button class="btn btn-sm btn-outline-danger" data-status="${item.id}|Cancelled">Cancel</button>
        </div>
      </td>
    `;
    table.appendChild(row);
  });

  table.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      const [id, status] = button.dataset.status.split("|");
      await setAppointmentStatus(id, status);
      notify(`Appointment marked ${status}.`, "success");
      await loadAppointments();
    });
  });
}

function subscribeRealtime() {
  supabase
    .channel("doctor-appointments")
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, async () => {
      await loadAppointments();
    })
    .subscribe();
}

init().catch((error) => notify(error.message || "Unable to load doctor dashboard.", "danger"));
