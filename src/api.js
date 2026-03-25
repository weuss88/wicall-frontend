const API = import.meta.env.VITE_API_URL;
let _token = localStorage.getItem('wicall_token') || null;
let _onUnauthorized = null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('wicall_token', t);
  else localStorage.removeItem('wicall_token');
}

export function onUnauthorized(cb) {
  _onUnauthorized = cb;
}

export async function apiCall(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { 'Authorization': 'Bearer ' + _token } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(API + path, opts);
  if (r.status === 401) {
    setToken(null);
    if (_onUnauthorized) _onUnauthorized();
    throw new Error('Session expirée, veuillez vous reconnecter.');
  }
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.detail || 'Erreur serveur');
  }
  if (r.status === 204) return null;
  return r.json();
}

export async function loginAPI(username, password) {
  let r;
  try {
    const form = new URLSearchParams({ username, password });
    r = await fetch(API + '/auth/login', { method: 'POST', body: form });
  } catch (e) {
    throw new Error('Serveur inaccessible — vérifie ta connexion ou réessaie dans 30 secondes (Railway se réveille)');
  }
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.detail || 'Identifiants incorrects');
  }
  return r.json();
}
