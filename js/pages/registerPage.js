import { signUp } from "../services/authService.js";
import { showLoading, hideLoading, notify } from "../services/uiService.js";

const form = document.getElementById("registerForm");
let isSubmitting = false;
const RATE_LIMIT_KEY = "signupRateLimitUntil";

function getRateLimitRemainingMs() {
  const until = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
  return Math.max(0, until - Date.now());
}

function setRateLimitCooldown(seconds = 60) {
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now() + seconds * 1000));
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;
  const remainingMs = getRateLimitRemainingMs();
  if (remainingMs > 0) {
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    notify(`Please wait ${remainingSeconds}s before retrying signup.`, "warning");
    return;
  }

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "patient");
  const submitButton = form.querySelector('button[type="submit"]');

  try {
    isSubmitting = true;
    if (submitButton) submitButton.disabled = true;
    showLoading("Creating account...");
    await signUp({ email, password, role });
    notify("Account created. Please verify your email and login.", "success");
    window.location.href = "/login.html";
  } catch (error) {
    if (error?.status === 429 || String(error?.message || "").toLowerCase().includes("too many")) {
      setRateLimitCooldown(60);
    }
    notify(error.message || "Unable to register.", "danger");
  } finally {
    isSubmitting = false;
    if (submitButton) submitButton.disabled = false;
    hideLoading();
  }
});
