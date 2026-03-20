import { useState, useEffect } from 'react';

const TAGS = ['PAC','PV','ITE','REN','MUT','AUTO','FIN','ALARM','AUTRE'];
const TAG_LABELS = {
  PAC:'PAC', PV:'PV / Panneaux', ITE:'ITE', REN:'Rénovation',
  MUT:'Mutuelle', AUTO:'Automobile', FIN:'Finance', ALARM:'Alarme', AUTRE:'Autre'
};

export default function CampaignModal({ campaign, onSave, onClose }) {
  const [nom, setNom] = useState('');
  const [client, setClient] = useState('');
  const [tag, setTag] = useState('PAC');
  const [cpl, setCpl] = useState('');
  const [logement, setLogement] = useState([]);
  const [logAll, setLogAll] = useState(false);
  const [statut, setStatut] = useState([]);
  const [statAll, setStatAll] = useState(false);
  const [chauffage, setChauffage] = useState([]);
  const [chAll, setChAll] = useState(false);
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [ageAll, setAgeAll] = useState(false);
  const [isNational, setIsNational] = useState(true);
  const [cpText, setCpText] = useState('');
  const [note, setNote] = useState('');
  const [criteres, setCriteres] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setNom(campaign.nom || '');
      setClient(campaign.client || '');
      setTag(campaign.tag || 'PAC');
      setCpl(campaign.cpl || '');
      setNote(campaign.alerte || '');
      setLogement(campaign.logement || []);
      setLogAll(!campaign.logement);
      setStatut(campaign.statut || []);
      setStatAll(!campaign.statut);
      setChauffage(campaign.chauffage || []);
      setChAll(!campaign.chauffage);
      if (campaign.age_min === null && campaign.age_max === null) {
        setAgeAll(true); setAgeMin(''); setAgeMax('');
      } else {
        setAgeAll(false);
        setAgeMin(campaign.age_min !== null ? String(campaign.age_min) : '');
        setAgeMax(campaign.age_max !== null ? String(campaign.age_max) : '');
      }
      if (campaign.cp === 'national') {
        setIsNational(true); setCpText('');
      } else {
        setIsNational(false);
        setCpText(Array.isArray(campaign.cp) ? campaign.cp.join(', ') : '');
      }
      setCriteres((campaign.criteres_custom || []).map(c => c.label));
    }
  }, [campaign]);

  const toggleChip = (arr, setArr, val, setAll) => {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    setAll(false);
  };

  const handleSave = async () => {
    if (!nom.trim() || !client.trim()) { alert('Nom et client sont obligatoires'); return; }

    const finalLogement = logAll ? null : (logement.length > 0 ? logement : null);
    const finalStatut = statAll ? null : (statut.length > 0 ? statut : null);
    const finalChauffage = chAll ? null : (chauffage.length > 0 ? chauffage : null);
    let finalAgeMin = null, finalAgeMax = null;
    if (!ageAll) {
      if (ageMin !== '') finalAgeMin = parseInt(ageMin);
      if (ageMax !== '') finalAgeMax = parseInt(ageMax);
    }

    // CP : si national ou champ vide → "national", sinon liste de depts
    let cp = 'national';
    if (!isNational && cpText.trim()) {
      const depts = cpText.split(/[,\s]+/)
        .map(x => x.trim())
        .filter(x => x.length > 0)
        .map(x => x.padStart(2, '0'))
        .filter(x => x.length === 2 && !isNaN(Number(x)));
      if (depts.length > 0) cp = depts;
    }

    const data = {
      nom: nom.trim(),
      client: client.trim(),
      tag,
      cpl: cpl.trim() || '?€',
      cp,
      logement: finalLogement,
      statut: finalStatut,
      chauffage: finalChauffage,
      age_min: finalAgeMin,
      age_max: finalAgeMax,
      alerte: note.trim() || null,
      actif: true,
      criteres_custom: criteres.filter(c => c.trim()).map(c => ({ label: c.trim() }))
    };

    setSaving(true);
    try {
      await onSave(data, campaign?.id);
    } catch {
      // erreur déjà affichée par onSave
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mo">
      <div className="mo-box">
        <div className="mo-head">
          <div className="mo-title">{campaign ? 'MODIFIER LA CAMPAGNE' : 'NOUVELLE CAMPAGNE'}</div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>
        <div className="mo-body">

          {/* Nom + Client */}
          <div className="fr">
            <div className="fg2">
              <label>Nom de la campagne *</label>
              <input className="fi" type="text" placeholder="PAC géoloc"
                value={nom} onChange={e => setNom(e.target.value)} />
            </div>
            <div className="fg2">
              <label>Client donneur d'ordre *</label>
              <input className="fi" type="text" placeholder="Léna"
                value={client} onChange={e => setClient(e.target.value)} />
            </div>
          </div>

          {/* Tag + CPL */}
          <div className="fr">
            <div className="fg2">
              <label>Type / Secteur</label>
              <select className="fi" value={tag} onChange={e => setTag(e.target.value)}>
                {TAGS.map(t => <option key={t} value={t}>{TAG_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="fg2">
              <label>CPL (€)</label>
              <input className="fi" type="text" placeholder="12€"
                value={cpl} onChange={e => setCpl(e.target.value)} />
            </div>
          </div>

          <div className="sect-lbl">Critères standards</div>

          {/* Logement + Statut */}
          <div className="fr">
            <div className="fg2">
              <label>Logement accepté</label>
              <div className="chips">
                <label className="chip">
                  <input type="checkbox" checked={logement.includes('maison')}
                    onChange={() => toggleChip(logement, setLogement, 'maison', setLogAll)} />
                  🏠 Maison
                </label>
                <label className="chip">
                  <input type="checkbox" checked={logement.includes('appartement')}
                    onChange={() => toggleChip(logement, setLogement, 'appartement', setLogAll)} />
                  🏢 Appartement
                </label>
                <label className="chip">
                  <input type="checkbox" checked={logAll}
                    onChange={e => { setLogAll(e.target.checked); if (e.target.checked) setLogement([]); }} />
                  Tous
                </label>
              </div>
            </div>
            <div className="fg2">
              <label>Statut occupant</label>
              <div className="chips">
                <label className="chip">
                  <input type="checkbox" checked={statut.includes('proprietaire')}
                    onChange={() => toggleChip(statut, setStatut, 'proprietaire', setStatAll)} />
                  🔑 Propriétaire
                </label>
                <label className="chip">
                  <input type="checkbox" checked={statut.includes('locataire')}
                    onChange={() => toggleChip(statut, setStatut, 'locataire', setStatAll)} />
                  📄 Locataire
                </label>
                <label className="chip">
                  <input type="checkbox" checked={statAll}
                    onChange={e => { setStatAll(e.target.checked); if (e.target.checked) setStatut([]); }} />
                  Tous
                </label>
              </div>
            </div>
          </div>

          {/* Chauffage + Age */}
          <div className="fr">
            <div className="fg2">
              <label>Mode de chauffage</label>
              <div className="chips">
                {[['gaz','🔥 Gaz'],['fioul','🛢 Fioul'],['electrique','⚡ Électrique'],['autre','♨ Autre']].map(([val, lbl]) => (
                  <label key={val} className="chip">
                    <input type="checkbox" checked={chauffage.includes(val)}
                      onChange={() => toggleChip(chauffage, setChauffage, val, setChAll)} />
                    {lbl}
                  </label>
                ))}
                <label className="chip">
                  <input type="checkbox" checked={chAll}
                    onChange={e => { setChAll(e.target.checked); if (e.target.checked) setChauffage([]); }} />
                  Aucun critère
                </label>
              </div>
            </div>
            <div className="fg2">
              <label>Âge prospect</label>
              <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <span style={{fontSize:'11px',color:'var(--muted2)'}}>Min</span>
                  <input className="fi fi-sm" type="number" min="0" max="99" placeholder="35"
                    value={ageMin} onChange={e => setAgeMin(e.target.value)} disabled={ageAll} />
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <span style={{fontSize:'11px',color:'var(--muted2)'}}>Max</span>
                  <input className="fi fi-sm" type="number" min="0" max="99" placeholder="99"
                    value={ageMax} onChange={e => setAgeMax(e.target.value)} disabled={ageAll} />
                </div>
                <label className="chip">
                  <input type="checkbox" checked={ageAll} onChange={e => setAgeAll(e.target.checked)} />
                  Aucune limite
                </label>
              </div>
              <div style={{fontSize:'10px',color:'var(--muted)',marginTop:'4px'}}>Vide = pas de limite de ce côté</div>
            </div>
          </div>

          <div className="sect-lbl">Critères spécifiques à la campagne</div>
          <div className="crit-dyn">
            <div className="crit-dyn-head">
              <div className="crit-dyn-title">Critères personnalisés</div>
              <button className="btn-add-crit" onClick={() => setCriteres(prev => [...prev, ''])}>
                + Ajouter un critère
              </button>
            </div>
            <div className="crit-list">
              {criteres.map((c, i) => (
                <div key={i} className="crit-row">
                  <input className="fi" type="text" placeholder="Ex: Projet dans les 6 mois"
                    value={c} onChange={e => setCriteres(prev => prev.map((x, j) => j === i ? e.target.value : x))} />
                  <button className="btn-rm-crit"
                    onClick={() => setCriteres(prev => prev.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
            <div className="crit-hint">
              Ces critères s'affichent sur la carte du conseiller comme checklist visuelle.<br />
              Exemples : "Projet dans les 6 mois", "Capital restant &gt; 100k€", "Montant impôts &gt; 2500€/an"...
            </div>
          </div>

          <div className="sect-lbl">Codes postaux</div>
          <div className="fr full">
            <div className="fg2">
              <label>Zones autorisées</label>
              <label className="chip" style={{display:'inline-flex',marginBottom:'8px',width:'fit-content'}}>
                <input type="checkbox" checked={isNational}
                  onChange={e => { setIsNational(e.target.checked); if (e.target.checked) setCpText(''); }} />
                🌍 National — tous les départements
              </label>
              <textarea className="fi" rows="3" disabled={isNational}
                value={cpText} onChange={e => setCpText(e.target.value)}
                placeholder={"01, 02, 14, 27, 59, 76, 80...\nEntrez les numéros de département séparés par des virgules"} />
              <div style={{fontSize:'10px',color:'var(--muted)',marginTop:'4px'}}>
                Numéros de département à 2 chiffres. Ex: 01, 14, 27, 76
              </div>
            </div>
          </div>

          <div className="fr full">
            <div className="fg2">
              <label>Note / Alerte conseiller</label>
              <input className="fi" type="text"
                placeholder="⚠ PAS aides État — Annoncer fournisseur..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>

        </div>
        <div className="mo-foot">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
          </button>
        </div>
      </div>
    </div>
  );
}
