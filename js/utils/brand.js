const DEFAULT_LOGO_ALT = "Edo State University Iyamho";

export function mountAuthSchoolLogo() {
  const url = typeof window !== "undefined" && window.SCHOOL_LOGO_URL;
  const card = document.querySelector(".auth-card");
  if (!url || !card || card.querySelector(".auth-school-logo")) return;

  const img = document.createElement("img");
  img.className = "auth-school-logo";
  img.src = url;
  img.alt = DEFAULT_LOGO_ALT;
  img.loading = "lazy";
  img.decoding = "async";
  card.insertBefore(img, card.firstChild);
}
