import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Package, Wallet, Store, Shield, LogOut, AlertTriangle, 
  TrendingUp, Clock, CheckCircle 
} from 'lucide-react';

const SupplierDashboard = () => {
  const { supplier } = useOutletContext();
  const navigate = useNavigate();
  
  // États pour les indicateurs temps réel
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [platformDebt, setPlatformDebt] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sécurité de Session [cite: 69-73]
  useEffect(() => {
    const sessionId = sessionStorage.getItem('supplierAuthenticated');
    if (sessionId !== supplier.id) {
      navigate(`/fournisseur/${supplier.accessSlug}`);
    }
  }, [supplier, navigate]);

  // Écoute temps réel des données vitales
  useEffect(() => {
    // 1. Écouter les commandes en cours (Règle séquentielle) [cite: 125-132]
    const qOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id),
      where('status', 'in', ['En attente', 'En préparation', 'En livraison'])
    );

    // 2. Écouter la dette (via le document fournisseur lui-même pour être synchro) [cite: 182-186]
    // Note: Le layout écoute déjà le supplier, mais ici on veut être sûr d'avoir la donnée fraîche
    
    const unsubscribeOrders = onSnapshot(qOrders, (snap) => {
      setActiveOrderCount(snap.size);
      setLoading(false);
    });

    // On met à jour la dette locale via les props du context si elles changent
    if(supplier.wallet) {
        setPlatformDebt(supplier.wallet.platformDebt || 0);
    }

    return () => unsubscribeOrders();
  }, [supplier]);

  const handleLogout = () => {
    sessionStorage.removeItem('supplierAuthenticated');
    navigate(`/fournisseur/${supplier.accessSlug}`);
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* HEADER ACCUEIL */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">Bonjour, {supplier.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            Code Vendeur : <span className="font-mono font-bold bg-gray-100 px-2 rounded text-brand-brown">{supplier.supplierCode}</span>
          </p>
        </div>
        <button onClick={handleLogout} className="text-sm text-red-500 font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-2">
            <LogOut size={16}/> Déconnexion
        </button>
      </div>

      {/* ALERTES CRITIQUES (DETTE) [cite: 218-224] */}
      {platformDebt > 0 && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${platformDebt > 50000 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
             <AlertTriangle className="shrink-0 mt-0.5"/>
             <div>
                <p className="font-bold">Régularisation requise</p>
                <p className="text-sm">
                    Vous devez reverser <span className="font-bold text-lg mx-1">{platformDebt.toLocaleString()} FCFA</span> à la plateforme.
                </p>
                <Link to="../wallet" className="text-sm underline font-bold mt-1 inline-block hover:opacity-80">
                    Cliquez ici pour payer et éviter le blocage.
                </Link>
             </div>
          </div>
      )}

      {/* STATUT OPÉRATIONNEL (Séquentiel) [cite: 126] */}
      <div className="bg-brand-brown/5 border border-brand-brown/10 p-6 rounded-2xl flex items-center justify-between">
         <div>
            <h3 className="font-bold text-brand-brown text-lg flex items-center gap-2">
                <Clock size={20}/> Commandes en cours
            </h3>
            <p className="text-sm text-gray-600 mt-1">
                {activeOrderCount > 0 
                  ? "Vous avez des commandes actives. Traitez-les une par une." 
                  : "Aucune commande en attente. Votre stand est calme."}
            </p>
         </div>
         <div className="text-3xl font-bold text-brand-brown bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
            {activeOrderCount}
         </div>
      </div>

      {/* GRILLE DE NAVIGATION RAPIDE [cite: 75-79] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARTE PRODUITS */}
        <Link to="../products" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><Store size={24}/></div>
             <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Catalogue</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">Mes Produits</h3>
          <p className="text-sm text-gray-500 mt-1">Ajouter des articles, gérer les stocks et voir les validations.</p>
        </Link>

        {/* CARTE COMMANDES */}
        <Link to="../orders" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-orange-50 p-3 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition relative">
                <Package size={24}/>
                {activeOrderCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
             </div>
             <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Livraisons</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition">Commandes</h3>
          <p className="text-sm text-gray-500 mt-1">Traiter les commandes entrantes et gérer les livraisons.</p>
        </Link>

        {/* CARTE FINANCES */}
        <Link to="../wallet" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition"><Wallet size={24}/></div>
             <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Trésorerie</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition">Portefeuille & Dettes</h3>
          <p className="text-sm text-gray-500 mt-1">Voir vos gains, votre dette plateforme et déclarer un paiement.</p>
        </Link>

        {/* CARTE RÈGLES */}
        <Link to="../rules" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition"><Shield size={24}/></div>
             <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Important</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition">Aides & Règles</h3>
          <p className="text-sm text-gray-500 mt-1">Comprendre le fonctionnement, les commissions et éviter les blocages.</p>
        </Link>

      </div>
    </div>
  );
};

export default SupplierDashboard;