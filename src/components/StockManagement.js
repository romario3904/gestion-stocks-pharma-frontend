import React, { useState, useEffect, useCallback } from 'react';

const StockManagement = ({ API_URL }) => {
  // Etats du composant
  const [medicaments, setMedicaments] = useState([]);
  const [filteredMedicaments, setFilteredMedicaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editMedicament, setEditMedicament] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'B',
    quantite: 0,
    seuil_secu: 100,
    prix_unitaire: 0,
    peremption: '',
    fournisseur: '',
    consommation_mensuelle: 0,
    duree_vie_jours: 730,
    substitution_possible: false,
    substituts: ''
  });

  // Chargement des medicaments
  const fetchMedicaments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/medicaments`);
      const data = await response.json();
      setMedicaments(data);
    } catch (error) {
      console.error('Erreur chargement medicaments:', error);
    }
  }, [API_URL]);

  // Filtrage des medicaments
  const filterMedicaments = useCallback(() => {
    let filtered = [...medicaments];
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categorieFilter !== 'all') {
      filtered = filtered.filter(m => m.categorie === categorieFilter);
    }
    
    setFilteredMedicaments(filtered);
  }, [medicaments, searchTerm, categorieFilter]);

  useEffect(() => {
    fetchMedicaments();
  }, [fetchMedicaments]);

  useEffect(() => {
    filterMedicaments();
  }, [filterMedicaments]);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const medicamentData = {
        ...formData,
        substituts: formData.substituts.split(',').map(s => s.trim()).filter(s => s)
      };
      
      const url = editMedicament 
        ? `${API_URL}/medicaments/${editMedicament.id}`
        : `${API_URL}/medicaments`;
      
      const method = editMedicament ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicamentData)
      });
      
      if (response.ok) {
        fetchMedicaments();
        setShowForm(false);
        setEditMedicament(null);
        resetForm();
        alert(editMedicament ? 'Medicament modifie avec succes' : 'Medicament ajoute avec succes');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Edition d'un medicament
  const handleEdit = (medicament) => {
    setEditMedicament(medicament);
    setFormData({
      ...medicament,
      substituts: medicament.substituts?.join(', ') || ''
    });
    setShowForm(true);
  };

  // Reinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      categorie: 'B',
      quantite: 0,
      seuil_secu: 100,
      prix_unitaire: 0,
      peremption: '',
      fournisseur: '',
      consommation_mensuelle: 0,
      duree_vie_jours: 730,
      substitution_possible: false,
      substituts: ''
    });
  };

  // Statut du stock
  const getStockStatus = (quantite, seuil) => {
    if (quantite <= seuil * 0.5) return { class: 'critical', text: 'Critique' };
    if (quantite <= seuil) return { class: 'warning', text: 'Faible' };
    if (quantite >= seuil * 3) return { class: 'high', text: 'Surstock' };
    return { class: 'normal', text: 'Normal' };
  };

  // Jours restants avant peremption
  const getJoursRestants = (datePeremption) => {
    const diffTime = new Date(datePeremption) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calcul de la valeur totale du stock
  const valeurTotaleStock = filteredMedicaments.reduce((sum, m) => sum + (m.quantite * m.prix_unitaire), 0);

  return (
    <div className="stock-management">
      {/* En-tete avec indicateurs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Valeur totale stock</h3>
          <div className="kpi-value">{valeurTotaleStock.toLocaleString()} €</div>
        </div>
        <div className="kpi-card">
          <h3>References actives</h3>
          <div className="kpi-value">{filteredMedicaments.length}</div>
        </div>
        <div className="kpi-card warning">
          <h3>Alertes critiques</h3>
          <div className="kpi-value">{filteredMedicaments.filter(m => m.quantite <= m.seuil_secu).length}</div>
        </div>
        <div className="kpi-card info">
          <h3>Peremption proche</h3>
          <div className="kpi-value">{filteredMedicaments.filter(m => getJoursRestants(m.peremption) < 90).length}</div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un medicament..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={categorieFilter} 
          onChange={(e) => setCategorieFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Toutes categories</option>
          <option value="A">Categorie A (haute valeur)</option>
          <option value="B">Categorie B (valeur moyenne)</option>
          <option value="C">Categorie C (faible valeur)</option>
        </select>
        <button className="btn-primary" onClick={() => {
          setShowForm(true);
          setEditMedicament(null);
          resetForm();
        }}>
          Nouveau medicament
        </button>
      </div>

      {/* Tableau des medicaments */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Nom du medicament</th>
            <th>Cat.</th>
            <th>Stock actuel</th>
            <th>Seuil</th>
            <th>Statut</th>
            <th>Prix unitaire</th>
            <th>Valeur totale</th>
            <th>Peremption</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedicaments.map(med => {
            const status = getStockStatus(med.quantite, med.seuil_secu);
            const valeurTotale = med.quantite * med.prix_unitaire;
            const joursRestants = getJoursRestants(med.peremption);
            
            return (
              <tr key={med.id}>
                <td><strong>{med.nom}</strong></td>
                <td><span className={`badge-categorie ${med.categorie}`}>{med.categorie}</span></td>
                <td>{med.quantite}</td>
                <td>{med.seuil_secu}</td>
                <td><span className={`status-badge ${status.class}`}>{status.text}</span></td>
                <td>{med.prix_unitaire} €</td>
                <td>{valeurTotale.toFixed(2)} €</td>
                <td className={joursRestants < 90 ? 'expiring' : ''}>
                  {med.peremption}
                  <br/>
                  <small>{joursRestants} jours restants</small>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(med)}>Modifier</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Formulaire modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editMedicament ? 'Modifier medicament' : 'Ajouter medicament'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Categorie</label>
                  <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})}>
                    <option value="A">A (Haute priorite)</option>
                    <option value="B">B (Priorite moyenne)</option>
                    <option value="C">C (Basse priorite)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantite</label>
                  <input type="number" value={formData.quantite} onChange={(e) => setFormData({...formData, quantite: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Seuil securite</label>
                  <input type="number" value={formData.seuil_secu} onChange={(e) => setFormData({...formData, seuil_secu: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Prix unitaire (€)</label>
                  <input type="number" step="0.01" value={formData.prix_unitaire} onChange={(e) => setFormData({...formData, prix_unitaire: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Date peremption</label>
                  <input type="date" value={formData.peremption} onChange={(e) => setFormData({...formData, peremption: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Fournisseur</label>
                  <input type="text" value={formData.fournisseur} onChange={(e) => setFormData({...formData, fournisseur: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Consommation mensuelle</label>
                  <input type="number" value={formData.consommation_mensuelle} onChange={(e) => setFormData({...formData, consommation_mensuelle: parseInt(e.target.value) || 0})} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;