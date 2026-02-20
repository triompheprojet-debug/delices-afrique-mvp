/**
 * ========================================
 * Délices d'Afrique - CALCULS MÉTIER
 * Logique de calcul centralisée pour partenaires
 * ========================================
 */

/**
 * Calcule les bénéfices partenaires selon le modèle hybride
 * 
 * RÈGLES MÉTIER :
 * 1. Marge de base protégée : 1000 FCFA minimum pour la plateforme
 * 2. Surplus redistribué selon 50/30/20 (plateforme/partenaire/client)
 * 3. Commission et réduction de base selon niveau partenaire
 * 4. Le partenaire ne voit JAMAIS le prix fournisseur ni la marge réelle
 * 
 * @param {number} productPrice - Prix de vente public du produit
 * @param {number} productBuyingPrice - Prix d'achat fournisseur (supplierPrice)
 * @param {number} totalSalesOfPartner - Ventes cumulées du partenaire (pour déterminer niveau)
 * @param {object} config - Configuration des règles (optionnel, utilise valeurs par défaut si absent)
 * @returns {object} { discountClient, commissionPartner, platformGain, finalPrice, level, realMargin, surplus }
 */
export const calculatePartnerBenefits = (
  productPrice,
  productBuyingPrice,
  totalSalesOfPartner = 0,
  config = null
) => {
  // Configuration par défaut (conforme à la documentation)
  const defaultConfig = {
    baseMargin: 1000, // Marge protégée minimum
    surplusSplit: {
      platform: 0.50, // 50% du surplus
      partner: 0.30,  // 30% du surplus
      client: 0.20    // 20% du surplus
    },
    levels: {
      standard: { minSales: 0, baseComm: 150, baseDisc: 150 },
      actif: { minSales: 30, baseComm: 250, baseDisc: 200 },
      premium: { minSales: 150, baseComm: 300, baseDisc: 200 }
    }
  };

  // Utiliser la config fournie ou les valeurs par défaut
  const rules = config?.partnerRules || defaultConfig;
  const levels = rules.levels || defaultConfig.levels;

  // Conversion en nombres pour sécurité
  const buyingPrice = Number(productBuyingPrice) || 0;
  const sellingPrice = Number(productPrice) || 0;
  const totalSales = Number(totalSalesOfPartner) || 0;

  // Détermination du niveau du partenaire
  const standard = levels.standard || defaultConfig.levels.standard;
  const actif = levels.actif || defaultConfig.levels.actif;
  const premium = levels.premium || defaultConfig.levels.premium;

  let level = standard;
  let levelName = 'standard';

  if (totalSales >= premium.minSales) {
    level = premium;
    levelName = 'premium';
  } else if (totalSales >= actif.minSales) {
    level = actif;
    levelName = 'actif';
  }

  // Commission et réduction DE BASE (selon niveau)
  let comm = level.baseComm || 0;
  let disc = level.baseDisc || 0;

  // Calcul de la marge réelle
  const margin = sellingPrice - buyingPrice;
  const baseMargin = rules.baseMargin || defaultConfig.baseMargin;

  // Calcul du surplus (si marge > marge de base protégée)
  const surplus = Math.max(0, margin - baseMargin);

  // Si surplus > 0 : Redistribution selon 50/30/20
  if (surplus > 0 && rules.surplusSplit) {
    const partnerBonus = Math.round(surplus * (rules.surplusSplit.partner || 0));
    const clientBonus = Math.round(surplus * (rules.surplusSplit.client || 0));

    comm += partnerBonus; // Commission totale = base + bonus
    disc += clientBonus;  // Réduction totale = base + bonus
  }

  // Calcul final du gain plateforme
  // Gain Plateforme = Prix de vente - Prix d'achat - Commission Partenaire - Réduction Client
  const platformGain = sellingPrice - buyingPrice - comm - disc;

  // Prix final payé par le client
  const finalPrice = sellingPrice - disc;

  return {
    discountClient: disc,          // Réduction visible pour le client
    commissionPartner: comm,       // Commission payée au partenaire
    platformGain: platformGain,    // Gain net de la plateforme
    finalPrice: finalPrice,        // Prix final payé par le client
    level: levelName,              // Niveau du partenaire
    realMargin: margin,            // Marge réelle (pour admin seulement)
    surplus: surplus               // Surplus généré (pour admin seulement)
  };
};

