import React, { useState } from 'react';
import { Save, Store, Clock, Phone, MapPin, Globe, Power, Palette } from 'lucide-react';

const Settings = () => {
  // État local pour simuler la sauvegarde des paramètres
  const [settings, setSettings] = useState({
    siteName: "Délices d'Afrique",
    phone: "06 123 45 67",
    whatsapp: "06 123 45 67",
    address: "Avenue de la Paix, Pointe-Noire",
    email: "contact@delices-afrique.com",
    isStoreOpen: true, // Pour gérer la fermeture temporaire 
    closingMessage: "Nous sommes actuellement fermés pour travaux. Réouverture lundi !",
    socials: {
      facebook: "https://facebook.com/delices",
      instagram: "https://instagram.com/delices"
    }
  });

  // Gestion des horaires (simplifiée pour le prototype) 
  const [hours, setHours] = useState([
    { day: 'Lundi', open: '07:30', close: '19:00', closed: false },
    { day: 'Mardi', open: '07:30', close: '19:00', closed: false },
    { day: 'Mercredi', open: '07:30', close: '19:00', closed: false },
    { day: 'Jeudi', open: '07:30', close: '19:00', closed: false },
    { day: 'Vendredi', open: '07:30', close: '19:00', closed: false },
    { day: 'Samedi', open: '08:00', close: '20:00', closed: false },
    { day: 'Dimanche', open: '', close: '', closed: true }, // 
  ]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Paramètres sauvegardés avec succès ! (Simulation)");
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Paramètres du site</h1>
          <p className="text-gray-500">Gérez les informations visibles par vos clients.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-brand-brown hover:bg-brand-beige text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg"
        >
          <Save size={20} />
          Enregistrer les modifications
        </button>
      </div>

      <div className="space-y-8">

        {/* 1. Identité & Contact */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
            <Store size={20} /> Identité de la Pâtisserie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nom de l'établissement</label>
              <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email de contact</label>
              <input type="email" name="email" value={settings.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Phone size={14}/> Téléphone (Affiché sur le site)</label>
              <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Globe size={14}/> Numéro WhatsApp</label>
              <input type="text" name="whatsapp" value={settings.whatsapp} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><MapPin size={14}/> Adresse complète</label>
              <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" />
            </div>
          </div>
        </div>

        {/* 2. Horaires d'ouverture */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
            <Clock size={20} /> Horaires d'ouverture
          </h2>
          <div className="grid gap-3">
            {hours.map((h, index) => (
              <div key={index} className="flex items-center gap-4 text-sm">
                <span className="w-24 font-bold text-gray-700">{h.day}</span>
                {h.closed ? (
                  <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded">Fermé</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="time" defaultValue={h.open} className="border border-gray-300 rounded p-1" />
                    <span>à</span>
                    <input type="time" defaultValue={h.close} className="border border-gray-300 rounded p-1" />
                  </div>
                )}
                {/* Toggle Fermé (simulé) */}
                <label className="flex items-center gap-2 ml-auto cursor-pointer">
                  <input type="checkbox" checked={h.closed} readOnly className="rounded text-brand-brown" />
                  <span className="text-xs text-gray-400">Fermé ce jour</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 3. État du site (Ouvert/Fermé) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
            <Power size={20} /> État du site
          </h2>
          
          <div className="flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="font-bold text-gray-800">Mode "Commandes Ouvertes"</h3>
              <p className="text-xs text-gray-500">Si désactivé, les clients verront un message de fermeture.</p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="isStoreOpen" checked={settings.isStoreOpen} onChange={handleChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"/>
              <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.isStoreOpen ? 'bg-green-400' : 'bg-gray-300'}`}></label>
            </div>
          </div>

          {!settings.isStoreOpen && (
             <div className="animate-fade-in-down">
                <label className="block text-sm font-bold text-gray-700 mb-1">Message de fermeture temporaire</label>
                <textarea name="closingMessage" value={settings.closingMessage} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none bg-yellow-50"></textarea>
             </div>
          )}
        </div>

        {/* 4. Apparence (Couleurs) - Optionnel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-70 pointer-events-none">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-brand-brown flex items-center gap-2">
              <Palette size={20} /> Thème & Couleurs (Option Pro)
            </h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Bientôt disponible</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Personnalisez les couleurs du site pour coller à votre marque.</p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#5D4037] border-2 border-gray-200 cursor-pointer ring-2 ring-offset-2 ring-blue-500"></div>
            <div className="w-10 h-10 rounded-full bg-[#E63946] border-2 border-gray-200 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-[#2A9D8F] border-2 border-gray-200 cursor-pointer"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;