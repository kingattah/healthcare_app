let loadingNode;

export function showLoading(message = "Please wait...") {
  if (!loadingNode) {
    loadingNode = document.createElement("div");
    loadingNode.className = "loading-overlay hidden";
    loadingNode.innerHTML = `
      <div class="surface-card p-4 text-center">
        <div class="spinner-border text-primary mb-3" role="status" aria-label="loading"></div>
        <p class="mb-0" data-loading-text>${message}</p>
      </div>
    `;
    document.body.appendChild(loadingNode);
  }
  const textNode = loadingNode.querySelector("[data-loading-text]");
  if (textNode) {
    textNode.textContent = message;
  }
  loadingNode.classList.remove("hidden");
}

export function hideLoading() {
  if (loadingNode) {
    loadingNode.classList.add("hidden");
  }
}

export function notify(message, type = "success") {
  const container = getAlertContainer();
  const item = document.createElement("div");
  item.className = `alert alert-${type} alert-dismissible fade show`;
  item.role = "alert";
  item.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  container.appendChild(item);
  setTimeout(() => item.remove(), 5000);
}

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function formatTime(value) {
  if (!value) return "-";
  return value.slice(0, 5);
}

function getAlertContainer() {
  let container = document.getElementById("app-alerts");
  if (!container) {
    container = document.createElement("div");
    container.id = "app-alerts";
    container.className = "position-fixed top-0 end-0 p-3";
    container.style.zIndex = "1090";
    document.body.appendChild(container);
  }
  return container;
}