/**
 * Formate un montant en FCFA
 * 
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté (ex: "2 500 FCFA")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 FCFA';
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace(/\s/g, ' ') + ' FCFA';
};

/**
 * Détermine le niveau d'un partenaire selon ses ventes
 * 
 * @param {number} totalSales - Nombre total de ventes cumulées
 * @param {object} config - Configuration des niveaux (optionnel)
 * @returns {string} "standard" | "actif" | "premium"
 */
export const getPartnerLevel = (totalSales, config = null) => {
  const defaultLevels = {
    standard: { minSales: 0 },
    actif: { minSales: 30 },
    premium: { minSales: 150 }
  };

  const levels = config?.partnerRules?.levels || defaultLevels;
  const sales = Number(totalSales) || 0;

  if (sales >= levels.premium.minSales) return 'premium';
  if (sales >= levels.actif.minSales) return 'actif';
  return 'standard';
};

/**
 * Calcule les frais de livraison selon la distance
 * 
 * @param {number} distance - Distance en km
 * @param {number} ratePerKm - Tarif par kilomètre (défaut: 500 FCFA/km)
 * @returns {number} Montant des frais de livraison
 */
export const calculateDeliveryFee = (distance, ratePerKm = 500) => {
  const dist = Number(distance) || 0;
  const rate = Number(ratePerKm) || 500;

  return Math.round(dist * rate);
};

/**
 * Valide qu'une marge est suffisante
 * 
 * @param {number} sellingPrice - Prix de vente
 * @param {number} buyingPrice - Prix d'achat
 * @param {number} minMargin - Marge minimum requise (défaut: 1000 FCFA)
 * @returns {boolean} true si la marge est suffisante
 */
export const validateMargin = (sellingPrice, buyingPrice, minMargin = 1000) => {
  const margin = Number(sellingPrice) - Number(buyingPrice);
  return margin >= Number(minMargin);
};

/**
 * Calcule le total d'une commande
 * 
 * @param {array} items - Liste des items du panier
 * @param {number} deliveryFee - Frais de livraison
 * @param {number} discount - Réduction (code promo)
 * @returns {object} { subtotal, total, itemCount }
 */
export const calculateOrderTotal = (items = [], deliveryFee = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0);
  }, 0);

  const total = Math.max(0, subtotal + Number(deliveryFee) - Number(discount));

  return {
    subtotal,
    total,
    itemCount
  };
};

/**
 * Calcule les gains d'un fournisseur pour une période
 * 
 * @param {array} orders - Liste des commandes du fournisseur
 * @returns {object} { totalEarned, platformDebt, deliveryEarned, deliveryPlatformCut }
 */
export const calculateSupplierEarnings = (orders = []) => {
  let totalEarned = 0;      // Total encaissé par le fournisseur
  let platformDebt = 0;     // Marge plateforme à reverser
  let deliveryEarned = 0;   // Gains sur les livraisons (90%)
  let deliveryPlatformCut = 0; // Part plateforme sur livraisons (10%)

  orders.forEach(order => {
    // Gain fournisseur sur les produits
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const supplierPrice = Number(item.supplierPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const margin = Number(item.platformMargin) || 0;

        totalEarned += supplierPrice * quantity;
        platformDebt += margin * quantity;
      });
    }

    // Gain sur la livraison (90% pour le fournisseur, 10% pour la plateforme)
    if (order.details?.deliveryFee) {
      const deliveryFee = Number(order.details.deliveryFee);
      deliveryEarned += Math.round(deliveryFee * 0.90);
      deliveryPlatformCut += Math.round(deliveryFee * 0.10);
    }
  });

  return {
    totalEarned: totalEarned + deliveryEarned,
    platformDebt: platformDebt + deliveryPlatformCut,
    deliveryEarned,
    deliveryPlatformCut
  };
};

/**
 * Calcule les gains d'un partenaire pour une période
 * 
 * @param {array} orders - Liste des commandes liées au partenaire
 * @param {object} config - Configuration des règles partenaires
 * @returns {object} { totalCommissions, pendingCommissions, paidCommissions }
 */
