/**
 * ========================================
 * Délices d'Afrique - useAuth Hook
 * Gestion de l'authentification Firebase
 * ========================================
 */

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Hook personnalisé pour l'authentification
 * Gère les connexions admin, partenaires, fournisseurs
 * 
 * @returns {object} { user, loading, error, login, register, logout, resetPassword, updatePassword }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Écoute les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer les informations utilisateur depuis Firestore
          // On vérifie d'abord dans partners, puis suppliers, puis admin
          let userData = null;
          let userRole = null;

          // Vérifier si c'est un partenaire
          const partnerDoc = await getDoc(doc(db, 'partners', firebaseUser.uid));
          if (partnerDoc.exists()) {
            userData = { id: firebaseUser.uid, ...partnerDoc.data() };
            userRole = 'partner';
          }

          // Vérifier si c'est un fournisseur
          if (!userData) {
            const supplierDoc = await getDoc(doc(db, 'suppliers', firebaseUser.uid));
            if (supplierDoc.exists()) {
              userData = { id: firebaseUser.uid, ...supplierDoc.data() };
              userRole = 'supplier';
            }
          }

          // Vérifier si c'est un admin
          if (!userData) {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminDoc.exists()) {
              userData = { id: firebaseUser.uid, ...adminDoc.data() };
              userRole = 'admin';
            }
          }

          setUser({
            ...firebaseUser,
            role: userRole,
            data: userData
          });
        } catch (err) {
          console.error('Erreur lors de la récupération des données utilisateur:', err);
          setError(err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Connexion avec email et mot de passe
   * 
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<object>} Utilisateur connecté
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return userCredential.user;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      // Messages d'erreur en français
      let errorMessage = 'Erreur de connexion';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format d\'email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   * 
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   * @param {object} userData - Données additionnelles de l'utilisateur
   * @param {string} role - Rôle ('partner', 'supplier', 'admin')
   * @returns {Promise<object>} Utilisateur créé
   */
  const register = async (email, password, userData = {}, role = 'partner') => {
    try {
      setError(null);
      setLoading(true);

      // Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Déterminer la collection selon le rôle
      const collectionName = role === 'admin' ? 'admins' : 
                            role === 'supplier' ? 'suppliers' : 
                            'partners';

      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, collectionName, uid), {
        email,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return userCredential.user;
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format d\'email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion
   * 
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      setError('Erreur lors de la déconnexion');
      throw err;
    }
  };

  /**
   * Réinitialisation du mot de passe
   * 
   * @param {string} email - Email du compte
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('Erreur de réinitialisation:', err);
      
      let errorMessage = 'Erreur lors de la réinitialisation';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format d\'email invalide';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Modification du mot de passe
   * 
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Promise<void>}
   */
  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      
      if (!auth.currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    } catch (err) {
      console.error('Erreur de modification du mot de passe:', err);
      
      let errorMessage = 'Erreur lors de la modification du mot de passe';
      
      switch (err.code) {
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Veuillez vous reconnecter pour effectuer cette action';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPartner: user?.role === 'partner',
    isSupplier: user?.role === 'supplier'
  };
};

export default useAuth;