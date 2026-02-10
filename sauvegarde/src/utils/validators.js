/**
 * ========================================
 * DÉLICES D'AFRIQUE - VALIDATORS
 * Validations de données
 * ========================================
 */

/**
 * Valide un numéro de téléphone congolais
 * 
 * Formats acceptés :
 * - 06 XXX XXXX (9 chiffres)
 * - 242 06 XXX XXXX (12 chiffres avec indicatif)
 * - +242 06 XXX XXXX (avec +)
 * 
 * @param {string} phone - Numéro de téléphone
 * @returns {object} { valid: boolean, message: string, cleaned: string }
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return {
      valid: false,
      message: 'Le numéro de téléphone est requis',
      cleaned: ''
    };
  }

  // Nettoyer le numéro (enlever espaces, tirets, parenthèses, +)
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');

  // Vérifier que ce ne sont que des chiffres
  if (!/^\d+$/.test(cleaned)) {
    return {
      valid: false,
      message: 'Le numéro ne doit contenir que des chiffres',
      cleaned: ''
    };
  }

  // Format avec indicatif international (242XXXXXXXXX)
  if (cleaned.startsWith('242')) {
    if (cleaned.length !== 12) {
      return {
        valid: false,
        message: 'Le format avec indicatif doit contenir 12 chiffres (242 + 9 chiffres)',
        cleaned: ''
      };
    }

    // Vérifier que le numéro commence par 06 ou 05 après l'indicatif
    const localPart = cleaned.substring(3);
    if (!localPart.startsWith('06') && !localPart.startsWith('05')) {
      return {
        valid: false,
        message: 'Le numéro doit commencer par 06 ou 05',
        cleaned: ''
      };
    }

    return {
      valid: true,
      message: 'Numéro valide',
      cleaned: cleaned
    };
  }

  // Format local (9 chiffres : 06XXXXXXX ou 05XXXXXXX)
  if (cleaned.length === 9) {
    if (!cleaned.startsWith('06') && !cleaned.startsWith('05')) {
      return {
        valid: false,
        message: 'Le numéro doit commencer par 06 ou 05',
        cleaned: ''
      };
    }

    return {
      valid: true,
      message: 'Numéro valide',
      cleaned: '242' + cleaned // Ajouter l'indicatif
    };
  }

  // Format avec 0 initial (10 chiffres : 006XXXXXXX)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    const withoutZero = cleaned.substring(1);
    if (!withoutZero.startsWith('06') && !withoutZero.startsWith('05')) {
      return {
        valid: false,
        message: 'Le numéro doit commencer par 06 ou 05',
        cleaned: ''
      };
    }

    return {
      valid: true,
      message: 'Numéro valide',
      cleaned: '242' + withoutZero
    };
  }

  return {
    valid: false,
    message: 'Format de numéro invalide. Utilisez le format : 06 XXX XXXX',
    cleaned: ''
  };
};

/**
 * Valide une adresse email
 * 
 * @param {string} email - Adresse email
 * @returns {object} { valid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      message: 'L\'adresse email est requise'
    };
  }

  // Regex email basique mais robuste
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Format d\'email invalide'
    };
  }

  // Vérifications supplémentaires
  if (email.length > 254) {
    return {
      valid: false,
      message: 'L\'email est trop long (max 254 caractères)'
    };
  }

  const [localPart, domain] = email.split('@');

  if (localPart.length > 64) {
    return {
      valid: false,
      message: 'La partie locale de l\'email est trop longue'
    };
  }

  if (domain.length > 253) {
    return {
      valid: false,
      message: 'Le domaine de l\'email est trop long'
    };
  }

  return {
    valid: true,
    message: 'Email valide'
  };
};

/**
 * Valide un mot de passe
 * 
 * @param {string} password - Mot de passe
 * @param {number} minLength - Longueur minimale (défaut: 6)
 * @param {boolean} requireSpecial - Exiger caractère spécial (défaut: false)
 * @returns {object} { valid: boolean, message: string, strength: string }
 */