export const calculatePartnerEarnings = (orders = [], config = null) => {
  let totalCommissions = 0;
  let pendingCommissions = 0;
  let paidCommissions = 0;

  orders.forEach(order => {
    if (order.promo?.partnerCommission) {
      const commission = Number(order.promo.partnerCommission);
      totalCommissions += commission;

      // Si la commande est livrée, la commission est due
      if (order.status === 'Livré') {
        pendingCommissions += commission;
      }

      // Si déjà payée (à implémenter dans le système)
      if (order.partnerPaid) {
        paidCommissions += commission;
      }
    }
  });

  return {
    totalCommissions,
    pendingCommissions,
    paidCommissions,
    availableBalance: pendingCommissions - paidCommissions
  };
};

/**
 * Vérifie si un montant de retrait est valide selon le niveau
 * 
 * @param {number} amount - Montant du retrait demandé
 * @param {string} level - Niveau du partenaire
 * @param {number} availableBalance - Solde disponible
 * @returns {object} { valid: boolean, message: string, minAmount: number }
 */
export const validateWithdrawal = (amount, level, availableBalance) => {
  const minAmounts = {
    standard: 2000,
    actif: 3000,
    premium: 5000
  };

  const minAmount = minAmounts[level] || 2000;
  const requestedAmount = Number(amount);
  const balance = Number(availableBalance);

  if (requestedAmount < minAmount) {
    return {
      valid: false,
      message: `Le montant minimum de retrait pour le niveau ${level} est de ${formatCurrency(minAmount)}`,
      minAmount
    };
  }

  if (requestedAmount > balance) {
    return {
      valid: false,
      message: `Solde insuffisant. Disponible : ${formatCurrency(balance)}`,
      minAmount
    };
  }

  return {
    valid: true,
    message: 'Retrait valide',
    minAmount
  };
};

/**
 * Calcule la progression vers le niveau suivant
 * 
 * @param {number} currentSales - Ventes actuelles
 * @param {string} currentLevel - Niveau actuel
 * @returns {object} { percentage: number, salesNeeded: number, nextLevel: string }
 */
export const calculateLevelProgress = (currentSales, currentLevel) => {
  const levels = {
    standard: { min: 0, max: 29, next: 'actif' },
    actif: { min: 30, max: 149, next: 'premium' },
    premium: { min: 150, max: Infinity, next: null }
  };

  const level = levels[currentLevel] || levels.standard;
  const sales = Number(currentSales);

  if (level.next === null) {
    return {
      percentage: 100,
      salesNeeded: 0,
      nextLevel: null,
      isMaxLevel: true
    };
  }

  const salesInCurrentLevel = sales - level.min;
  const totalSalesNeeded = level.max - level.min + 1;
  const percentage = Math.min(100, Math.round((salesInCurrentLevel / totalSalesNeeded) * 100));
  const salesNeeded = Math.max(0, level.max - sales + 1);

  return {
    percentage,
    salesNeeded,
    nextLevel: level.next,
    isMaxLevel: false
  };
};

/**
 * Calcule les statistiques globales de la plateforme
 * 
 * @param {array} orders - Toutes les commandes
 * @param {array} partners - Tous les partenaires
 * @param {array} suppliers - Tous les fournisseurs
 * @returns {object} Statistiques complètes
 */
export const calculatePlatformStats = (orders = [], partners = [], suppliers = []) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.details?.finalTotal) || 0), 0);
  const totalPlatformMargin = orders.reduce((sum, order) => {
    const items = order.items || [];
    return sum + items.reduce((itemSum, item) => {
      return itemSum + ((Number(item.platformMargin) || 0) * (Number(item.quantity) || 0));
    }, 0);
  }, 0);

  const activePartners = partners.filter(p => p.isActive).length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;

  const ordersByStatus = orders.reduce((acc, order) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalOrders,
    totalRevenue,
    totalPlatformMargin,
    activePartners,
    activeSuppliers,
    ordersByStatus,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  };
};

/**
 * ========================================
 * FONCTIONS ADMIN - FINANCES COMPLÈTES
 * ========================================
 */

/**
 * Calcule les gains exacts de l'admin pour une commande
 * CETTE FONCTION EST RÉSERVÉE À L'ADMIN UNIQUEMENT
 * 
 * @param {object} order - Commande complète
 * @param {object} config - Configuration des règles
 * @returns {object} Détails financiers complets de la commande
 */
