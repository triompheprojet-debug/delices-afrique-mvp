/**
 * ========================================
 * DÉLICES D'AFRIQUE - useSupplier Hook
 * Gestion des données fournisseurs
 * ========================================
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateSupplierEarnings } from '../utils/calculations';
import { 
  getSupplierOrders, 
  updateOrderStatus, 
  createSettlement,
  getSupplierProducts 
} from '../utils/firebase-helpers';

/**
 * Hook personnalisé pour les fournisseurs
 * Récupère et gère les données en temps réel
 * 
 * @param {string} supplierId - ID du fournisseur
 * @returns {object} Données et fonctions fournisseur
 */
export const useSupplier = (supplierId) => {
  const [supplier, setSupplier] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [finances, setFinances] = useState({
    totalEarned: 0,
    platformDebt: 0,
    deliveryEarned: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Écoute les données du fournisseur en temps réel
  useEffect(() => {
    if (!supplierId) {
      setLoading(false);
      return;
    }

    const supplierRef = doc(db, 'suppliers', supplierId);
    
    const unsubscribe = onSnapshot(
      supplierRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const supplierData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          setSupplier(supplierData);

          // Mettre à jour les finances depuis le wallet
          setFinances({
            totalEarned: supplierData.wallet?.totalEarned || 0,
            platformDebt: supplierData.wallet?.platformDebt || 0,
            deliveryEarned: 0, // À calculer depuis les commandes
            netBalance: (supplierData.wallet?.totalEarned || 0) - (supplierData.wallet?.platformDebt || 0)
          });

          setLoading(false);
        } else {
          setError('Fournisseur non trouvé');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erreur lors de l\'écoute des données fournisseur:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [supplierId]);

  // Récupère la commande courante et compte les commandes en attente
  useEffect(() => {
    if (!supplierId) return;

    const ordersRef = collection(db, 'orders');
    
    // Écoute la commande "En attente" ou "En préparation" la plus ancienne
    const currentOrderQuery = query(
      ordersRef,
      where('supplierId', '==', supplierId),
      where('status', 'in', ['En attente', 'En préparation']),
      orderBy('createdAt', 'asc'),
      limit(1)
    );

    const unsubscribeCurrent = onSnapshot(currentOrderQuery, (snapshot) => {
      if (!snapshot.empty) {
        setCurrentOrder({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        });
      } else {
        setCurrentOrder(null);
      }
    });

    // Compte toutes les commandes en attente
    const pendingOrdersQuery = query(
      ordersRef,
      where('supplierId', '==', supplierId),
      where('status', 'in', ['En attente', 'En préparation', 'En livraison'])
    );

    const unsubscribePending = onSnapshot(pendingOrdersQuery, (snapshot) => {
      setPendingOrdersCount(snapshot.size);
    });

    return () => {
      unsubscribeCurrent();
      unsubscribePending();
    };
  }, [supplierId]);

  // Récupère les produits du fournisseur
  useEffect(() => {
    if (!supplierId) return;

    const fetchProducts = async () => {
      try {
        const productsData = await getSupplierProducts(supplierId);
        setProducts(productsData);
      } catch (err) {
        console.error('Erreur lors de la récupération des produits:', err);
      }
    };

    fetchProducts();
  }, [supplierId]);

  /**
   * Met à jour le statut de la commande courante
   * 
   * @param {string} newStatus - Nouveau statut
   * @returns {Promise<void>}
   */
  const updateCurrentOrderStatus = async (newStatus) => {
    if (!currentOrder) {
      throw new Error('Aucune commande en cours');
    }

    try {
      await updateOrderStatus(currentOrder.id, newStatus);
      
      // Si passé à "En livraison", programmer le passage automatique à "Livré" après 2h
      if (newStatus === 'En livraison') {
        // Cette logique serait mieux gérée côté Cloud Functions
        // Mais on peut la simuler côté client pour le moment
        setTimeout(async () => {
          try {
            // Vérifier que la commande est toujours en livraison
            const orderRef = doc(db, 'orders', currentOrder.id);
            const orderSnap = await getDoc(orderRef);
            
            if (orderSnap.exists() && orderSnap.data().status === 'En livraison') {
              await updateOrderStatus(currentOrder.id, 'Livré');
            }
          } catch (err) {
            console.error('Erreur passage automatique Livré:', err);
          }
        }, 2 * 60 * 60 * 1000); // 2 heures
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      throw err;
    }
  };

  /**
   * Annule la commande courante
   * 
   * @param {string} reason - Raison de l'annulation
   * @returns {Promise<void>}
   */
  const cancelCurrentOrder = async (reason) => {
    if (!currentOrder) {
      throw new Error('Aucune commande en cours');
    }

    if (currentOrder.status === 'En livraison') {
      throw new Error('Impossible d\'annuler une commande en livraison');
    }

    try {
      await updateOrderStatus(currentOrder.id, 'Annulé', {
        cancellationReason: reason,
        cancelledBy: 'supplier',
        cancelledAt: new Date()
      });
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      throw err;
    }
  };

  /**
   * Récupère l'historique complet des commandes
   * 
   * @param {string} status - Filtrer par statut (optionnel)
   * @returns {Promise<array>} Liste des commandes
   */
  const getOrdersHistory = async (status = null) => {
    if (!supplierId) return [];

    try {
      return await getSupplierOrders(supplierId, status);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'historique:', err);
      return [];
    }
  };

  /**
   * Calcule les finances détaillées pour une période
   * 
   * @param {Date} startDate - Date de début (optionnel)
   * @param {Date} endDate - Date de fin (optionnel)
   * @returns {Promise<object>} Finances détaillées
   */
  const calculatePeriodFinances = async (startDate = null, endDate = null) => {
    if (!supplierId) return null;

    try {
      const orders = await getSupplierOrders(supplierId, 'Livré');
      
      // Filtrer par période si spécifié
      const filteredOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        
        return true;
      });

      return calculateSupplierEarnings(filteredOrders);
    } catch (err) {
      console.error('Erreur lors du calcul des finances:', err);
      return null;
    }
  };

  /**
   * Soumet une preuve de paiement à la plateforme
   * 
   * @param {object} paymentProof - { transactionId, amount, date }
   * @returns {Promise<string>} ID du settlement créé
   */
  const submitPayment = async (paymentProof) => {
    if (!supplierId || !supplier) {
      throw new Error('Données fournisseur manquantes');
    }

    try {
      // Récupérer toutes les commandes livrées non réglées
      const orders = await getSupplierOrders(supplierId, 'Livré');
      const unpaidOrders = orders.filter(order => !order.settlementId);

      if (unpaidOrders.length === 0) {
        throw new Error('Aucune commande à régler');
      }

      // Calculer le montant total dû
      const finances = calculateSupplierEarnings(unpaidOrders);

      // Créer le settlement
      const settlementData = {
        supplierId,
        supplierName: supplier.name,
        amount: finances.platformDebt,
        processedOrders: unpaidOrders.length,
        orderIds: unpaidOrders.map(o => o.id),
        transactionRef: paymentProof.transactionId
      };

      const settlementId = await createSettlement(settlementData);

      // Marquer les commandes comme réglées
      const updatePromises = unpaidOrders.map(order =>
        updateDoc(doc(db, 'orders', order.id), {
          settlementId,
          settlementStatus: 'pending'
        })
      );

      await Promise.all(updatePromises);

      return settlementId;
    } catch (err) {
      console.error('Erreur lors de la soumission du paiement:', err);
      throw err;
    }
  };

  /**
   * Ajoute ou met à jour un produit
   * 
   * @param {object} productData - Données du produit
   * @returns {Promise<void>}
   */
  const updateProduct = async (productData) => {
    if (!supplierId) {
      throw new Error('ID fournisseur manquant');
    }

    try {
      // Cette fonction devrait créer ou mettre à jour un produit
      // L'implémentation complète dépendra de votre structure
      // Pour l'instant, on la laisse comme placeholder
      throw new Error('Fonction à implémenter');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      throw err;
    }
  };

  /**
   * Récupère les statistiques du fournisseur
   * 
   * @returns {Promise<object>} Statistiques
   */
  const getStats = async () => {
    if (!supplierId) return null;

    try {
      const allOrders = await getSupplierOrders(supplierId);
      
      const deliveredOrders = allOrders.filter(o => o.status === 'Livré');
      const thisMonthOrders = allOrders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      });

      return {
        totalOrders: allOrders.length,
        deliveredOrders: deliveredOrders.length,
        pendingOrders: pendingOrdersCount,
        thisMonthOrders: thisMonthOrders.length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active' && p.inStock).length
      };
    } catch (err) {
      console.error('Erreur lors de la récupération des stats:', err);
      return null;
    }
  };

  return {
    supplier,
    currentOrder,
    pendingOrdersCount,
    products,
    finances,
    loading,
    error,
    updateCurrentOrderStatus,
    cancelCurrentOrder,
    getOrdersHistory,
    calculatePeriodFinances,
    submitPayment,
    updateProduct,
    getStats,
    // Helpers
    isBlocked: supplier?.status === 'blocked',
    isActive: supplier?.status === 'active',
    hasCurrentOrder: !!currentOrder,
    supplierCode: supplier?.supplierCode || '',
    accessSlug: supplier?.accessSlug || ''
  };
};

export default useSupplier;