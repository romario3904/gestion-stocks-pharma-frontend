import React, { useState, useEffect } from 'react';

const CentralisationAchats = ({ API_URL }) => {
  // Etats du composant
  const [medicaments, setMedicaments] = useState([]);
  const [selectedMedicaments, setSelectedMedicaments] = useState([]);
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicaments();
  }, []);

  // Chargement des medicaments
  const fetchMedicaments = async () => {
    try {
      const response = await fetch(`${API_URL}/medicaments`);
      const data = await response.json();
      setMedicaments(data);
    } catch (error) {
      console.error('Erreur chargement medicaments:', error);
      setMedicaments([]);
    }
  };

  // Selection d'un medicament
  const handleSelection = (medicamentId) => {
    setSelectedMedicaments(prev => 
      prev.includes(medicamentId)
        ? prev.filter(id => id !== medicamentId)
        : [...prev, medicamentId]
    );
  };

  // Analyse de centralisation
  const analyserCentralisation = async () => {
    if (selectedMedicaments.length === 0) {
      alert("Veuillez selectionner au moins un medicament");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/centralisation-acht`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicaments_selectionnes: selectedMedicaments,
          regroupement: "GHT Centre"
        })
      });
      const data = await response.json();
      setAnalyse(data);
    } catch (error) {
      console.error('Erreur analyse centralisation:', error);
      // Simulation de donnees
      const medicamentsSel = medicaments.filter(m => selectedMedicaments.includes(m.id));
      setAnalyse({
        medicaments_centralises: medicamentsSel,
        economie_projetee: {
          montant_actuel: medicamentsSel.reduce((sum, m) => sum + (m.quantite * m.prix_unitaire), 0),
          economie_potentielle: medicamentsSel.reduce((sum, m) => sum + (m.quantite * m.prix_unitaire * 0.15), 0),
          nouveau_prix_moyen: medicamentsSel.reduce((sum, m) => sum + (m.prix_unitaire * 0.85), 0) / medicamentsSel.length
        },
        recommandations: {
          standardisation: "Negocier un tarif unique par molecule",
          delais: "Synchroniser les commandes GHT",
          risques: "Dependance fournisseur unique a surveiller"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centralisation-achats">
      <h2>Centralisation des achats au sein du GHT</h2>
      
      {/* Bandeau informatif */}
      <div className="info-banner">
        <div className="banner-icon">💰</div>
        <div className="banner-content">
          <h3>Potentiel d'economies: 15% sur les achats groupes</h3>
          <p>La centralisation permet de mutualiser les volumes et de negocier des tarifs preferentiels</p>
        </div>
      </div>

      {/* Deux colonnes */}
      <div className="two-columns">
        {/* Colonne gauche - Selection */}
        <div className="column">
          <h3>Selection des medicaments</h3>
          <div className="medicaments-list">
            {medicaments.map(med => (
              <label key={med.id} className="medicament-item">
                <input
                  type="checkbox"
                  checked={selectedMedicaments.includes(med.id)}
                  onChange={() => handleSelection(med.id)}
                />
                <div className="med-info">
                  <strong>{med.nom}</strong>
                  <span className="med-detail">Quantite: {med.quantite.toLocaleString()} | Prix: {med.prix_unitaire}€</span>
                </div>
              </label>
            ))}
          </div>
          <button 
            className="btn-primary" 
            onClick={analyserCentralisation}
            disabled={loading || selectedMedicaments.length === 0}
          >
            {loading ? 'Analyse en cours...' : 'Lancer analyse centralisation'}
          </button>
        </div>

        {/* Colonne droite - Resultats */}
        <div className="column">
          <h3>Resultats de l'analyse</h3>
          {analyse ? (
            <div className="analyse-results">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <h3>Montant actuel</h3>
                  <div className="kpi-value">
                    {analyse.economie_projetee?.montant_actuel?.toLocaleString()} €
                  </div>
                </div>
                <div className="kpi-card success">
                  <h3>Economie potentielle</h3>
                  <div className="kpi-value">
                    + {analyse.economie_projetee?.economie_potentielle?.toLocaleString()} €
                  </div>
                  <div className="result-detail">Soit 15% d'economie</div>
                </div>
              </div>

              {/* Medicaments concernes */}
              <div className="medicaments-centralises">
                <h4>Articles concernes ({analyse.medicaments_centralises?.length})</h4>
                <div className="med-tags">
                  {analyse.medicaments_centralises?.map(med => (
                    <span key={med.id} className="med-tag">{med.nom}</span>
                  ))}
                </div>
              </div>

              {/* Recommandations GHT */}
              <div className="recommendations-cht">
                <h4>Recommandations GHT</h4>
                <ul>
                  <li>✓ {analyse.recommandations?.standardisation}</li>
                  <li>✓ {analyse.recommandations?.delais}</li>
                  <li>⚠️ {analyse.recommandations?.risques}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>Selectionnez des medicaments et lancez l'analyse</p>
            </div>
          )}
        </div>
      </div>

      {/* Risques de dereferencement */}
      <div className="risques-section">
        <h3>Analyse des risques de dereferencement local</h3>
        <div className="risques-grid">
          <div className="risque-card">
            <h4>Dependance Fournisseur Unique</h4>
            <p>Risque eleve de rupture critique si un probleme survient chez le prestataire unique</p>
            <div className="solution">Strategie: Maintenir 2 fournisseurs par molecule</div>
          </div>
          <div className="risque-card">
            <h4>Adaptation Locale</h4>
            <p>Produits standardises pouvant ne pas correspondre aux protocoles specifiques</p>
            <div className="solution">Strategie: Droit de derogation pour 20% des achats</div>
          </div>
          <div className="risque-card">
            <h4>Delais de Livraison</h4>
            <p>Centralisation administrative pouvant allonger les delais</p>
            <div className="solution">Strategie: Stock securite renforce + commandes tampon</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralisationAchats;