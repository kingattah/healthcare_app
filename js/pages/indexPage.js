import { getSession, getCurrentUserProfile, signOut } from "../services/authService.js";
import { notify } from "../services/uiService.js";
import { renderNavbar } from "../../components/navbar.js";

const navRoot = document.getElementById("navRoot");
const ctaRoot = document.getElementById("ctaRoot");

async function init() {
  const session = await getSession();
  if (!session) {
    navRoot.innerHTML = renderNavbar();
    return;
  }

  const profile = await getCurrentUserProfile();
  const role = profile?.appUser?.role || "";
  navRoot.innerHTML = renderNavbar({ role, showLogout: true });
  ctaRoot.innerHTML = `
    <a class="btn btn-primary btn-lg" href="/dashboard/${role}.html">Go to ${role} dashboard</a>
  `;
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut();
    notify("Signed out.", "info");
    window.location.reload();
  });
}

init().catch((error) => notify(error.message || "Unable to load landing page.", "danger"));