export const calculateAdminOrderFinances = (order, config = null) => {
  const items = order.items || [];
  let totalSupplierPrice = 0;
  let totalPlatformMargin = 0;
  let totalPublicPrice = 0;

  // Calcul pour chaque produit
  items.forEach(item => {
    const quantity = Number(item.quantity) || 0;
    const supplierPrice = Number(item.supplierPrice) || 0;
    const publicPrice = Number(item.price) || 0;
    const platformMargin = Number(item.platformMargin) || 0;

    totalSupplierPrice += supplierPrice * quantity;
    totalPlatformMargin += platformMargin * quantity;
    totalPublicPrice += publicPrice * quantity;
  });

  // Livraison
  const deliveryFee = Number(order.details?.deliveryFee) || 0;
  const deliverySupplierCut = Math.round(deliveryFee * 0.90); // 90% fournisseur
  const deliveryPlatformCut = Math.round(deliveryFee * 0.10); // 10% plateforme

  // Code promo partenaire
  const partnerDiscount = Number(order.promo?.discount) || 0;
  const partnerCommission = Number(order.promo?.partnerCommission) || 0;
  const partnerCode = order.promo?.code || null;

  // Calculs finaux
  const totalClientPays = Number(order.details?.finalTotal) || 0;
  const supplierGets = totalSupplierPrice + deliverySupplierCut;
  const partnerGets = partnerCommission;
  const platformGets = totalPlatformMargin + deliveryPlatformCut;

  // Vérification (pour débogage)
  const verification = totalClientPays + partnerDiscount;
  const distribution = supplierGets + partnerGets + platformGets;

  return {
    // Montants client
    subtotalProducts: totalPublicPrice,
    deliveryFee: deliveryFee,
    partnerDiscount: partnerDiscount,
    totalClientPays: totalClientPays,

    // Répartition
    supplier: {
      fromProducts: totalSupplierPrice,
      fromDelivery: deliverySupplierCut,
      total: supplierGets
    },
    partner: {
      commission: partnerCommission,
      code: partnerCode,
      hasPartner: !!partnerCode
    },
    platform: {
      fromMargins: totalPlatformMargin,
      fromDelivery: deliveryPlatformCut,
      total: platformGets
    },

    // Vérification comptable
    verification: {
      totalRevenue: verification, // Ce que génère la commande
      totalDistributed: distribution, // Ce qui est distribué
      isBalanced: Math.abs(verification - distribution) < 1 // Tolérance 1 FCFA pour arrondis
    }
  };
};

/**
 * Calcule les finances globales de la plateforme pour une période
 * FONCTION ADMIN - Vue d'ensemble complète
 * 
 * @param {array} orders - Toutes les commandes de la période
 * @param {array} partners - Tous les partenaires
 * @param {array} suppliers - Tous les fournisseurs
 * @param {object} config - Configuration
 * @returns {object} Finances complètes de la plateforme
 */
