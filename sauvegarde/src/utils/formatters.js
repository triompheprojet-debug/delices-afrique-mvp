/**
 * ========================================
 * Délices d'Afrique - FORMATTERS
 * Formatage des données pour affichage
 * ========================================
 */

/**
 * Formate une date en français
 * 
 * @param {Date|string|Timestamp} date - Date à formater
 * @param {string} format - Format souhaité ('short', 'long', 'full')
 * @returns {string} Date formatée
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';

  let dateObj;
  
  // Conversion en objet Date
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date.toDate && typeof date.toDate === 'function') {
    // Timestamp Firestore
    dateObj = date.toDate();
  } else if (date.seconds) {
    // Timestamp Firestore (objet brut)
    dateObj = new Date(date.seconds * 1000);
  } else {
    return '-';
  }

  // Vérification validité
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const options = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  };

  return new Intl.DateTimeFormat('fr-FR', options[format] || options.short).format(dateObj);
};

/**
 * Formate une heure
 * 
 * @param {Date|string|Timestamp} date - Date/heure à formater
 * @param {boolean} withSeconds - Afficher les secondes
 * @returns {string} Heure formatée (ex: "14:30" ou "14:30:45")
 */
export const formatTime = (date, withSeconds = false) => {
  if (!date) return '-';

  let dateObj;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    return '-';
  }

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const options = {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds && { second: '2-digit' })
  };

  return new Intl.DateTimeFormat('fr-FR', options).format(dateObj);
};

/**
 * Formate une date et heure complète
 * 
 * @param {Date|string|Timestamp} date - Date à formater
 * @param {string} format - Format de la date ('short', 'long', 'full')
 * @returns {string} Date et heure formatées (ex: "5 fév. 2026 à 14:30")
 */
export const formatDateTime = (date, format = 'short') => {
  if (!date) return '-';

  const formattedDate = formatDate(date, format);
  const formattedTime = formatTime(date);

  if (formattedDate === '-' || formattedTime === '-') {
    return '-';
  }

  return `${formattedDate} à ${formattedTime}`;
};

/**
 * Formate une date relative (il y a X temps)
 * 
 * @param {Date|string|Timestamp} date - Date à formater
 * @returns {string} Date relative (ex: "Il y a 2 heures", "Il y a 3 jours")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';

  let dateObj;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    return '-';
  }

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const now = new Date();
  const diffMs = now - dateObj;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Il y a ${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
};

/**
 * Formate un numéro de téléphone congolais
 * 
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Téléphone formaté (ex: "+242 06 XXX XXXX")
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';

  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleaned = phone.replace(/\D/g, '');

  // Format Congo : +242 06 XXX XXXX
  if (cleaned.startsWith('242')) {
    // Format international complet
    const country = cleaned.substring(0, 3);
    const prefix = cleaned.substring(3, 5);
    const part1 = cleaned.substring(5, 8);
    const part2 = cleaned.substring(8, 12);
    return `+${country} ${prefix} ${part1} ${part2}`;
  } else if (cleaned.length === 9) {
    // Format local 06 XXX XXXX
    const prefix = cleaned.substring(0, 2);
    const part1 = cleaned.substring(2, 5);
    const part2 = cleaned.substring(5, 9);
    return `${prefix} ${part1} ${part2}`;
  } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Format avec 0 initial
    const prefix = cleaned.substring(0, 3);
    const part1 = cleaned.substring(3, 6);
    const part2 = cleaned.substring(6, 10);
    return `${prefix} ${part1} ${part2}`;
  }

  // Si format non reconnu, retourner tel quel
  return phone;
};

/**
 * Formate une adresse complète
 * 
 * @param {object} addressObj - Objet adresse { address, quartier, ville }
 * @returns {string} Adresse formatée
 */
export const formatAddress = (addressObj) => {
  if (!addressObj) return '-';

  if (typeof addressObj === 'string') {
    return addressObj;
  }

  const parts = [];

  if (addressObj.address) parts.push(addressObj.address);
  if (addressObj.quartier) parts.push(addressObj.quartier);
  if (addressObj.ville) parts.push(addressObj.ville);

  return parts.length > 0 ? parts.join(', ') : '-';
};

/**
 * Tronque un texte à une longueur maximale
 * 
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @param {string} suffix - Suffixe (défaut: "...")
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Formate un pourcentage
 * 
 * @param {number} value - Valeur (0-100 ou 0-1)
 * @param {boolean} isDecimal - true si la valeur est entre 0 et 1
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Pourcentage formaté (ex: "15%", "15.5%")
 */
export const formatPercent = (value, isDecimal = false, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
};

