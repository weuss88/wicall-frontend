import { useState } from 'react';
import { parseCPL, MOIS_FR } from '../utils';

export default function ManagerCATab({ leads, campaigns }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [filterCons, setFilterCons] = useState('');

  const conseillers = [...new Map(leads.map(l => [l.conseiller_id, { id: l.conseiller_id, name: l.conseiller_name }])).values()];
  const filtered = filterCons ? leads.filter(l => String(l.conseiller_id) === filterCons) : leads;
  const monthLeads = filtered.filter(l => {
    const d = new Date(l.created_at);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
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

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const canNext = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  return (
    <div className="mgr-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className="btn-r" onClick={prevMonth}>← Préc.</button>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '1px', minWidth: '180px', textAlign: 'center' }}>
          {MOIS_FR[viewMonth].toUpperCase()} {viewYear}
        </div>
        {canNext && <button className="btn-r" onClick={nextMonth}>Suiv. →</button>}
        {conseillers.length > 0 && (
          <select className="fi" style={{ width: 'auto', padding: '6px 12px', marginLeft: 'auto' }} value={filterCons} onChange={e => setFilterCons(e.target.value)}>
            <option value="">Tous les conseillers</option>
            {conseillers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        )}
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-ico">📋</div><div><div className="stat-val">{totalLeads}</div><div className="stat-lbl">Leads total</div></div></div>
        <div className="stat-card"><div className="stat-ico text-green">✓</div><div><div className="stat-val">{totalValide}</div><div className="stat-lbl">Validés</div></div></div>
        <div className="stat-card" style={{ border: '1px solid rgba(0,230,118,0.3)', background: 'rgba(0,230,118,0.06)' }}><div className="stat-ico">💶</div><div><div className="stat-val text-green">{totalCA.toFixed(2)} €</div><div className="stat-lbl">CA du mois</div></div></div>
        <div className="stat-card"><div className="stat-ico">📅</div><div><div className="stat-val">{days.filter(d => d.total > 0).length}</div><div className="stat-lbl">Jours actifs</div></div></div>
      </div>
      <div className="mgr-card">
        <div className="mgr-head">
          <div className="mgr-head-title">DÉTAIL PAR JOUR{filterCons ? ` — ${conseillers.find(c => String(c.id) === filterCons)?.name || ''}` : ' — TOUS'}</div>
        </div>
        {totalLeads === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Aucun lead ce mois</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr>
                <th>Date</th><th>Leads</th><th className="text-green">Validés</th>
                <th style={{ color: '#ffd740' }}>En attente</th><th className="text-red">Supprimés</th>
                <th className="text-green">CA du jour</th>
              </tr></thead>
              <tbody>
                {days.filter(d => d.total > 0).map(d => {
                  const isToday = isCurrentMonth && d.day === today;
                  const dateObj = new Date(viewYear, viewMonth, d.day);
                  return (
                    <tr key={d.day} style={isToday ? { background: 'rgba(0,210,200,0.05)' } : {}}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: isToday ? 600 : 400 }}>
                        {dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        {isToday && <span style={{ fontSize: '9px', color: 'var(--teal)', marginLeft: '6px', fontFamily: 'Rajdhani,sans-serif', letterSpacing: '.5px' }}>AUJOURD'HUI</span>}
                      </td>
                      <td>{d.total}</td>
                      <td style={{ color: d.valide > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: d.valide > 0 ? 600 : 400 }}>{d.valide || '—'}</td>
                      <td style={{ color: d.attente > 0 ? '#ffd740' : 'var(--muted)' }}>{d.attente || '—'}</td>
                      <td style={{ color: d.supprime > 0 ? 'var(--red)' : 'var(--muted)' }}>{d.supprime || '—'}</td>
                      <td style={{ color: d.ca > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: d.ca > 0 ? 700 : 400 }}>
                        {d.ca > 0 ? d.ca.toFixed(2) + ' €' : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: '1px solid rgba(0,210,200,0.2)', fontWeight: 700, background: 'rgba(0,210,200,0.03)' }}>
                  <td style={{ color: 'var(--teal)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: '.5px' }}>TOTAL</td>
                  <td>{totalLeads}</td>
                  <td className="text-green">{totalValide}</td>
                  <td style={{ color: '#ffd740' }}>{monthLeads.filter(l => l.statut === 'en_attente').length}</td>
                  <td className="text-red">{monthLeads.filter(l => l.statut === 'supprime').length}</td>
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
