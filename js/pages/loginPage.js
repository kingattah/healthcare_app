import { signIn } from "../services/authService.js";
import { showLoading, hideLoading, notify } from "../services/uiService.js";
import { appPath } from "../utils/paths.js";

const form = document.getElementById("loginForm");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    showLoading("Signing in...");
    await signIn({ email, password });
    notify("Login successful.", "success");
    window.location.href = appPath("index.html");
  } catch (error) {
    notify(error.message || "Unable to login.", "danger");
  } finally {
    hideLoading();
  }
});
