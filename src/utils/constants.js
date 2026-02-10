// src/utils/constants.js

// ==========================================
// 🏆 NIVEAUX PARTENAIRES & RÈGLES MÉTIER
// ==========================================
export const PARTNER_LEVELS = {
  STANDARD: 'Standard',
  ACTIF: 'Actif',
  PREMIUM: 'Premium',
};

export const LEVEL_RULES = {
  [PARTNER_LEVELS.STANDARD]: {
    minSales: 0,
    commission: 150,
    discount: 150,
    withdrawalMin: 2000,
    nextLevel: PARTNER_LEVELS.ACTIF,
    target: 30,
    // ✅ NOUVEAU : Ajout des couleurs pour l'UI (utilisé dans Dashboard)
    uiColor: 'amber', 
    icon: 'Star'
  },
  [PARTNER_LEVELS.ACTIF]: {
    minSales: 30,
    commission: 250,
    discount: 200,
    withdrawalMin: 5000,
    nextLevel: PARTNER_LEVELS.PREMIUM,
    target: 150,
    uiColor: 'slate',
    icon: 'Award'
  },
  [PARTNER_LEVELS.PREMIUM]: {
    minSales: 150,
    commission: 300,
    discount: 200,
    withdrawalMin: 10000,
    nextLevel: 'Max',
    target: null,
    uiColor: 'yellow',
    icon: 'Trophy'
  },
};

// ==========================================
// 📦 STATUTS DES COMMANDES (Database Values)
// ==========================================
export const ORDER_STATUS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  PREPARING: 'En préparation', // ✅ NOUVEAU (Manquait dans Orders.jsx)
  SHIPPING: 'En livraison',    // ✅ NOUVEAU (Manquait dans Orders.jsx)
  DELIVERED: 'Livré',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

// ==========================================
// 💳 MODES DE PAIEMENT & LIVRAISON
// ==========================================
// ✅ NOUVEAU SECTION COMPLÈTE
export const PAYMENT_METHODS = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
};

export const DELIVERY_METHODS = {
  DELIVERY: 'Livraison',
  PICKUP: 'Retrait',
};

// ==========================================
// 💰 STATUTS DES COMMISSIONS & PAIEMENTS
// ==========================================
export const PROMO_STATUS = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  PAID: 'paid',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REJECTED: 'rejected',
};

// ==========================================
// ⚙️ CONFIGURATION GLOBALE
// ==========================================
export const APP_CONFIG = {
  BASE_MARGIN: 1000,
  SURPLUS_SPLIT: {
    PLATFORM: 0.50,
    PARTNER: 0.30,
    CLIENT: 0.20,
  },
  OPERATORS: ['MTN Money', 'Airtel Money'],
  
  // ✅ NOUVEAU : Valeurs par défaut (utilisées dans Settings/Checkout)
  DEFAULT_DELIVERY_RATE: 500,
  BAKERY_LOCATION: { lat: -4.793, lng: 11.853 }, // Mis à jour selon Settings.jsx
  DEFAULT_OPENING: '08:00',
  DEFAULT_CLOSING: '22:00',
  CONTACT_PHONE: '+242 06 000 0000',
  DEFAULT_ADDRESS: 'Centre Ville, Pointe-Noire'
};