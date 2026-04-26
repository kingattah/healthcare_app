function isDashboardPage() {
  return window.location.pathname.includes("/dashboard/");
}

export function appPath(target) {
  const cleanTarget = String(target || "").replace(/^\.?\//, "");
  const prefix = isDashboardPage() ? "../" : "./";
  return `${prefix}${cleanTarget}`;
}
