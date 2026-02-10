import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  
  // État de l'heure actuelle (Mis à jour chaque minute)
  const [now, setNow] = useState(new Date());

  // Configuration par défaut
  const [config, setConfig] = useState({
    openingTime: '08:00',
    closingTime: '22:00', // Valeur par défaut
    isShopOpen: true,
    phoneNumber: '+242 06 000 0000',
    deliveryRatePerKm: 500,
    partnerRules: {
        baseMargin: 1000, // ✅ Marge de base protégée (1000 FCFA)
        surplusSplit: { platform: 0.50, partner: 0.30, client: 0.20 }, // ✅ Répartition 50/30/20
        levels: {
            standard: { minSales: 0, baseComm: 150, baseDisc: 150 },
            active: { minSales: 30, baseComm: 250, baseDisc: 200 },
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

  // 4. ✅ CALCUL DES GAINS PARTENAIRES (LOGIQUE CORRECTE - CONFORME À LA DOC)
  /**
   * Cette fonction calcule la redistribution des gains selon le modèle hybride:
   * 
   * RÈGLE 1: Marge de base protégée (1000 FCFA) - Le créateur garde minimum baseMargin
   * RÈGLE 2: Surplus redistribué selon 50/30/20 (plateforme/partenaire/client)
   * RÈGLE 3: Commission et réduction de base selon niveau (Standard/Actif/Premium)
   * RÈGLE 4: Le partenaire ne voit JAMAIS le buyingPrice ni la marge réelle
   * 
   * @param {number} productPrice - Prix de vente public du produit
   * @param {number} productBuyingPrice - Prix d'achat fournisseur (confidentiel)
   * @param {number} totalSalesOfPartner - Ventes cumulées du partenaire (pour niveau)
   * @returns {object} { discountClient, commissionPartner, platformGain, finalPrice }
   */
  const calculatePartnerBenefits = (productPrice, productBuyingPrice, totalSalesOfPartner = 0) => {
    const rules = config.partnerRules || {};
    const levels = rules.levels || {};
    
    const buyingPrice = Number(productBuyingPrice) || 0;
    const sellingPrice = Number(productPrice) || 0;

    // ✅ Récupération des paliers
    const standard = levels.standard || { minSales: 0, baseComm: 0, baseDisc: 0 };
    const active = levels.active || { minSales: 30 };
    const premium = levels.premium || { minSales: 150 };

    // ✅ Détermination du niveau du partenaire
    let level = standard;
    if (totalSalesOfPartner >= premium.minSales) level = premium;
    else if (totalSalesOfPartner >= active.minSales) level = active;

    // ✅ Commission et réduction DE BASE (selon niveau)
    let comm = level.baseComm || 0;
    let disc = level.baseDisc || 0;

    // ✅ CALCUL DU SURPLUS (Marge réelle - Marge de base protégée)
    const margin = sellingPrice - buyingPrice;
    const baseMargin = rules.baseMargin || 1000;
    const surplus = margin - baseMargin;

    // ✅ SI SURPLUS > 0 : Redistribution selon 50/30/20
    if (surplus > 0 && rules.surplusSplit) {
      const partnerBonus = Math.round(surplus * (rules.surplusSplit.partner || 0)); // +30% du surplus
      const clientBonus = Math.round(surplus * (rules.surplusSplit.client || 0));   // +20% du surplus
      
      comm += partnerBonus; // Commission totale = base + bonus
      disc += clientBonus;  // Réduction totale = base + bonus
    }

    // ✅ CALCUL FINAL DU GAIN PLATEFORME
    // Gain Plateforme = Prix de vente - Prix d'achat - Commission Partenaire - Réduction Client
    const platformGain = sellingPrice - buyingPrice - comm - disc;

    return {
      discountClient: Math.round(disc),           // ✅ Arrondi
      commissionPartner: Math.round(comm),        // ✅ Arrondi
      platformGain: Math.round(platformGain),     // ✅ Arrondi
      finalPrice: Math.round(sellingPrice - disc) // ✅ FIX BUG-15 : Arrondi pour éviter centimes
    };
  };

  return (
    <ConfigContext.Provider value={{ 
        config, 
        loading, 
        isOpenNow: statusInfo.isOpenNow, 
        isClosedForNight: statusInfo.isClosedForNight, // La variable clé
        calculatePartnerBenefits // ✅ Fonction exportée (CORRECTE)
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;