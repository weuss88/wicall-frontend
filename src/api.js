const API = 'https://wicall-backend-production.up.railway.app';
let _token = localStorage.getItem('wicall_token') || null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('wicall_token', t);
  else localStorage.removeItem('wicall_token');
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
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.detail || 'Erreur serveur');
  }
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
