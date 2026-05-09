import React, { useState, useEffect, useCallback } from 'react';

const Dashboard = ({ API_URL }) => {
  // Etats du composant
  const [stats, setStats] = useState(null);
  const [analyseABC, setAnalyseABC] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement des donnees
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, abcRes, alertesRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/analyse-abc`),
        fetch(`${API_URL}/alertes-ruptures`)
      ]);
      
      setStats(await statsRes.json());
      setAnalyseABC(await abcRes.json());
      setAlertes(await alertesRes.json());
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;

  return (
    <div className="dashboard">
      {/* Indicateurs KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Medicaments en stock</h3>
          <div className="kpi-value">{stats?.total_medicaments?.toLocaleString() || 0}</div>
        </div>
        <div className="kpi-card warning">
          <h3>Ruptures imminentes</h3>
          <div className="kpi-value">{stats?.nombre_ruptures_risque || 0}</div>
        </div>
        <div className="kpi-card success">
          <h3>Taux de rotation</h3>
          <div className="kpi-value">{stats?.taux_rotation_moyen?.toFixed(2) || 0}</div>
        </div>
        <div className="kpi-card info">
          <h3>Valeur totale stock</h3>
          <div className="kpi-value">{stats?.valeur_stock_total?.toLocaleString() || 0} €</div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="dashboard-grid">
        {/* Analyse ABC */}
        <div className="dashboard-section">
          <h2>Analyse ABC (Pareto)</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicament</th>
                <th>Classe</th>
                <th>Conso mensuelle</th>
                <th>Valeur consommation</th>
                <th>Rotation stock</th>
              </tr>
            </thead>
            <tbody>
              {analyseABC.slice(0, 10).map(med => (
                <tr key={med.id}>
                  <td><strong>{med.nom}</strong></td>
                  <td className={`classe-${med.classe_abc}`}>{med.classe_abc}</td>
                  <td>{med.consommation_mensuelle}</td>
                  <td>{med.valeur_consommation?.toFixed(2)} €</td>
                  <td>{med.rotation_stock?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alertes critiques */}
        <div className="dashboard-section">
          <h2>Alertes critiques</h2>
          {alertes.length === 0 ? (
            <div className="alert-success">Aucune alerte - Stock optimal</div>
          ) : (
            <div className="alertes-list">
              {alertes.map(alerte => (
                <div key={alerte.id} className={`alerte-card ${alerte.niveau_alerte?.toLowerCase() || 'urgent'}`}>
                  <div className="alerte-header">
                    <strong>{alerte.nom}</strong>
                    <span className="alerte-badge">{alerte.niveau_alerte || 'URGENT'}</span>
                  </div>
                  <div className="alerte-details">
                    <div>Stock actuel: {alerte.quantite} unites</div>
                    <div>Seuil securite: {alerte.seuil_secu}</div>
                    <div>Consommation mensuelle: {alerte.consommation_mensuelle}</div>
                    <div>Quantite recommandee: {alerte.quantite_recommandee || Math.ceil(alerte.consommation_mensuelle * 1.5)}</div>
                    <div>Delai livraison: {alerte.delai_livraison_jours || 5} jours</div>
                  </div>
                  <button className="btn-commander">Commander urgence</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommandations strategiques */}
      <div className="dashboard-section">
        <h2>Recommandations strategiques</h2>
        <div className="recommendations">
          <div className="rec-card">
            <h4>Flux tendu</h4>
            <p>Reduire le stock des classes C de 30% pour liberer {((stats?.valeur_stock_total || 0) * 0.1).toFixed(0)} € de tresorerie</p>
          </div>
          <div className="rec-card">
            <h4>Rotation stock</h4>
            <p>Ameliorer la rotation des produits de classe B (frequence commande: toutes les 2 semaines)</p>
          </div>
          <div className="rec-card">
            <h4>Centralisation GHT</h4>
            <p>Potentiel d'economie de 15% sur les achats groupes → {((stats?.valeur_stock_total || 0) * 0.15).toFixed(0)} €/an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;