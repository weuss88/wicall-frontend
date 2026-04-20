import { useState, useEffect, useRef } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const retryRef = useRef(false);
  const credRef = useRef({ username: '', password: '' });

  const isServerDown = error.includes('inaccessible');

  useEffect(() => {
    if (countdown <= 0) return;
    if (countdown === 1 && retryRef.current) {
      const t = setTimeout(() => {
        setCountdown(0);
        submit(credRef.current.username, credRef.current.password);
      }, 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const submit = async (u, p) => {
    if (!u || !p) return;
    retryRef.current = false;
    setCountdown(0);
    setLoading(true);
    setError('');
    try {
      await onLogin(u, p);
    } catch (e) {
      const msg = e.message || 'Erreur inconnue';
      setError(msg);
      if (msg.includes('inaccessible') && u && p) {
        credRef.current = { username: u, password: p };
        retryRef.current = true;
        setCountdown(30);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => submit(username, password);
  const handleRetryNow = () => { retryRef.current = false; setCountdown(0); submit(username, password); };

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
          {error && (
            <div className="l-err">
              {error}
              {isServerDown && countdown > 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.85 }}>
                  Nouvelle tentative dans <strong>{countdown}s</strong>…
                </div>
              )}
            </div>
          )}
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
          <button className="btn-login" onClick={handleSubmit} disabled={loading || countdown > 0}>
            {loading ? 'CONNEXION...' : countdown > 0 ? `Connexion dans ${countdown}s…` : 'CONNEXION'}
          </button>
          {isServerDown && countdown > 0 && (
            <button onClick={handleRetryNow}
              style={{ background: 'none', border: '1px solid rgba(0,210,200,0.3)', color: 'var(--teal)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', marginTop: '8px', width: '100%' }}>
              ↺ Réessayer maintenant
            </button>
          )}
        </div>
        <div className="l-hint">Contactez votre administrateur pour vos accès.</div>
      </div>
    </div>
  );
}
