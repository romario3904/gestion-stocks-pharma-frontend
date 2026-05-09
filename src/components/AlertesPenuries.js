import React, { useState, useEffect, useCallback } from 'react';

const AlertesPenuries = ({ API_URL }) => {
  // Etats du composant
  const [alertes, setAlertes] = useState([]);
  const [substitutions, setSubstitutions] = useState({});
  const [selectedMedicament, setSelectedMedicament] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chargement des alertes
  const fetchAlertes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/alertes-ruptures`);
      const data = await response.json();
      setAlertes(data);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      setAlertes([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAlertes();
  }, [fetchAlertes]);

  // Verification substitution
  const checkSubstitution = useCallback(async (medicamentId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/substitution/${medicamentId}`);
      const data = await response.json();
      setSubstitutions(prev => ({ ...prev, [medicamentId]: data }));
      setSelectedMedicament(medicamentId);
    } catch (error) {
      console.error('Erreur verification substitution:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Commande d'urgence
  const commanderUrgence = (medicament) => {
    const quantite = prompt(`Quantite a commander pour ${medicament.nom}:`, 
      medicament.quantite_recommandee || Math.ceil(medicament.consommation_mensuelle * 1.5));
    if (quantite && !isNaN(quantite)) {
      alert(`Commande d'urgence lancee: ${quantite} ${medicament.nom}`);
    }
  };

  if (loading && alertes.length === 0) {
    return <div className="loading">Chargement des alertes...</div>;
  }

  return (
    <div className="alertes-penuries">
      <h2>Gestion des penuries et alertes</h2>

      {alertes.length === 0 ? (
        <div className="success-message">Aucune alerte de penurie - Stock secure</div>
      ) : (
        <div className="alertes-grid">
          {alertes.map(alerte => (
            <div key={alerte.id} className={`alerte-card ${alerte.niveau_alerte?.toLowerCase() || 'urgent'}`}>
              <div className="alerte-header">
                <strong>{alerte.nom}</strong>
                <span className="alerte-badge">{alerte.niveau_alerte || 'URGENT'}</span>
              </div>
              <div className="alerte-details">
                <div>Stock actuel: {alerte.quantite} unites</div>
                <div>Seuil securite: {alerte.seuil_secu}</div>
                <div>Jours restants: {Math.floor(alerte.quantite / (alerte.consommation_mensuelle / 30))} jours</div>
              </div>
              <div className="alert-actions">
                <button className="btn-commander-urgence" onClick={() => commanderUrgence(alerte)}>
                  Commander urgence
                </button>
                <button className="btn-substitution" onClick={() => checkSubstitution(alerte.id)}>
                  Verifier substitution
                </button>
              </div>

              {selectedMedicament === alerte.id && substitutions[alerte.id] && (
                <div className="substitution-info">
                  <h4>Plan de substitution</h4>
                  {substitutions[alerte.id].substitution_possible ? (
                    substitutions[alerte.id].substituts_disponibles?.length > 0 ? (
                      <div>
                        {substitutions[alerte.id].substituts_disponibles.map(sub => (
                          <div key={sub.id} className="substitut-item">
                            <span>{sub.nom} (Stock: {sub.quantite})</span>
                            <button className="btn-valider">Valider</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Aucun substitut disponible</p>
                    )
                  ) : (
                    <p>Substitution impossible</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertesPenuries;