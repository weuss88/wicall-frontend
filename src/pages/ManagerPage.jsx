import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../api';
import CampaignModal from '../components/CampaignModal';

const ALL_PAGES = [
  { key: 'camp',    label: 'Campagnes' },
  { key: 'cons',    label: 'Conseillers' },
  { key: 'leads',   label: 'Leads' },
  { key: 'stats',   label: 'Stats CA' },
  { key: 'billing', label: 'Facturation' },
];
function isFullAccess(me) {
  if (!me) return false;
  return !!me.is_owner;
}
function hasPage(me, page) {
  if (!me) return false;
  if (isFullAccess(me)) return true;
  // pages_access null = accès par défaut sans billing ni gestion accès
  const pages = me.pages_access ?? ['camp', 'cons', 'leads', 'stats'];
  return pages.includes(page);
}
const TCOL = {PAC:'#4d9fff',PV:'#ffd740',ITE:'#c97fff',REN:'#00d2c8',MUT:'#00e676',AUTO:'#ff9100',FIN:'#ff6b9d',ALARM:'#ff6b6b',AUTRE:'#7ab8b5'};
const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
function parseCPL(cpl) {
  if (!cpl) return 0;
  const n = parseFloat(String(cpl).replace(/[^0-9.]/g,''));
  return isNaN(n) ? 0 : n;
}
function exportCSV(leads, campaigns) {
  const headers = ['Date','Statut','Conseiller','Campagne','Tag','CPL','Nom','Prénom','Téléphone','Mail','CP','Ville','Rappel','Note'];
  const rows = leads.map(l => {
    const camp = campaigns.find(c => c.id === l.campaign_id);
    const rappel = l.date_rappel ? new Date(l.date_rappel).toLocaleDateString('fr-FR') + (l.heure_rappel ? ' '+l.heure_rappel : '') : '';
    return [
      new Date(l.created_at).toLocaleDateString('fr-FR'),
      l.statut,
      l.conseiller_name || '',
      l.campaign_nom || '',
      l.campaign_tag || '',
      camp?.cpl || '',
      l.nom_prospect || '',
      l.prenom || '',
      l.telephone || '',
      l.email || '',
      l.cp || '',
      l.ville || '',
      rappel,
      l.commentaire || '',
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

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

function ManagerCATab({ leads, campaigns }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [filterCons, setFilterCons] = useState('');

  const conseillers = [...new Map(leads.map(l => [l.conseiller_id, {id: l.conseiller_id, name: l.conseiller_name}])).values()];
  const filtered = filterCons ? leads.filter(l => String(l.conseiller_id) === filterCons) : leads;
  const monthLeads = filtered.filter(l => {
    const d = new Date(l.created_at);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const days = Array.from({length: daysInMonth}, (_, i) => {
    const day = i + 1;
    const dl = monthLeads.filter(l => new Date(l.created_at).getDate() === day);
    const valides = dl.filter(l => l.statut === 'valide');
    const ca = valides.reduce((s, l) => {
      const camp = campaigns.find(c => c.id === l.campaign_id);
      return s + parseCPL(camp?.cpl) * (camp?.taux_devaluation ?? 100) / 100;
    }, 0);
    return { day, total: dl.length, valide: valides.length, attente: dl.filter(l => l.statut === 'en_attente').length, supprime: dl.filter(l => l.statut === 'supprime').length, ca };
  });

  const totalCA = days.reduce((s, d) => s + d.ca, 0);
  const totalLeads = monthLeads.length;
  const totalValide = monthLeads.filter(l => l.statut === 'valide').length;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };
  const canNext = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  return (
    <div className="mgr-body">
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
        <button className="btn-r" onClick={prevMonth}>← Préc.</button>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'16px',fontWeight:700,color:'var(--teal)',letterSpacing:'1px',minWidth:'180px',textAlign:'center'}}>
          {MOIS_FR[viewMonth].toUpperCase()} {viewYear}
        </div>
        {canNext && <button className="btn-r" onClick={nextMonth}>Suiv. →</button>}
        {conseillers.length > 0 && (
          <select className="fi" style={{width:'auto',padding:'6px 12px',marginLeft:'auto'}} value={filterCons} onChange={e => setFilterCons(e.target.value)}>
            <option value="">Tous les conseillers</option>
            {conseillers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        )}
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-ico">📋</div><div><div className="stat-val">{totalLeads}</div><div className="stat-lbl">Leads total</div></div></div>
        <div className="stat-card"><div className="stat-ico" style={{color:'var(--green)'}}>✓</div><div><div className="stat-val">{totalValide}</div><div className="stat-lbl">Validés</div></div></div>
        <div className="stat-card" style={{border:'1px solid rgba(0,230,118,0.3)',background:'rgba(0,230,118,0.06)'}}><div className="stat-ico">💶</div><div><div className="stat-val" style={{color:'var(--green)'}}>{totalCA.toFixed(2)} €</div><div className="stat-lbl">CA du mois</div></div></div>
        <div className="stat-card"><div className="stat-ico">📅</div><div><div className="stat-val">{days.filter(d => d.total > 0).length}</div><div className="stat-lbl">Jours actifs</div></div></div>
      </div>
      <div className="mgr-card">
        <div className="mgr-head">
          <div className="mgr-head-title">DÉTAIL PAR JOUR{filterCons ? ` — ${conseillers.find(c => String(c.id) === filterCons)?.name || ''}` : ' — TOUS'}</div>
        </div>
        {totalLeads === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--muted)',fontSize:'13px'}}>Aucun lead ce mois</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table className="tbl">
              <thead><tr>
                <th>Date</th><th>Leads</th><th style={{color:'var(--green)'}}>Validés</th>
                <th style={{color:'#ffd740'}}>En attente</th><th style={{color:'var(--red)'}}>Supprimés</th>
                <th style={{color:'var(--green)'}}>CA du jour</th>
              </tr></thead>
              <tbody>
                {days.filter(d => d.total > 0).map(d => {
                  const isToday = isCurrentMonth && d.day === today;
                  const dateObj = new Date(viewYear, viewMonth, d.day);
                  return (
                    <tr key={d.day} style={isToday ? {background:'rgba(0,210,200,0.05)'} : {}}>
                      <td style={{whiteSpace:'nowrap',fontWeight:isToday?600:400}}>
                        {dateObj.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'2-digit'})}
                        {isToday && <span style={{fontSize:'9px',color:'var(--teal)',marginLeft:'6px',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>AUJOURD'HUI</span>}
                      </td>
                      <td>{d.total}</td>
                      <td style={{color:d.valide>0?'var(--green)':'var(--muted)',fontWeight:d.valide>0?600:400}}>{d.valide||'—'}</td>
                      <td style={{color:d.attente>0?'#ffd740':'var(--muted)'}}>{d.attente||'—'}</td>
                      <td style={{color:d.supprime>0?'var(--red)':'var(--muted)'}}>{d.supprime||'—'}</td>
                      <td style={{color:d.ca>0?'var(--green)':'var(--muted)',fontWeight:d.ca>0?700:400}}>
                        {d.ca>0?d.ca.toFixed(2)+' €':'—'}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:'1px solid rgba(0,210,200,0.2)',fontWeight:700,background:'rgba(0,210,200,0.03)'}}>
                  <td style={{color:'var(--teal)',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>TOTAL</td>
                  <td>{totalLeads}</td>
                  <td style={{color:'var(--green)'}}>{totalValide}</td>
                  <td style={{color:'#ffd740'}}>{monthLeads.filter(l => l.statut==='en_attente').length}</td>
                  <td style={{color:'var(--red)'}}>{monthLeads.filter(l => l.statut==='supprime').length}</td>
                  <td style={{color:'var(--green)',fontSize:'13px'}}>{totalCA.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagerPage({ me, onLogout }) {
  const now = new Date();
  const canBilling = hasPage(me, 'billing');

  const [tab, setTab] = useState('camp');
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [userDlg, setUserDlg] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [search, setSearch] = useState('');
  const [billingMonth, setBillingMonth] = useState(now.getMonth());
  const [billingYear, setBillingYear] = useState(now.getFullYear());
  const [filterLeadCons, setFilterLeadCons] = useState('');
  const [filterLeadCamp, setFilterLeadCamp] = useState('');
  // userDlg: null | { mode:'add'|'edit', user, username, fullName, password, newRole, pagesAccess, saving, error }

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
    if (newTab === 'cons' || newTab === 'acces' || newTab === 'billing') loadUsers();
    if (newTab === 'leads' || newTab === 'billing' || newTab === 'stats') loadLeads();
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

  const defaultPages = (role) => role === 'manager' ? ['camp', 'cons', 'leads', 'stats'] : [];
  const openAddUser = () => setUserDlg({ mode: 'add', user: null, username: '', fullName: '', password: '', newRole: 'conseiller', pagesAccess: defaultPages('conseiller'), saving: false, error: '' });
  const openEditUser = (user) => setUserDlg({ mode: 'edit', user, username: user.username, fullName: user.full_name || '', password: '', newRole: user.role || 'conseiller', pagesAccess: user.pages_access || defaultPages(user.role), saving: false, error: '' });
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
        const regBody = { username: username.trim(), full_name: fullName.trim(), password: password.trim(), role: isFullAccess(me) ? userDlg.newRole : 'conseiller' };
        if (isFullAccess(me) && userDlg.newRole === 'manager') regBody.pages_access = userDlg.pagesAccess;
        await apiCall('POST', '/auth/register', regBody);
      } else {
        const body = { full_name: fullName.trim() };
        if (password.trim()) body.password = password.trim();
        if (isFullAccess(me)) { body.role = userDlg.newRole; if (userDlg.newRole === 'manager') body.pages_access = userDlg.pagesAccess; }
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

  const filteredLeads = leads.filter(l => {
    if (filterLeadCons && String(l.conseiller_id) !== filterLeadCons) return false;
    if (filterLeadCamp && String(l.campaign_id) !== filterLeadCamp) return false;
    return true;
  });
  const leadConseillers = [...new Map(leads.map(l => [l.conseiller_id, {id: l.conseiller_id, name: l.conseiller_name}])).values()];
  const leadCampagnes = [...new Map(leads.map(l => [l.campaign_id, {id: l.campaign_id, nom: l.campaign_nom}])).values()];

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
          {hasPage(me,'camp') && <div className={`sb-row ${tab==='camp'?'on':''}`} onClick={() => handleTabChange('camp')}><div className="sb-dot"></div>Campagnes</div>}
          {hasPage(me,'cons') && <div className={`sb-row ${tab==='cons'?'on':''}`} onClick={() => handleTabChange('cons')}><div className="sb-dot"></div>Conseillers</div>}
          {hasPage(me,'leads') && (
            <div className={`sb-row ${tab==='leads'?'on':''}`} onClick={() => handleTabChange('leads')}>
              <div className="sb-dot"></div>Leads
              {totalLeads > 0 && <span className="sb-tag">{totalLeads}</span>}
            </div>
          )}
          {hasPage(me,'stats') && <div className={`sb-row ${tab==='stats'?'on':''}`} onClick={() => handleTabChange('stats')}><div className="sb-dot"></div>Stats CA</div>}
          {hasPage(me,'billing') && (
            <div className={`sb-row ${tab==='billing'?'on':''}`} onClick={() => handleTabChange('billing')}>
              <div className="sb-dot"></div>Facturation
            </div>
          )}
          {isFullAccess(me) && (
            <div className={`sb-row ${tab==='acces'?'on':''}`} onClick={() => handleTabChange('acces')}>
              <div className="sb-dot"></div>Gestion accès
              <span style={{fontSize:'8px',marginLeft:'4px',color:'var(--teal)',opacity:.6,fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>🔑</span>
            </div>
          )}
          <div className="sb-sec">Stats live</div>
          <div className="sb-row"><div className="sb-dot"></div>Total<span className="sb-tag">{tot}</span></div>
          <div className="sb-row"><div className="sb-dot"></div>Actives<span className="sb-tag">{act}</span></div>
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-av" style={{color:'var(--teal)'}}>{(me?.full_name||me?.name||'M').split(' ').map(x => x[0]).join('').toUpperCase().slice(0,2)}</div>
              <div><div className="sb-uname">{me?.full_name||me?.name||'Manager'}</div><div className="sb-urole">{isFullAccess(me) ? 'Propriétaire' : 'Manager'}</div></div>
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
          {hasPage(me,'camp') && <button className={`mob-tab ${tab==='camp'?'on':''}`} onClick={() => handleTabChange('camp')}>📋 Campagnes</button>}
          {hasPage(me,'cons') && <button className={`mob-tab ${tab==='cons'?'on':''}`} onClick={() => handleTabChange('cons')}>👥 Conseillers</button>}
          {hasPage(me,'leads') && <button className={`mob-tab ${tab==='leads'?'on':''}`} onClick={() => handleTabChange('leads')}>⭐ Leads</button>}
          {hasPage(me,'stats') && <button className={`mob-tab ${tab==='stats'?'on':''}`} onClick={() => handleTabChange('stats')}>📊 Stats CA</button>}
          {hasPage(me,'billing') && <button className={`mob-tab ${tab==='billing'?'on':''}`} onClick={() => handleTabChange('billing')}>💶 Facturation</button>}
          {isFullAccess(me) && <button className={`mob-tab ${tab==='acces'?'on':''}`} onClick={() => handleTabChange('acces')}>🔑 Accès</button>}
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="tp-path">WICALL / MANAGER</div>
              <div className="tp-title">{tab==='camp' ? 'Gestion Campagnes' : tab==='cons' ? 'Gestion Conseillers' : tab==='billing' ? 'Facturation' : tab==='stats' ? 'Stats CA' : tab==='acces' ? 'Gestion des accès' : 'Leads Qualifiés'}</div>
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
                    {users.filter(u => u.role === 'conseiller').map(u => (
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
                <div className="mgr-head" style={{flexWrap:'wrap',gap:'8px'}}>
                  <div className="mgr-head-title">
                    LEADS
                    {(filterLeadCons || filterLeadCamp) && <span style={{color:'var(--teal)',fontSize:'10px',marginLeft:'8px'}}>({filteredLeads.length} / {leads.length})</span>}
                  </div>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                    {leadConseillers.length > 1 && (
                      <select className="fi" style={{width:'auto',padding:'4px 8px',fontSize:'11px'}} value={filterLeadCons} onChange={e => setFilterLeadCons(e.target.value)}>
                        <option value="">Tous les conseillers</option>
                        {leadConseillers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                      </select>
                    )}
                    {leadCampagnes.length > 1 && (
                      <select className="fi" style={{width:'auto',padding:'4px 8px',fontSize:'11px'}} value={filterLeadCamp} onChange={e => setFilterLeadCamp(e.target.value)}>
                        <option value="">Toutes les campagnes</option>
                        {leadCampagnes.map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
                      </select>
                    )}
                    <button className="btn-add" style={{background:'none',border:'1px solid rgba(0,210,200,0.3)',color:'var(--teal)'}} onClick={loadLeads}>↺</button>
                    {filteredLeads.length > 0 && (
                      <button className="btn-add" style={{background:'none',border:'1px solid rgba(0,230,118,0.35)',color:'var(--green)'}}
                        onClick={() => exportCSV(filteredLeads, campaigns)}>
                        ↓ Export CSV
                      </button>
                    )}
                  </div>
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
                        {filteredLeads.map(l => {
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

          {/* Tab Gestion des accès — owner uniquement */}
          {tab === 'acces' && isFullAccess(me) && (
            <div className="mgr-body">
              <div className="mgr-card">
                <div className="mgr-head">
                  <div className="mgr-head-title">🔑 GESTION DES ACCÈS MANAGERS</div>
                  <button className="btn-add" style={{background:'none',border:'1px solid rgba(0,210,200,0.3)',color:'var(--teal)'}} onClick={loadUsers}>↺</button>
                </div>
                <p style={{padding:'0 16px 12px',color:'var(--muted)',fontSize:'12px',margin:0}}>
                  Cochez les pages auxquelles chaque manager a accès. Les modifications sont appliquées immédiatement.
                </p>
                {users.filter(u => u.role === 'manager' && !u.is_owner).length === 0 ? (
                  <div style={{padding:'30px',textAlign:'center',color:'var(--muted)',fontSize:'13px'}}>Aucun autre manager pour l'instant</div>
                ) : (
                  <div style={{overflowX:'auto'}}>
                    <table className="tbl">
                      <thead><tr>
                        <th>Manager</th><th>Identifiant</th>
                        {ALL_PAGES.map(p => <th key={p.key} style={{textAlign:'center',fontSize:'11px'}}>{p.label}</th>)}
                      </tr></thead>
                      <tbody>
                        {users.filter(u => u.role === 'manager' && !u.is_owner).map(u => {
                          const pages = u.pages_access || ['camp', 'cons', 'leads', 'stats'];
                          return (
                            <tr key={u.id}>
                              <td><div className="t-name">{u.full_name || u.username}</div></td>
                              <td style={{color:'var(--muted2)',fontSize:'11px'}}>{u.username}</td>
                              {ALL_PAGES.map(p => (
                                <td key={p.key} style={{textAlign:'center'}}>
                                  <input type="checkbox"
                                    checked={pages.includes(p.key)}
                                    style={{accentColor:'var(--teal)',width:'15px',height:'15px',cursor:'pointer'}}
                                    onChange={async (e) => {
                                      const newPages = e.target.checked
                                        ? [...pages, p.key]
                                        : pages.filter(x => x !== p.key);
                                      try {
                                        await apiCall('PUT', '/users/' + u.id, { pages_access: newPages });
                                        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, pages_access: newPages } : x));
                                      } catch (err) { alert('Erreur: ' + err.message); }
                                    }} />
                                </td>
                              ))}
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

          {/* Tab Facturation */}
          {tab === 'billing' && canBilling && (() => {
            const bLeads = leads.filter(l => {
              const d = new Date(l.created_at);
              return d.getFullYear() === billingYear && d.getMonth() === billingMonth;
            });
            const bValidated = bLeads.filter(l => l.statut === 'valide');

            // Grouper par campagne
            const byCamp = {};
            bLeads.forEach(l => {
              if (!byCamp[l.campaign_id]) byCamp[l.campaign_id] = { nom: l.campaign_nom, tag: l.campaign_tag, client: l.campaign_client, leads: [], valides: [] };
              byCamp[l.campaign_id].leads.push(l);
              if (l.statut === 'valide') byCamp[l.campaign_id].valides.push(l);
            });

            const rows = Object.values(byCamp).map(g => {
              const camp = campaigns.find(c => c.nom === g.nom);
              const cpl = parseCPL(camp?.cpl);
              const taux = camp?.taux_devaluation ?? 100;
              const ca = g.valides.length * cpl * taux / 100;
              return { ...g, cpl, taux, ca };
            }).sort((a, b) => b.ca - a.ca);

            const totalCA = rows.reduce((s, r) => s + r.ca, 0);

            const prevBMonth = () => { if (billingMonth===0){setBillingMonth(11);setBillingYear(y=>y-1);}else setBillingMonth(m=>m-1); };
            const nextBMonth = () => { if (billingMonth===11){setBillingMonth(0);setBillingYear(y=>y+1);}else setBillingMonth(m=>m+1); };
            const canNextB = billingYear < now.getFullYear() || (billingYear === now.getFullYear() && billingMonth < now.getMonth());

            return (
              <div className="mgr-body">
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
                  <button className="btn-r" onClick={prevBMonth}>← Préc.</button>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'16px',fontWeight:700,color:'var(--teal)',letterSpacing:'1px',minWidth:'180px',textAlign:'center'}}>
                    {MOIS_FR[billingMonth].toUpperCase()} {billingYear}
                  </div>
                  {canNextB && <button className="btn-r" onClick={nextBMonth}>Suiv. →</button>}
                  {bLeads.length > 0 && (
                    <button className="btn-add" style={{background:'none',border:'1px solid rgba(0,230,118,0.35)',color:'var(--green)',marginLeft:'auto'}}
                      onClick={() => exportCSV(bLeads, campaigns)}>↓ Export CSV</button>
                  )}
                </div>

                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-ico">📋</div>
                    <div><div className="stat-val">{bLeads.length}</div><div className="stat-lbl">Leads soumis</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-ico" style={{color:'var(--green)'}}>✓</div>
                    <div><div className="stat-val">{bValidated.length}</div><div className="stat-lbl">Leads validés</div></div>
                  </div>
                  <div className="stat-card" style={{border:'1px solid rgba(0,230,118,0.3)',background:'rgba(0,230,118,0.06)'}}>
                    <div className="stat-ico">💶</div>
                    <div><div className="stat-val" style={{color:'var(--green)'}}>{totalCA.toFixed(2)} €</div><div className="stat-lbl">CA total du mois</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-ico">📋</div>
                    <div><div className="stat-val">{rows.length}</div><div className="stat-lbl">Campagnes actives</div></div>
                  </div>
                </div>

                <div className="mgr-card">
                  <div className="mgr-head">
                    <div className="mgr-head-title">DÉTAIL PAR CAMPAGNE — {MOIS_FR[billingMonth].toUpperCase()} {billingYear}</div>
                  </div>
                  {rows.length === 0 ? (
                    <div style={{textAlign:'center',padding:'40px',color:'var(--muted)',fontSize:'13px'}}>Aucun lead ce mois</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table className="tbl">
                        <thead><tr>
                          <th>Campagne</th><th>Client</th><th>Tag</th>
                          <th>Soumis</th><th>Validés</th><th>CPL</th><th>Taux déval.</th><th style={{color:'var(--green)'}}>CA calculé</th>
                        </tr></thead>
                        <tbody>
                          {rows.map((r, i) => {
                            const col = TCOL[r.tag] || '#7ab8b5';
                            return (
                              <tr key={i}>
                                <td><div className="t-name">{r.nom}</div></td>
                                <td style={{color:'var(--muted2)',fontSize:'11px'}}>{r.client}</td>
                                <td><span className="t-tag" style={{background:`${col}18`,color:col,border:`1px solid ${col}35`}}>{r.tag}</span></td>
                                <td>{r.leads.length}</td>
                                <td style={{color: r.valides.length > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.valides.length > 0 ? 600 : 400}}>{r.valides.length}</td>
                                <td className="t-cpl">{r.cpl > 0 ? r.cpl + ' €' : <span style={{color:'var(--muted)'}}>—</span>}</td>
                                <td style={{color: r.taux < 100 ? '#ffd740' : 'var(--text2)'}}>{r.taux}%</td>
                                <td style={{color: r.ca > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.ca > 0 ? 700 : 400}}>
                                  {r.ca > 0 ? r.ca.toFixed(2) + ' €' : '—'}
                                </td>
                              </tr>
                            );
                          })}
                          <tr style={{borderTop:'1px solid rgba(0,210,200,0.2)',fontWeight:700,background:'rgba(0,210,200,0.03)'}}>
                            <td colSpan="3" style={{color:'var(--teal)',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>TOTAL</td>
                            <td>{bLeads.length}</td>
                            <td style={{color:'var(--green)'}}>{bValidated.length}</td>
                            <td colSpan="2"></td>
                            <td style={{color:'var(--green)',fontSize:'13px'}}>{totalCA.toFixed(2)} €</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

            </div>
            );
          })()}
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
              <div className="mo-title">{userDlg.mode === 'add' ? 'NOUVEL UTILISATEUR' : 'MODIFIER L\'UTILISATEUR'}</div>
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
              {isFullAccess(me) && (
                <div className="fr full">
                  <div className="fg2">
                    <label>Rôle</label>
                    <select className="fi" value={userDlg.newRole}
                      onChange={e => setUserDlg(d => ({ ...d, newRole: e.target.value, pagesAccess: defaultPages(e.target.value) }))}>
                      <option value="conseiller">Conseiller</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              )}
              {isFullAccess(me) && userDlg.newRole === 'manager' && (
                <div className="fg2 full">
                  <label>Pages accessibles</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'6px'}}>
                    {ALL_PAGES.map(p => (
                      <label key={p.key} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',cursor:'pointer',color:'var(--text2)'}}>
                        <input type="checkbox"
                          style={{accentColor:'var(--teal)'}}
                          checked={(userDlg.pagesAccess||[]).includes(p.key)}
                          onChange={e => {
                            const cur = userDlg.pagesAccess || [];
                            setUserDlg(d => ({ ...d, pagesAccess: e.target.checked ? [...cur, p.key] : cur.filter(x => x !== p.key) }));
                          }} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
