/**
 * ========================================
 * Délices d'Afrique - CONFIG CONTEXT
 * Gestion de la configuration globale
 * ========================================
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { calculatePartnerBenefits } from '../utils/calculations';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  
  // État de l'heure actuelle (Mis à jour chaque minute)
  const [now, setNow] = useState(new Date());

  // Configuration par défaut
  const [config, setConfig] = useState({
    openingTime: '08:00',
    closingTime: '22:00',
    isShopOpen: true,
    phoneNumber: '+242 06 000 0000',
    deliveryRatePerKm: 500,
    partnerRules: {
      baseMargin: 1000, // ✅ Marge de base protégée (1000 FCFA)
      surplusSplit: { platform: 0.50, partner: 0.30, client: 0.20 }, // ✅ Répartition 50/30/20
      levels: {
        standard: { minSales: 0, baseComm: 150, baseDisc: 150 },
        actif: { minSales: 30, baseComm: 250, baseDisc: 200 }, // ✅ CORRIGÉ: "actif" au lieu de "active"
        premium: { minSales: 150, baseComm: 300, baseDisc: 200 }
      }
    }
  });

  // 1. Écoute les réglages Firebase (Si Admin change l'heure, ça met à jour ici)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        setConfig(prev => ({ ...prev, ...doc.data() }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Horloge interne (Tick chaque minute)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date()); 
    }, 60000); // 60s
    return () => clearInterval(timer);
  }, []);

  // 3. Calcul de l'état OUVERT/FERMÉ (Recalculé quand 'config' ou 'now' change)
  const statusInfo = useMemo(() => {
    if (!config.openingTime || !config.closingTime) {
      return { isOpenNow: false, isClosedForNight: false };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = config.openingTime.split(':').map(Number);
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    
    const openTimeVal = openH * 60 + openM;
    const closeTimeVal = closeH * 60 + closeM;

    // Logique d'ouverture (pour les clients)
    const isOpenNow = config.isShopOpen && currentMinutes >= openTimeVal && currentMinutes < closeTimeVal;
  
    // Si l'heure actuelle est >= heure fermeture, c'est la nuit.
    const isClosedForNight = currentMinutes >= closeTimeVal;

    return { isOpenNow, isClosedForNight };
  }, [config, now]);

  /**
   * ✅ FONCTION WRAPPER pour calculatePartnerBenefits
   * Utilise la fonction importée de calculations.js au lieu de la dupliquer
   * Passe automatiquement la config comme dernier paramètre
   */
  const calculateBenefits = (productPrice, productBuyingPrice, totalSalesOfPartner = 0) => {
    return calculatePartnerBenefits(productPrice, productBuyingPrice, totalSalesOfPartner, config);
  };

  return (
    <ConfigContext.Provider value={{ 
      config, 
      loading, 
      isOpenNow: statusInfo.isOpenNow, 
      isClosedForNight: statusInfo.isClosedForNight,
      calculatePartnerBenefits: calculateBenefits // ✅ Wrapper au lieu de duplication
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;