/**
 * Formate un nombre avec séparateurs de milliers
 * 
 * @param {number} number - Nombre à formater
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Nombre formaté (ex: "2 500", "1 250.50")
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Formate une distance
 * 
 * @param {number} distance - Distance en km
 * @returns {string} Distance formatée (ex: "2.5 km", "500 m")
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined || isNaN(distance)) {
    return '-';
  }

  const dist = Number(distance);

  if (dist < 1) {
    // Afficher en mètres si < 1 km
    return `${Math.round(dist * 1000)} m`;
  }

  return `${dist.toFixed(1)} km`;
};

/**
 * Formate un statut de commande avec emoji
 * 
 * @param {string} status - Statut de la commande
 * @returns {object} { label: string, emoji: string, color: string }
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'En attente': { 
      label: 'En attente', 
      emoji: '⏳', 
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    'En préparation': { 
      label: 'En préparation', 
      emoji: '👨‍🍳', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    'En livraison': { 
      label: 'En livraison', 
      emoji: '🚚', 
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    'Livré': { 
      label: 'Livré', 
      emoji: '✅', 
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    'Annulé': { 
      label: 'Annulé', 
      emoji: '❌', 
      color: 'text-error',
      bgColor: 'bg-red-100'
    }
  };

  return statusMap[status] || { 
    label: status || 'Inconnu', 
    emoji: '❓', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  };
};

/**
 * Formate un niveau de partenaire avec badge
 * 
 * @param {string} level - Niveau du partenaire
 * @returns {object} { label: string, emoji: string, color: string }
 */
export const formatPartnerLevel = (level) => {
  const levelMap = {
    'standard': { 
      label: 'Standard', 
      emoji: '⭐', 
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      badgeColor: 'bg-gradient-to-r from-gray-400 to-gray-600'
    },
    'actif': { 
      label: 'Actif', 
      emoji: '🔥', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      badgeColor: 'bg-gradient-to-r from-blue-400 to-blue-600'
    },
    'premium': { 
      label: 'Premium', 
      emoji: '👑', 
      color: 'text-gold-600',
      bgColor: 'bg-gold-100',
      badgeColor: 'bg-gradient-to-r from-gold-400 to-gold-600'
    }
  };

  return levelMap[level] || levelMap['standard'];
};

/**
 * Formate un statut de paiement
 * 
 * @param {string} status - Statut du paiement
 * @returns {object} { label: string, emoji: string, color: string }
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pending': { 
      label: 'En attente', 
      emoji: '⏳', 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    'paid': { 
      label: 'Payé', 
      emoji: '✅', 
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    'approved': { 
      label: 'Approuvé', 
      emoji: '✓', 
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    'rejected': { 
      label: 'Rejeté', 
      emoji: '❌', 
      color: 'text-error',
      bgColor: 'bg-red-100'
    }
  };

  return statusMap[status] || { 
    label: status || 'Inconnu', 
    emoji: '❓', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  };
};

/**
 * Formate une méthode de paiement
 * 
 * @param {string} method - Méthode de paiement
 * @returns {string} Méthode formatée avec emoji
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    'Espèces': '💵 Espèces',
    'Mobile Money': '📱 Mobile Money',
    'Airtel Money': '📱 Airtel Money',
    'MTN Money': '📱 MTN Money'
  };

  return methodMap[method] || method || '-';
};

/**
 * Formate une méthode de livraison
 * 
 * @param {string} method - Méthode de livraison
 * @returns {string} Méthode formatée avec emoji
 */
export const formatDeliveryMethod = (method) => {
  const methodMap = {
    'Livraison': '🚚 Livraison',
    'Retrait': '🏪 Retrait sur place'
  };

  return methodMap[method] || method || '-';
};
/**
 * Formate un montant en devise (FCFA)
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté (ex: "1 500 FCFA")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 FCFA';
  }

  // Utilise le format français pour les séparateurs de milliers (espace)
  // et ajoute la devise FCFA
  const formattedNumber = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  return `${formattedNumber} FCFA`;
};

/**
 * Formate un code de commande
 * 
 * @param {string} code - Code de commande
 * @returns {string} Code formaté
 */
export const formatOrderCode = (code) => {
  if (!code) return '-';
  return code.toUpperCase();
};

/**
 * Capitalise la première lettre d'un texte
 * 
 * @param {string} text - Texte à capitaliser
 * @returns {string} Texte capitalisé
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Transforme un texte en slug URL-friendly
 * 
 * @param {string} text - Texte à transformer
 * @returns {string} Slug
 */
export const slugify = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9]+/g, '-')      // Remplacer caractères spéciaux par -
    .replace(/^-+|-+$/g, '');         // Enlever - en début/fin
};

/**
 * Formate une plage horaire
 * 
 * @param {string} start - Heure de début (ex: "08:00")
 * @param {string} end - Heure de fin (ex: "22:00")
 * @returns {string} Plage formatée (ex: "8h00 - 22h00")
 */
export const formatTimeRange = (start, end) => {
  if (!start || !end) return '-';

  const formatHour = (time) => {
    const [hours, minutes] = time.split(':');
    return `${parseInt(hours)}h${minutes}`;
  };

  return `${formatHour(start)} - ${formatHour(end)}`;
};

// Export par défaut
export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  formatAddress,
  truncateText,
  formatPercent,
  formatNumber,
  formatDistance,
  formatOrderStatus,
  formatPartnerLevel,
  formatPaymentStatus,
  formatPaymentMethod,
  formatDeliveryMethod,
  formatOrderCode,
  formatCurrency,
  capitalize,
  slugify,
  formatTimeRange
};