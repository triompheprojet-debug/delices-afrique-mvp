import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Save, 
  Clock, 
  Power, 
  Smartphone, 
  MapPin, 
  Globe, 
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // État initial du formulaire
  const [config, setConfig] = useState({
    openingTime: '08:00',
    closingTime: '22:00',
    isShopOpen: true, // Si false, le site est fermé manuellement
    phoneNumber: '+242 06 000 0000',
    address: 'Centre Ville, Pointe-Noire',
    bannerMessage: 'Bienvenue chez nous !', // Message défilant ou titre
    maintenanceMode: false // Si true, site inaccessible
  });

  // 1. Charger les configurations au démarrage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setConfig({ ...config, ...docSnap.data() });
        } else {
          // Si le document n'existe pas encore, on le crée avec les valeurs par défaut
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

  // 2. Sauvegarder les modifications
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const docRef = doc(db, "settings", "config");
      await setDoc(docRef, config);
      
      setSuccessMsg('Paramètres mis à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000); // Effacer message après 3s
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement des paramètres...</div>;

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Globe className="text-brand-brown"/> Configuration du Site
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* --- SECTION 1 : ÉTAT & HORAIRES --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-600"/> Disponibilité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Switch Ouverture Manuelle */}
            <div className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition ${config.isShopOpen ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div>
                <span className="font-bold block text-gray-800">État de la boutique</span>
                <span className="text-xs text-gray-500">{config.isShopOpen ? 'Actuellement OUVERT' : 'Actuellement FERMÉ (Force)'}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.isShopOpen} 
                  onChange={(e) => setConfig({...config, isShopOpen: e.target.checked})} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Switch Maintenance */}
            <div className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition ${config.maintenanceMode ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
              <div>
                <span className="font-bold block text-gray-800 flex items-center gap-1">Mode Maintenance <AlertTriangle size={14} className="text-orange-500"/></span>
                <span className="text-xs text-gray-500">Bloque l'accès au site client</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.maintenanceMode} 
                  onChange={(e) => setConfig({...config, maintenanceMode: e.target.checked})} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Heure d'ouverture</label>
                <input 
                  type="time" 
                  value={config.openingTime} 
                  onChange={(e) => setConfig({...config, openingTime: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Heure de fermeture</label>
                <input 
                  type="time" 
                  value={config.closingTime} 
                  onChange={(e) => setConfig({...config, closingTime: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                />
             </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">Ces horaires peuvent être utilisés pour afficher automatiquement "Fermé" sur le site.</p>
        </div>

        {/* --- SECTION 2 : INFORMATIONS PUBLIQUES --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-brand-brown"/> Coordonnées & Affichage
          </h2>

          <div className="space-y-4">
            <div>
               <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Smartphone size={16}/> Téléphone Public</label>
               <input 
                 type="text" 
                 value={config.phoneNumber} 
                 onChange={(e) => setConfig({...config, phoneNumber: e.target.value})}
                 className="w-full border border-gray-300 rounded-lg p-3"
                 placeholder="+242..."
               />
            </div>
            
            <div>
               <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><MapPin size={16}/> Adresse Boutique</label>
               <input 
                 type="text" 
                 value={config.address} 
                 onChange={(e) => setConfig({...config, address: e.target.value})}
                 className="w-full border border-gray-300 rounded-lg p-3"
                 placeholder="Adresse complète"
               />
            </div>

            <div>
               <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><MessageSquare size={16}/> Message d'annonce (Bannière)</label>
               <input 
                 type="text" 
                 value={config.bannerMessage} 
                 onChange={(e) => setConfig({...config, bannerMessage: e.target.value})}
                 className="w-full border border-gray-300 rounded-lg p-3"
                 placeholder="Ex: Promo -20% ce weekend !"
               />
            </div>
          </div>
        </div>

        {/* --- BOUTON SAUVEGARDER --- */}
        <div className="sticky bottom-4">
           {successMsg && (
             <div className="mb-4 bg-green-100 text-green-800 p-4 rounded-xl flex items-center gap-2 animate-bounce">
                <CheckCircle size={20}/> {successMsg}
             </div>
           )}
           
           <button 
             type="submit" 
             disabled={saving}
             className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
           >
             {saving ? 'Enregistrement...' : <><Save size={20}/> Enregistrer les paramètres</>}
           </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;