export const validatePassword = (password, minLength = 6, requireSpecial = false) => {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      message: 'Le mot de passe est requis',
      strength: 'weak'
    };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Le mot de passe doit contenir au moins ${minLength} caractères`,
      strength: 'weak'
    };
  }

  // Vérifier caractère spécial si requis
  if (requireSpecial) {
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) {
      return {
        valid: false,
        message: 'Le mot de passe doit contenir au moins un caractère spécial',
        strength: 'weak'
      };
    }
  }

  // Calcul de la force du mot de passe
  let strength = 'weak';
  let strengthScore = 0;

  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[0-9]/.test(password)) strengthScore++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore++;

  if (strengthScore >= 5) {
    strength = 'strong';
  } else if (strengthScore >= 3) {
    strength = 'medium';
  }

  return {
    valid: true,
    message: 'Mot de passe valide',
    strength: strength
  };
};

/**
 * Valide un code partenaire (format: DA-XXXXXX)
 * 
 * @param {string} code - Code partenaire
 * @returns {object} { valid: boolean, message: string, formatted: string }
 */
export const validatePartnerCode = (code) => {
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      message: 'Le code partenaire est requis',
      formatted: ''
    };
  }

  // Nettoyer et formater
  const cleaned = code.trim().toUpperCase();

  // Vérifier le format DA-XXXXXX
  const codeRegex = /^DA-[A-Z0-9]{6}$/;

  if (!codeRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'Format de code invalide. Format attendu : DA-XXXXXX',
      formatted: ''
    };
  }

  return {
    valid: true,
    message: 'Code valide',
    formatted: cleaned
  };
};

/**
 * Valide un montant (prix, commission, etc.)
 * 
 * @param {number|string} amount - Montant à valider
 * @param {number} min - Montant minimum (optionnel)
 * @param {number} max - Montant maximum (optionnel)
 * @returns {object} { valid: boolean, message: string, value: number }
 */
export const validateAmount = (amount, min = 0, max = null) => {
  if (amount === null || amount === undefined || amount === '') {
    return {
      valid: false,
      message: 'Le montant est requis',
      value: 0
    };
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return {
      valid: false,
      message: 'Le montant doit être un nombre valide',
      value: 0
    };
  }

  if (numAmount < 0) {
    return {
      valid: false,
      message: 'Le montant ne peut pas être négatif',
      value: 0
    };
  }

  if (min !== null && numAmount < min) {
    return {
      valid: false,
      message: `Le montant minimum est de ${min} FCFA`,
      value: numAmount
    };
  }

  if (max !== null && numAmount > max) {
    return {
      valid: false,
      message: `Le montant maximum est de ${max} FCFA`,
      value: numAmount
    };
  }

  return {
    valid: true,
    message: 'Montant valide',
    value: numAmount
  };
};

/**
 * Valide un nom (personne, produit, etc.)
 * 
 * @param {string} name - Nom à valider
 * @param {number} minLength - Longueur minimale (défaut: 2)
 * @param {number} maxLength - Longueur maximale (défaut: 100)
 * @returns {object} { valid: boolean, message: string }
 */
export const validateName = (name, minLength = 2, maxLength = 100) => {
  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      message: 'Le nom est requis'
    };
  }

  const trimmed = name.trim();

  if (trimmed.length < minLength) {
    return {
      valid: false,
      message: `Le nom doit contenir au moins ${minLength} caractères`
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      message: `Le nom ne peut pas dépasser ${maxLength} caractères`
    };
  }

  // Vérifier que le nom ne contient pas de caractères suspects
  const suspiciousChars = /[<>{}[\]\\\/]/;
  if (suspiciousChars.test(trimmed)) {
    return {
      valid: false,
      message: 'Le nom contient des caractères non autorisés'
    };
  }

  return {
    valid: true,
    message: 'Nom valide'
  };
};

/**
 * Valide une adresse
 * 
 * @param {string} address - Adresse à valider
 * @param {number} minLength - Longueur minimale (défaut: 5)
 * @returns {object} { valid: boolean, message: string }
 */
export const validateAddress = (address, minLength = 5) => {
  if (!address || typeof address !== 'string') {
    return {
      valid: false,
      message: 'L\'adresse est requise'
    };
  }

  const trimmed = address.trim();

  if (trimmed.length < minLength) {
    return {
      valid: false,
      message: `L\'adresse doit contenir au moins ${minLength} caractères`
    };
  }

  return {
    valid: true,
    message: 'Adresse valide'
  };
};

