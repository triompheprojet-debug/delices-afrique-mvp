/**
 * ========================================
 * Délices d'Afrique - AUTH CONTEXT
 * Gestion globale de l'authentification
 * ========================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Création du contexte
const AuthContext = createContext();

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

/**
 * Provider pour l'authentification globale
 * Gère les rôles : admin, partner, supplier, client
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Détermine le rôle et récupère les données utilisateur
   */
  const fetchUserData = async (firebaseUser) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setUserRole(null);
      setUserData(null);
      return;
    }

    try {
      // 1. Vérifier si c'est un admin
      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
      if (adminDoc.exists()) {
        setCurrentUser(firebaseUser);
        setUserRole('admin');
        setUserData({ id: adminDoc.id, ...adminDoc.data() });
        return;
      }

      // 2. Vérifier si c'est un partenaire
      const partnerDoc = await getDoc(doc(db, 'partners', firebaseUser.uid));
      if (partnerDoc.exists()) {
        setCurrentUser(firebaseUser);
        setUserRole('partner');
        setUserData({ id: partnerDoc.id, ...partnerDoc.data() });
        return;
      }

      // 3. Vérifier si c'est un fournisseur
      const supplierDoc = await getDoc(doc(db, 'suppliers', firebaseUser.uid));
      if (supplierDoc.exists()) {
        setCurrentUser(firebaseUser);
        setUserRole('supplier');
        setUserData({ id: supplierDoc.id, ...supplierDoc.data() });
        return;
      }

      // 4. Si aucun rôle trouvé, considérer comme client
      setCurrentUser(firebaseUser);
      setUserRole('client');
      setUserData({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Client'
      });

    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      setError(err.message);
    }
  };

  /**
   * Écoute les changements d'authentification Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      await fetchUserData(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Connexion
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserData(userCredential.user);
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
        case 'auth/invalid-credential':
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        default:
          errorMessage = 'Erreur de connexion. Vérifiez vos identifiants.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserData(null);
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      setError('Erreur lors de la déconnexion');
      throw err;
    }
  };

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role) => {
    return userRole === role;
  };

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  const isAuthenticated = () => {
    return !!currentUser;
  };

  /**
   * Vérifie si l'utilisateur est admin
   */
  const isAdmin = () => {
    return userRole === 'admin';
  };

  /**
   * Vérifie si l'utilisateur est partenaire
   */
  const isPartner = () => {
    return userRole === 'partner';
  };

  /**
   * Vérifie si l'utilisateur est fournisseur
   */
  const isSupplier = () => {
    return userRole === 'supplier';
  };

  /**
   * Vérifie si l'utilisateur est client
   */
  const isClient = () => {
    return userRole === 'client' || !userRole;
  };

  /**
   * Récupère l'ID de l'utilisateur
   */
  const getUserId = () => {
    return currentUser?.uid || null;
  };

  /**
   * Récupère le nom d'affichage de l'utilisateur
   */
  const getDisplayName = () => {
    if (userData?.fullName) return userData.fullName;
    if (userData?.name) return userData.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Utilisateur';
  };

  /**
   * Récupère l'email de l'utilisateur
   */
  const getEmail = () => {
    return currentUser?.email || userData?.email || '';
  };

  // Valeur du contexte
  const value = {
    // État
    currentUser,
    userRole,
    userData,
    loading,
    error,
    
    // Fonctions d'authentification
    login,
    logout,
    
    // Vérifications de rôle
    hasRole,
    isAuthenticated,
    isAdmin,
    isPartner,
    isSupplier,
    isClient,
    
    // Getters
    getUserId,
    getDisplayName,
    getEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;