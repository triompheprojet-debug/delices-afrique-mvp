import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Save, Clock, Smartphone, MapPin, Globe, MessageSquare, 
  CheckCircle, AlertTriangle, Truck, List, Plus, Star, Trash2, Edit2, X, Check 
} from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // --- ÉTATS POUR GESTION CATÉGORIES ---
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState(null); // ID de la catégorie en cours d'édition
  const [editName, setEditName] = useState('');     // Nom temporaire pendant l'édition

  // État initial global
  const [config, setConfig] = useState({
    openingTime: '08:00',
    closingTime: '22:00',
    isShopOpen: true,
    phoneNumber: '+242 06 000 0000',
    address: 'Centre Ville, Pointe-Noire',
    bannerMessage: '',
    maintenanceMode: false,
    deliveryRatePerKm: 500,
    bakeryLocation: { lat: -4.793, lng: 11.853 },
    categories: [] 
  });

  // 1. Charger les configurations
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig(prev => ({ 
            ...prev, 
            ...data,
            categories: data.categories || [] 
          }));
        } else {
          await setDoc(docRef, config);
        }
      } catch (error) {
        console.error("Erreur chargement settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Sauvegarder tout
  const handleSave = async (e) => {
    if(e) e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const docRef = doc(db, "settings", "config");
      await setDoc(docRef, config);
      
      setSuccessMsg('Paramètres mis à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // --- LOGIQUE CATÉGORIES (AJOUT / EDIT / DELETE) ---

  // A. Ajouter
  const addCategory = () => {
    if (!newCatName.trim()) return;
    
    // Génère un ID unique simple basé sur le timestamp et un nombre aléatoire
    const newId = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const newCat = { 
      id: newId, 
      name: newCatName.trim(), 
      isFeatured: false // Par défaut non affiché dans la navbar pour éviter de la surcharger
    };

    setConfig(prev => ({ ...prev, categories: [...(prev.categories || []), newCat] }));
    setNewCatName('');
  };

  // B. Supprimer
  const removeCategory = (id) => {
    if(window.confirm("Supprimer cette catégorie ? Les produits liés devront être reclassés.")) {
      setConfig(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    }
  };

  // C. Activer/Désactiver "Featured" (Navbar)
  const toggleFeatured = (id) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === id ? { ...c, isFeatured: !c.isFeatured } : c
      )
    }));
  };

  // D. Commencer l'édition
  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  // E. Sauvegarder l'édition (Renommer)
  const saveEdit = (id) => {
    if (!editName.trim()) return;
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === id ? { ...c, name: editName.trim() } : c
      )
    }));
    setEditingId(null);
    setEditName('');
  };

  // Calcul du nombre de catégories actives dans la navbar
  const featuredCount = config.categories?.filter(c => c.isFeatured).length || 0;

  if (loading) return <div className="p-10 text-center flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div></div>;

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Globe className="text-brand-brown"/> Configuration Globale
      </h1>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1 : ÉTAT & HORAIRES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-600"/> Disponibilité & Horaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition ${config.isShopOpen ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div>
                <span className="font-bold block text-gray-800">État de la boutique</span>
                <span className="text-xs text-gray-500">{config.isShopOpen ? 'Actuellement OUVERT' : 'Actuellement FERMÉ'}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.isShopOpen} onChange={(e) => setConfig({...config, isShopOpen: e.target.checked})} className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
             <div className="flex gap-4 items-center">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Ouverture</label>
                    <input type="time" value={config.openingTime} onChange={(e) => setConfig({...config, openingTime: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50"/>
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Fermeture</label>
                    <input type="time" value={config.closingTime} onChange={(e) => setConfig({...config, closingTime: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50"/>
                 </div>
             </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
             <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500"/> Mode Maintenance</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.maintenanceMode} onChange={(e) => setConfig({...config, maintenanceMode: e.target.checked})} className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
             </label>
          </div>
        </div>

        {/* SECTION 2 : INFORMATIONS PUBLIQUES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-brand-brown"/> Coordonnées
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Téléphone</label>
               <input type="text" value={config.phoneNumber} onChange={(e) => setConfig({...config, phoneNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 mt-1"/>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Adresse</label>
               <input type="text" value={config.address} onChange={(e) => setConfig({...config, address: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 mt-1"/>
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Message Bannière (Optionnel)</label>
               <input type="text" value={config.bannerMessage} onChange={(e) => setConfig({...config, bannerMessage: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 mt-1" placeholder="Ex: Promo -20% ce weekend !"/>
            </div>
          </div>
        </div>

        {/* SECTION 3 : GESTION LIVRAISON */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Truck size={20} className="text-green-600"/> Livraison
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Prix par km (FCFA)</label>
              <input type="number" value={config.deliveryRatePerKm} onChange={e => setConfig({...config, deliveryRatePerKm: Number(e.target.value)})} className="w-full border border-gray-300 p-3 rounded-lg text-lg font-bold text-green-700" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">GPS Boutique (Lat / Lng)</label>
              <div className="flex gap-2">
                <input type="number" step="0.0001" value={config.bakeryLocation?.lat || ''} onChange={e => setConfig({...config, bakeryLocation: {...config.bakeryLocation, lat: Number(e.target.value)}})} className="w-full border p-3 rounded-lg" placeholder="Lat" />
                <input type="number" step="0.0001" value={config.bakeryLocation?.lng || ''} onChange={e => setConfig({...config, bakeryLocation: {...config.bakeryLocation, lng: Number(e.target.value)}})} className="w-full border p-3 rounded-lg" placeholder="Lng" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 : GESTION CATÉGORIES (AMÉLIORÉE) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <List size={20} className="text-purple-600"/> Catégories & Menu
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                   Sélectionnez les catégories à afficher dans la barre de navigation.
                </p>
             </div>
             <div className={`px-3 py-1 rounded-full text-xs font-bold border ${featuredCount > 5 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                {featuredCount} / 5 dans la Navbar
             </div>
          </div>

          {/* Formulaire d'ajout */}
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Nouvelle catégorie (ex: Glaces)..." 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none transition"
            />
            <button type="button" onClick={addCategory} className="bg-purple-600 text-white px-6 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 active:scale-95 transition">
              <Plus size={20}/> Ajouter
            </button>
          </div>

          {/* Liste des catégories */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {(!config.categories || config.categories.length === 0) && (
              <p className="text-center text-gray-400 py-8 italic border-2 border-dashed border-gray-100 rounded-xl">
                 Aucune catégorie définie. Ajoutez-en une ci-dessus.
              </p>
            )}

            {config.categories?.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl group hover:bg-white hover:shadow-md transition-all duration-200">
                
                {/* Mode Édition vs Mode Lecture */}
                {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                        <input 
                            autoFocus
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 border-2 border-purple-300 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-800 focus:outline-none"
                        />
                        <button type="button" onClick={() => saveEdit(cat.id)} className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200"><Check size={16}/></button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200"><X size={16}/></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">{cat.name}</span>
                        <button type="button" onClick={() => startEdit(cat)} className="text-gray-300 hover:text-purple-600 transition">
                            <Edit2 size={14}/>
                        </button>
                    </div>
                )}

                {/* Actions Droite */}
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => toggleFeatured(cat.id)} 
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold border transition ${
                        cat.isFeatured 
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Star size={14} fill={cat.isFeatured ? "currentColor" : "none"} className={cat.isFeatured ? "text-yellow-500" : ""}/>
                    {cat.isFeatured ? 'Visible' : 'Masqué'}
                  </button>
                  
                  <button type="button" onClick={() => removeCategory(cat.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOUTON SAUVEGARDER (Sticky Bottom) */}
        <div className="sticky bottom-4 z-20">
           {successMsg && (
             <div className="mb-4 bg-green-100 text-green-800 p-4 rounded-xl flex items-center justify-center gap-2 animate-bounce shadow-lg border border-green-200">
                <CheckCircle size={20}/> {successMsg}
             </div>
           )}
           <button type="submit" disabled={saving} className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 border-2 border-brand-brown hover:border-gray-800">
             {saving ? 'Sauvegarde en cours...' : <><Save size={20}/> Enregistrer les modifications</>}
           </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;