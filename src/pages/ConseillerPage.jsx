import { useState, useEffect } from 'react';
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

function CampaignCard({ camp, status, S }) {
  const col = TCOL[camp.tag] || '#7ab8b5';
  const cp = cpMatch(camp, S.cp);
  const pills = { eligible: '✓ ÉLIGIBLE', partial: '◎ À vérifier', pending: '… En attente' };
  const cpCls = cp === 'nat' ? 'nat' : cp === 'ok' ? 'ok' : 'u';
  const cpLbl = cp === 'nat' ? '🌍 National' : cp === 'ok' ? '✓ ' + S.cp.substring(0, 2) : '? CP';
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

  const tags = [];
  if (camp.logement) tags.push({ lbl: camp.logement.map(cap).join('/'), st: critMatch(camp, 'logement', S.logement) });
  if (camp.statut) tags.push({ lbl: camp.statut.map(cap).join('/'), st: critMatch(camp, 'statut', S.statut) });
  if (camp.chauffage) tags.push({ lbl: camp.chauffage.map(cap).join('/'), st: critMatch(camp, 'chauffage', S.chauffage) });
  if (camp.age_min !== null || camp.age_max !== null)
    tags.push({ lbl: `${camp.age_min ?? '?'} – ${camp.age_max ?? '∞'} ans`, st: ageMatch(camp, S.age) });

  return (
    <div className={`cc ${status}`}>
      <div className="ct">
        <div className="ct-l">
          <div className="cn">
            <span style={{display:'inline-block',background:`${col}18`,color:col,fontSize:'9px',fontWeight:700,padding:'1px 6px',borderRadius:'4px',marginRight:'5px',verticalAlign:'middle',border:`1px solid ${col}35`,fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>{camp.tag}</span>
            {camp.nom}
          </div>
          <div className="ck">👤 {camp.client}</div>
        </div>
        {pills[status] && <span className={`pill ${status}`}>{pills[status]}</span>}
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

export default function ConseillerPage({ me, onLogout }) {
  const [campaigns, setCampaigns] = useState([]);
  const [S, setS] = useState({ cp: '', logement: null, statut: null, chauffage: null, age: '' });
  const [cpLabel, setCpLabel] = useState('');

  useEffect(() => {
    apiCall('GET', '/campaigns/').then(setCampaigns).catch(console.error);
  }, []);

  const ini = me?.name?.split(' ').map(x => x[0]).join('').toUpperCase() || 'C';

  const handleCP = (val) => {
    const v = val.replace(/\D/g, '');
    setS(prev => ({ ...prev, cp: v }));
    const dept = v.substring(0, 2);
    setCpLabel(v.length >= 2 && DEPTS[dept] ? dept + '·' + DEPTS[dept] : '');
  };

  const selFilter = (key, val) => setS(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
  const reset = () => { setS({ cp: '', logement: null, statut: null, chauffage: null, age: '' }); setCpLabel(''); };

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
  const byClient = name => active.filter(c => c.client.toLowerCase().startsWith(name.toLowerCase())).length;

  return (
    <div className="page">
      <div className="shell">
        <div className="sidebar">
          <div className="sb-head">
            <div className="sb-mark">W</div>
            <div><div className="sb-brand">WICALL</div><div className="sb-sub">Conseiller</div></div>
          </div>
          <div className="sb-sec">Navigation</div>
          <div className="sb-row on"><div className="sb-dot"></div>Qualification</div>
          <div className="sb-sec">Clients actifs</div>
          <div className="sb-row"><div className="sb-dot"></div>Yony<span className="sb-tag">{byClient('yony')}</span></div>
          <div className="sb-row"><div className="sb-dot"></div>Léna<span className="sb-tag">{byClient('léna')}</span></div>
          <div className="sb-row"><div className="sb-dot"></div>Cécile<span className="sb-tag">{byClient('cécile')}</span></div>
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
            <button className="btn-logout" style={{width:'auto',padding:'5px 10px',fontSize:'10px'}} onClick={onLogout}>↩</button>
          </div>
        </div>

        <div className="main" style={{gridTemplateRows:'auto auto 1fr'}}>
          <div className="filters">
            <div className="ibox">
              <span className="ilbl">CP</span>
              <input className="iin cp-iin" type="text" maxLength="5" placeholder="75001"
                inputMode="numeric" value={S.cp} onChange={e => handleCP(e.target.value)} />
              {cpLabel && <span className="ilbl-nm">{cpLabel}</span>}
            </div>
            <div className="fg">
              <span className="fglbl">Logement</span>
              <div className="fgopts">
                <button className={`fb ${S.logement==='maison'?'on':''}`} onClick={() => selFilter('logement','maison')}>🏠 Maison</button>
                <button className={`fb ${S.logement==='appartement'?'on':''}`} onClick={() => selFilter('logement','appartement')}>🏢 Appart</button>
              </div>
            </div>
            <div className="fg">
              <span className="fglbl">Statut</span>
              <div className="fgopts">
                <button className={`fb ${S.statut==='proprietaire'?'on':''}`} onClick={() => selFilter('statut','proprietaire')}>🔑 Proprio</button>
                <button className={`fb ${S.statut==='locataire'?'on neg':''}`} onClick={() => selFilter('statut','locataire')}>📄 Loc.</button>
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
          </div>

          <div className="topbar">
            <div>
              <div className="tp-path">WICALL / QUALIFICATION</div>
              <div className="tp-title">Filtrage Campagnes</div>
            </div>
            <div className="tp-right">
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
          ) : (
            <div id="grid-screen" className="show">
              <div className="col">
                {left.map(c => <CampaignCard key={c.id} camp={c} status={c._st} S={S} />)}
              </div>
              <div className="col">
                {right.map(c => <CampaignCard key={c.id} camp={c} status={c._st} S={S} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
