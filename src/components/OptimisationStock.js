import React, { useState, useEffect, useCallback } from 'react';

const OptimisationStock = ({ API_URL }) => {
  // Etats du composant
  const [optimisationData, setOptimisationData] = useState([]);
  const [perimesData, setPerimesData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement des donnees optimisation
  const fetchOptimisationData = useCallback(async () => {
    setLoading(true);
    try {
      const [optimisationRes, perimesRes] = await Promise.all([
        fetch(`${API_URL}/stock-securite-dynamique`),
        fetch(`${API_URL}/medicaments-perimes`)
      ]);
      
      setOptimisationData(await optimisationRes.json());
      setPerimesData(await perimesRes.json());
    } catch (error) {
      console.error('Erreur chargement optimisation:', error);
      setOptimisationData([]);
      setPerimesData({
        perimes: [],
        proche_peremption: [],
        recommandations: { destruction: [], promotion_rapide: [], don_possible: [] }
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOptimisationData();
  }, [fetchOptimisationData]);

  // Calcul des statistiques
  const totalEconomies = optimisationData.reduce((sum, m) => sum + (m.economie_potentielle || 0), 0);
  const surstocksCount = optimisationData.filter(m => m.recommandation?.includes('Surstock')).length;
  const urgentsCount = optimisationData.filter(m => m.recommandation?.includes('Urgent')).length;
  const rotationMoyenne = optimisationData.reduce((sum, m) => sum + (m.consommation_mensuelle / m.quantite || 0), 0) / optimisationData.length || 0;

  if (loading) {
    return <div className="loading">Chargement de l'optimisation...</div>;
  }

  return (
    <div className="optimisation-stock">
      <h2>Optimisation du stock et Flux tendu</h2>
      <p className="section-desc">Pilotage des indicateurs de performance logistique et reduction des risques de peremption</p>

      {/* Indicateurs KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Economies potentielles</h3>
          <div className="kpi-value">{totalEconomies.toFixed(2)} €</div>
        </div>
        <div className="kpi-card warning">
          <h3>Surstock identifie</h3>
          <div className="kpi-value">{surstocksCount}</div>
        </div>
        <div className="kpi-card danger">
          <h3>Urgences</h3>
          <div className="kpi-value">{urgentsCount}</div>
        </div>
        <div className="kpi-card info">
          <h3>Rotation moyenne</h3>
          <div className="kpi-value">{rotationMoyenne.toFixed(2)}</div>
        </div>
      </div>

      {/* Tableau stock de securite dynamique */}
      <h3>Stock de securite dynamique</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicament</th>
              <th>Stock</th>
              <th>Conso mensuelle</th>
              <th>Stock securite</th>
              <th>Impact economique</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {optimisationData.slice(0, 10).map(med => (
              <tr key={med.id}>
                <td><strong>{med.nom}</strong><br/><small>Cat. {med.categorie}</small></td>
                <td className={med.quantite < (med.stock_securite_calcule || 0) ? 'critical-value' : ''}>
                  {med.quantite}
                </td>
                <td>{med.consommation_mensuelle}</td>
                <td>{med.stock_securite_calcule || Math.ceil(med.consommation_mensuelle / 4)}</td>
                <td className={med.economie_potentielle > 0 ? 'positive-value' : ''}>
                  {med.economie_potentielle > 0 ? `+ ${med.economie_potentielle.toFixed(2)} €` : '-'}
                </td>
                <td>
                  <button className="btn-small">Optimiser</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategies flux tendu */}
      <div className="strategies-section">
        <h3>Strategies de flux tendu</h3>
        <div className="strategies-grid">
          <div className="strategy-card">
            <h4>Methode ABC</h4>
            <p>Classification par valeur de consommation</p>
            <p>Classe A: 70% de la valeur, commandes hebdomadaires</p>
            <p>Classe B: 20% de la valeur, commandes bimensuelles</p>
            <p>Classe C: 10% de la valeur, commandes mensuelles</p>
            <div className="strategy-impact">Impact: +25% Tresorerie</div>
          </div>
          <div className="strategy-card">
            <h4>Juste a temps (JAT)</h4>
            <p>Livraison quotidienne pour les classes A</p>
            <p>Reduction stock securite classe C de 50%</p>
            <p>Mutualisation des stocks au sein du GHT</p>
            <div className="strategy-impact">Objectif: 15 commandes/fournisseur/an</div>
          </div>
          <div className="strategy-card">
            <h4>Stock Dynamique</h4>
            <p>Ajustement selon saisonnalite</p>
            <p>Calcul base sur ecart-type consommation</p>
            <p>Alertes automatiques seuil franchi</p>
            <div className="strategy-impact">Precision: +15% vs fixe</div>
          </div>
          <div className="strategy-card">
            <h4>Collaboration VMI</h4>
            <p>Gestion partagee avec les fournisseurs</p>
            <p>Partage des previsions de consommation</p>
            <p>Vendor Managed Inventory pour top 50</p>
            <div className="strategy-impact">Delais: -40%</div>
          </div>
        </div>
      </div>

      {/* Gestion des perimes */}
      {perimesData && perimesData.proche_peremption && perimesData.proche_peremption.length > 0 && (
        <div className="peremption-alert">
          <h3>Alertes peremption proche</h3>
          <div className="peremption-list">
            {perimesData.proche_peremption.slice(0, 5).map(m => {
              const joursRestants = Math.ceil((new Date(m.peremption) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={m.id} className="peremption-item">
                  <span><strong>{m.nom}</strong></span>
                  <span>Stock: {m.quantite}</span>
                  <span className={joursRestants < 30 ? 'critical' : ''}>{joursRestants} jours restants</span>
                  <button className="btn-small">Planifier rotation</button>
                </div>
              );
            })}
          </div>
          <div className="info-note">
            <p>La mise en place du Premier Entré, Premier Sorti (PEPS) systematique a permis une reduction de 12% des pertes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimisationStock;