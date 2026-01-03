import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // 1. Écouter TOUTES les commandes pour les statistiques globales
    const qAll = query(collection(db, "orders"));
    
    const unsubscribeStats = onSnapshot(qAll, (snapshot) => {
      let totalRev = 0;
      let todayRev = 0;
      let pending = 0;
      let delivered = 0;
      
      const today = new Date().toDateString(); // Date d'aujourd'hui format texte

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate ? data.createdAt.toDate().toDateString() : null;
        
        // Calcul Revenu Total (uniquement si commande non annulée)
        if (data.status !== 'Annulé') {
          totalRev += (data.details?.finalTotal || 0);
        }

        // Calcul Revenu Aujourd'hui
        if (orderDate === today && data.status !== 'Annulé') {
          todayRev += (data.details?.finalTotal || 0);
        }

        // Compteurs Statuts
        if (data.status === 'En attente') pending++;
        if (data.status === 'Livré' || data.status === 'Terminé') delivered++;
      });

      setStats({
        totalRevenue: totalRev,
        todayRevenue: todayRev,
        pendingOrders: pending,
        totalOrders: snapshot.size,
        deliveredOrders: delivered
      });
    });

    // 2. Écouter les 5 DERNIÈRES commandes pour le flux d'activité
    const qRecent = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
    
    const unsubscribeRecent = onSnapshot(qRecent, (snapshot) => {
      setRecentOrders(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setLoading(false);
    });

    return () => {
      unsubscribeStats();
      unsubscribeRecent();
    };
  }, []);

  // Composant Carte Statistique (pour éviter la répétition)
  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition hover:shadow-md">
      <div>
        <p className="text-gray-500 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subtext && <p className={`text-xs mt-2 font-bold ${colorClass}`}>{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Chargement des données...</div>;

  return (
    <div className="pb-20 max-w-7xl mx-auto">
      
      {/* --- TITRE ET BIENVENUE --- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
        <p className="text-gray-500">Aperçu de l'activité de votre boutique.</p>
      </div>

      {/* --- GRILLE DES STATISTIQUES (Responsive) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* 1. Commandes en attente (URGENT) */}
        <StatCard 
          title="Commandes en attente" 
          value={stats.pendingOrders}
          subtext={stats.pendingOrders > 0 ? "Nécessite votre attention !" : "Tout est calme."}
          icon={Clock}
          colorClass="text-red-600"
          bgClass="bg-red-50"
        />

        {/* 2. Revenu du Jour */}
        <StatCard 
          title="Ventes Aujourd'hui" 
          value={`${stats.todayRevenue.toLocaleString()} FCFA`}
          subtext="Recettes du jour"
          icon={TrendingUp}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />

        {/* 3. Total Commandes */}
        <StatCard 
          title="Total Commandes" 
          value={stats.totalOrders}
          subtext={`${stats.deliveredOrders} livrées avec succès`}
          icon={ShoppingBag}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />

        {/* 4. Revenu Global */}
        <StatCard 
          title="Chiffre d'affaires Global" 
          value={`${stats.totalRevenue.toLocaleString()} FCFA`}
          subtext="Total depuis le début"
          icon={DollarSign}
          colorClass="text-brand-brown"
          bgClass="bg-orange-50"
        />
      </div>

      {/* --- SECTION DÉTAILS (2 colonnes sur grand écran) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : Commandes Récentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-800">Commandes Récentes</h2>
            <Link to="/admin/orders" className="text-brand-brown text-sm font-bold flex items-center gap-1 hover:underline">
              Voir tout <ArrowRight size={16}/>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">Aucune commande récente.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-mono font-bold text-gray-600">{order.code}</td>
                      <td className="p-4 font-medium text-gray-800">{order.customer?.name}</td>
                      <td className="p-4 text-gray-600 font-bold">{(order.details?.finalTotal || 0).toLocaleString()} FCFA</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'En attente' ? 'bg-red-100 text-red-700' :
                          order.status === 'Livré' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-500 text-xs">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLONNE DROITE : Actions Rapides / État */}
        <div className="space-y-6">
          
          {/* Alerte Stock (Factice pour l'instant, ou lié à logic future) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-500"/> État du système
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Base de données</span>
                  <span className="text-green-600 font-bold flex items-center gap-1">Connecté <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div></span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Dernière mise à jour</span>
                  <span className="text-gray-800 font-medium">{new Date().toLocaleTimeString()}</span>
               </div>
            </div>
          </div>

          {/* Raccourcis */}
          <div className="bg-brand-brown/5 p-6 rounded-2xl border border-brand-brown/10">
             <h3 className="font-bold text-brand-brown mb-4">Raccourcis</h3>
             <div className="space-y-2">
                <Link to="/admin/products" className="block w-full bg-white text-center py-3 rounded-xl text-gray-700 font-bold shadow-sm hover:shadow-md transition">
                   Ajouter un produit
                </Link>
                <Link to="/admin/orders" className="block w-full bg-brand-brown text-center py-3 rounded-xl text-white font-bold shadow-sm hover:bg-brand-brown/90 transition">
                   Gérer les commandes
                </Link>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;