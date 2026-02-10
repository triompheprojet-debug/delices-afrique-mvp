/**
 * ========================================
 * DÉLICES D'AFRIQUE - usePartner Hook
 * Gestion des données partenaires
 * ========================================
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getPartnerLevel, calculatePartnerEarnings, calculateLevelProgress } from '../utils/calculations';
import { createWithdrawal } from '../utils/firebase-helpers';

/**
 * Hook personnalisé pour les partenaires
 * Récupère et gère les données en temps réel
 * 
 * @param {string} partnerId - ID du partenaire (optionnel si on utilise l'auth)
 * @returns {object} Données et fonctions partenaire
 */
export const usePartner = (partnerId) => {
  const [partner, setPartner] = useState(null);
  const [sales, setSales] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    available: 0,
    withdrawn: 0,
    pending: 0
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    level: 'standard',
    progress: { percentage: 0, salesNeeded: 0, nextLevel: 'actif' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Écoute les données du partenaire en temps réel
  useEffect(() => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    const partnerRef = doc(db, 'partners', partnerId);
    
    const unsubscribe = onSnapshot(
      partnerRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const partnerData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          setPartner(partnerData);

          // Calculer le niveau et la progression
          const currentLevel = getPartnerLevel(partnerData.totalSales);
          const progress = calculateLevelProgress(partnerData.totalSales, currentLevel);

          setStats({
            totalSales: partnerData.totalSales || 0,
            level: currentLevel,
            progress
          });

          setEarnings({
            total: partnerData.totalEarnings || 0,
            available: partnerData.walletBalance || 0,
            withdrawn: partnerData.totalWithdrawn || 0,
            pending: (partnerData.totalEarnings || 0) - (partnerData.totalWithdrawn || 0) - (partnerData.walletBalance || 0)
          });

          setLoading(false);
        } else {
          setError('Partenaire non trouvé');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erreur lors de l\'écoute des données partenaire:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [partnerId]);

  // Récupère l'historique des ventes
  useEffect(() => {
    if (!partnerId) return;

    const fetchSales = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('promo.partnerId', '==', partnerId),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const salesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSales(salesData);
      } catch (err) {
        console.error('Erreur lors de la récupération des ventes:', err);
      }
    };

    fetchSales();
  }, [partnerId]);

  /**
   * Met à jour les informations du partenaire
   * 
   * @param {object} updates - Champs à mettre à jour
   * @returns {Promise<void>}
   */
  const updatePartner = async (updates) => {
    if (!partnerId) {
      throw new Error('ID partenaire manquant');
    }

    try {
      const partnerRef = doc(db, 'partners', partnerId);
      await updateDoc(partnerRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour du partenaire:', err);
      throw err;
    }
  };

  /**
   * Demande un retrait de gains
   * 
   * @param {number} amount - Montant à retirer
   * @param {object} paymentInfo - Informations de paiement { operator, phone, recipientName }
   * @returns {Promise<string>} ID du retrait créé
   */
  const requestPayout = async (amount, paymentInfo) => {
    if (!partnerId || !partner) {
      throw new Error('Données partenaire manquantes');
    }

    try {
      // Vérifier le solde disponible
      if (amount > earnings.available) {
        throw new Error('Solde insuffisant');
      }

      // Vérifier le montant minimum selon le niveau
      const minAmounts = {
        standard: 2000,
        actif: 3000,
        premium: 5000
      };

      const minAmount = minAmounts[stats.level] || 2000;

      if (amount < minAmount) {
        throw new Error(`Le montant minimum de retrait pour le niveau ${stats.level} est de ${minAmount} FCFA`);
      }

      // Créer la demande de retrait
      const withdrawalData = {
        partnerId,
        partnerName: partner.fullName,
        recipientName: paymentInfo.recipientName || partner.fullName,
        phone: paymentInfo.phone || partner.phone,
        operator: paymentInfo.operator || 'Mobile Money',
        amount
      };

      const withdrawalId = await createWithdrawal(withdrawalData);

      // Mettre à jour le wallet du partenaire
      await updatePartner({
        walletBalance: earnings.available - amount
      });

      return withdrawalId;
    } catch (err) {
      console.error('Erreur lors de la demande de retrait:', err);
      throw err;
    }
  };

  /**
   * Récupère l'historique des retraits
   * 
   * @returns {Promise<array>} Liste des retraits
   */
  const getWithdrawals = async () => {
    if (!partnerId) return [];

    try {
      const withdrawalsRef = collection(db, 'withdrawals');
      const q = query(
        withdrawalsRef,
        where('partnerId', '==', partnerId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Erreur lors de la récupération des retraits:', err);
      return [];
    }
  };

  /**
   * Récupère les statistiques détaillées
   * 
   * @returns {object} Statistiques détaillées
   */
  const getDetailedStats = () => {
    const deliveredSales = sales.filter(sale => sale.status === 'Livré');
    const pendingSales = sales.filter(sale => sale.status !== 'Livré' && sale.status !== 'Annulé');
    const thisMonthSales = sales.filter(sale => {
      const saleDate = sale.createdAt?.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt);
      const now = new Date();
      return saleDate.getMonth() === now.getMonth() && 
             saleDate.getFullYear() === now.getFullYear();
    });

    return {
      totalOrders: sales.length,
      deliveredOrders: deliveredSales.length,
      pendingOrders: pendingSales.length,
      thisMonthOrders: thisMonthSales.length,
      conversionRate: sales.length > 0 ? (deliveredSales.length / sales.length * 100).toFixed(2) : 0,
      averageCommission: deliveredSales.length > 0 
        ? Math.round(deliveredSales.reduce((sum, sale) => sum + (sale.promo?.partnerCommission || 0), 0) / deliveredSales.length)
        : 0
    };
  };

  return {
    partner,
    sales,
    earnings,
    stats,
    loading,
    error,
    updatePartner,
    requestPayout,
    getWithdrawals,
    getDetailedStats,
    // Helpers
    isActive: partner?.isActive || false,
    promoCode: partner?.promoCode || '',
    level: stats.level,
    progress: stats.progress
  };
};

export default usePartner;