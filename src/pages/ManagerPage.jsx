import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../api';
import CampaignModal from '../components/CampaignModal';

const TCOL = {PAC:'#4d9fff',PV:'#ffd740',ITE:'#c97fff',REN:'#00d2c8',MUT:'#00e676',AUTO:'#ff9100',FIN:'#ff6b9d',ALARM:'#ff6b6b',AUTRE:'#7ab8b5'};

export default function ManagerPage({ me, onLogout }) {
  const [tab, setTab] = useState('camp');
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [userDlg, setUserDlg] = useState(null);
  const [search, setSearch] = useState('');
  // userDlg: null | { mode:'add'|'edit', user, username, fullName, password, saving, error }

  const loadCampaigns = useCallback(async () => {
    try {
      const data = await apiCall('GET', '/campaigns/');
      setCampaigns(data);
    } catch (e) {
      alert('Erreur chargement campagnes: ' + e.message);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiCall('GET', '/users/');
      setUsers(data);
    } catch (e) {
      alert('Erreur chargement conseillers: ' + e.message);
    }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'cons') loadUsers();
  };

  const handleSaveCampaign = async (data, id) => {
    try {
      if (id) await apiCall('PUT', '/campaigns/' + id, data);
      else await apiCall('POST', '/campaigns/', data);
      setModalOpen(false);
      setEditCampaign(null);
      await loadCampaigns();
    } catch (e) {
      alert('Erreur: ' + e.message);
      throw e;
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await apiCall('PATCH', '/campaigns/' + id + '/toggle');
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, actif: res.actif } : c));
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    try {
      await apiCall('DELETE', '/campaigns/' + id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
  };

  const openAddUser = () => setUserDlg({ mode: 'add', user: null, username: '', fullName: '', password: '', saving: false, error: '' });
  const openEditUser = (user) => setUserDlg({ mode: 'edit', user, username: user.username, fullName: user.full_name || '', password: '', saving: false, error: '' });
  const closeUserDlg = () => setUserDlg(null);

  const handleSaveUser = async () => {
    const { mode, user, username, fullName, password } = userDlg;
    if (!fullName.trim()) { setUserDlg(d => ({ ...d, error: 'Le nom est obligatoire' })); return; }
    if (mode === 'add' && !username.trim()) { setUserDlg(d => ({ ...d, error: "L'identifiant est obligatoire" })); return; }
    if (mode === 'add' && !password.trim()) { setUserDlg(d => ({ ...d, error: 'Le mot de passe est obligatoire' })); return; }
    setUserDlg(d => ({ ...d, saving: true, error: '' }));
    try {
      if (mode === 'add') {
        await apiCall('POST', '/auth/register', { username: username.trim(), full_name: fullName.trim(), password: password.trim(), role: 'conseiller' });
      } else {
        const body = { full_name: fullName.trim() };
        if (password.trim()) body.password = password.trim();
        await apiCall('PUT', '/users/' + user.id, body);
      }
      closeUserDlg();
      await loadUsers();
    } catch (e) {
      setUserDlg(d => ({ ...d, saving: false, error: e.message }));
    }
  };

  const tot = campaigns.length;
  const act = campaigns.filter(c => c.actif).length;
  const cli = new Set(campaigns.map(c => c.client.split('—')[0].trim())).size;
  const sec = new Set(campaigns.map(c => c.tag)).size;

  const q = search.trim().toLowerCase();
  const filteredCampaigns = q
    ? campaigns.filter(c =>
        c.nom.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q)
      )
    : campaigns;

  return (
    <div className="page">
      <div className="shell">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sb-head">
            <div className="sb-mark">W</div>
            <div><div className="sb-brand">WICALL</div><div className="sb-sub">Manager</div></div>
          </div>
          <div className="sb-sec">Navigation</div>
          <div className={`sb-row ${tab==='camp'?'on':''}`} onClick={() => handleTabChange('camp')}>
            <div className="sb-dot"></div>Campagnes
          </div>
          <div className={`sb-row ${tab==='cons'?'on':''}`} onClick={() => handleTabChange('cons')}>
            <div className="sb-dot"></div>Conseillers
          </div>
          <div className="sb-sec">Stats live</div>
          <div className="sb-row"><div className="sb-dot"></div>Total<span className="sb-tag">{tot}</span></div>
          <div className="sb-row"><div className="sb-dot"></div>Actives<span className="sb-tag">{act}</span></div>
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-av" style={{color:'var(--teal)'}}>{me?.name?.split(' ').map(x => x[0]).join('').toUpperCase() || 'M'}</div>
              <div><div className="sb-uname">{me?.name || 'Manager'}</div><div className="sb-urole">Administrateur</div></div>
            </div>
            <button className="btn-logout" onClick={onLogout}>↩ DÉCONNEXION</button>
          </div>
        </div>

        {/* Mobile bar */}
        <div className="mob-bar">
          <div className="mob-bar-left">
            <div className="mob-bar-mark">W</div>
            <div>
              <div className="mob-bar-brand">WICALL</div>
              <div className="mob-bar-role">Manager</div>
            </div>
          </div>
          <div className="mob-bar-user">
            <div className="mob-bar-av" style={{color:'var(--teal)'}}>{me?.name?.split(' ').map(x => x[0]).join('').toUpperCase() || 'M'}</div>
            <div className="mob-bar-uname">{me?.name || 'Manager'}</div>
            <button className="btn-logout" onClick={onLogout}>↩ DÉCO</button>
          </div>
        </div>

        {/* Mobile tabs (navigation onglets) */}
        <div className="mob-tabs">
          <button className={`mob-tab ${tab==='camp'?'on':''}`} onClick={() => handleTabChange('camp')}>📋 Campagnes</button>
          <button className={`mob-tab ${tab==='cons'?'on':''}`} onClick={() => handleTabChange('cons')}>👥 Conseillers</button>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="tp-path">WICALL / MANAGER</div>
              <div className="tp-title">{tab==='camp' ? 'Gestion Campagnes' : 'Gestion Conseillers'}</div>
            </div>
            {tab === 'camp' && (
              <div className="tp-right">
                <div className="ibox" style={{marginRight:'8px'}}>
                  <span className="ilbl">🔍</span>
                  <input
                    className="iin search-iin"
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',padding:'0 4px',fontSize:'12px'}}>✕</button>
                  )}
                </div>
                <button className="btn-add" onClick={() => { setEditCampaign(null); setModalOpen(true); }}>
                  + NOUVELLE CAMPAGNE
                </button>
              </div>
            )}
          </div>

          {/* Tab Campagnes */}
          {tab === 'camp' && (
            <div className="mgr-body">
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-ico">📋</div>
                  <div><div className="stat-val">{tot}</div><div className="stat-lbl">Total campagnes</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-ico">✅</div>
                  <div><div className="stat-val">{act}</div><div className="stat-lbl">Actives</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-ico">👥</div>
                  <div><div className="stat-val">{cli}</div><div className="stat-lbl">Clients donneurs</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-ico">🏷️</div>
                  <div><div className="stat-val">{sec}</div><div className="stat-lbl">Secteurs</div></div>
                </div>
              </div>
              <div className="mgr-card">
                <div className="mgr-head">
                  <div className="mgr-head-title">
                    {q ? `${filteredCampaigns.length} résultat${filteredCampaigns.length !== 1 ? 's' : ''} pour "${search}"` : 'TOUTES LES CAMPAGNES'}
                  </div>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="tbl">
                    <thead><tr>
                      <th>Campagne / Client</th><th>Type</th><th>CPL</th>
                      <th>Âge</th><th>CP</th><th>Critères custom</th><th>Statut</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredCampaigns.length === 0 && (
                        <tr><td colSpan="8" style={{textAlign:'center',padding:'40px',color:'var(--muted)',fontSize:'13px'}}>
                          {q ? `Aucune campagne ne correspond à "${search}"` : 'Aucune campagne pour l\'instant'}
                        </td></tr>
                      )}
                      {filteredCampaigns.map(c => {
                        const col = TCOL[c.tag] || '#7ab8b5';
                        const cpTxt = c.cp === 'national' ? '🌍 National' : `${Array.isArray(c.cp) ? c.cp.length : 0} depts`;
                        const ageTxt = (c.age_min !== null || c.age_max !== null)
                          ? `${c.age_min ?? '?'} – ${c.age_max ?? '∞'} ans` : 'Tous';
                        return (
                          <tr key={c.id}>
                            <td>
                              <div className="t-name">{c.nom}</div>
                              <div className="t-client">{c.client}</div>
                            </td>
                            <td>
                              <span className="t-tag" style={{background:`${col}18`,color:col,border:`1px solid ${col}35`}}>
                                {c.tag}
                              </span>
                            </td>
                            <td className="t-cpl">{c.cpl}</td>
                            <td style={{color:'var(--text2)',fontSize:'11px'}}>{ageTxt}</td>
                            <td><div className="cp-prev">{cpTxt}</div></td>
                            <td>
                              {c.criteres_custom?.length > 0
                                ? <span style={{color:'var(--teal)',fontSize:'10px'}}>{c.criteres_custom.length} critère{c.criteres_custom.length > 1 ? 's' : ''}</span>
                                : <span style={{color:'var(--muted)'}}>—</span>}
                            </td>
                            <td>
                              <label className="tog">
                                <input type="checkbox" checked={c.actif} onChange={() => handleToggle(c.id)} />
                                <div className="tog-track"></div><div className="tog-thumb"></div>
                              </label>
                            </td>
                            <td>
                              <button className="btn-ed" onClick={() => { setEditCampaign(c); setModalOpen(true); }}>
                                ✏ Modifier
                              </button>
                              <button className="btn-dl" onClick={() => handleDelete(c.id)}>✕</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Conseillers */}
          {tab === 'cons' && (
            <div className="mgr-body">
              <div className="mgr-card">
                <div className="mgr-head">
                  <div className="mgr-head-title">COMPTES CONSEILLERS</div>
                  <button className="btn-add" onClick={openAddUser}>+ AJOUTER</button>
                </div>
                <table className="tbl">
                  <thead><tr>
                    <th>Nom</th><th>Identifiant</th><th>Statut</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><div className="t-name">{u.full_name || u.username}</div></td>
                        <td style={{color:'var(--muted2)'}}>{u.username}</td>
                        <td>
                          <span style={{
                            background: u.is_active ? 'var(--green2)' : 'rgba(255,68,68,0.1)',
                            color: u.is_active ? 'var(--green)' : 'var(--red)',
                            padding: '3px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700'
                          }}>
                            {u.is_active ? 'ACTIF' : 'INACTIF'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-ed" onClick={() => openEditUser(u)}>Modifier</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <CampaignModal
          campaign={editCampaign}
          onSave={handleSaveCampaign}
          onClose={() => { setModalOpen(false); setEditCampaign(null); }}
        />
      )}

      {userDlg && (
        <div className="mo">
          <div className="mo-box" style={{maxWidth:'420px'}}>
            <div className="mo-head">
              <div className="mo-title">{userDlg.mode === 'add' ? 'NOUVEAU CONSEILLER' : 'MODIFIER LE CONSEILLER'}</div>
              <button className="mo-x" onClick={closeUserDlg}>✕</button>
            </div>
            <div className="mo-body">
              {userDlg.mode === 'add' && (
                <div className="fr full">
                  <div className="fg2">
                    <label>Identifiant (login) *</label>
                    <input className="fi" type="text" placeholder="jean.dupont"
                      value={userDlg.username}
                      onChange={e => setUserDlg(d => ({ ...d, username: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="fr full">
                <div className="fg2">
                  <label>Nom complet *</label>
                  <input className="fi" type="text" placeholder="Jean Dupont"
                    value={userDlg.fullName}
                    onChange={e => setUserDlg(d => ({ ...d, fullName: e.target.value }))} />
                </div>
              </div>
              <div className="fr full">
                <div className="fg2">
                  <label>{userDlg.mode === 'add' ? 'Mot de passe *' : 'Nouveau mot de passe (vide = inchangé)'}</label>
                  <input className="fi" type="password" placeholder="••••••••"
                    value={userDlg.password}
                    onChange={e => setUserDlg(d => ({ ...d, password: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleSaveUser()} />
                </div>
              </div>
              {userDlg.error && (
                <div style={{color:'var(--red)',fontSize:'12px',padding:'6px 0'}}>{userDlg.error}</div>
              )}
            </div>
            <div className="mo-foot">
              <button className="btn-cancel" onClick={closeUserDlg}>Annuler</button>
              <button className="btn-save" onClick={handleSaveUser} disabled={userDlg.saving}>
                {userDlg.saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
