import { requireRole, signOut } from "../services/authService.js";
import { getAllUsers, getDoctors, createDoctor, getAppointments, getAnalytics } from "../services/adminService.js";
import { notify, formatDate, formatTime } from "../services/uiService.js";
import { renderNavbar } from "../../components/navbar.js";
import { supabase } from "../supabaseClient.js";

function getStatusClass(status) {
  const value = String(status || "pending").toLowerCase();
  if (value.includes("confirm")) return "confirmed";
  if (value.includes("complete")) return "completed";
  if (value.includes("cancel")) return "cancelled";
  return "pending";
}

async function init() {
  const profile = await requireRole(["admin"]);
  if (!profile) return;

  document.getElementById("navRoot").innerHTML = renderNavbar({ role: "admin", showLogout: true });
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut();
    window.location.href = "/login.html";
  });

  document.getElementById("doctorForm")?.addEventListener("submit", handleCreateDoctor);

  await Promise.all([loadAnalytics(), loadUsers(), loadDoctorsTable(), loadAppointmentsTable()]);
  subscribeRealtime();
}

async function handleCreateDoctor(event) {
  event.preventDefault();
  const data = new FormData(event.target);
  const user_id = String(data.get("user_id"));
  const name = String(data.get("name"));
  const specialization = String(data.get("specialization"));
  const department = String(data.get("department"));

  await createDoctor({
    user_id,
    name,
    specialization,
    department
  });

  notify("Doctor created successfully.", "success");
  event.target.reset();
  await Promise.all([loadUsers(), loadDoctorsTable()]);
}

async function loadAnalytics() {
  const analytics = await getAnalytics();
  document.getElementById("totalBookings").textContent = analytics.totalBookings;
  document.getElementById("totalUsers").textContent = analytics.totalUsers;
  document.getElementById("activeDoctors").textContent = analytics.activeDoctors;
}

async function loadUsers() {
  const users = await getAllUsers();
  const table = document.getElementById("usersTable");
  table.innerHTML = "";
  if (!users.length) {
    table.innerHTML = `<tr><td colspan="3" class="empty-row">No users found yet.</td></tr>`;
    return;
  }
  users.forEach((user) => {
    table.innerHTML += `
      <tr>
        <td>${user.email}</td>
        <td><span class="status-badge neutral text-uppercase">${user.role}</span></td>
        <td>${formatDate(user.created_at)}</td>
      </tr>
    `;
  });
}

async function loadDoctorsTable() {
  const doctors = await getDoctors();
  const table = document.getElementById("doctorsTable");
  table.innerHTML = "";
  if (!doctors.length) {
    table.innerHTML = `<tr><td colspan="3" class="empty-row">No doctor profiles have been created yet.</td></tr>`;
    return;
  }
  doctors.forEach((doctor) => {
    table.innerHTML += `
      <tr>
        <td>${doctor.name}</td>
        <td>${doctor.specialization}</td>
        <td>${doctor.department}</td>
      </tr>
    `;
  });
}

async function loadAppointmentsTable() {
  const appointments = await getAppointments();
  const table = document.getElementById("appointmentsTable");
  table.innerHTML = "";
  if (!appointments.length) {
    table.innerHTML = `<tr><td colspan="5" class="empty-row">No appointments recorded yet.</td></tr>`;
    return;
  }
  appointments.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${item.patients?.full_name || "-"}</td>
        <td>${item.doctors?.name || "-"}</td>
        <td>${formatDate(item.appointment_date)}</td>
        <td>${formatTime(item.appointment_time)}</td>
        <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
      </tr>
    `;
  });
}

function subscribeRealtime() {
  supabase
    .channel("admin-appointments")
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, async () => {
      await Promise.all([loadAppointmentsTable(), loadAnalytics()]);
    })
    .subscribe();
}

init().catch((error) => notify(error.message || "Unable to load admin dashboard.", "danger"));
