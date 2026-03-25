// Utilitaires partagés entre ManagerPage et ConseillerPage

export const TCOL = {PAC:'#4d9fff',PV:'#ffd740',ITE:'#c97fff',REN:'#00d2c8',MUT:'#00e676',AUTO:'#ff9100',FIN:'#ff6b9d',ALARM:'#ff6b6b',AUTRE:'#7ab8b5'};
export const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export const ALL_PAGES = [
  { key: 'camp',    label: 'Campagnes' },
  { key: 'cons',    label: 'Conseillers' },
  { key: 'leads',   label: 'Leads' },
  { key: 'stats',   label: 'Stats CA' },
  { key: 'billing', label: 'Facturation' },
];

export function parseCPL(cpl) {
  if (!cpl) return 0;
  const n = parseFloat(String(cpl).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function fmtTel(val) {
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

export function exportCSV(leads, campaigns) {
  const headers = ['Date','Statut','Conseiller','Campagne','Tag','CPL','Nom','Prénom','Téléphone','Mail','CP','Ville','Rappel','Note'];
  const rows = leads.map(l => {
    const camp = campaigns.find(c => c.id === l.campaign_id);
    const rappel = l.date_rappel
      ? new Date(l.date_rappel).toLocaleDateString('fr-FR') + (l.heure_rappel ? ' ' + l.heure_rappel : '')
      : '';
    return [
      new Date(l.created_at).toLocaleDateString('fr-FR'),
      l.statut, l.conseiller_name || '', l.campaign_nom || '', l.campaign_tag || '',
      camp?.cpl || '', l.nom_prospect || '', l.prenom || '', l.telephone || '',
      l.email || '', l.cp || '', l.ville || '', rappel, l.commentaire || '',
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export const STATUT_CFG = {
  valide:     { bg: 'rgba(0,230,118,0.12)',  color: 'var(--green)', border: 'rgba(0,230,118,0.3)',  label: '✓ VALIDÉ' },
  supprime:   { bg: 'rgba(255,68,68,0.1)',   color: 'var(--red)',   border: 'rgba(255,68,68,0.25)', label: '✕ SUPPRIMÉ' },
  en_attente: { bg: 'rgba(255,215,64,0.1)',  color: '#ffd740',      border: 'rgba(255,215,64,0.25)', label: '⏳ EN ATTENTE' },
};

export function StatutBadge({ statut }) {
  const s = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '2px 9px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '.3px' }}>
      {s.label}
    </span>
  );
}

export function isFullAccess(me) {
  return !!me?.is_owner;
}

export function hasPage(me, page) {
  if (!me) return false;
  if (isFullAccess(me)) return true;
  const pages = me.pages_access ?? ['camp', 'cons', 'leads', 'stats'];
  return pages.includes(page);
}
