import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifie en permanence si l'utilisateur est connecté
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  
  // Si pas d'utilisateur connecté, on renvoie vers /login
  if (!user) return <Navigate to="/login" />;

  // Sinon, on affiche la page demandée (les enfants)
  return children;
};

export default ProtectedRoute;