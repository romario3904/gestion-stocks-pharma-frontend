import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import OptimisationStock from './components/OptimisationStock';
import ArmoiresInformatisees from './components/ArmoiresInformatisees';
import CentralisationAchats from './components/CentralisationAchats';
import AlertesPenuries from './components/AlertesPenuries';

const App = () => {
  // Etat pour l'onglet actif
  const [activeTab, setActiveTab] = useState('dashboard');
  // Etat pour les statistiques
  const [stats, setStats] = useState(null);
  // URL de l'API backend
  const API_URL = 'http://localhost:5000/api';

  // Chargement des stats au demarrage
  useEffect(() => {
    fetchStats();
    // Rafraichissement toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fonction de recuperation des statistiques
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Configuration des onglets de navigation
  const tabs = [
    { id: 'dashboard', name: 'Tableau de bord', component: Dashboard },
    { id: 'stock', name: 'Gestion de Stock', component: StockManagement },
    { id: 'alertes', name: 'Alertes Penuries', component: AlertesPenuries },
    { id: 'optimisation', name: 'Flux Tendu', component: OptimisationStock },
    { id: 'armoires', name: 'Armoires (API)', component: ArmoiresInformatisees },
    { id: 'centralisation', name: 'Analyses GHT', component: CentralisationAchats }
  ];

  // Composant actif selon l'onglet selectionne
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  return (
    <div className="app">
      {/* En-tete de l'application */}
      <header className="header">
        <div className="header-left">
          <h1>Pharmacie PUI</h1>
          <p className="header-subtitle">Hôpital Central</p>
        </div>
        {stats && (
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Valeur Stock</span>
              <span className="stat-value">{stats.valeur_stock_total?.toLocaleString()} €</span>
            </div>
            <div className="stat-item alert">
              <span className="stat-label">Alertes</span>
              <span className="stat-value">{stats.alertes_actives}</span>
            </div>
            <div className="stat-item warning">
              <span className="stat-label">Perimes 30j</span>
              <span className="stat-value">{stats.medicaments_a_perimer_30j}</span>
            </div>
          </div>
        )}
      </header>
      
      {/* Barre de navigation */}
      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      {/* Contenu principal */}
      <main className="main-content">
        <ActiveComponent API_URL={API_URL} />
      </main>
    </div>
  );
};

export default App;