export function renderNavbar({ role = "", title = "CareOps", showLogout = false } = {}) {
  const isMarketing = !showLogout && !role;
  const isDashboardPage = window.location.pathname.includes("/dashboard/");
  const rootPath = isDashboardPage ? "../" : "./";
  return `
    <nav class="navbar app-navbar navbar-expand-lg sticky-top">
      <div class="container">
        <div class="d-flex align-items-center gap-3">
          <a class="navbar-brand" href="${rootPath}index.html">
            <span class="brand-mark">${title}</span>
            <span class="brand-subtitle d-none d-md-inline-block">Hospital Command Center</span>
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
