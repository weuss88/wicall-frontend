import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../api';
import { TCOL, ALL_PAGES, StatutBadge, exportCSV, isFullAccess, hasPage } from '../utils';
import CampaignModal from '../components/CampaignModal';
import LeadEditModal from '../components/LeadEditModal';
import ManagerCATab from '../components/ManagerCATab';
import BillingTab from '../components/BillingTab';
import UserModal from '../components/UserModal';
import ToastContainer from '../components/Toast';
import useToast from '../hooks/useToast';

export default function ManagerPage({ me, onLogout }) {
  const { toasts, toast } = useToast();
  const [tab, setTab] = useState('camp');
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [userDlg, setUserDlg] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLeadCons, setFilterLeadCons] = useState('');
  const [filterLeadCamp, setFilterLeadCamp] = useState('');

  const loadCampaigns = useCallback(async () => {
    try { setCampaigns(await apiCall('GET', '/campaigns/')); }
    catch (e) { toast('Erreur chargement campagnes: ' + e.message); }
  }, []);

  const loadUsers = useCallback(async () => {
    try { setUsers(await apiCall('GET', '/users/')); }
    catch (e) { toast('Erreur chargement conseillers: ' + e.message); }
  }, []);

  const loadLeads = useCallback(async () => {
    try { setLeads(await apiCall('GET', '/leads/')); }
    catch (e) { toast('Erreur chargement leads: ' + e.message); }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (['cons', 'acces', 'billing'].includes(newTab)) loadUsers();
    if (['leads', 'billing', 'stats'].includes(newTab)) loadLeads();
  };

  const handleLeadUpdate = async (id, data) => {
    const updated = await apiCall('PUT', '/leads/' + id, data);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Supprimer définitivement ce lead ? Cette action est irréversible.')) return;
    try {
      await apiCall('DELETE', '/leads/' + id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast('Lead supprimé', 'success');
    } catch (e) { toast('Erreur: ' + e.message); }
  };

  const handleSaveCampaign = async (data, id) => {
    try {
      if (id) await apiCall('PUT', '/campaigns/' + id, data);
      else await apiCall('POST', '/campaigns/', data);
      setModalOpen(false);
      setEditCampaign(null);
      await loadCampaigns();
    } catch (e) {
      toast('Erreur: ' + e.message);
      throw e;
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await apiCall('PATCH', '/campaigns/' + id + '/toggle');
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, actif: res.actif } : c));
    } catch (e) { toast('Erreur: ' + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    try {
      await apiCall('DELETE', '/campaigns/' + id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) { toast('Erreur: ' + e.message); }
  };

  const defaultPages = (role) => role === 'manager' ? ['camp', 'cons', 'leads', 'stats'] : [];
  const openAddUser = () => setUserDlg({ mode: 'add', user: null, username: '', fullName: '', password: '', newRole: 'conseiller', pagesAccess: defaultPages('conseiller'), saving: false, error: '' });
  const openEditUser = (user) => setUserDlg({ mode: 'edit', user, username: user.username, fullName: user.full_name || '', password: '', newRole: user.role || 'conseiller', pagesAccess: user.pages_access || defaultPages(user.role), saving: false, error: '' });

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Supprimer le compte de ${user.full_name || user.username} ? Cette action est irréversible.`)) return;
    try {
      await apiCall('DELETE', '/users/' + user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast('Compte supprimé', 'success');
    } catch (e) { toast('Erreur: ' + e.message); }
  };

  const handleToggleUser = async (user) => {
    try {
      await apiCall('PUT', '/users/' + user.id, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast(user.is_active ? 'Compte désactivé' : 'Compte activé', 'success');
    } catch (e) { toast('Erreur: ' + e.message); }
  };

  const handleSaveUser = async () => {
    const { mode, user, username, fullName, password } = userDlg;
    if (!fullName.trim()) { setUserDlg(d => ({ ...d, error: 'Le nom est obligatoire' })); return; }
    if (mode === 'add' && !username.trim()) { setUserDlg(d => ({ ...d, error: "L'identifiant est obligatoire" })); return; }
    if (mode === 'add' && !password.trim()) { setUserDlg(d => ({ ...d, error: 'Le mot de passe est obligatoire' })); return; }
    setUserDlg(d => ({ ...d, saving: true, error: '' }));
    try {
      if (mode === 'add') {
        const body = { username: username.trim(), full_name: fullName.trim(), password: password.trim(), role: isFullAccess(me) ? userDlg.newRole : 'conseiller' };
        if (isFullAccess(me) && userDlg.newRole === 'manager') body.pages_access = userDlg.pagesAccess;
        await apiCall('POST', '/auth/register', body);
      } else {
        const body = { full_name: fullName.trim() };
        if (password.trim()) body.password = password.trim();
        if (isFullAccess(me)) { body.role = userDlg.newRole; if (userDlg.newRole === 'manager') body.pages_access = userDlg.pagesAccess; }
        await apiCall('PUT', '/users/' + user.id, body);
      }
      setUserDlg(null);
      await loadUsers();
    } catch (e) {
      setUserDlg(d => ({ ...d, saving: false, error: e.message }));
    }
  };

  // Données dérivées
  const tot = campaigns.length;
  const act = campaigns.filter(c => c.actif).length;
  const cli = new Set(campaigns.map(c => c.client.split('—')[0].trim())).size;
  const sec = new Set(campaigns.map(c => c.tag)).size;
  const q = search.trim().toLowerCase();
  const filteredCampaigns = q ? campaigns.filter(c => c.nom.toLowerCase().includes(q) || c.client.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q)) : campaigns;
  const filteredLeads = leads.filter(l => {
    if (filterLeadCons && String(l.conseiller_id) !== filterLeadCons) return false;
    if (filterLeadCamp && String(l.campaign_id) !== filterLeadCamp) return false;
    return true;
  });
  const leadConseillers = [...new Map(leads.map(l => [l.conseiller_id, { id: l.conseiller_id, name: l.conseiller_name }])).values()];
  const leadCampagnes = [...new Map(leads.map(l => [l.campaign_id, { id: l.campaign_id, nom: l.campaign_nom }])).values()];

  const tabTitle = { camp: 'Gestion Campagnes', cons: 'Gestion Conseillers', leads: 'Leads Qualifiés', billing: 'Facturation', stats: 'Stats CA', acces: 'Gestion des accès' };

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
          {hasPage(me, 'camp') && <div className={`sb-row ${tab === 'camp' ? 'on' : ''}`} onClick={() => handleTabChange('camp')}><div className="sb-dot"></div>Campagnes</div>}
          {hasPage(me, 'cons') && <div className={`sb-row ${tab === 'cons' ? 'on' : ''}`} onClick={() => handleTabChange('cons')}><div className="sb-dot"></div>Conseillers</div>}
          {hasPage(me, 'leads') && (
            <div className={`sb-row ${tab === 'leads' ? 'on' : ''}`} onClick={() => handleTabChange('leads')}>
              <div className="sb-dot"></div>Leads
              {leads.length > 0 && <span className="sb-tag">{leads.length}</span>}
            </div>
          )}
          {hasPage(me, 'stats') && <div className={`sb-row ${tab === 'stats' ? 'on' : ''}`} onClick={() => handleTabChange('stats')}><div className="sb-dot"></div>Stats CA</div>}
          {hasPage(me, 'billing') && <div className={`sb-row ${tab === 'billing' ? 'on' : ''}`} onClick={() => handleTabChange('billing')}><div className="sb-dot"></div>Facturation</div>}
          {isFullAccess(me) && (
            <div className={`sb-row ${tab === 'acces' ? 'on' : ''}`} onClick={() => handleTabChange('acces')}>
              <div className="sb-dot"></div>Gestion accès
              <span style={{ fontSize: '8px', marginLeft: '4px', color: 'var(--teal)', opacity: .6, fontFamily: 'Rajdhani,sans-serif', letterSpacing: '.5px' }}>🔑</span>
            </div>
          )}
          <div className="sb-sec">Stats live</div>
          <div className="sb-row"><div className="sb-dot"></div>Total<span className="sb-tag">{tot}</span></div>
          <div className="sb-row"><div className="sb-dot"></div>Actives<span className="sb-tag">{act}</span></div>
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-av text-teal">{(me?.full_name || me?.name || 'M').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)}</div>
              <div><div className="sb-uname">{me?.full_name || me?.name || 'Manager'}</div><div className="sb-urole">{isFullAccess(me) ? 'Propriétaire' : 'Manager'}</div></div>
            </div>
            <button className="btn-logout" onClick={onLogout}>↩ DÉCONNEXION</button>
          </div>
        </div>

        {/* Mobile bar */}
        <div className="mob-bar">
          <div className="mob-bar-left">
            <div className="mob-bar-mark">W</div>
            <div><div className="mob-bar-brand">WICALL</div><div className="mob-bar-role">Manager</div></div>
          </div>
          <div className="mob-bar-user">
            <div className="mob-bar-av text-teal">{me?.name?.split(' ').map(x => x[0]).join('').toUpperCase() || 'M'}</div>
            <div className="mob-bar-uname">{me?.name || 'Manager'}</div>
            <button className="btn-logout" onClick={onLogout}>↩ DÉCO</button>
          </div>
        </div>
        <div className="mob-tabs">
          {hasPage(me, 'camp') && <button className={`mob-tab ${tab === 'camp' ? 'on' : ''}`} onClick={() => handleTabChange('camp')}>📋 Campagnes</button>}
          {hasPage(me, 'cons') && <button className={`mob-tab ${tab === 'cons' ? 'on' : ''}`} onClick={() => handleTabChange('cons')}>👥 Conseillers</button>}
          {hasPage(me, 'leads') && <button className={`mob-tab ${tab === 'leads' ? 'on' : ''}`} onClick={() => handleTabChange('leads')}>⭐ Leads</button>}
          {hasPage(me, 'stats') && <button className={`mob-tab ${tab === 'stats' ? 'on' : ''}`} onClick={() => handleTabChange('stats')}>📊 Stats CA</button>}
          {hasPage(me, 'billing') && <button className={`mob-tab ${tab === 'billing' ? 'on' : ''}`} onClick={() => handleTabChange('billing')}>💶 Facturation</button>}
          {isFullAccess(me) && <button className={`mob-tab ${tab === 'acces' ? 'on' : ''}`} onClick={() => handleTabChange('acces')}>🔑 Accès</button>}
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="tp-path">WICALL / MANAGER</div>
              <div className="tp-title">{tabTitle[tab] || tab}</div>
            </div>
            {tab === 'camp' && (
              <div className="tp-right">
                <div className="ibox" style={{ marginRight: '8px' }}>
                  <span className="ilbl">🔍</span>
                  <input className="iin search-iin" type="text" placeholder="Rechercher..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                  {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0 4px', fontSize: '12px' }}>✕</button>}
                </div>
                <button className="btn-add" onClick={() => { setEditCampaign(null); setModalOpen(true); }}>+ NOUVELLE CAMPAGNE</button>
              </div>
            )}
          </div>

          {/* Tab Campagnes */}
          {tab === 'camp' && (
            <div className="mgr-body">
              <div className="stats-row">
                <div className="stat-card"><div className="stat-ico">📋</div><div><div className="stat-val">{tot}</div><div className="stat-lbl">Total campagnes</div></div></div>
                <div className="stat-card"><div className="stat-ico">✅</div><div><div className="stat-val">{act}</div><div className="stat-lbl">Actives</div></div></div>
                <div className="stat-card"><div className="stat-ico">👥</div><div><div className="stat-val">{cli}</div><div className="stat-lbl">Clients donneurs</div></div></div>
                <div className="stat-card"><div className="stat-ico">🏷️</div><div><div className="stat-val">{sec}</div><div className="stat-lbl">Secteurs</div></div></div>
              </div>
              <div className="mgr-card">
                <div className="mgr-head">
                  <div className="mgr-head-title">{q ? `${filteredCampaigns.length} résultat${filteredCampaigns.length !== 1 ? 's' : ''} pour "${search}"` : 'TOUTES LES CAMPAGNES'}</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="tbl">
                    <thead><tr>
                      <th>Campagne / Client</th><th>Type</th><th>CPL</th>
                      <th>Âge</th><th>CP</th><th>Critères custom</th><th>Statut</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredCampaigns.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>
                          {q ? `Aucune campagne ne correspond à "${search}"` : "Aucune campagne pour l'instant"}
                        </td></tr>
                      )}
                      {filteredCampaigns.map(c => {
                        const col = TCOL[c.tag] || '#7ab8b5';
                        const cpTxt = c.cp === 'national' ? '🌍 National' : `${Array.isArray(c.cp) ? c.cp.length : 0} depts`;
                        const ageTxt = (c.age_min !== null || c.age_max !== null) ? `${c.age_min ?? '?'} – ${c.age_max ?? '∞'} ans` : 'Tous';
                        return (
                          <tr key={c.id}>
                            <td><div className="t-name">{c.nom}</div><div className="t-client">{c.client}</div></td>
                            <td><span className="t-tag" style={{ background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{c.tag}</span></td>
                            <td className="t-cpl">{c.cpl}</td>
                            <td style={{ color: 'var(--text2)', fontSize: '11px' }}>{ageTxt}</td>
                            <td><div className="cp-prev">{cpTxt}</div></td>
                            <td>
                              {c.criteres_custom?.length > 0
                                ? <span style={{ color: 'var(--teal)', fontSize: '10px' }}>{c.criteres_custom.length} critère{c.criteres_custom.length > 1 ? 's' : ''}</span>
                                : <span className="text-muted">—</span>}
                            </td>
                            <td>
                              <label className="tog">
                                <input type="checkbox" checked={c.actif} onChange={() => handleToggle(c.id)} />
                                <div className="tog-track"></div><div className="tog-thumb"></div>
                              </label>
                            </td>
                            <td>
                              <button className="btn-ed" onClick={() => { setEditCampaign(c); setModalOpen(true); }}>✏ Modifier</button>
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
                  <thead><tr><th>Nom</th><th>Identifiant</th><th>Actif</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.filter(u => u.role === 'conseiller').map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="t-name">{u.full_name || u.username}</div>
                          {!u.is_active && <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '2px' }}>Compte désactivé</div>}
                        </td>
                        <td className="text-muted2">{u.username}</td>
                        <td>
                          <label className="tog">
                            <input type="checkbox" checked={!!u.is_active} onChange={() => handleToggleUser(u)} />
                            <div className="tog-track"></div><div className="tog-thumb"></div>
                          </label>
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
                <div className="stat-card"><div className="stat-ico">⭐</div><div><div className="stat-val">{leads.length}</div><div className="stat-lbl">Total leads</div></div></div>
                <div className="stat-card"><div className="stat-ico">👥</div><div><div className="stat-val">{new Set(leads.map(l => l.conseiller_id)).size}</div><div className="stat-lbl">Conseillers actifs</div></div></div>
                <div className="stat-card"><div className="stat-ico">📋</div><div><div className="stat-val">{new Set(leads.map(l => l.campaign_id)).size}</div><div className="stat-lbl">Campagnes touchées</div></div></div>
              </div>
              <div className="mgr-card">
                <div className="mgr-head" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <div className="mgr-head-title">
                    LEADS
                    {(filterLeadCons || filterLeadCamp) && <span style={{ color: 'var(--teal)', fontSize: '10px', marginLeft: '8px' }}>({filteredLeads.length} / {leads.length})</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {leadConseillers.length > 1 && (
                      <select className="fi" style={{ width: 'auto', padding: '4px 8px', fontSize: '11px' }} value={filterLeadCons} onChange={e => setFilterLeadCons(e.target.value)}>
                        <option value="">Tous les conseillers</option>
                        {leadConseillers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                      </select>
                    )}
                    {leadCampagnes.length > 1 && (
                      <select className="fi" style={{ width: 'auto', padding: '4px 8px', fontSize: '11px' }} value={filterLeadCamp} onChange={e => setFilterLeadCamp(e.target.value)}>
                        <option value="">Toutes les campagnes</option>
                        {leadCampagnes.map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
                      </select>
                    )}
                    <button className="btn-add" style={{ background: 'none', border: '1px solid rgba(0,210,200,0.3)', color: 'var(--teal)' }} onClick={loadLeads}>↺</button>
                    {filteredLeads.length > 0 && (
                      <button className="btn-add" style={{ background: 'none', border: '1px solid rgba(0,230,118,0.35)', color: 'var(--green)' }}
                        onClick={() => exportCSV(filteredLeads, campaigns)}>↓ Export CSV</button>
                    )}
                  </div>
                </div>
                {leads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
                    <div style={{ fontSize: '13px' }}>Aucun lead qualifié pour l'instant</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="tbl">
                      <thead><tr>
                        <th>Date</th><th>Statut</th><th>Conseiller</th><th>Campagne</th><th>Civ.</th>
                        <th>Nom</th><th>Prénom</th><th>Adresse</th><th>CP</th><th>Ville</th>
                        <th>Tél.</th><th>Mail</th><th>Rappel</th><th>Note</th><th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {filteredLeads.map(l => {
                          const col = TCOL[l.campaign_tag] || '#7ab8b5';
                          const d = new Date(l.created_at);
                          const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                          const nd = v => v || <span className="text-muted">—</span>;
                          const rappel = l.date_rappel
                            ? new Date(l.date_rappel).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + (l.heure_rappel ? ' ' + l.heure_rappel : '')
                            : null;
                          return (
                            <tr key={l.id}>
                              <td style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{dateStr}</td>
                              <td><StatutBadge statut={l.statut} /></td>
                              <td><div className="t-name" style={{ fontSize: '12px' }}>{l.conseiller_name}</div></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ background: `${col}18`, color: col, fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${col}35`, whiteSpace: 'nowrap' }}>{l.campaign_tag}</span>
                                  <div>
                                    <div className="t-name" style={{ fontSize: '12px' }}>{l.campaign_nom}</div>
                                    <div className="t-client" style={{ fontSize: '10px' }}>{l.campaign_client}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td-meta">{nd(l.civilite)}</td>
                              <td style={{ fontSize: '12px' }}>{nd(l.nom_prospect)}</td>
                              <td style={{ fontSize: '12px' }}>{nd(l.prenom)}</td>
                              <td style={{ fontSize: '11px', maxWidth: '140px' }}>{nd(l.adresse)}</td>
                              <td style={{ fontSize: '11px' }}>{nd(l.cp)}</td>
                              <td style={{ fontSize: '11px' }}>{nd(l.ville)}</td>
                              <td style={{ fontSize: '12px', color: 'var(--teal)', whiteSpace: 'nowrap' }}>{nd(l.telephone)}</td>
                              <td style={{ fontSize: '11px', maxWidth: '140px' }}>{nd(l.email)}</td>
                              <td style={{ fontSize: '11px', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{nd(rappel)}</td>
                              <td style={{ fontSize: '11px', color: 'var(--text2)', maxWidth: '160px' }}>{nd(l.commentaire)}</td>
                              <td className="nowrap">
                                {l.statut !== 'valide' && <button className="btn-ed" style={{ color: 'var(--green)', borderColor: 'rgba(0,230,118,0.3)', marginRight: '4px' }} title="Valider" onClick={() => handleLeadUpdate(l.id, { statut: 'valide' })}>✓</button>}
                                {l.statut !== 'supprime' && <button className="btn-dl" style={{ marginRight: '4px' }} title="Marquer supprimé" onClick={() => handleLeadUpdate(l.id, { statut: 'supprime' })}>✕</button>}
                                <button className="btn-ed" style={{ marginRight: '4px' }} title="Modifier" onClick={() => setEditLead(l)}>✏</button>
                                <button className="btn-dl" style={{ color: 'var(--red)', borderColor: 'rgba(255,68,68,0.4)' }} title="Supprimer définitivement" onClick={() => handleDeleteLead(l.id)}>🗑</button>
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

          {/* Tab Stats CA */}
          {tab === 'stats' && (
            <>
              <div className="topbar">
                <div>
                  <div className="tp-path">WICALL / STATS CA</div>
                  <div className="tp-title">Chiffre d'affaires mensuel</div>
                </div>
              </div>
              <ManagerCATab leads={leads} campaigns={campaigns} />
            </>
          )}

          {/* Tab Facturation */}
          {tab === 'billing' && hasPage(me, 'billing') && (
            <BillingTab leads={leads} campaigns={campaigns} />
          )}

          {/* Tab Gestion des accès — owner uniquement */}
          {tab === 'acces' && isFullAccess(me) && (
            <div className="mgr-body">
              <div className="mgr-card">
                <div className="mgr-head">
                  <div className="mgr-head-title">🔑 GESTION DES ACCÈS MANAGERS</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-add" style={{ background: 'none', border: '1px solid rgba(0,210,200,0.3)', color: 'var(--teal)' }} onClick={loadUsers}>↺</button>
                    <button className="btn-add" onClick={() => setUserDlg({ mode: 'add', user: null, username: '', fullName: '', password: '', newRole: 'manager', pagesAccess: defaultPages('manager'), saving: false, error: '' })}>+ MANAGER</button>
                  </div>
                </div>
                <p style={{ padding: '0 16px 12px', color: 'var(--muted)', fontSize: '12px', margin: 0 }}>
                  Cochez les pages auxquelles chaque manager a accès. Les modifications sont appliquées immédiatement.
                </p>
                {users.filter(u => u.role === 'manager' && !u.is_owner).length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun autre manager pour l'instant</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="tbl">
                      <thead><tr>
                        <th>Manager</th><th>Identifiant</th>
                        {ALL_PAGES.map(p => <th key={p.key} style={{ textAlign: 'center', fontSize: '11px' }}>{p.label}</th>)}
                        <th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {users.filter(u => u.role === 'manager' && !u.is_owner).map(u => {
                          const pages = u.pages_access || ['camp', 'cons', 'leads', 'stats'];
                          return (
                            <tr key={u.id}>
                              <td><div className="t-name">{u.full_name || u.username}</div></td>
                              <td className="td-meta">{u.username}</td>
                              {ALL_PAGES.map(p => (
                                <td key={p.key} style={{ textAlign: 'center' }}>
                                  <input type="checkbox"
                                    checked={pages.includes(p.key)}
                                    style={{ accentColor: 'var(--teal)', width: '15px', height: '15px', cursor: 'pointer' }}
                                    onChange={async (e) => {
                                      const newPages = e.target.checked ? [...pages, p.key] : pages.filter(x => x !== p.key);
                                      try {
                                        await apiCall('PUT', '/users/' + u.id, { pages_access: newPages });
                                        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, pages_access: newPages } : x));
                                      } catch (err) { toast('Erreur: ' + err.message); }
                                    }} />
                                </td>
                              ))}
                              <td className="nowrap">
                                <button className="btn-ed" onClick={() => openEditUser(u)}>Modifier</button>
                                <button className="btn-dl" onClick={() => handleDeleteUser(u)}>✕</button>
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
        <CampaignModal campaign={editCampaign} onSave={handleSaveCampaign} onClose={() => { setModalOpen(false); setEditCampaign(null); }} />
      )}
      {userDlg && (
        <UserModal me={me} userDlg={userDlg} setUserDlg={setUserDlg} onClose={() => setUserDlg(null)} onSave={handleSaveUser} />
      )}
      {editLead && (
        <LeadEditModal lead={editLead} onSave={handleLeadUpdate} onClose={() => setEditLead(null)} />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
