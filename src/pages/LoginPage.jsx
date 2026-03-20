import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (e) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(0,210,200,0.06) 0%, transparent 70%)'
    }}>
      <div className="login-wrap">
        <div className="login-logo">
          <div className="login-hex"><div className="login-w">W</div></div>
          <div className="login-title">WICALL</div>
          <div className="login-sub">Plateforme de qualification prospect</div>
        </div>
        <div className="login-box">
          {error && <div className="l-err">{error}</div>}
          <div className="l-grp">
            <label className="l-lbl">Identifiant</label>
            <input className="l-in" type="text" placeholder="manager1"
              value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="l-grp">
            <label className="l-lbl">Mot de passe</label>
            <input className="l-in" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading ? 'CONNEXION...' : 'CONNEXION'}
          </button>
        </div>
        <div className="l-hint">manager1/manager123 · conseiller1/conseil123</div>
      </div>
    </div>
  );
}
