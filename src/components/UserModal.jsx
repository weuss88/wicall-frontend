import { ALL_PAGES, isFullAccess } from '../utils';

const defaultPages = (role) => role === 'manager' ? ['camp', 'cons', 'leads', 'stats'] : [];

export default function UserModal({ me, userDlg, setUserDlg, onClose, onSave }) {
  const { mode, username, fullName, password, newRole, pagesAccess, saving, error } = userDlg;

  return (
    <div className="mo">
      <div className="mo-box" style={{ maxWidth: '420px' }}>
        <div className="mo-head">
          <div className="mo-title">{mode === 'add' ? 'NOUVEL UTILISATEUR' : "MODIFIER L'UTILISATEUR"}</div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>
        <div className="mo-body">
          {mode === 'add' && (
            <div className="fr full">
              <div className="fg2">
                <label>Identifiant (login) *</label>
                <input className="fi" type="text" placeholder="jean.dupont"
                  value={username}
                  onChange={e => setUserDlg(d => ({ ...d, username: e.target.value }))} />
              </div>
            </div>
          )}
          <div className="fr full">
            <div className="fg2">
              <label>Nom complet *</label>
              <input className="fi" type="text" placeholder="Jean Dupont"
                value={fullName}
                onChange={e => setUserDlg(d => ({ ...d, fullName: e.target.value }))} />
            </div>
          </div>
          <div className="fr full">
            <div className="fg2">
              <label>{mode === 'add' ? 'Mot de passe *' : 'Nouveau mot de passe (vide = inchangé)'}</label>
              <input className="fi" type="password" placeholder="••••••••"
                value={password}
                onChange={e => setUserDlg(d => ({ ...d, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && onSave()} />
            </div>
          </div>
          {isFullAccess(me) && (
            <div className="fr full">
              <div className="fg2">
                <label>Rôle</label>
                <select className="fi" value={newRole}
                  onChange={e => setUserDlg(d => ({ ...d, newRole: e.target.value, pagesAccess: defaultPages(e.target.value) }))}>
                  <option value="conseiller">Conseiller</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>
          )}
          {isFullAccess(me) && newRole === 'manager' && (
            <div className="fg2 full">
              <label>Pages accessibles</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {ALL_PAGES.map(p => (
                  <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer', color: 'var(--text2)' }}>
                    <input type="checkbox"
                      style={{ accentColor: 'var(--teal)' }}
                      checked={(pagesAccess || []).includes(p.key)}
                      onChange={e => {
                        const cur = pagesAccess || [];
                        setUserDlg(d => ({ ...d, pagesAccess: e.target.checked ? [...cur, p.key] : cur.filter(x => x !== p.key) }));
                      }} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          {error && <div style={{ color: 'var(--red)', fontSize: '12px', padding: '6px 0' }}>{error}</div>}
        </div>
        <div className="mo-foot">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={onSave} disabled={saving}>
            {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
          </button>
        </div>
      </div>
    </div>
  );
}
