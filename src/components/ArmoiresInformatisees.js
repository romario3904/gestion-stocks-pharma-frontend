import React, { useState, useEffect } from 'react';

const ArmoiresInformatisees = ({ API_URL }) => {
  // Etats du composant
  const [armoires, setArmoires] = useState([]);
  const [medicaments, setMedicaments] = useState([]);
  const [selectedArmoire, setSelectedArmoire] = useState(null);

  useEffect(() => {
    fetchArmoires();
    fetchMedicaments();
  }, []);

  // Chargement des armoires
  const fetchArmoires = async () => {
    try {
      const response = await fetch(`${API_URL}/armoires`);
      const dataSimulee = [
        {
          id: 1,
          service: "Urgences",
          localisation: "Niveau 0 - Aile Est",
          status: "actif",
          date_installation: "2024-01-15",
          niveau_remplissage: 85,
          dernier_acces: "10/12/2024 14:30",
          api_id: "8API-QST-URG"
        },
        {
          id: 2,
          service: "Cardiologie",
          localisation: "Niveau 2 - Aile Ouest",
          status: "actif",
          date_installation: "2024-03-20",
          niveau_remplissage: 62,
          dernier_acces: "10/12/2024 09:15",
          api_id: "8API-QST-CARD"
        },
        {
          id: 3,
          service: "Pediatrie",
          localisation: "Niveau 1 - Aile Sud",
          status: "maintenance",
          date_installation: "2024-06-10",
          niveau_remplissage: 0,
          dernier_acces: "08/12/2024 16:45",
          api_id: "8API-QST-PED"
        }
      ];
      setArmoires(dataSimulee);
    } catch (error) {
      console.error('Erreur chargement armoires:', error);
      setArmoires([]);
    }
  };

  // Chargement des medicaments
  const fetchMedicaments = async () => {
    try {
      const response = await fetch(`${API_URL}/medicaments`);
      const data = await response.json();
      setMedicaments(data.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement medicaments:', error);
      setMedicaments([]);
    }
  };

  // Badge de statut
  const getStatusBadge = (status) => {
    switch(status) {
      case 'actif':
        return <span className="status-badge success">Connecte & Operationnel</span>;
      case 'maintenance':
        return <span className="status-badge warning">Maintenance</span>;
      default:
        return <span className="status-badge">Inconnu</span>;
    }
  };

  return (
    <div className="armoires-informatisees">
      <h2>Deploiement des Armoires a Pharmacie Informatisees (API)</h2>

      {/* Avantages du deploiement */}
      <div className="benefits-grid">
        <div className="benefit-card">
          <div className="benefit-icon">⏱️</div>
          <h4>Gain de temps</h4>
          <p>Reduction de 40% du temps consacre a la gestion des stocks</p>
          <div className="stat">-25 min/jour/infirmier</div>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">🔒</div>
          <h4>Securisation</h4>
          <p>Traçabilite complete des prelevements</p>
          <div className="stat">99.8% de fiabilite</div>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">📉</div>
          <h4>Reduction erreurs</h4>
          <p>Diminution de 65% des erreurs de dispensation</p>
          <div className="stat">-650 erreurs/an</div>
        </div>
      </div>

      {/* Liste des armoires */}
      <h3>Armoires deployees</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Localisation</th>
            <th>Statut</th>
            <th>Date installation</th>
            <th>Niveau remplissage</th>
            <th>Dernier acces</th>
          </tr>
        </thead>
        <tbody>
          {armoires.map(armoire => (
            <tr key={armoire.id} onClick={() => setSelectedArmoire(armoire)} style={{cursor: 'pointer'}}>
              <td><strong>{armoire.service}</strong></td>
              <td>{armoire.localisation}</td>
              <td>{getStatusBadge(armoire.status)}</td>
              <td>{armoire.date_installation}</td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${armoire.niveau_remplissage}%`}}>
                    {armoire.niveau_remplissage}%
                  </div>
                </div>
              </td>
              <td>{armoire.dernier_acces}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal details armoire */}
      {selectedArmoire && (
        <div className="modal-overlay" onClick={() => setSelectedArmoire(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Details de l'armoire - {selectedArmoire.service}</h3>
            <div className="armoire-details">
              <div className="detail-row">
                <strong>Identifiant API:</strong> {selectedArmoire.api_id}
              </div>
              <div className="detail-row">
                <strong>Localisation:</strong> {selectedArmoire.localisation}
              </div>
              <div className="detail-row">
                <strong>Dernier acces:</strong> {selectedArmoire.dernier_acces}
              </div>
              <div className="detail-row">
                <strong>Installation:</strong> {selectedArmoire.date_installation}
              </div>
              <div className="detail-row">
                <strong>Statut:</strong> {getStatusBadge(selectedArmoire.status)}
              </div>
              <div className="medicaments-stockes">
                <h4>Medicaments frequemment preleves</h4>
                <table className="data-table">
                  <tbody>
                    {medicaments.map(med => (
                      <tr key={med.id}>
                        <td>{med.nom}</td>
                        <td>{Math.floor(Math.random() * 50) + 10} prelevements/semaine</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary">Generer Rapport Inventaire</button>
              <button className="btn-secondary" onClick={() => setSelectedArmoire(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Recommandations deploiement */}
      <div className="recommendations-section">
        <h3>Recommandations pour le deploiement API</h3>
        <div className="recommendations-list">
          <div className="rec-item">
            <div className="rec-number">1</div>
            <div className="rec-content">
              <h4>Formation prealable</h4>
              <p>Organiser 3 jours de formation pour les infirmiers avant mise en service</p>
            </div>
          </div>
          <div className="rec-item">
            <div className="rec-number">2</div>
            <div className="rec-content">
              <h4>Pilote initial</h4>
              <p>Deployer d'abord dans 2 services pilotes pendant 1 mois</p>
            </div>
          </div>
          <div className="rec-item">
            <div className="rec-number">3</div>
            <div className="rec-content">
              <h4>Support technique</h4>
              <p>Presence d'un pharmacien referent pendant les 2 premieres semaines</p>
            </div>
          </div>
          <div className="rec-item">
            <div className="rec-number">4</div>
            <div className="rec-content">
              <h4>Indicateurs de suivi</h4>
              <p>Mesurer mensuellement: temps de preparation, erreurs, satisfaction equipe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArmoiresInformatisees;