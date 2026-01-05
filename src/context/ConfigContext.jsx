import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  // Configuration par défaut étendue
  const [config, setConfig] = useState({
    openingTime: '08:00',
    closingTime: '22:00',
    isShopOpen: true,
    phoneNumber: '+242 06 000 0000',
    address: 'Centre Ville, Pointe-Noire',
    bannerMessage: '',
    maintenanceMode: false,
    
    // NOUVEAU : Gestion Livraison & Catégories
    deliveryRatePerKm: 500, // Prix par Km
    bakeryLocation: { lat: -4.793, lng: 11.853 }, // Position par défaut (Pointe-Noire approx)
    categories: [
      { id: 'cat_1', name: 'Gâteaux', isFeatured: true },
      { id: 'cat_2', name: 'Viennoiseries', isFeatured: true },
      { id: 'cat_3', name: 'Boissons', isFeatured: false },
      { id: 'cat_4', name: 'Salé', isFeatured: false }
    ]
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        // On fusionne pour ne rien perdre si de nouveaux champs sont ajoutés
        setConfig(prev => ({ ...prev, ...doc.data() }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const checkIsOpen = () => {
    if (!config.isShopOpen) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = config.openingTime.split(':').map(Number);
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    const openTimeVal = openH * 60 + openM;
    const closeTimeVal = closeH * 60 + closeM;
    return currentTime >= openTimeVal && currentTime < closeTimeVal;
  };

  const isOpenNow = checkIsOpen();

  return (
    <ConfigContext.Provider value={{ config, loading, isOpenNow }}>
      {children}
    </ConfigContext.Provider>
  );
};
