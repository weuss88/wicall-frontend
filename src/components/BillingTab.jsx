import { useState } from 'react';
import { parseCPL, MOIS_FR, TCOL, exportCSV } from '../utils';

export default function BillingTab({ leads, campaigns }) {
  const now = new Date();
  const [billingMonth, setBillingMonth] = useState(now.getMonth());
  const [billingYear, setBillingYear] = useState(now.getFullYear());

  const bLeads = leads.filter(l => {
    const d = new Date(l.created_at);
    return d.getFullYear() === billingYear && d.getMonth() === billingMonth;
  });
  const bValidated = bLeads.filter(l => l.statut === 'valide');

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

  const prevMonth = () => { if (billingMonth === 0) { setBillingMonth(11); setBillingYear(y => y - 1); } else setBillingMonth(m => m - 1); };
  const nextMonth = () => { if (billingMonth === 11) { setBillingMonth(0); setBillingYear(y => y + 1); } else setBillingMonth(m => m + 1); };
  const canNext = billingYear < now.getFullYear() || (billingYear === now.getFullYear() && billingMonth < now.getMonth());

  return (
    <div className="mgr-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className="btn-r" onClick={prevMonth}>← Préc.</button>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '1px', minWidth: '180px', textAlign: 'center' }}>
          {MOIS_FR[billingMonth].toUpperCase()} {billingYear}
        </div>
        {canNext && <button className="btn-r" onClick={nextMonth}>Suiv. →</button>}
        {bLeads.length > 0 && (
          <button className="btn-add" style={{ background: 'none', border: '1px solid rgba(0,230,118,0.35)', color: 'var(--green)', marginLeft: 'auto' }}
            onClick={() => exportCSV(bLeads, campaigns)}>↓ Export CSV</button>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-ico">📋</div>
          <div><div className="stat-val">{bLeads.length}</div><div className="stat-lbl">Leads soumis</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-ico" style={{ color: 'var(--green)' }}>✓</div>
          <div><div className="stat-val">{bValidated.length}</div><div className="stat-lbl">Leads validés</div></div>
        </div>
        <div className="stat-card" style={{ border: '1px solid rgba(0,230,118,0.3)', background: 'rgba(0,230,118,0.06)' }}>
          <div className="stat-ico">💶</div>
          <div><div className="stat-val" style={{ color: 'var(--green)' }}>{totalCA.toFixed(2)} €</div><div className="stat-lbl">CA total du mois</div></div>
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
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Aucun lead ce mois</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr>
                <th>Campagne</th><th>Client</th><th>Tag</th>
                <th>Soumis</th><th>Validés</th><th>CPL</th><th>Taux déval.</th><th style={{ color: 'var(--green)' }}>CA calculé</th>
              </tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const col = TCOL[r.tag] || '#7ab8b5';
                  return (
                    <tr key={i}>
                      <td><div className="t-name">{r.nom}</div></td>
                      <td style={{ color: 'var(--muted2)', fontSize: '11px' }}>{r.client}</td>
                      <td><span className="t-tag" style={{ background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{r.tag}</span></td>
                      <td>{r.leads.length}</td>
                      <td style={{ color: r.valides.length > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.valides.length > 0 ? 600 : 400 }}>{r.valides.length}</td>
                      <td className="t-cpl">{r.cpl > 0 ? r.cpl + ' €' : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                      <td style={{ color: r.taux < 100 ? '#ffd740' : 'var(--text2)' }}>{r.taux}%</td>
                      <td style={{ color: r.ca > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.ca > 0 ? 700 : 400 }}>
                        {r.ca > 0 ? r.ca.toFixed(2) + ' €' : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: '1px solid rgba(0,210,200,0.2)', fontWeight: 700, background: 'rgba(0,210,200,0.03)' }}>
                  <td colSpan="3" style={{ color: 'var(--teal)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: '.5px' }}>TOTAL</td>
                  <td>{bLeads.length}</td>
                  <td style={{ color: 'var(--green)' }}>{bValidated.length}</td>
                  <td colSpan="2"></td>
                  <td style={{ color: 'var(--green)', fontSize: '13px' }}>{totalCA.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
