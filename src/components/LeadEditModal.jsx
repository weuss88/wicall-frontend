import { useState } from 'react';
import { TCOL, fmtTel } from '../utils';

export default function LeadEditModal({ lead, onSave, onClose }) {
  const [form, setForm] = useState({
    civilite:      lead.civilite || '',
    nom_prospect:  lead.nom_prospect || '',
    prenom:        lead.prenom || '',
    adresse:       lead.adresse || '',
    cp:            lead.cp || '',
    ville:         lead.ville || '',
    telephone:     lead.telephone || '',
    email:         lead.email || '',
    date_rappel:   lead.date_rappel || '',
    heure_rappel:  lead.heure_rappel || '',
    commentaire:   lead.commentaire || '',
    statut:        lead.statut || 'en_attente',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(lead.id, {
        civilite:     form.civilite || null,
        nom_prospect: form.nom_prospect.trim() || null,
        prenom:       form.prenom.trim() || null,
        adresse:      form.adresse.trim() || null,
        cp:           form.cp.trim() || null,
        ville:        form.ville.trim() || null,
        telephone:    form.telephone.trim() || null,
        email:        form.email.trim() || null,
        date_rappel:  form.date_rappel || null,
        heure_rappel: form.heure_rappel || null,
        commentaire:  form.commentaire.trim() || null,
        statut:       form.statut,
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
      <div className="mo-box" style={{ maxWidth: '560px' }}>
        <div className="mo-head">
          <div className="mo-title">MODIFIER LE LEAD</div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>
        <div className="mo-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(0,210,200,0.06)', border: '1px solid rgba(0,210,200,0.15)', borderRadius: '6px', marginBottom: '14px' }}>
            <span style={{ background: `${col}18`, color: col, fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${col}35` }}>{lead.campaign_tag}</span>
            <span style={{ fontSize: '12px', color: 'var(--text)' }}>{lead.campaign_nom}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>{lead.conseiller_name}</span>
          </div>

          <div className="fg2" style={{ marginBottom: '10px' }}>
            <label>Statut du lead</label>
            <select className="fi" value={form.statut} onChange={e => set('statut', e.target.value)}>
              <option value="en_attente">⏳ En attente</option>
              <option value="valide">✓ Validé</option>
              <option value="supprime">✕ Supprimé</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
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

          <div className="fg2" style={{ marginBottom: '10px' }}>
            <label>Adresse</label>
            <input className="fi" type="text" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="fg2">
              <label>CP</label>
              <input className="fi" type="text" maxLength="5" inputMode="numeric"
                value={form.cp} onChange={e => set('cp', e.target.value.replace(/\D/g, '').substring(0, 5))} />
            </div>
            <div className="fg2">
              <label>Ville</label>
              <input className="fi" type="text" value={form.ville} onChange={e => set('ville', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="fg2">
              <label>Date de rappel</label>
              <input className="fi" type="date" value={form.date_rappel} onChange={e => set('date_rappel', e.target.value)} />
            </div>
            <div className="fg2">
              <label>Heure de rappel</label>
              <input className="fi" type="time" value={form.heure_rappel} onChange={e => set('heure_rappel', e.target.value)} />
            </div>
          </div>

          <div className="fg2" style={{ marginBottom: '10px' }}>
            <label>Note</label>
            <textarea className="fi" rows="3" value={form.commentaire} onChange={e => set('commentaire', e.target.value)}
              style={{ resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }} />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: '12px', padding: '4px 0' }}>{error}</div>}
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
