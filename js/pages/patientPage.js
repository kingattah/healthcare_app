import { requireRole, signOut } from "../services/authService.js";
import {
  getDepartments,
  getDoctorsByDepartment,
  getDoctorSchedules,
  createAppointment,
  getPatientAppointments,
  updateAppointment
} from "../services/bookingService.js";
import { showLoading, hideLoading, notify, formatDate, formatTime } from "../services/uiService.js";
import { renderNavbar } from "../../components/navbar.js";
import { supabase } from "../supabaseClient.js";

const state = { patientId: null, selectedDoctorId: null, selectedScheduleId: null };

function getStatusClass(status) {
  const value = String(status || "pending").toLowerCase();
  if (value.includes("confirm")) return "confirmed";
  if (value.includes("complete")) return "completed";
  if (value.includes("cancel")) return "cancelled";
  return "pending";
}

async function init() {
  const profile = await requireRole(["patient"]);
  if (!profile) return;

  document.getElementById("navRoot").innerHTML = renderNavbar({ role: "patient", showLogout: true });
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut();
    window.location.href = "/login.html";
  });

  const { data: patient, error } = await supabase.from("patients").select("*").eq("user_id", profile.user.id).maybeSingle();
  if (error) throw error;
  if (patient) {
    state.patientId = patient.id;
  } else {
    const { data: newPatient, error: createError } = await supabase
      .from("patients")
      .insert({
        user_id: profile.user.id,
        full_name: profile.user.email?.split("@")[0] || "New Patient",
        phone: "",
        address: ""
      })
      .select()
      .single();
    if (createError) throw createError;
    state.patientId = newPatient.id;
  }

  await loadDepartments();
  await loadHistory();
  subscribeRealtime();
  bindEvents();
}

function bindEvents() {
  document.getElementById("departmentSelect")?.addEventListener("change", loadDoctors);
  document.getElementById("dateInput")?.addEventListener("change", loadSchedules);
  document.getElementById("bookBtn")?.addEventListener("click", handleBook);
}

async function loadDepartments() {
  const departments = await getDepartments();
  const select = document.getElementById("departmentSelect");
  select.innerHTML = `<option value="">Select department</option>`;
  departments.forEach((dep) => {
    select.innerHTML += `<option value="${dep}">${dep}</option>`;
  });
}

async function loadDoctors() {
  const department = document.getElementById("departmentSelect").value;
  const doctors = await getDoctorsByDepartment(department);
  const select = document.getElementById("doctorSelect");
  select.innerHTML = `<option value="">Select doctor</option>`;
  doctors.forEach((doctor) => {
    select.innerHTML += `<option value="${doctor.id}">${doctor.name} - ${doctor.specialization}</option>`;
  });
  select.addEventListener("change", (event) => {
    state.selectedDoctorId = event.target.value;
  });
}

async function loadSchedules() {
  const doctorId = document.getElementById("doctorSelect").value;
  const date = document.getElementById("dateInput").value;
  if (!doctorId || !date) return;

  const schedules = await getDoctorSchedules(doctorId, date);
  const slots = document.getElementById("slotList");
  slots.innerHTML = "";

  schedules.forEach((schedule) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary btn-sm slot-btn";
    btn.textContent = `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;
    btn.onclick = () => {
      state.selectedDoctorId = doctorId;
      state.selectedScheduleId = schedule.id;
      document.querySelectorAll(".slot-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
    };
    slots.appendChild(btn);
  });
}

async function handleBook() {
  const date = document.getElementById("dateInput").value;
  if (!state.selectedDoctorId || !state.selectedScheduleId || !date) {
    notify("Select doctor, date and slot first.", "warning");
    return;
  }
  try {
    showLoading("Booking appointment...");
    const timeValue = document.querySelector("#slotList .slot-btn.active")?.textContent?.split(" - ")[0] || "09:00";
    await createAppointment({
      patient_id: state.patientId,
      doctor_id: state.selectedDoctorId,
      schedule_id: state.selectedScheduleId,
      appointment_date: date,
      appointment_time: timeValue,
      status: "Pending"
    });
    notify("Appointment booked successfully.", "success");
    await loadHistory();
  } catch (error) {
    notify(error.message || "Booking failed.", "danger");
  } finally {
    hideLoading();
  }
}

function subscribeRealtime() {
  supabase
    .channel("patient-appointments")
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, async () => {
      await loadHistory();
    })
    .subscribe();
}

async function loadHistory() {
  const history = await getPatientAppointments(state.patientId);
  const table = document.getElementById("historyTable");
  table.innerHTML = "";
  if (!history.length) {
    table.innerHTML = `<tr><td colspan="5" class="empty-row">No appointments yet. Book your first visit to get started.</td></tr>`;
    return;
  }
  history.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.doctors?.name || "-"}</td>
      <td>${formatDate(item.appointment_date)}</td>
      <td>${formatTime(item.schedules?.start_time)}</td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-outline-warning" data-reschedule="${item.id}">Reschedule</button>
          <button class="btn btn-sm btn-outline-danger" data-cancel="${item.id}">Cancel</button>
        </div>
      </td>
    `;
    table.appendChild(row);
  });

  table.querySelectorAll("[data-cancel]").forEach((button) => {
    button.addEventListener("click", async () => {
      await updateAppointment(button.dataset.cancel, { status: "Cancelled" });
      notify("Appointment cancelled.", "info");
      await loadHistory();
    });
  });

  table.querySelectorAll("[data-reschedule]").forEach((button) => {
    button.addEventListener("click", async () => {
      const newDate = prompt("Enter new date (YYYY-MM-DD):");
      if (!newDate) return;
      await updateAppointment(button.dataset.reschedule, { appointment_date: newDate, status: "Pending" });
      notify("Appointment rescheduled.", "success");
      await loadHistory();
    });
  });
}

init().catch((error) => {
  hideLoading();
  notify(error.message || "Unable to load patient dashboard.", "danger");
});
