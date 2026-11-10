// One place for the backend URL + cookie handling.
// Using relative path "" works for both unified hosting and custom API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // sends the login cookie
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}