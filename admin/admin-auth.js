// admin-auth.js — shared across all admin pages
const AdminAuth = (() => {
  const token = () => localStorage.getItem('admin_token');

  function requireAuth() {
    if (!token()) { window.location.href = '/admin/login.html'; return false; }
    const userEl = document.getElementById('adminUser');
    if (userEl) userEl.textContent = localStorage.getItem('admin_username') || 'Admin';
    return true;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    window.location.href = '/admin/login.html';
  }

  async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      // Only set Content-Type for JSON; FormData sets its own
    }
    const finalHeaders = options.body instanceof FormData
      ? { Authorization: 'Bearer ' + token(), ...(options.headers || {}) }
      : { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json', ...(options.headers || {}) };

    const res = await fetch(url, { ...options, headers: finalHeaders });
    if (res.status === 401) { logout(); return null; }
    return res.json();
  }

  return { token, requireAuth, logout, apiFetch };
})();
