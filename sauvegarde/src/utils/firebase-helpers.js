/**
 * ========================================
 * DÉLICES D'AFRIQUE - FIREBASE HELPERS
 * Helpers Firestore pour interactions DB
 * ========================================
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  setDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Génère un code unique pour partenaires, fournisseurs, commandes
 * 
 * @param {string} prefix - Préfixe du code (ex: "DA", "CMD", "SUP")
 * @param {string} collectionName - Nom de la collection Firestore
 * @param {string} field - Champ à vérifier (ex: "promoCode", "code")
 * @param {number} length - Longueur du code aléatoire (défaut: 6)
 * @returns {Promise<string>} Code unique généré
 */
export const generateUniqueCode = async (prefix, collectionName, field, length = 6) => {
  let code;
  let exists = true;

  while (exists) {
    // Génération d'un code aléatoire alphanumérique
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .toUpperCase();
    
    code = `${prefix}-${randomPart}`;

    // Vérification de l'unicité
    const q = query(
      collection(db, collectionName),
      where(field, '==', code)
    );
    const snapshot = await getDocs(q);
    exists = !snapshot.empty;
  }

  return code;
};

/**
 * Génère un slug unique pour les fournisseurs
 * 
 * @param {string} baseName - Nom du fournisseur
 * @returns {Promise<string>} Slug unique
 */
export const generateUniqueSlug = async (baseName) => {
  // Transformation du nom en slug de base
  let baseSlug = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '');        // Enlever les tirets en début/fin

  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const q = query(
      collection(db, 'suppliers'),
      where('accessSlug', '==', slug)
    );
    const snapshot = await getDocs(q);
    exists = !snapshot.empty;

    if (exists) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
};

/**
 * Met à jour le statut d'une commande avec historique
 * 
 * @param {string} orderId - ID de la commande
 * @param {string} newStatus - Nouveau statut
 * @param {object} additionalData - Données supplémentaires (optionnel)
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
  const orderRef = doc(db, 'orders', orderId);
  
  const updateData = {
    status: newStatus,
    [`statusHistory.${newStatus}`]: serverTimestamp(),
    ...additionalData
  };

  // Si le statut est "Livré", ajouter le timestamp paidAt
  if (newStatus === 'Livré') {
    updateData.paidAt = serverTimestamp();
  }

  await updateDoc(orderRef, updateData);
};

/**
 * Récupère la configuration globale depuis Firestore
 * 
 * @returns {Promise<object|null>} Configuration ou null
 */
export const getConfigRules = async () => {
  try {
    const configRef = doc(db, 'settings', 'config');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error);
    return null;
  }
};

/**
 * Crée un nouveau fournisseur
 * 
 * @param {object} supplierData - Données du fournisseur
 * @returns {Promise<object>} { id, slug, code, tempPassword }
 */
export const createSupplier = async (supplierData) => {
  const { name, phone } = supplierData;

  // Génération des identifiants uniques
  const supplierCode = await generateUniqueCode('SUP', 'suppliers', 'supplierCode', 4);
  const accessSlug = await generateUniqueSlug(name);
  
  // Génération d'un mot de passe temporaire (8 caractères)
  const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase();

  // Création du document fournisseur
  const newSupplier = {
    name,
    phone,
    supplierCode,
    accessSlug,
    status: 'active',
    tempPassword,
    createdAt: serverTimestamp(),
    wallet: {
      totalEarned: 0,
      platformDebt: 0
    }
  };

  const docRef = await addDoc(collection(db, 'suppliers'), newSupplier);

  return {
    id: docRef.id,
    slug: accessSlug,
    code: supplierCode,
    tempPassword
  };
};

/**
 * Crée un nouveau partenaire
 * 
 * @param {object} partnerData - Données du partenaire
 * @returns {Promise<object>} { id, promoCode }
 */