export const calculateAdminGlobalFinances = (orders = [], partners = [], suppliers = [], config = null) => {
  // Initialisation des totaux
  let totalRevenue = 0; // Total généré (avant réductions)
  let totalClientPaid = 0; // Total payé par les clients (après réductions)
  let totalPlatformMargin = 0;
  let totalSupplierEarnings = 0;
  let totalPartnerCommissions = 0;
  let totalPartnerDiscounts = 0;
  let totalDeliveryFees = 0;
  let totalDeliveryPlatformCut = 0;
  let totalDeliverySupplierCut = 0;

  // Statistiques par statut
  const ordersByStatus = {
    'En attente': 0,
    'En préparation': 0,
    'En livraison': 0,
    'Livré': 0,
    'Annulé': 0
  };

  // Parcourir toutes les commandes
  orders.forEach(order => {
    const status = order.status || 'unknown';
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;

    // Ne calculer les finances que pour les commandes livrées
    if (status === 'Livré') {
      const orderFinances = calculateAdminOrderFinances(order, config);

      totalRevenue += orderFinances.subtotalProducts + orderFinances.deliveryFee;
      totalClientPaid += orderFinances.totalClientPays;
      totalPlatformMargin += orderFinances.platform.fromMargins;
      totalSupplierEarnings += orderFinances.supplier.fromProducts;
      totalPartnerCommissions += orderFinances.partner.commission;
      totalPartnerDiscounts += orderFinances.partnerDiscount;
      totalDeliveryFees += orderFinances.deliveryFee;
      totalDeliveryPlatformCut += orderFinances.platform.fromDelivery;
      totalDeliverySupplierCut += orderFinances.supplier.fromDelivery;
    }
  });

  // Gain total plateforme
  const totalPlatformGain = totalPlatformMargin + totalDeliveryPlatformCut;

  // Statistiques partenaires
  const activePartners = partners.filter(p => p.isActive).length;
  const partnersByLevel = {
    standard: partners.filter(p => p.level === 'standard').length,
    actif: partners.filter(p => p.level === 'actif').length,
    premium: partners.filter(p => p.level === 'premium').length
  };

  // Statistiques fournisseurs
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const blockedSuppliers = suppliers.filter(s => s.status === 'blocked').length;

  // Montants dus (à payer)
  const partnersPendingPayouts = partners.reduce((sum, p) => sum + (Number(p.walletBalance) || 0), 0);
  const suppliersPendingSettlements = suppliers.reduce((sum, s) => sum + (Number(s.wallet?.platformDebt) || 0), 0);

  return {
    // Revenus globaux
    revenue: {
      totalGenerated: totalRevenue, // Total avant réductions
      totalReceived: totalClientPaid, // Total reçu des clients
      totalDiscountsGiven: totalPartnerDiscounts
    },

    // Répartition des gains
    distribution: {
      platform: {
        fromProductMargins: totalPlatformMargin,
        fromDelivery: totalDeliveryPlatformCut,
        total: totalPlatformGain,
        percentage: totalRevenue > 0 ? (totalPlatformGain / totalRevenue * 100).toFixed(2) : 0
      },
      suppliers: {
        fromProducts: totalSupplierEarnings,
        fromDelivery: totalDeliverySupplierCut,
        total: totalSupplierEarnings + totalDeliverySupplierCut,
        percentage: totalRevenue > 0 ? ((totalSupplierEarnings + totalDeliverySupplierCut) / totalRevenue * 100).toFixed(2) : 0
      },
      partners: {
        totalCommissions: totalPartnerCommissions,
        percentage: totalRevenue > 0 ? (totalPartnerCommissions / totalRevenue * 100).toFixed(2) : 0
      }
    },

    // Livraisons
    delivery: {
      totalFees: totalDeliveryFees,
      platformCut: totalDeliveryPlatformCut,
      supplierCut: totalDeliverySupplierCut
    },

    // Commandes
    orders: {
      total: orders.length,
      delivered: ordersByStatus['Livré'] || 0,
      pending: (ordersByStatus['En attente'] || 0) + (ordersByStatus['En préparation'] || 0) + (ordersByStatus['En livraison'] || 0),
      cancelled: ordersByStatus['Annulé'] || 0,
      byStatus: ordersByStatus,
      averageOrderValue: orders.length > 0 ? Math.round(totalClientPaid / (ordersByStatus['Livré'] || 1)) : 0
    },

    // Partenaires
    partners: {
      total: partners.length,
      active: activePartners,
      byLevel: partnersByLevel,
      totalCommissionsPaid: totalPartnerCommissions,
      pendingPayouts: partnersPendingPayouts
    },

    // Fournisseurs
    suppliers: {
      total: suppliers.length,
      active: activeSuppliers,
      blocked: blockedSuppliers,
      totalEarned: totalSupplierEarnings + totalDeliverySupplierCut,
      pendingSettlements: suppliersPendingSettlements
    },

    // Montants dus
    liabilities: {
      toPartners: partnersPendingPayouts,
      toSuppliers: suppliersPendingSettlements,
      total: partnersPendingPayouts + suppliersPendingSettlements
    },

    // Trésorerie nette
    netCashflow: totalPlatformGain - partnersPendingPayouts
  };
};

/**
 * Calcule le détail financier d'un produit (pour admin)
 * Affiche toutes les marges et prix cachés
 * 
 * @param {object} product - Produit
 * @param {object} config - Configuration
 * @returns {object} Détails financiers complets du produit
 */
