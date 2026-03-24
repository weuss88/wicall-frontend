import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../api';
import CampaignModal from '../components/CampaignModal';

const TCOL = {PAC:'#4d9fff',PV:'#ffd740',ITE:'#c97fff',REN:'#00d2c8',MUT:'#00e676',AUTO:'#ff9100',FIN:'#ff6b9d',ALARM:'#ff6b6b',AUTRE:'#7ab8b5'};

const STATUT_CFG = {
  valide:     { bg:'rgba(0,230,118,0.12)',  color:'var(--green)', border:'rgba(0,230,118,0.3)',  label:'✓ VALIDÉ' },
  supprime:   { bg:'rgba(255,68,68,0.1)',   color:'var(--red)',   border:'rgba(255,68,68,0.25)', label:'✕ SUPPRIMÉ' },
  en_attente: { bg:'rgba(255,215,64,0.1)',  color:'#ffd740',      border:'rgba(255,215,64,0.25)',label:'⏳ EN ATTENTE' },
};
function StatutBadge({ statut }) {
  const s = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'2px 9px',fontSize:'10px',fontWeight:700,whiteSpace:'nowrap',letterSpacing:'.3px'}}>{s.label}</span>;
}

function fmtTel(val) {
  const digits = val.replace(/\D/g, '').substring(0, 11);
  if (digits.startsWith('33') && digits.length >= 2) {
    const parts = ['33'];
    const rest = digits.substring(2);
    if (rest.length > 0) parts.push(rest.substring(0, 1));
    if (rest.length > 1) parts.push(rest.substring(1, 3));
    if (rest.length > 3) parts.push(rest.substring(3, 5));
    if (rest.length > 5) parts.push(rest.substring(5, 7));
    if (rest.length > 7) parts.push(rest.substring(7, 9));
    return parts.join(' ');
  }
  return digits.substring(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ');
}

function LeadEditModal({ lead, onSave, onClose }) {
  const [form, setForm] = useState({
    civilite: lead.civilite || '',
    nom_prospect: lead.nom_prospect || '',
    prenom: lead.prenom || '',
    adresse: lead.adresse || '',
    cp: lead.cp || '',
    ville: lead.ville || '',
    telephone: lead.telephone || '',
    email: lead.email || '',
    date_rappel: lead.date_rappel || '',
    heure_rappel: lead.heure_rappel || '',
    commentaire: lead.commentaire || '',
    statut: lead.statut || 'en_attente',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(lead.id, {
        civilite: form.civilite || null,
        nom_prospect: form.nom_prospect.trim() || null,
        prenom: form.prenom.trim() || null,
        adresse: form.adresse.trim() || null,
        cp: form.cp.trim() || null,
        ville: form.ville.trim() || null,
        telephone: form.telephone.trim() || null,
        email: form.email.trim() || null,
        date_rappel: form.date_rappel || null,
        heure_rappel: form.heure_rappel || null,
        commentaire: form.commentaire.trim() || null,
        statut: form.statut,
      });
      onClose();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const col = TCOL[lead.campaign_tag] || '#7ab8b5';
  return (
    <div className="mo">
      <div className="mo-box" style={{maxWidth:'560px'}}>
        <div className="mo-head">
          <div className="mo-title">MODIFIER LE LEAD</div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>
        <div className="mo-body">
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',background:'rgba(0,210,200,0.06)',border:'1px solid rgba(0,210,200,0.15)',borderRadius:'6px',marginBottom:'14px'}}>
            <span style={{background:`${col}18`,color:col,fontSize:'9px',fontWeight:700,padding:'1px 6px',borderRadius:'4px',border:`1px solid ${col}35`}}>{lead.campaign_tag}</span>
            <span style={{fontSize:'12px',color:'var(--text)'}}>{lead.campaign_nom}</span>
            <span style={{fontSize:'11px',color:'var(--muted)',marginLeft:'auto'}}>{lead.conseiller_name}</span>
          </div>

          {/* Statut */}
          <div className="fg2" style={{marginBottom:'10px'}}>
            <label>Statut du lead</label>
            <select className="fi" value={form.statut} onChange={e => set('statut', e.target.value)}>
              <option value="en_attente">⏳ En attente</option>
              <option value="valide">✓ Validé</option>
              <option value="supprime">✕ Supprimé</option>
            </select>
          </div>

          {/* Civilité + Nom + Prénom */}
          <div style={{display:'grid',gridTemplateColumns:'100px 1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>Civilité</label>
              <select className="fi" value={form.civilite} onChange={e => set('civilite', e.target.value)}>
                <option value="">—</option>
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
              </select>
            </div>
            <div className="fg2">
              <label>Nom</label>
              <input className="fi" type="text" value={form.nom_prospect} onChange={e => set('nom_prospect', e.target.value)} />
            </div>
            <div className="fg2">
              <label>Prénom</label>
              <input className="fi" type="text" value={form.prenom} onChange={e => set('prenom', e.target.value)} />
            </div>
          </div>

          {/* Adresse */}
          <div className="fg2" style={{marginBottom:'10px'}}>
            <label>Adresse</label>
            <input className="fi" type="text" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          </div>

          {/* CP + Ville */}
          <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>CP</label>
              <input className="fi" type="text" maxLength="5" inputMode="numeric"
                value={form.cp} onChange={e => set('cp', e.target.value.replace(/\D/g,'').substring(0,5))} />
            </div>
            <div className="fg2">
              <label>Ville</label>
              <input className="fi" type="text" value={form.ville} onChange={e => set('ville', e.target.value)} />
            </div>
          </div>

          {/* Téléphone + Mail */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>Téléphone</label>
              <input className="fi" type="tel" maxLength="17"
                value={form.telephone} onChange={e => set('telephone', fmtTel(e.target.value))} />
            </div>
            <div className="fg2">
              <label>Mail</label>
              <input className="fi" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          {/* Date + Heure rappel */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>Date de rappel</label>
              <input className="fi" type="date" value={form.date_rappel} onChange={e => set('date_rappel', e.target.value)} />
            </div>
            <div className="fg2">
              <label>Heure de rappel</label>
              <input className="fi" type="time" value={form.heure_rappel} onChange={e => set('heure_rappel', e.target.value)} />
            </div>
          </div>

          {/* Note */}
          <div className="fg2" style={{marginBottom:'10px'}}>
            <label>Note</label>
            <textarea className="fi" rows="3" value={form.commentaire} onChange={e => set('commentaire', e.target.value)}
              style={{resize:'vertical',minHeight:'60px',fontFamily:'inherit'}} />
          </div>

          {error && <div style={{color:'var(--red)',fontSize:'12px',padding:'4px 0'}}>{error}</div>}
        </div>
        <div className="mo-foot">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? 'ENREGISTREMENT...' : '✓ ENREGISTRER'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManagerPage({ me, onLogout }) {
  const [tab, setTab] = useState('camp');
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [userDlg, setUserDlg] = useState(null);
  const [editLead, setEditLead] = useState(null);
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

  const loadLeads = useCallback(async () => {
    try {
      const data = await apiCall('GET', '/leads/');
      setLeads(data);
    } catch (e) {
      alert('Erreur chargement leads: ' + e.message);
    }
  }, []);

  const handleLeadUpdate = async (id, data) => {
    const updated = await apiCall('PUT', '/leads/' + id, data);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  };

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'cons') loadUsers();
    if (newTab === 'leads') loadLeads();
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

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Supprimer le compte de ${user.full_name || user.username} ? Cette action est irréversible.`)) return;
    try {
      await apiCall('DELETE', '/users/' + user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
  };

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
  const totalLeads = leads.length;

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
          <div className={`sb-row ${tab==='leads'?'on':''}`} onClick={() => handleTabChange('leads')}>
            <div className="sb-dot"></div>Leads
            {totalLeads > 0 && <span className="sb-tag">{totalLeads}</span>}
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
          <button className={`mob-tab ${tab==='leads'?'on':''}`} onClick={() => handleTabChange('leads')}>⭐ Leads</button>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="tp-path">WICALL / MANAGER</div>
              <div className="tp-title">{tab==='camp' ? 'Gestion Campagnes' : tab==='cons' ? 'Gestion Conseillers' : 'Leads Qualifiés'}</div>
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
                          <button className="btn-dl" onClick={() => handleDeleteUser(u)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Tab Leads */}
          {tab === 'leads' && (
            <div className="mgr-body">
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-ico">⭐</div>
                  <div><div className="stat-val">{totalLeads}</div><div className="stat-lbl">Total leads</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-ico">👥</div>
                  <div><div className="stat-val">{new Set(leads.map(l => l.conseiller_id)).size}</div><div className="stat-lbl">Conseillers actifs</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-ico">📋</div>
                  <div><div className="stat-val">{new Set(leads.map(l => l.campaign_id)).size}</div><div className="stat-lbl">Campagnes touchées</div></div>
                </div>
              </div>
              <div className="mgr-card">
                <div className="mgr-head">
                  <div className="mgr-head-title">TOUS LES LEADS</div>
                  <button className="btn-add" style={{background:'none',border:'1px solid rgba(0,210,200,0.3)',color:'var(--teal)'}} onClick={loadLeads}>↺ Actualiser</button>
                </div>
                {leads.length === 0 ? (
                  <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)'}}>
                    <div style={{fontSize:'32px',marginBottom:'12px'}}>⭐</div>
                    <div style={{fontSize:'13px'}}>Aucun lead qualifié pour l'instant</div>
                  </div>
                ) : (
                  <div style={{overflowX:'auto'}}>
                    <table className="tbl">
                      <thead><tr>
                        <th>Date</th><th>Statut</th><th>Conseiller</th><th>Campagne</th><th>Civ.</th>
                        <th>Nom</th><th>Prénom</th><th>Adresse</th><th>CP</th><th>Ville</th>
                        <th>Tél.</th><th>Mail</th><th>Rappel</th><th>Note</th><th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {leads.map(l => {
                          const col = TCOL[l.campaign_tag] || '#7ab8b5';
                          const d = new Date(l.created_at);
                          const dateStr = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit' })
                            + ' ' + d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
                          const nd = v => v || <span style={{color:'var(--muted)'}}>—</span>;
                          const rappel = l.date_rappel
                            ? new Date(l.date_rappel).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'2-digit'})
                              + (l.heure_rappel ? ' ' + l.heure_rappel : '')
                            : null;
                          return (
                            <tr key={l.id}>
                              <td style={{fontSize:'11px',color:'var(--muted)',whiteSpace:'nowrap'}}>{dateStr}</td>
                              <td><StatutBadge statut={l.statut} /></td>
                              <td>
                                <div className="t-name" style={{fontSize:'12px'}}>{l.conseiller_name}</div>
                              </td>
                              <td>
                                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                  <span style={{background:`${col}18`,color:col,fontSize:'9px',fontWeight:700,padding:'1px 6px',borderRadius:'4px',border:`1px solid ${col}35`,whiteSpace:'nowrap'}}>{l.campaign_tag}</span>
                                  <div>
                                    <div className="t-name" style={{fontSize:'12px'}}>{l.campaign_nom}</div>
                                    <div className="t-client" style={{fontSize:'10px'}}>{l.campaign_client}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{fontSize:'11px',color:'var(--muted2)'}}>{nd(l.civilite)}</td>
                              <td style={{fontSize:'12px'}}>{nd(l.nom_prospect)}</td>
                              <td style={{fontSize:'12px'}}>{nd(l.prenom)}</td>
                              <td style={{fontSize:'11px',maxWidth:'140px'}}>{nd(l.adresse)}</td>
                              <td style={{fontSize:'11px'}}>{nd(l.cp)}</td>
                              <td style={{fontSize:'11px'}}>{nd(l.ville)}</td>
                              <td style={{fontSize:'12px',color:'var(--teal)',whiteSpace:'nowrap'}}>{nd(l.telephone)}</td>
                              <td style={{fontSize:'11px',maxWidth:'140px'}}>{nd(l.email)}</td>
                              <td style={{fontSize:'11px',whiteSpace:'nowrap',color:'var(--text2)'}}>{nd(rappel)}</td>
                              <td style={{fontSize:'11px',color:'var(--text2)',maxWidth:'160px'}}>{nd(l.commentaire)}</td>
                              <td style={{whiteSpace:'nowrap'}}>
                                {l.statut !== 'valide' && (
                                  <button className="btn-ed" style={{color:'var(--green)',borderColor:'rgba(0,230,118,0.3)',marginRight:'4px'}}
                                    onClick={() => handleLeadUpdate(l.id, {statut:'valide'})}>✓</button>
                                )}
                                {l.statut !== 'supprime' && (
                                  <button className="btn-dl" style={{marginRight:'4px'}}
                                    onClick={() => handleLeadUpdate(l.id, {statut:'supprime'})}>✕</button>
                                )}
                                <button className="btn-ed" onClick={() => setEditLead(l)}>✏</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {editLead && (
        <LeadEditModal
          lead={editLead}
          onSave={handleLeadUpdate}
          onClose={() => setEditLead(null)}
        />
      )}
    </div>
  );
}
