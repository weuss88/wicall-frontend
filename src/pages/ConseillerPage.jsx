import { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../api';

const DEPTS = {'01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-HteProv','05':'Htes-Alpes','06':'Alpes-Mar','07':'Ardèche','08':'Ardennes','09':'Ariège','10':'Aube','11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal','16':'Charente','17':'Char-Maritime','18':'Cher','19':'Corrèze','21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne','25':'Doubs','26':'Drôme','27':'Eure','28':'Eure-et-Loir','29':'Finistère','30':'Gard','31':'Hte-Garonne','32':'Gers','33':'Gironde','34':'Hérault','35':'Ille-et-Vilaine','36':'Indre','37':'Indre-et-Loire','38':'Isère','39':'Jura','40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Hte-Loire','44':'Loire-Atl','45':'Loiret','46':'Lot','47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire','50':'Manche','51':'Marne','52':'Hte-Marne','53':'Mayenne','54':'M-et-Moselle','55':'Meuse','56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord','60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme','64':'Pyr-Atl','65':'Htes-Pyr','66':'Pyr-Or','67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône','70':'Hte-Saône','71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Hte-Savoie','75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines','79':'Deux-Sèvres','80':'Somme','81':'Tarn','82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse','85':'Vendée','86':'Vienne','87':'Hte-Vienne','88':'Vosges','89':'Yonne','90':'Ter-Belfort','91':'Essonne','92':'Hts-de-Seine','93':'Seine-St-Denis','94':'Val-de-Marne','95':'Val-d\'Oise'};
const TCOL = {PAC:'#4d9fff',PV:'#ffd740',ITE:'#c97fff',REN:'#00d2c8',MUT:'#00e676',AUTO:'#ff9100',FIN:'#ff6b9d',ALARM:'#ff6b6b',AUTRE:'#7ab8b5'};

function cpMatch(camp, cp) {
  if (camp.cp === 'national') return 'nat';
  if (cp.length < 2) return 'u';
  return Array.isArray(camp.cp) && camp.cp.includes(cp.substring(0, 2)) ? 'ok' : 'ko';
}
function critMatch(camp, field, value) {
  if (!camp[field]) return 'ok';
  if (!value) return 'u';
  return camp[field].includes(value) ? 'ok' : 'ko';
}
function ageMatch(camp, age) {
  if (camp.age_min === null && camp.age_max === null) return 'ok';
  if (!age) return 'u';
  const a = parseInt(age);
  if (isNaN(a)) return 'u';
  return (camp.age_min === null || a >= camp.age_min) && (camp.age_max === null || a <= camp.age_max) ? 'ok' : 'ko';
}
function getStatus(camp, S) {
  if (!camp.actif) return 'ineligible';
  const cp = cpMatch(camp, S.cp);
  if (cp === 'ko') return 'ineligible';
  if (cp === 'u') return 'pending';
  const l = critMatch(camp, 'logement', S.logement);
  const s = critMatch(camp, 'statut', S.statut);
  const ch = critMatch(camp, 'chauffage', S.chauffage);
  const a = ageMatch(camp, S.age);
  if (l==='ko'||s==='ko'||ch==='ko'||a==='ko') return 'ineligible';
  if (l==='ok'&&s==='ok'&&ch==='ok'&&a==='ok') return 'eligible';
  return 'partial';
}

function CampaignCard({ camp, status, S, selected, onSelect }) {
  const col = TCOL[camp.tag] || '#7ab8b5';
  const cp = cpMatch(camp, S.cp);
  const pills = { eligible: '✓ ÉLIGIBLE', partial: '◎ À vérifier', pending: '… En attente' };
  const cpCls = cp === 'nat' ? 'nat' : cp === 'ok' ? 'ok' : 'u';
  const cpLbl = cp === 'nat' ? '🌍 National' : cp === 'ok' ? '✓ ' + S.cp.substring(0, 2) : '? CP';
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const isEligible = status === 'eligible';

  const tags = [];
  if (camp.logement) tags.push({ lbl: camp.logement.map(cap).join('/'), st: critMatch(camp, 'logement', S.logement) });
  if (camp.statut) tags.push({ lbl: camp.statut.map(cap).join('/'), st: critMatch(camp, 'statut', S.statut) });
  if (camp.chauffage) tags.push({ lbl: camp.chauffage.map(cap).join('/'), st: critMatch(camp, 'chauffage', S.chauffage) });
  if (camp.age_min !== null || camp.age_max !== null)
    tags.push({ lbl: `${camp.age_min ?? '?'} – ${camp.age_max ?? '∞'} ans`, st: ageMatch(camp, S.age) });

  return (
    <div
      className={`cc ${status}${selected ? ' cc-selected' : ''}`}
      onClick={isEligible ? () => onSelect(camp.id) : undefined}
      style={isEligible ? { cursor: 'pointer' } : {}}
    >
      <div className="ct">
        <div className="ct-l">
          <div className="cn">
            <span style={{display:'inline-block',background:`${col}18`,color:col,fontSize:'9px',fontWeight:700,padding:'1px 6px',borderRadius:'4px',marginRight:'5px',verticalAlign:'middle',border:`1px solid ${col}35`,fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>{camp.tag}</span>
            {camp.nom}
          </div>
          <div className="ck">👤 {camp.client}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
          {pills[status] && <span className={`pill ${status}`}>{pills[status]}</span>}
          {isEligible && (
            <div className={`cc-checkbox ${selected ? 'checked' : ''}`}>
              {selected && <span>✓</span>}
            </div>
          )}
        </div>
      </div>
      {tags.length > 0 && (
        <div className="tags">
          {tags.map((t, i) => (
            <span key={i} className={`tg ${t.st === 'u' ? '' : t.st}`}>
              {t.st === 'ok' ? '✓' : t.st === 'ko' ? '✗' : '·'} {t.lbl}
            </span>
          ))}
        </div>
      )}
      {camp.criteres_custom?.length > 0 && (
        <div style={{marginBottom:'8px',display:'flex',flexWrap:'wrap',gap:'4px'}}>
          {camp.criteres_custom.map((cr, i) => (
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',background:'rgba(0,210,200,0.06)',border:'1px solid rgba(0,210,200,0.15)',borderRadius:'4px',fontSize:'10px',color:'var(--teal)'}}>
              ◇ {cr.label}
            </span>
          ))}
        </div>
      )}
      <div className="cb">
        <div className="cpl">{camp.cpl}/lead</div>
        {camp.alerte ? <div className="anote">⚠ {camp.alerte}</div> : <div style={{flex:1}}></div>}
        <div className={`cpb ${cpCls}`}>{cpLbl}</div>
      </div>
    </div>
  );
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

function LeadModal({ selectedCamps, allCamps, S, onClose, onSuccess }) {
  const [form, setForm] = useState({
    civilite: '',
    nom: '',
    prenom: '',
    adresse: '',
    cp: S.cp || '',
    ville: '',
    telephone: S.telephone || '',
    email: '',
    date_rappel: '',
    heure_rappel: '',
    commentaire: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const camps = allCamps.filter(c => selectedCamps.has(c.id));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      for (const camp of camps) {
        await apiCall('POST', '/leads/', {
          campaign_id: camp.id,
          civilite: form.civilite || null,
          nom_prospect: form.nom.trim() || null,
          prenom: form.prenom.trim() || null,
          adresse: form.adresse.trim() || null,
          cp: form.cp.trim() || null,
          ville: form.ville.trim() || null,
          telephone: form.telephone.trim() || null,
          email: form.email.trim() || null,
          date_rappel: form.date_rappel || null,
          heure_rappel: form.heure_rappel || null,
          commentaire: form.commentaire.trim() || null,
        });
      }
      onSuccess(camps.length);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="mo">
      <div className="mo-box" style={{maxWidth:'560px'}}>
        <div className="mo-head">
          <div className="mo-title">QUALIFIER EN LEAD</div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>
        <div className="mo-body">
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'10px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>
              Campagne{camps.length > 1 ? 's' : ''} sélectionnée{camps.length > 1 ? 's' : ''}
            </div>
            {camps.map(c => {
              const col = TCOL[c.tag] || '#7ab8b5';
              return (
                <div key={c.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',background:'rgba(0,210,200,0.06)',border:'1px solid rgba(0,210,200,0.15)',borderRadius:'6px',marginBottom:'4px'}}>
                  <span style={{background:`${col}18`,color:col,fontSize:'9px',fontWeight:700,padding:'1px 6px',borderRadius:'4px',border:`1px solid ${col}35`}}>{c.tag}</span>
                  <span style={{fontSize:'12px',color:'var(--text)'}}>{c.nom}</span>
                  <span style={{fontSize:'11px',color:'var(--muted)',marginLeft:'auto'}}>{c.cpl}/lead</span>
                </div>
              );
            })}
          </div>

          {/* Ligne 1 : civilité + nom + prénom */}
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
              <input className="fi" type="text" placeholder="Dupont"
                value={form.nom} onChange={e => set('nom', e.target.value)} />
            </div>
            <div className="fg2">
              <label>Prénom</label>
              <input className="fi" type="text" placeholder="Jean"
                value={form.prenom} onChange={e => set('prenom', e.target.value)} />
            </div>
          </div>

          {/* Ligne 2 : adresse */}
          <div className="fg2" style={{marginBottom:'10px'}}>
            <label>Adresse</label>
            <input className="fi" type="text" placeholder="12 rue de la Paix"
              value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          </div>

          {/* Ligne 3 : CP + ville */}
          <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>CP</label>
              <input className="fi" type="text" maxLength="5" placeholder="75001"
                inputMode="numeric" value={form.cp} onChange={e => set('cp', e.target.value.replace(/\D/g,'').substring(0,5))} />
            </div>
            <div className="fg2">
              <label>Ville</label>
              <input className="fi" type="text" placeholder="Paris"
                value={form.ville} onChange={e => set('ville', e.target.value)} />
            </div>
          </div>

          {/* Ligne 4 : téléphone + mail */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>Téléphone</label>
              <input className="fi" type="tel" maxLength="17" placeholder="33 6 12 34 56 78"
                inputMode="numeric" value={form.telephone}
                onChange={e => set('telephone', fmtTel(e.target.value))} />
            </div>
            <div className="fg2">
              <label>Mail</label>
              <input className="fi" type="email" placeholder="jean.dupont@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          {/* Ligne 5 : date + heure de rappel */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
            <div className="fg2">
              <label>Date de rappel</label>
              <input className="fi" type="date"
                value={form.date_rappel} onChange={e => set('date_rappel', e.target.value)} />
            </div>
            <div className="fg2">
              <label>Heure de rappel</label>
              <input className="fi" type="time"
                value={form.heure_rappel} onChange={e => set('heure_rappel', e.target.value)} />
            </div>
          </div>

          {/* Note */}
          <div className="fg2" style={{marginBottom:'10px'}}>
            <label>Note (optionnel)</label>
            <textarea className="fi" rows="3" placeholder="Notes sur le prospect, remarques..."
              value={form.commentaire} onChange={e => set('commentaire', e.target.value)}
              style={{resize:'vertical',minHeight:'70px',fontFamily:'inherit'}} />
          </div>

          {error && <div style={{color:'var(--red)',fontSize:'12px',padding:'4px 0'}}>{error}</div>}
        </div>
        <div className="mo-foot">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? 'ENVOI...' : `✓ QUALIFIER ${camps.length > 1 ? camps.length + ' LEADS' : 'EN LEAD'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const D = v => v ? v : <span style={{color:'var(--muted)'}}>—</span>;

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
function parseCPL(cpl) {
  if (!cpl) return 0;
  const n = parseFloat(String(cpl).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function MonCATab({ myLeads, campaigns }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const getCPL = l => parseCPL(campaigns.find(c => c.id === l.campaign_id)?.cpl);
  const getTaux = l => campaigns.find(c => c.id === l.campaign_id)?.taux_devaluation ?? 100;

  const monthLeads = useMemo(() => myLeads.filter(l => {
    const d = new Date(l.created_at);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  }), [myLeads, viewMonth, viewYear]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const days = useMemo(() => Array.from({length: daysInMonth}, (_, i) => {
    const day = i + 1;
    const dl = monthLeads.filter(l => new Date(l.created_at).getDate() === day);
    const valides = dl.filter(l => l.statut === 'valide');
    const ca = valides.reduce((s, l) => s + getCPL(l) * getTaux(l) / 100, 0);
    return {
      day,
      total: dl.length,
      valide: valides.length,
      attente: dl.filter(l => l.statut === 'en_attente').length,
      supprime: dl.filter(l => l.statut === 'supprime').length,
      ca
    };
  }), [monthLeads, daysInMonth]);

  const totalCA = days.reduce((s, d) => s + d.ca, 0);
  const totalLeads = monthLeads.length;
  const totalValide = monthLeads.filter(l => l.statut === 'valide').length;
  const activeDays = days.filter(d => d.total > 0).length;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };
  const canNext = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  return (
    <div className="mgr-body">
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
        <button className="btn-r" onClick={prevMonth}>← Préc.</button>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'16px',fontWeight:700,color:'var(--teal)',letterSpacing:'1px',minWidth:'160px',textAlign:'center'}}>
          {MOIS_FR[viewMonth].toUpperCase()} {viewYear}
        </div>
        {canNext && <button className="btn-r" onClick={nextMonth}>Suiv. →</button>}
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-ico">📋</div>
          <div><div className="stat-val">{totalLeads}</div><div className="stat-lbl">Leads total</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-ico" style={{color:'var(--green)'}}>✓</div>
          <div><div className="stat-val">{totalValide}</div><div className="stat-lbl">Validés</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-ico">💶</div>
          <div><div className="stat-val">{totalCA.toFixed(2)} €</div><div className="stat-lbl">CA du mois</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-ico">📅</div>
          <div><div className="stat-val">{activeDays}</div><div className="stat-lbl">Jours actifs</div></div>
        </div>
      </div>
      <div className="mgr-card">
        <div className="mgr-head">
          <div className="mgr-head-title">DÉTAIL PAR JOUR — {MOIS_FR[viewMonth].toUpperCase()} {viewYear}</div>
        </div>
        {totalLeads === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--muted)',fontSize:'13px'}}>Aucun lead qualifié ce mois</div>
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
                      <td style={{whiteSpace:'nowrap',fontWeight: isToday ? 600 : 400}}>
                        {dateObj.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'2-digit'})}
                        {isToday && <span style={{fontSize:'9px',color:'var(--teal)',marginLeft:'6px',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>AUJOURD'HUI</span>}
                      </td>
                      <td>{d.total}</td>
                      <td style={{color: d.valide > 0 ? 'var(--green)' : 'var(--muted)',fontWeight: d.valide > 0 ? 600 : 400}}>{d.valide || '—'}</td>
                      <td style={{color: d.attente > 0 ? '#ffd740' : 'var(--muted)'}}>{d.attente || '—'}</td>
                      <td style={{color: d.supprime > 0 ? 'var(--red)' : 'var(--muted)'}}>{d.supprime || '—'}</td>
                      <td style={{color: d.ca > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: d.ca > 0 ? 700 : 400}}>
                        {d.ca > 0 ? d.ca.toFixed(2) + ' €' : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:'1px solid rgba(0,210,200,0.2)',fontWeight:700,background:'rgba(0,210,200,0.03)'}}>
                  <td style={{color:'var(--teal)',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>TOTAL</td>
                  <td>{totalLeads}</td>
                  <td style={{color:'var(--green)'}}>{totalValide}</td>
                  <td style={{color:'#ffd740'}}>{monthLeads.filter(l => l.statut === 'en_attente').length}</td>
                  <td style={{color:'var(--red)'}}>{monthLeads.filter(l => l.statut === 'supprime').length}</td>
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

const STATUT_CFG = {
  valide:     { bg:'rgba(0,230,118,0.12)',   color:'var(--green)', border:'rgba(0,230,118,0.3)',   label:'✓ VALIDÉ' },
  supprime:   { bg:'rgba(255,68,68,0.1)',    color:'var(--red)',   border:'rgba(255,68,68,0.25)',   label:'✕ SUPPRIMÉ' },
  en_attente: { bg:'rgba(255,215,64,0.1)',   color:'#ffd740',      border:'rgba(255,215,64,0.25)', label:'⏳ EN ATTENTE' },
};
function StatutBadge({ statut }) {
  const s = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'2px 9px',fontSize:'10px',fontWeight:700,whiteSpace:'nowrap',letterSpacing:'.3px'}}>{s.label}</span>;
}

function HistoriqueTab({ myLeads }) {
  if (myLeads.length === 0) {
    return (
      <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)'}}>
        <div style={{fontSize:'32px',marginBottom:'12px'}}>📋</div>
        <div style={{fontSize:'13px'}}>Aucun lead qualifié pour l'instant</div>
      </div>
    );
  }
  return (
    <div style={{overflowX:'auto'}}>
      <table className="tbl">
        <thead><tr>
          <th>Date</th><th>Statut</th><th>Campagne</th><th>Civ.</th><th>Nom</th><th>Prénom</th>
          <th>Adresse</th><th>CP</th><th>Ville</th><th>Tél.</th><th>Mail</th>
          <th>Rappel</th><th>Note</th>
        </tr></thead>
        <tbody>
          {myLeads.map(l => {
            const col = TCOL[l.campaign_tag] || '#7ab8b5';
            const d = new Date(l.created_at);
            const dateStr = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit' })
              + ' ' + d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
            const rappel = l.date_rappel
              ? new Date(l.date_rappel).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'2-digit'})
                + (l.heure_rappel ? ' ' + l.heure_rappel : '')
              : null;
            return (
              <tr key={l.id}>
                <td style={{fontSize:'11px',color:'var(--muted)',whiteSpace:'nowrap'}}>{dateStr}</td>
                <td><StatutBadge statut={l.statut} /></td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <span style={{background:`${col}18`,color:col,fontSize:'9px',fontWeight:700,padding:'1px 6px',borderRadius:'4px',border:`1px solid ${col}35`}}>{l.campaign_tag}</span>
                    <div>
                      <div className="t-name" style={{fontSize:'12px'}}>{l.campaign_nom}</div>
                      <div className="t-client" style={{fontSize:'10px'}}>{l.campaign_client}</div>
                    </div>
                  </div>
                </td>
                <td style={{fontSize:'11px',color:'var(--muted2)'}}>{D(l.civilite)}</td>
                <td style={{fontSize:'12px'}}>{D(l.nom_prospect)}</td>
                <td style={{fontSize:'12px'}}>{D(l.prenom)}</td>
                <td style={{fontSize:'11px',maxWidth:'140px'}}>{D(l.adresse)}</td>
                <td style={{fontSize:'11px'}}>{D(l.cp)}</td>
                <td style={{fontSize:'11px'}}>{D(l.ville)}</td>
                <td style={{fontSize:'12px',color:'var(--teal)',whiteSpace:'nowrap'}}>{D(l.telephone)}</td>
                <td style={{fontSize:'11px',maxWidth:'140px'}}>{D(l.email)}</td>
                <td style={{fontSize:'11px',whiteSpace:'nowrap',color:'var(--text2)'}}>{D(rappel)}</td>
                <td style={{fontSize:'11px',color:'var(--text2)',maxWidth:'160px'}}>{D(l.commentaire)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ConseillerPage({ me, onLogout }) {
  const [campaigns, setCampaigns] = useState([]);
  const [S, setS] = useState({ cp: '', logement: null, statut: null, chauffage: null, age: '', telephone: '' });
  const [cpLabel, setCpLabel] = useState('');
  const [tab, setTab] = useState('quali');
  const [selectedCamps, setSelectedCamps] = useState(new Set());
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [myLeads, setMyLeads] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    apiCall('GET', '/campaigns/').then(setCampaigns).catch(console.error);
    apiCall('GET', '/leads/me').then(setMyLeads).catch(console.error);
  }, []);

  const ini = me?.name?.split(' ').map(x => x[0]).join('').toUpperCase() || 'C';

  const handleCP = (val) => {
    const v = val.replace(/\D/g, '');
    setS(prev => ({ ...prev, cp: v }));
    const dept = v.substring(0, 2);
    setCpLabel(v.length >= 2 && DEPTS[dept] ? dept + '·' + DEPTS[dept] : '');
  };

  const selFilter = (key, val) => setS(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
  const reset = () => {
    setS({ cp: '', logement: null, statut: null, chauffage: null, age: '', telephone: '' });
    setCpLabel('');
    setSelectedCamps(new Set());
  };

  const handleTel = (val) => {
    const digits = val.replace(/\D/g, '').substring(0, 11);
    let fmt;
    if (digits.startsWith('33') && digits.length >= 2) {
      const parts = ['33'];
      const rest = digits.substring(2);
      if (rest.length > 0) parts.push(rest.substring(0, 1));
      if (rest.length > 1) parts.push(rest.substring(1, 3));
      if (rest.length > 3) parts.push(rest.substring(3, 5));
      if (rest.length > 5) parts.push(rest.substring(5, 7));
      if (rest.length > 7) parts.push(rest.substring(7, 9));
      fmt = parts.join(' ');
    } else {
      fmt = digits.substring(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ');
    }
    setS(prev => ({ ...prev, telephone: fmt }));
  };

  const toggleSelect = (id) => {
    setSelectedCamps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLeadSuccess = async (count) => {
    setShowLeadModal(false);
    setSelectedCamps(new Set());
    const leads = await apiCall('GET', '/leads/me').catch(() => myLeads);
    setMyLeads(leads);
    setToast(`✓ ${count} lead${count > 1 ? 's' : ''} qualifié${count > 1 ? 's' : ''} avec succès !`);
    setTimeout(() => setToast(''), 4000);
  };

  const hasCP = S.cp.length >= 2;
  const active = campaigns.filter(c => c.actif);
  const ord = { eligible: 0, partial: 1, pending: 2, ineligible: 3 };
  const sorted = [...active]
    .map(c => ({ ...c, _st: getStatus(c, S) }))
    .sort((a, b) => ord[a._st] - ord[b._st]);
  const shown = sorted.filter(c => c._st !== 'ineligible');
  const eli = shown.filter(c => c._st === 'eligible').length;
  const left = shown.filter((_, i) => i % 2 === 0);
  const right = shown.filter((_, i) => i % 2 === 1);
  const clientCounts = active.reduce((acc, c) => {
    const key = c.client.split('—')[0].trim();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="shell">
        <div className="sidebar">
          <div className="sb-head">
            <div className="sb-mark">W</div>
            <div><div className="sb-brand">WICALL</div><div className="sb-sub">Conseiller</div></div>
          </div>
          <div className="sb-sec">Navigation</div>
          <div className={`sb-row ${tab==='quali'?'on':''}`} onClick={() => setTab('quali')}>
            <div className="sb-dot"></div>Qualification
          </div>
          <div className={`sb-row ${tab==='histo'?'on':''}`} onClick={() => setTab('histo')}>
            <div className="sb-dot"></div>Mes leads
            {myLeads.length > 0 && <span className="sb-tag">{myLeads.length}</span>}
          </div>
          <div className={`sb-row ${tab==='moca'?'on':''}`} onClick={() => setTab('moca')}>
            <div className="sb-dot"></div>Mon CA
          </div>
          <div className="sb-sec">Clients actifs</div>
          {Object.entries(clientCounts).map(([name, count]) => (
            <div key={name} className="sb-row">
              <div className="sb-dot"></div>{name}<span className="sb-tag">{count}</span>
            </div>
          ))}
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-av">{ini}</div>
              <div><div className="sb-uname">{me?.name}</div><div className="sb-urole">Conseiller</div></div>
            </div>
            <button className="btn-logout" onClick={onLogout}>↩ DÉCONNEXION</button>
          </div>
        </div>

        <div className="mob-bar">
          <div className="mob-bar-left">
            <div className="mob-bar-mark">W</div>
            <div>
              <div className="mob-bar-brand">WICALL</div>
              <div className="mob-bar-role">Conseiller</div>
            </div>
          </div>
          <div className="mob-bar-user">
            <div className="mob-bar-av">{ini}</div>
            <div className="mob-bar-uname">{me?.name}</div>
            <button className="btn-logout" onClick={onLogout}>↩ DÉCO</button>
          </div>
        </div>

        <div className="mob-tabs">
          <button className={`mob-tab ${tab==='quali'?'on':''}`} onClick={() => setTab('quali')}>📋 Campagnes</button>
          <button className={`mob-tab ${tab==='histo'?'on':''}`} onClick={() => setTab('histo')}>⭐ Mes leads</button>
          <button className={`mob-tab ${tab==='moca'?'on':''}`} onClick={() => setTab('moca')}>💶 Mon CA</button>
        </div>

        <div className="main" style={tab === 'quali' ? {gridTemplateRows:'auto auto 1fr'} : {}}>
          {tab === 'quali' && (
            <>
              <div className="filters">
                <div className="ibox">
                  <span className="ilbl">CP</span>
                  <input className="iin cp-iin" type="text" maxLength="5" placeholder="75001"
                    inputMode="numeric" value={S.cp} onChange={e => handleCP(e.target.value)} />
                  {cpLabel && <span className="ilbl-nm">{cpLabel}</span>}
                </div>
                <div className="fg">
                  <span className="fglbl">Statut</span>
                  <div className="fgopts">
                    <button className={`fb ${S.statut==='proprietaire'?'on':''}`} onClick={() => selFilter('statut','proprietaire')}>🔑 Proprio</button>
                    <button className={`fb ${S.statut==='locataire'?'on neg':''}`} onClick={() => selFilter('statut','locataire')}>📄 Loc.</button>
                  </div>
                </div>
                <div className="fg">
                  <span className="fglbl">Logement</span>
                  <div className="fgopts">
                    <button className={`fb ${S.logement==='maison'?'on':''}`} onClick={() => selFilter('logement','maison')}>🏠 Maison</button>
                    <button className={`fb ${S.logement==='appartement'?'on':''}`} onClick={() => selFilter('logement','appartement')}>🏢 Appart</button>
                  </div>
                </div>
                <div className="fg">
                  <span className="fglbl">Chauffage</span>
                  <div className="fgopts">
                    {[['gaz','🔥 Gaz'],['fioul','🛢 Fioul'],['electrique','⚡ Élec.'],['autre','♨ Autre']].map(([v,l]) => (
                      <button key={v} className={`fb ${S.chauffage===v?'on':''}`} onClick={() => selFilter('chauffage',v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="ibox">
                  <span className="ilbl">Âge</span>
                  <input className="iin age-iin" type="number" min="18" max="99" placeholder="45"
                    value={S.age} onChange={e => setS(prev => ({ ...prev, age: e.target.value }))} />
                </div>
                <div className="ibox">
                  <span className="ilbl">Tél.</span>
                  <input className="iin tel-iin" type="tel" maxLength="17" placeholder="33 6 12 34 56 78"
                    inputMode="numeric" value={S.telephone} onChange={e => handleTel(e.target.value)} />
                </div>
              </div>

              <div className="topbar">
                <div>
                  <div className="tp-path">WICALL / QUALIFICATION</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:'10px',flexWrap:'wrap'}}>
                    <div className="tp-title">Filtrage Campagnes</div>
                    {eli > 0 && selectedCamps.size === 0 && (
                      <span style={{fontSize:'10px',color:'var(--muted)',whiteSpace:'nowrap'}}>
                        · cliquer sur <span className="pill eligible" style={{fontSize:'9px',padding:'1px 7px'}}>✓ ÉLIGIBLE</span> pour sélectionner
                      </span>
                    )}
                  </div>
                </div>
                <div className="tp-right">
                  {selectedCamps.size > 0 && (
                    <button className="btn-qualify" onClick={() => setShowLeadModal(true)}>
                      ✓ QUALIFIER {selectedCamps.size > 1 ? selectedCamps.size + ' LEADS' : 'EN LEAD'}
                    </button>
                  )}
                  <div className="badge-ok">
                    {hasCP ? `${eli} ÉLIGIBLE${eli !== 1 ? 'S' : ''}` : '— ÉLIGIBLES'}
                  </div>
                  {hasCP && <span className="badge-tot">{shown.length} / {active.length}</span>}
                  <button className="btn-r" onClick={reset}>↺ Reset</button>
                </div>
              </div>

              {!hasCP ? (
                <div id="init-screen">
                  <div className="ic">📞</div>
                  <h2>PROSPECT EN LIGNE ?</h2>
                  <p>Saisissez le code postal du prospect pour filtrer les campagnes en temps réel.</p>
                  <span className="hint">↑ TAPEZ LE CP CI-DESSUS</span>
                </div>
              ) : shown.length === 0 ? (
                <div id="init-screen">
                  <div className="ic">🔍</div>
                  <h2>AUCUNE CAMPAGNE ÉLIGIBLE</h2>
                  <p>Aucune campagne active ne correspond aux critères saisis pour le département <strong>{S.cp.substring(0,2)}</strong>.</p>
                  <span className="hint">Modifiez les critères ou vérifiez le CP</span>
                </div>
              ) : (
                <div id="grid-screen" className="show">
                  <div className="col">
                    {left.map(c => (
                      <CampaignCard key={c.id} camp={c} status={c._st} S={S}
                        selected={selectedCamps.has(c.id)}
                        onSelect={toggleSelect} />
                    ))}
                  </div>
                  <div className="col">
                    {right.map(c => (
                      <CampaignCard key={c.id} camp={c} status={c._st} S={S}
                        selected={selectedCamps.has(c.id)}
                        onSelect={toggleSelect} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'histo' && (
            <>
              <div className="topbar">
                <div>
                  <div className="tp-path">WICALL / MES LEADS</div>
                  <div className="tp-title">Historique des leads qualifiés</div>
                </div>
                <div className="tp-right">
                  <div className="badge-ok">{myLeads.length} LEAD{myLeads.length !== 1 ? 'S' : ''}</div>
                </div>
              </div>
              <div className="mgr-body">
                <div className="mgr-card">
                  <HistoriqueTab myLeads={myLeads} />
                </div>
              </div>
            </>
          )}

          {tab === 'moca' && (
            <>
              <div className="topbar">
                <div>
                  <div className="tp-path">WICALL / MON CA</div>
                  <div className="tp-title">Chiffre d'affaires mensuel</div>
                </div>
              </div>
              <MonCATab myLeads={myLeads} campaigns={campaigns} />
            </>
          )}
        </div>
      </div>

      {showLeadModal && (
        <LeadModal
          selectedCamps={selectedCamps}
          allCamps={campaigns}
          S={S}
          onClose={() => setShowLeadModal(false)}
          onSuccess={handleLeadSuccess}
        />
      )}

      {toast && (
        <div className="lead-toast">{toast}</div>
      )}
    </div>
  );
}
