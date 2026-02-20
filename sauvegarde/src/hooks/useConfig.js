/**
 * ========================================
 * Délices d'Afrique - useConfig Hook
 * Gestion de la configuration globale
 * ========================================
 */

import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { calculatePartnerBenefits } from '../utils/calculations';

/**
 * Hook personnalisé pour la configuration globale
 * Wrapper du ConfigContext avec fonctions utilitaires
 * 
 * @returns {object} Configuration et helpers
 */
export const useConfig = () => {
  const [config, setConfig] = useState({
    // Paramètres par défaut
    address: '',
    phoneNumber: '+242 06 000 0000',
    bakeryLocation: { lat: 0, lng: 0 },
    openingTime: '08:00',
    closingTime: '22:00',
    isShopOpen: true,
    maintenanceMode: false,
    deliveryRatePerKm: 500,
    bannerMessage: '',
    categories: [],
    // Règles partenaires par défaut
    partnerRules: {
      baseMargin: 1000,
      surplusSplit: { platform: 0.50, partner: 0.30, client: 0.20 },
      levels: {
        standard: { minSales: 0, baseComm: 150, baseDisc: 150, minPayout: 2000 },
        actif: { minSales: 30, baseComm: 250, baseDisc: 200, minPayout: 3000 },
        premium: { minSales: 150, baseComm: 300, baseDisc: 200, minPayout: 5000 }
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État de l'heure actuelle (mis à jour chaque minute)
  const [now, setNow] = useState(new Date());

  // Écoute la configuration en temps réel
  useEffect(() => {
    const configRef = doc(db, 'settings', 'config');
    
    const unsubscribe = onSnapshot(
      configRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(prev => ({
            ...prev,
            ...docSnap.data()
          }));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de l\'écoute de la configuration:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Horloge interne (mise à jour chaque minute)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // 60 secondes

    return () => clearInterval(timer);
  }, []);

  /**
   * Calcule si la boutique est ouverte maintenant
   */
  const isOpenNow = useMemo(() => {
    if (!config.openingTime || !config.closingTime) {
      return false;
    }

    if (config.maintenanceMode) {
      return false;
    }

    if (!config.isShopOpen) {
      return false;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = config.openingTime.split(':').map(Number);
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    
    const openTimeVal = openH * 60 + openM;
    const closeTimeVal = closeH * 60 + closeM;

    return currentMinutes >= openTimeVal && currentMinutes < closeTimeVal;
  }, [config, now]);

  /**
   * Vérifie si c'est après l'heure de fermeture (nuit)
   */
  const isClosedForNight = useMemo(() => {
    if (!config.closingTime) {
      return false;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    const closeTimeVal = closeH * 60 + closeM;

    return currentMinutes >= closeTimeVal;
  }, [config, now]);

  /**
   * Calcule le temps restant avant fermeture
   * 
   * @returns {object} { hours, minutes, isClosingSoon }
   */
  const getTimeUntilClosing = () => {
    if (!config.closingTime) {
      return { hours: 0, minutes: 0, isClosingSoon: false };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    const closeTimeVal = closeH * 60 + closeM;

    const diffMinutes = closeTimeVal - currentMinutes;

    if (diffMinutes <= 0) {
      return { hours: 0, minutes: 0, isClosingSoon: false };
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const isClosingSoon = diffMinutes <= 60; // Moins d'1 heure

    return { hours, minutes, isClosingSoon };
  };

  /**
   * Calcule le temps restant avant ouverture
   * 
   * @returns {object} { hours, minutes }
   */
  const getTimeUntilOpening = () => {
    if (!config.openingTime) {
      return { hours: 0, minutes: 0 };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = config.openingTime.split(':').map(Number);
    const openTimeVal = openH * 60 + openM;

    let diffMinutes = openTimeVal - currentMinutes;

    // Si c'est déjà passé aujourd'hui, calculer pour demain
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return { hours, minutes };
  };

  /**
   * Récupère le tarif de livraison
   * 
   * @returns {number} Tarif par km
   */
  const getDeliveryRate = () => {
    return config.deliveryRatePerKm || 500;
  };

  /**
   * Calcule les frais de livraison pour une distance
   * 
   * @param {number} distance - Distance en km
   * @returns {number} Frais de livraison
   */
  const calculateDeliveryFee = (distance) => {
    const rate = getDeliveryRate();
    return Math.round(distance * rate);
  };

  /**
   * Récupère les règles partenaires
   * 
   * @returns {object} Règles partenaires
   */
  const getPartnerRules = () => {
    return config.partnerRules || {
      baseMargin: 1000,
      surplusSplit: { platform: 0.50, partner: 0.30, client: 0.20 },
      levels: {
        standard: { minSales: 0, baseComm: 150, baseDisc: 150, minPayout: 2000 },
        actif: { minSales: 30, baseComm: 250, baseDisc: 200, minPayout: 3000 },
        premium: { minSales: 150, baseComm: 300, baseDisc: 200, minPayout: 5000 }
      }
    };
  };

  /**
   * Calcule les bénéfices pour un partenaire (wrapper)
   * 
   * @param {number} productPrice - Prix de vente
   * @param {number} productBuyingPrice - Prix fournisseur
   * @param {number} totalSalesOfPartner - Ventes totales du partenaire
   * @returns {object} Bénéfices calculés
   */
  const calculateBenefits = (productPrice, productBuyingPrice, totalSalesOfPartner = 0) => {
    return calculatePartnerBenefits(productPrice, productBuyingPrice, totalSalesOfPartner, config);
  };

  /**
   * Récupère les catégories de produits
   * 
   * @returns {array} Liste des catégories
   */
  const getCategories = () => {
    return config.categories || [];
  };

  /**
   * Récupère les catégories en vedette
   * 
   * @returns {array} Catégories en vedette
   */
  const getFeaturedCategories = () => {
    return (config.categories || []).filter(cat => cat.isFeatured);
  };

  /**
   * Vérifie si une catégorie existe
   * 
   * @param {string} categoryId - ID de la catégorie
   * @returns {boolean}
   */
  const categoryExists = (categoryId) => {
    return (config.categories || []).some(cat => cat.id === categoryId);
  };

  /**
   * Récupère les horaires d'ouverture formatés
   * 
   * @returns {string} Horaires formatés (ex: "8h00 - 22h00")
   */
  const getFormattedHours = () => {
    if (!config.openingTime || !config.closingTime) {
      return 'Horaires non définis';
    }

    const formatHour = (time) => {
      const [hours, minutes] = time.split(':');
      return `${parseInt(hours)}h${minutes}`;
    };

    return `${formatHour(config.openingTime)} - ${formatHour(config.closingTime)}`;
  };

  /**
   * Récupère l'adresse de la pâtisserie
   * 
   * @returns {string} Adresse
   */
  const getAddress = () => {
    return config.address || '';
  };

  /**
   * Récupère le numéro de téléphone
   * 
   * @returns {string} Téléphone
   */
  const getPhoneNumber = () => {
    return config.phoneNumber || '+242 06 000 0000';
  };

  /**
   * Récupère la localisation GPS
   * 
   * @returns {object} { lat, lng }
   */
  const getLocation = () => {
    return config.bakeryLocation || { lat: 0, lng: 0 };
  };

  /**
   * Vérifie si le mode maintenance est actif
   * 
   * @returns {boolean}
   */
  const isMaintenanceMode = () => {
    return config.maintenanceMode || false;
  };

  /**
   * Récupère le message de bannière
   * 
   * @returns {string} Message de bannière
   */
  const getBannerMessage = () => {
    return config.bannerMessage || '';
  };

  return {
    config,
    loading,
    error,
    // État boutique
    isOpenNow,
    isClosedForNight,
    getTimeUntilClosing,
    getTimeUntilOpening,
    // Livraison
    getDeliveryRate,
    calculateDeliveryFee,
    // Partenaires
    getPartnerRules,
    calculateBenefits,
    // Catégories
    getCategories,
    getFeaturedCategories,
    categoryExists,
    // Informations générales
    getFormattedHours,
    getAddress,
    getPhoneNumber,
    getLocation,
    isMaintenanceMode,
    getBannerMessage
  };
};

export default useConfig;