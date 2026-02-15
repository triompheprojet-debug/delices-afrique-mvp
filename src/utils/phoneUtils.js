/**
 * 🔧 UTILITAIRES POUR LA GESTION DES NUMÉROS DE TÉLÉPHONE
 */

/**
 * Normalise un numéro de téléphone en retirant tous les espaces, tirets, parenthèses
 * @param {string} phone - Numéro brut saisi par l'utilisateur
 * @returns {string} - Numéro normalisé (chiffres uniquement)
 * @example normalizePhone("06 000 00 00") => "060000000"
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  // Retire tous les caractères non-numériques (espaces, tirets, parenthèses, etc.)
  return phone.replace(/\D/g, '');
};

/**
 * Formate un numéro pour l'affichage (ajoute des espaces)
 * @param {string} phone - Numéro normalisé
 * @returns {string} - Numéro formaté pour affichage
 * @example formatPhone("060000000") => "06 000 00 00"
 */
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  const normalized = normalizePhone(phone);
  
  // Format: XX XXX XX XX
  if (normalized.length === 9) {
    return `${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7, 9)}`;
  }
  
  return normalized;
};

/**
 * Valide un numéro de téléphone Congo (06, 05, 04 + 7 chiffres)
 * @param {string} phone - Numéro à valider
 * @returns {boolean} - true si valide
 */
export const isValidCongoPhone = (phone) => {
  const normalized = normalizePhone(phone);
  // Doit commencer par 06, 05 ou 04 et contenir exactement 9 chiffres
  return /^(06|05|04)\d{7}$/.test(normalized);
};