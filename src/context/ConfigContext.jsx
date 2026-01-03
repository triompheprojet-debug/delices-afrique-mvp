import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    openingTime: '08:00',
    closingTime: '22:00',
    isShopOpen: true,
    phoneNumber: '+242 06 000 0000',
    address: 'Centre Ville',
    bannerMessage: '',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écoute en temps réel du document 'settings/config'
    const unsubscribe = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fonction utilitaire pour vérifier si c'est ouvert (Heure + Switch Admin)
  const checkIsOpen = () => {
    if (!config.isShopOpen) return false; // Fermé manuellement par l'admin

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit

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