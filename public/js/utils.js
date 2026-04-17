const API_BASE = "../api";

async function apiGet(path) {
  const response = await fetch(`${API_BASE}/${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data && data.error ? data.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!data || data.success !== true) {
    const message =
      data && data.error ? data.error : "Unexpected API response.";
    throw new Error(message);
  }

  return data;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }

  return new Intl.NumberFormat().format(num);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function queryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
