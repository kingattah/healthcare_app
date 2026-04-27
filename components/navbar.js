export function renderNavbar({ role = "", title, showLogout = false } = {}) {
  const isMarketing = !showLogout && !role;
  const isDashboardPage = window.location.pathname.includes("/dashboard/");
  const rootPath = isDashboardPage ? "../" : "./";
  const logoUrl = typeof window !== "undefined" && window.SCHOOL_LOGO_URL ? window.SCHOOL_LOGO_URL : "";
  const brandMark =
    title != null && String(title).length
      ? title
      : (typeof window !== "undefined" && window.APP_NAV_TITLE) || "Hospital appointments";
  const brandSub =
    (typeof window !== "undefined" && window.APP_NAV_SUBTITLE) ||
    "Edo State University Teaching Hospital · case study";
  const logoBlock = logoUrl
    ? `<img class="brand-logo" src="${logoUrl}" alt="Edo State University Iyamho" width="48" height="48" loading="eager" decoding="async" />`
    : "";
  return `
    <nav class="navbar app-navbar navbar-expand-lg sticky-top">
      <div class="container">
        <div class="d-flex align-items-center gap-3">
          <a class="navbar-brand" href="${rootPath}index.html">
            ${logoBlock}
            <span class="brand-text">
              <span class="brand-mark">${brandMark}</span>
              <span class="brand-subtitle d-none d-md-inline-block">${brandSub}</span>
            </span>
          </a>
          ${role ? `<span class="badge app-role-badge text-uppercase">${role}</span>` : ""}
        </div>
        ${
          isMarketing
            ? `
          <div class="app-nav-links d-none d-lg-flex">
            <a class="nav-link" href="${rootPath}index.html#features">Product</a>
            <a class="nav-link" href="${rootPath}index.html#workflow">Workflow</a>
            <a class="nav-link" href="${rootPath}index.html#cta">Get started</a>
          </div>
        `
            : ""
        }
        <div class="navbar-actions">
          ${
            isMarketing
              ? `
            <a class="btn btn-outline-primary btn-sm d-none d-md-inline-flex" href="${rootPath}login.html">Sign in</a>
            <a class="btn btn-primary btn-sm" href="${rootPath}register.html">Get started</a>
          `
              : ""
          }
          ${showLogout ? `<button class="btn btn-outline-danger btn-sm" id="logoutBtn">Logout</button>` : ""}
        </div>
      </div>
    </nav>
  `;
}