export const calculateAdminProductFinances = (product, config = null) => {
  const supplierPrice = Number(product.supplierPrice) || 0;
  const publicPrice = Number(product.price) || 0;
  const platformMargin = Number(product.platformMargin) || 0;

  // Calcul de ce que rapporterait une vente avec code partenaire
  const partnerBenefitsStandard = calculatePartnerBenefits(publicPrice, supplierPrice, 0, config);
  const partnerBenefitsActif = calculatePartnerBenefits(publicPrice, supplierPrice, 30, config);
  const partnerBenefitsPremium = calculatePartnerBenefits(publicPrice, supplierPrice, 150, config);

  return {
    // Prix de base
    pricing: {
      supplierPrice: supplierPrice,
      publicPrice: publicPrice,
      platformMargin: platformMargin,
      marginPercentage: publicPrice > 0 ? ((platformMargin / publicPrice) * 100).toFixed(2) : 0
    },

    // Sans code partenaire
    withoutPartner: {
      clientPays: publicPrice,
      supplierGets: supplierPrice,
      platformGets: platformMargin,
      platformMarginPercentage: ((platformMargin / publicPrice) * 100).toFixed(2)
    },

    // Avec code partenaire (par niveau)
    withPartner: {
      standard: {
        clientPays: partnerBenefitsStandard.finalPrice,
        clientDiscount: partnerBenefitsStandard.discountClient,
        supplierGets: supplierPrice,
        partnerGets: partnerBenefitsStandard.commissionPartner,
        platformGets: partnerBenefitsStandard.platformGain
      },
      actif: {
        clientPays: partnerBenefitsActif.finalPrice,
        clientDiscount: partnerBenefitsActif.discountClient,
        supplierGets: supplierPrice,
        partnerGets: partnerBenefitsActif.commissionPartner,
        platformGets: partnerBenefitsActif.platformGain
      },
      premium: {
        clientPays: partnerBenefitsPremium.finalPrice,
        clientDiscount: partnerBenefitsPremium.discountClient,
        supplierGets: supplierPrice,
        partnerGets: partnerBenefitsPremium.commissionPartner,
        platformGets: partnerBenefitsPremium.platformGain
      }
    },

    // Informations de validation
    validation: {
      hasMinimumMargin: platformMargin >= 1000,
      canActivatePartnerProgram: platformMargin >= 1000,
      surplus: Math.max(0, platformMargin - 1000)
    }
  };
};

/**
 * Génère un rapport financier détaillé pour une période
 * FONCTION ADMIN UNIQUEMENT
 * 
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @param {array} orders - Commandes de la période
 * @param {array} partners - Partenaires
 * @param {array} suppliers - Fournisseurs
 * @returns {object} Rapport financier complet
 */
export const generateAdminFinancialReport = (startDate, endDate, orders, partners, suppliers) => {
  // Filtrer les commandes par période
  const periodOrders = orders.filter(order => {
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculs financiers
  const finances = calculateAdminGlobalFinances(periodOrders, partners, suppliers);

  // Tendances (comparaison avec période précédente - à implémenter si besoin)
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  return {
    period: {
      start: startDate,
      end: endDate,
      days: daysDiff
    },
    summary: {
      totalOrders: periodOrders.length,
      totalRevenue: finances.revenue.totalReceived,
      platformProfit: finances.distribution.platform.total,
      averageDailyRevenue: daysDiff > 0 ? Math.round(finances.revenue.totalReceived / daysDiff) : 0,
      averageDailyProfit: daysDiff > 0 ? Math.round(finances.distribution.platform.total / daysDiff) : 0
    },
    details: finances,
    topMetrics: {
      conversionRate: finances.orders.total > 0 
        ? ((finances.orders.delivered / finances.orders.total) * 100).toFixed(2) 
        : 0,
      averageOrderValue: finances.orders.averageOrderValue,
      platformMarginRate: finances.revenue.totalReceived > 0
        ? ((finances.distribution.platform.total / finances.revenue.totalReceived) * 100).toFixed(2)
        : 0
    }
  };
};

// Export par défaut
export default {
  calculatePartnerBenefits,
  formatCurrency,
  getPartnerLevel,
  calculateDeliveryFee,
  validateMargin,
  calculateOrderTotal,
  calculateSupplierEarnings,
  calculatePartnerEarnings,
  validateWithdrawal,
  calculateLevelProgress,
  calculatePlatformStats,
  // Fonctions ADMIN
  calculateAdminOrderFinances,
  calculateAdminGlobalFinances,
  calculateAdminProductFinances,
  generateAdminFinancialReport
};