/**
 * Valide une URL
 * 
 * @param {string} url - URL à valider
 * @returns {object} { valid: boolean, message: string }
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      message: 'L\'URL est requise'
    };
  }

  try {
    new URL(url);
    return {
      valid: true,
      message: 'URL valide'
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Format d\'URL invalide'
    };
  }
};

/**
 * Valide une image (fichier)
 * 
 * @param {File} file - Fichier image
 * @param {number} maxSizeMB - Taille maximale en Mo (défaut: 5)
 * @param {array} allowedTypes - Types MIME autorisés
 * @returns {object} { valid: boolean, message: string }
 */
export const validateImage = (
  file, 
  maxSizeMB = 5, 
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) => {
  if (!file) {
    return {
      valid: false,
      message: 'Aucun fichier sélectionné'
    };
  }

  // Vérifier le type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Type de fichier non autorisé. Formats acceptés : ${allowedTypes.join(', ')}`
    };
  }

  // Vérifier la taille
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `La taille du fichier ne doit pas dépasser ${maxSizeMB} Mo`
    };
  }

  return {
    valid: true,
    message: 'Image valide'
  };
};

/**
 * Valide une date
 * 
 * @param {string|Date} date - Date à valider
 * @param {boolean} future - La date doit être dans le futur
 * @param {boolean} past - La date doit être dans le passé
 * @returns {object} { valid: boolean, message: string, date: Date }
 */
export const validateDate = (date, future = false, past = false) => {
  if (!date) {
    return {
      valid: false,
      message: 'La date est requise',
      date: null
    };
  }

  let dateObj;

  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return {
      valid: false,
      message: 'Format de date invalide',
      date: null
    };
  }

  const now = new Date();

  if (future && dateObj <= now) {
    return {
      valid: false,
      message: 'La date doit être dans le futur',
      date: dateObj
    };
  }

  if (past && dateObj >= now) {
    return {
      valid: false,
      message: 'La date doit être dans le passé',
      date: dateObj
    };
  }

  return {
    valid: true,
    message: 'Date valide',
    date: dateObj
  };
};

/**
 * Valide des coordonnées GPS
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} { valid: boolean, message: string }
 */
export const validateCoordinates = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      message: 'Les coordonnées doivent être des nombres valides'
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      message: 'La latitude doit être entre -90 et 90'
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      message: 'La longitude doit être entre -180 et 180'
    };
  }

  return {
    valid: true,
    message: 'Coordonnées valides'
  };
};

/**
 * Valide un formulaire complet
 * 
 * @param {object} data - Données du formulaire
 * @param {object} rules - Règles de validation { field: validatorFunction }
 * @returns {object} { valid: boolean, errors: object }
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let valid = true;

  Object.keys(rules).forEach(field => {
    const validator = rules[field];
    const value = data[field];

    if (typeof validator === 'function') {
      const result = validator(value);
      if (!result.valid) {
        errors[field] = result.message;
        valid = false;
      }
    }
  });

  return {
    valid,
    errors
  };
};

// Export par défaut
export default {
  validatePhone,
  validateEmail,
  validatePassword,
  validatePartnerCode,
  validateAmount,
  validateName,
  validateAddress,
  validateUrl,
  validateImage,
  validateDate,
  validateCoordinates,
  validateForm
};