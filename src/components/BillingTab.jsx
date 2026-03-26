import { useState } from 'react';
import { parseCPL, MOIS_FR, TCOL, exportCSV } from '../utils';

const PAY_CFG = {
  en_attente: { label: '⏳ En attente', color: '#ffd740',       bg: 'rgba(255,215,64,0.08)',  border: 'rgba(255,215,64,0.3)' },
  facture:    { label: '📄 Facturé',    color: 'var(--teal)',   bg: 'rgba(0,210,200,0.08)',   border: 'rgba(0,210,200,0.3)' },
  paye:       { label: '✓ Payé',        color: 'var(--green)',  bg: 'rgba(0,230,118,0.08)',   border: 'rgba(0,230,118,0.3)' },
};

function loadPayStatus(year, month) {
  try { return JSON.parse(localStorage.getItem(`wicall_billing_${year}_${month}`) || '{}'); }
  catch { return {}; }
}

export default function BillingTab({ leads, campaigns }) {
  const now = new Date();
  const [billingMonth, setBillingMonth] = useState(now.getMonth());
  const [billingYear, setBillingYear]   = useState(now.getFullYear());
  const [filterClient, setFilterClient] = useState('');
  const [filterCamp, setFilterCamp]     = useState('');
  const [viewMode, setViewMode]         = useState('camp'); // 'camp' | 'client'
  const [payStatus, setPayStatus]       = useState(() => loadPayStatus(now.getFullYear(), now.getMonth()));

  const prevMonth = () => {
    const nm = billingMonth === 0 ? 11 : billingMonth - 1;
    const ny = billingMonth === 0 ? billingYear - 1 : billingYear;
    setBillingMonth(nm); setBillingYear(ny); setPayStatus(loadPayStatus(ny, nm));
  };
  const nextMonth = () => {
    const nm = billingMonth === 11 ? 0 : billingMonth + 1;
    const ny = billingMonth === 11 ? billingYear + 1 : billingYear;
    setBillingMonth(nm); setBillingYear(ny); setPayStatus(loadPayStatus(ny, nm));
  };
  const canNext = billingYear < now.getFullYear() || (billingYear === now.getFullYear() && billingMonth < now.getMonth());

  const updatePay = (campNom, statut) => {
    const key = `wicall_billing_${billingYear}_${billingMonth}`;
    const next = { ...payStatus, [campNom]: statut };
    setPayStatus(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const bLeads = leads.filter(l => {
    const d = new Date(l.created_at);
    return d.getFullYear() === billingYear && d.getMonth() === billingMonth;
  });

  const byCamp = {};
  bLeads.forEach(l => {
    if (!byCamp[l.campaign_id]) byCamp[l.campaign_id] = { nom: l.campaign_nom, tag: l.campaign_tag, client: l.campaign_client, leads: [], valides: [] };
    byCamp[l.campaign_id].leads.push(l);
    if (l.statut === 'valide') byCamp[l.campaign_id].valides.push(l);
  });

  const allRows = Object.values(byCamp).map(g => {
    const camp = campaigns.find(c => c.nom === g.nom);
    const cpl  = parseCPL(camp?.cpl);
    const taux = camp?.taux_devaluation ?? 100;
    const ca       = g.valides.length * cpl * taux / 100;
    const caPerdu  = g.valides.length * cpl * (1 - taux / 100);
    const pay      = payStatus[g.nom] || 'en_attente';
    return { ...g, cpl, taux, ca, caPerdu, pay };
  }).sort((a, b) => b.ca - a.ca);

  const clients = [...new Set(allRows.map(r => r.client))].sort();
  const rows = allRows
    .filter(r => !filterClient || r.client === filterClient)
    .filter(r => !filterCamp  || r.nom    === filterCamp);

  const campOptions = (filterClient ? allRows.filter(r => r.client === filterClient) : allRows).map(r => r.nom).sort();
  const filteredLeadsForExport = bLeads
    .filter(l => !filterClient || l.campaign_client === filterClient)
    .filter(l => !filterCamp   || l.campaign_nom    === filterCamp);

  const totalCA      = rows.reduce((s, r) => s + r.ca, 0);
  const totalValides = rows.reduce((s, r) => s + r.valides.length, 0);
  const totalSoumis  = rows.reduce((s, r) => s + r.leads.length, 0);
  const totalPaye    = rows.filter(r => r.pay === 'paye').reduce((s, r) => s + r.ca, 0);
  const totalPerdu   = rows.filter(r => r.taux < 100).reduce((s, r) => s + r.caPerdu, 0);

  // Vue par client
  const clientRows = clients
    .filter(c => !filterClient || c === filterClient)
    .map(client => {
      const cr = rows.filter(r => r.client === client);
      return {
        client,
        nbCamps: cr.length,
        soumis:  cr.reduce((s, r) => s + r.leads.length, 0),
        valides: cr.reduce((s, r) => s + r.valides.length, 0),
        ca:      cr.reduce((s, r) => s + r.ca, 0),
        paye:    cr.filter(r => r.pay === 'paye').reduce((s, r) => s + r.ca, 0),
      };
    });

  const exportBilling = () => {
    const headers = ['Client','Campagne','Tag','Soumis','Validés','CPL (€)','Taux déval.','CA calculé (€)','Statut paiement'];
    const data = rows.map(r => [
      r.client, r.nom, r.tag, r.leads.length, r.valides.length,
      r.cpl.toFixed(2), r.taux + '%', r.ca.toFixed(2),
      PAY_CFG[r.pay]?.label || r.pay,
    ]);
    const csv = [headers, ...data].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `facturation_${MOIS_FR[billingMonth].toLowerCase()}_${billingYear}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mgr-body">

      {/* Barre de contrôles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className="btn-r" onClick={prevMonth}>← Préc.</button>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '1px', minWidth: '180px', textAlign: 'center' }}>
          {MOIS_FR[billingMonth].toUpperCase()} {billingYear}
        </div>
        {canNext && <button className="btn-r" onClick={nextMonth}>Suiv. →</button>}

        {clients.length > 1 && (
          <select className="fi" style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }}
            value={filterClient} onChange={e => { setFilterClient(e.target.value); setFilterCamp(''); }}>
            <option value="">Tous les clients</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {campOptions.length > 1 && (
          <select className="fi" style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }}
            value={filterCamp} onChange={e => setFilterCamp(e.target.value)}>
            <option value="">Toutes les campagnes</option>
            {campOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}

        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          <button className="btn-r"
            style={{ background: viewMode === 'camp' ? 'rgba(0,210,200,0.15)' : 'none', borderColor: viewMode === 'camp' ? 'var(--teal)' : undefined, color: viewMode === 'camp' ? 'var(--teal)' : undefined }}
            onClick={() => setViewMode('camp')}>Par campagne</button>
          <button className="btn-r"
            style={{ background: viewMode === 'client' ? 'rgba(0,210,200,0.15)' : 'none', borderColor: viewMode === 'client' ? 'var(--teal)' : undefined, color: viewMode === 'client' ? 'var(--teal)' : undefined }}
            onClick={() => setViewMode('client')}>Par client</button>
        </div>

        <button className="btn-add" style={{ background: 'none', border: '1px solid rgba(0,210,200,0.35)', color: 'var(--teal)' }}
          onClick={exportBilling} disabled={rows.length === 0}>↓ Export Facturation</button>
        {filteredLeadsForExport.length > 0 && (
          <button className="btn-add" style={{ background: 'none', border: '1px solid rgba(0,230,118,0.35)', color: 'var(--green)' }}
            onClick={() => exportCSV(filteredLeadsForExport, campaigns)}>↓ Export Leads</button>
        )}
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-ico">📋</div>
          <div><div className="stat-val">{totalSoumis}</div><div className="stat-lbl">Leads soumis</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-ico text-green">✓</div>
          <div><div className="stat-val">{totalValides}</div><div className="stat-lbl">Leads validés</div></div>
        </div>
        <div className="stat-card" style={{ border: '1px solid rgba(0,230,118,0.3)', background: 'rgba(0,230,118,0.06)' }}>
          <div className="stat-ico">💶</div>
          <div><div className="stat-val text-green">{totalCA.toFixed(2)} €</div><div className="stat-lbl">{filterClient ? `CA — ${filterClient}` : 'CA total du mois'}</div></div>
        </div>
        <div className="stat-card" style={{ border: '1px solid rgba(0,210,200,0.3)', background: 'rgba(0,210,200,0.04)' }}>
          <div className="stat-ico" style={{ color: 'var(--teal)' }}>✓</div>
          <div><div className="stat-val" style={{ color: 'var(--teal)' }}>{totalPaye.toFixed(2)} €</div><div className="stat-lbl">CA encaissé</div></div>
        </div>
        {totalPerdu > 0 && (
          <div className="stat-card" style={{ border: '1px solid rgba(255,215,64,0.3)', background: 'rgba(255,215,64,0.04)' }}>
            <div className="stat-ico" style={{ color: '#ffd740' }}>⚠</div>
            <div><div className="stat-val" style={{ color: '#ffd740' }}>-{totalPerdu.toFixed(2)} €</div><div className="stat-lbl">Perdu (déval.)</div></div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-ico">📋</div>
          <div><div className="stat-val">{rows.length}</div><div className="stat-lbl">Campagnes</div></div>
        </div>
      </div>

      {/* Tableau */}
      <div className="mgr-card">
        <div className="mgr-head">
          <div className="mgr-head-title">
            {viewMode === 'camp' ? 'DÉTAIL PAR CAMPAGNE' : 'RÉCAP PAR CLIENT'} — {MOIS_FR[billingMonth].toUpperCase()} {billingYear}
            {filterClient && <span style={{ color: 'var(--teal)', fontSize: '11px', marginLeft: '8px', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>· {filterClient}</span>}
            {filterCamp   && <span style={{ color: 'var(--teal)', fontSize: '11px', marginLeft: '4px', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>· {filterCamp}</span>}
          </div>
        </div>

        {viewMode === 'camp' ? (
          rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Aucun lead ce mois</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr>
                  <th>Campagne</th><th>Client</th><th>Tag</th>
                  <th>Soumis</th><th>Validés</th><th>CPL</th><th>Taux déval.</th><th className="text-green">CA calculé</th><th>Paiement</th>
                </tr></thead>
                <tbody>
                  {rows.map((r, i) => {
                    const col       = TCOL[r.tag] || '#7ab8b5';
                    const isDevalued = r.taux < 100;
                    const pay        = PAY_CFG[r.pay] || PAY_CFG.en_attente;
                    return (
                      <tr key={i} style={isDevalued ? { borderLeft: '2px solid rgba(255,215,64,0.5)' } : {}}>
                        <td>
                          <div className="t-name">{r.nom}</div>
                          {isDevalued && (
                            <div style={{ fontSize: '10px', color: '#ffd740', marginTop: '2px' }}>
                              ⚠ -{r.caPerdu.toFixed(2)} € dévalué
                            </div>
                          )}
                        </td>
                        <td className="td-meta">{r.client}</td>
                        <td><span className="t-tag" style={{ background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{r.tag}</span></td>
                        <td>{r.leads.length}</td>
                        <td style={{ color: r.valides.length > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.valides.length > 0 ? 600 : 400 }}>{r.valides.length}</td>
                        <td className="t-cpl">{r.cpl > 0 ? r.cpl.toFixed(2) + ' €' : <span className="text-muted">—</span>}</td>
                        <td style={{ color: isDevalued ? '#ffd740' : 'var(--text2)', fontWeight: isDevalued ? 600 : 400 }}>{r.taux}%</td>
                        <td style={{ color: r.ca > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.ca > 0 ? 700 : 400 }}>
                          {r.ca > 0 ? r.ca.toFixed(2) + ' €' : '—'}
                        </td>
                        <td>
                          <select value={r.pay} onChange={e => updatePay(r.nom, e.target.value)}
                            style={{ background: pay.bg, color: pay.color, border: `1px solid ${pay.border}`, borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                            <option value="en_attente">⏳ En attente</option>
                            <option value="facture">📄 Facturé</option>
                            <option value="paye">✓ Payé</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: '1px solid rgba(0,210,200,0.2)', fontWeight: 700, background: 'rgba(0,210,200,0.03)' }}>
                    <td colSpan="3" style={{ color: 'var(--teal)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: '.5px' }}>TOTAL</td>
                    <td>{totalSoumis}</td>
                    <td className="text-green">{totalValides}</td>
                    <td colSpan="2"></td>
                    <td style={{ color: 'var(--green)', fontSize: '13px' }}>{totalCA.toFixed(2)} €</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        ) : (
          clientRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Aucun lead ce mois</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr>
                  <th>Client</th><th>Campagnes</th><th>Soumis</th><th>Validés</th>
                  <th className="text-green">CA total</th><th style={{ color: 'var(--teal)' }}>CA encaissé</th>
                </tr></thead>
                <tbody>
                  {clientRows.map((r, i) => (
                    <tr key={i}>
                      <td><div className="t-name">{r.client}</div></td>
                      <td className="td-meta">{r.nbCamps} campagne{r.nbCamps > 1 ? 's' : ''}</td>
                      <td>{r.soumis}</td>
                      <td style={{ color: r.valides > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: r.valides > 0 ? 600 : 400 }}>{r.valides}</td>
                      <td style={{ color: r.ca > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: 700 }}>{r.ca > 0 ? r.ca.toFixed(2) + ' €' : '—'}</td>
                      <td style={{ color: r.paye > 0 ? 'var(--teal)' : 'var(--muted)' }}>{r.paye > 0 ? r.paye.toFixed(2) + ' €' : '—'}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px solid rgba(0,210,200,0.2)', fontWeight: 700, background: 'rgba(0,210,200,0.03)' }}>
                    <td colSpan="2" style={{ color: 'var(--teal)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: '.5px' }}>TOTAL</td>
                    <td>{totalSoumis}</td>
                    <td className="text-green">{totalValides}</td>
                    <td style={{ color: 'var(--green)', fontSize: '13px' }}>{totalCA.toFixed(2)} €</td>
                    <td style={{ color: 'var(--teal)', fontSize: '13px' }}>{totalPaye.toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
