// src/utils/constants.js

// =============================================================================
// 🏆 1. NIVEAUX PARTENAIRES & RÈGLES MÉTIER
// =============================================================================

export const PARTNER_LEVELS = {
  STANDARD: 'Standard',
  ACTIF: 'Actif',
  PREMIUM: 'Premium',
};

// Configuration détaillée des paliers
export const LEVEL_RULES = {
  [PARTNER_LEVELS.STANDARD]: {
    minSales: 0,
    baseComm: 150,    // Commission de base (FCFA)
    baseDisc: 150,    // Réduction client de base (FCFA)
    withdrawalMin: 2000,
    nextLevel: PARTNER_LEVELS.ACTIF,
    target: 30,       // Objectif pour passer au niveau suivant
  },
  [PARTNER_LEVELS.ACTIF]: {
    minSales: 30,
    baseComm: 250,
    baseDisc: 200,
    withdrawalMin: 5000,
    nextLevel: PARTNER_LEVELS.PREMIUM,
    target: 150,
  },
  [PARTNER_LEVELS.PREMIUM]: {
    minSales: 150,
    baseComm: 300,
    baseDisc: 200,
    withdrawalMin: 10000,
    nextLevel: 'Max', // Niveau maximum atteint
    target: null,
  },
};

// Seuils de retrait simplifiés (pour PartnerWallet.jsx)
export const WITHDRAWAL_LIMITS = {
  [PARTNER_LEVELS.STANDARD]: 2000,
  [PARTNER_LEVELS.ACTIF]: 5000,
  [PARTNER_LEVELS.PREMIUM]: 10000,
};

// =============================================================================
// 🎨 2. UI & DESIGN SYSTEM (BADGES, COULEURS, ICÔNES)
// =============================================================================

// Styles visuels des niveaux (pour PartnerDashboard.jsx)
export const LEVEL_UI = {
  [PARTNER_LEVELS.STANDARD]: {
    color: 'from-amber-900 to-amber-700',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-700/10',
    borderColor: 'border-amber-700/30',
    iconName: 'Star'
  },
  [PARTNER_LEVELS.ACTIF]: {
    color: 'from-gray-300 to-gray-500',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    borderColor: 'border-slate-400/30',
    iconName: 'Award'
  },
  [PARTNER_LEVELS.PREMIUM]: {
    color: 'from-amber-400 to-yellow-600',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    iconName: 'Trophy'
  }
};

// Couleurs des statuts de commande (pour Orders.jsx)
export const STATUS_STYLES = {
  'En attente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'En préparation': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  // 'En livraison' supprimé
  'Livré': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Terminé': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Annulé': 'bg-red-500/20 text-red-400 border-red-500/30'
};

// =============================================================================
// 📦 3. STATUTS DES COMMANDES (DATABASE)
// =============================================================================

export const ORDER_STATUS = {
  PENDING: 'En attente',
  PREPARING: 'En préparation',
  SHIPPING: 'En livraison', 
  DELIVERED: 'Livré',
  COMPLETED: 'Terminé',       // Déclenche le paiement commission
  CANCELLED: 'Annulé',
};

// Ordre logique pour l'avancement des commandes
export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETED
];

// =============================================================================
// 💰 4. FINANCE & PAIEMENTS
// =============================================================================

export const PAYMENT_METHODS = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
};

export const DELIVERY_METHODS = {
  DELIVERY: 'Livraison',
  PICKUP: 'Retrait',
};

export const PROMO_STATUS = {
  PENDING: 'pending',     // En attente de validation commande
  VALIDATED: 'validated', // Validé (crédité dans wallet)
  PAID: 'paid',           // Retiré (cash out)
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REJECTED: 'rejected',
};

// Opérateurs Mobile Money supportés
export const MOBILE_OPERATORS = ['MTN Money', 'Airtel Money'];

// =============================================================================
// 🛡️ 5. LIMITES & VALIDATIONS (NOUVEAU)
// =============================================================================

export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    REGEX: /^[a-zA-ZÀ-ÿ\s'-]+$/, // Lettres, espaces, apostrophes, tirets
    ERROR_MSG: "Le nom doit contenir entre 2 et 50 caractères (lettres uniquement)"
  },
  PHONE: {
    REGEX: /^(06|05|04)\d{7}$/, // Format local Congo
    LENGTH: 9,
    PREFIXES: ['06', '05', '04'],
    ERROR_MSG: "Numéro invalide (doit commencer par 06, 05 ou 04 et contenir 9 chiffres au total)"
  },
  PROMO_CODE: {
    LENGTH: 8, // DA-XXX-XX = 8 caractères
    REGEX: /^DA-[A-Z0-9]{3}-[A-Z0-9]{2}$/, // Format strict DA-XXX-XX
    PREFIX: 'DA',
    ERROR_MSG: "Le code promo doit être au format DA-XXX-XX (ex: DA-A1B-C2)"
  },
  WITHDRAWAL: {
    MIN_AMOUNT: 2000, // Seuil plancher absolu
    MAX_AMOUNT: 500000, // Plafond sécurité par transaction
  },
  ORDER: {
    MAX_ITEMS: 50, // Anti-spam panier
  }
};

// =============================================================================
// 📊 6. FILTRES & TRIS (DASHBOARDS)
// =============================================================================

export const SALES_FILTERS = {
  STATUS: {
    ALL: 'all',
    VALIDATED: 'validated',
    PENDING: 'pending',
    CANCELLED: 'cancelled' 
  },
  DATE: {
    ALL: 'all',
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month'
  },
  SORT: {
    RECENT: 'recent',
    AMOUNT: 'amount',
    COMMISSION: 'commission'
  }
};

// Onglets Admin (Partners.jsx)
export const ADMIN_TABS = {
  OVERVIEW: 'overview',
  PARTNERS: 'partners',
  PAYOUTS: 'payouts',
  CODES: 'codes',
  RULES: 'rules'
};

// =============================================================================
// ⚙️ 7. CONFIGURATION GLOBALE PAR DÉFAUT
// =============================================================================

export const APP_CONFIG = {
  // Marges et répartition
  BASE_MARGIN: 1000, // FCFA (Marge protégée créateur)
  SURPLUS_SPLIT: {
    PLATFORM: 0.50, // 50%
    PARTNER: 0.30,  // 30%
    CLIENT: 0.20,   // 20%
  },
  
  // Infos Boutique
  BAKERY_LOCATION: { lat: -4.793, lng: 11.853 }, // Pointe-Noire
  DEFAULT_ADDRESS: 'Centre Ville, Pointe-Noire',
  CONTACT_PHONE: '+242 06 000 0000',
  
  // Horaires & Logistique
  DEFAULT_OPENING: '08:00',
  DEFAULT_CLOSING: '22:00',
  DEFAULT_DELIVERY_RATE: 500, // FCFA par Km
};