export const createPartner = async (partnerData) => {
  const { fullName, phone, password } = partnerData;

  // Génération du code promo unique
  const promoCode = await generateUniqueCode('DA', 'partners', 'promoCode', 6);

  // Création du document partenaire
  const newPartner = {
    fullName,
    phone,
    password, // À hasher avant en production !
    promoCode,
    level: 'standard',
    isActive: true,
    totalSales: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
    walletBalance: 0,
    createdAt: serverTimestamp(),
    termsAcceptedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'partners'), newPartner);

  return {
    id: docRef.id,
    promoCode
  };
};

/**
 * Vérifie si un code existe dans une collection
 * 
 * @param {string} code - Code à vérifier
 * @param {string} collectionName - Nom de la collection
 * @param {string} field - Champ à vérifier
 * @returns {Promise<boolean>} true si le code existe
 */
export const checkCodeExists = async (code, collectionName, field) => {
  const q = query(
    collection(db, collectionName),
    where(field, '==', code)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Récupère un partenaire par son code promo
 * 
 * @param {string} promoCode - Code promo du partenaire
 * @returns {Promise<object|null>} Données du partenaire ou null
 */
export const getPartnerByPromoCode = async (promoCode) => {
  try {
    const q = query(
      collection(db, 'partners'),
      where('promoCode', '==', promoCode.toUpperCase()),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du partenaire:', error);
    return null;
  }
};

/**
 * Récupère un fournisseur par son slug
 * 
 * @param {string} slug - Slug du fournisseur
 * @returns {Promise<object|null>} Données du fournisseur ou null
 */
export const getSupplierBySlug = async (slug) => {
  try {
    const q = query(
      collection(db, 'suppliers'),
      where('accessSlug', '==', slug),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    return null;
  }
};

/**
 * Récupère toutes les commandes d'un fournisseur
 * 
 * @param {string} supplierId - ID du fournisseur
 * @param {string} status - Filtrer par statut (optionnel)
 * @returns {Promise<array>} Liste des commandes
 */
export const getSupplierOrders = async (supplierId, status = null) => {
  try {
    let q;
    
    if (status) {
      q = query(
        collection(db, 'orders'),
        where('supplierId', '==', supplierId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'orders'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return [];
  }
};

/**
 * Récupère toutes les commandes d'un partenaire
 * 
 * @param {string} partnerId - ID du partenaire
 * @returns {Promise<array>} Liste des commandes avec code promo du partenaire
 */
export const getPartnerOrders = async (partnerId) => {
  try {
    // Note: Cette requête nécessite un index composite sur (promo.partnerId, createdAt)
    const q = query(
      collection(db, 'orders'),
      where('promo.partnerId', '==', partnerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes partenaire:', error);
    return [];
  }
};

/**
 * Met à jour le wallet d'un fournisseur
 * 
 * @param {string} supplierId - ID du fournisseur
 * @param {object} walletData - Nouvelles données du wallet
 * @returns {Promise<void>}
 */
export const updateSupplierWallet = async (supplierId, walletData) => {
  const supplierRef = doc(db, 'suppliers', supplierId);
  await updateDoc(supplierRef, {
    wallet: walletData
  });
};

/**
 * Met à jour les statistiques d'un partenaire
 * 
 * @param {string} partnerId - ID du partenaire
 * @param {object} stats - Nouvelles statistiques
 * @returns {Promise<void>}
 */
export const updatePartnerStats = async (partnerId, stats) => {
  const partnerRef = doc(db, 'partners', partnerId);
  await updateDoc(partnerRef, stats);
};

/**
 * Crée une demande de retrait partenaire
 * 
 * @param {object} withdrawalData - Données du retrait
 * @returns {Promise<string>} ID du retrait créé
 */
export const createWithdrawal = async (withdrawalData) => {
  const withdrawal = {
    ...withdrawalData,
    status: 'pending',
    createdAt: serverTimestamp(),
    processedAt: null,
    transactionRef: null
  };

  const docRef = await addDoc(collection(db, 'withdrawals'), withdrawal);
  return docRef.id;
};

/**
 * Crée un règlement fournisseur (settlement)
 * 
 * @param {object} settlementData - Données du règlement
 * @returns {Promise<string>} ID du settlement créé
 */
export const createSettlement = async (settlementData) => {
  const settlement = {
    ...settlementData,
    type: 'settlement',
    context: 'end_of_day_blocking',
    status: 'pending',
    createdAt: serverTimestamp(),
    validatedAt: null,
    transactionRef: null
  };

  const docRef = await addDoc(collection(db, 'settlements'), settlement);
  return docRef.id;
};

/**
 * Bloque tous les fournisseurs (fin de journée)
 * 
 * @returns {Promise<number>} Nombre de fournisseurs bloqués
 */
export const blockAllSuppliers = async () => {
  const q = query(
    collection(db, 'suppliers'),
    where('status', '==', 'active')
  );

  const snapshot = await getDocs(q);
  let count = 0;

  const updatePromises = snapshot.docs.map(async (document) => {
    const supplierRef = doc(db, 'suppliers', document.id);
    await updateDoc(supplierRef, {
      status: 'blocked',
      blockedAt: serverTimestamp()
    });
    count++;
  });

  await Promise.all(updatePromises);
  return count;
};

/**
 * Débloque un fournisseur et réinitialise ses compteurs
 * 
 * @param {string} supplierId - ID du fournisseur
 * @returns {Promise<void>}
 */
export const unblockSupplier = async (supplierId) => {
  const supplierRef = doc(db, 'suppliers', supplierId);
  
  await updateDoc(supplierRef, {
    status: 'active',
    blockedAt: null,
    wallet: {
      totalEarned: 0,
      platformDebt: 0
    }
  });
};

/**
 * Récupère les produits d'un fournisseur
 * 
 * @param {string} supplierId - ID du fournisseur
 * @param {string} status - Filtrer par statut (optionnel)
 * @returns {Promise<array>} Liste des produits
 */
export const getSupplierProducts = async (supplierId, status = null) => {
  try {
    let q;
    
    if (status) {
      q = query(
        collection(db, 'products'),
        where('supplierId', '==', supplierId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'products'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
};

/**
 * Récupère tous les produits actifs (pour le client)
 * 
 * @param {string} category - Filtrer par catégorie (optionnel)
 * @returns {Promise<array>} Liste des produits
 */
export const getActiveProducts = async (category = null) => {
  try {
    let q;
    
    if (category) {
      q = query(
        collection(db, 'products'),
        where('status', '==', 'active'),
        where('inStock', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'products'),
        where('status', '==', 'active'),
        where('inStock', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des produits actifs:', error);
    return [];
  }
};

/**
 * Convertit un Timestamp Firestore en Date JavaScript
 * 
 * @param {Timestamp} timestamp - Timestamp Firestore
 * @returns {Date|null} Date JavaScript ou null
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return null;
};

/**
 * Convertit une Date JavaScript en Timestamp Firestore
 * 
 * @param {Date} date - Date JavaScript
 * @returns {Timestamp} Timestamp Firestore
 */
export const dateToTimestamp = (date) => {
  if (!date) return null;
  return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
};

// Export par défaut
export default {
  generateUniqueCode,
  generateUniqueSlug,
  updateOrderStatus,
  getConfigRules,
  createSupplier,
  createPartner,
  checkCodeExists,
  getPartnerByPromoCode,
  getSupplierBySlug,
  getSupplierOrders,
  getPartnerOrders,
  updateSupplierWallet,
  updatePartnerStats,
  createWithdrawal,
  createSettlement,
  blockAllSuppliers,
  unblockSupplier,
  getSupplierProducts,
  getActiveProducts,
  timestampToDate,
  dateToTimestamp
};