import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  ShoppingBag, Clock, CheckCircle, XCircle, Calendar, 
  Search 
} from 'lucide-react';

const PartnerSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  // 1. Récupération des données réelles
  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const sessionData = JSON.parse(sessionStr);

    // Requête : Trouver toutes les commandes liées à ce partenaire
    // Note: On suppose que lors de la commande (Checkout), on a enregistré promo.partnerId
    const q = query(
      collection(db, "orders"), 
      where("promo.partnerId", "==", sessionData.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSales(salesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Filtrage côté client
  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    if (filter === 'pending') return sale.status !== 'Livrée' && sale.status !== 'Annulée';
    if (filter === 'completed') return sale.status === 'Livrée';
    return true;
  });

  // Utilitaires d'affichage
  const getStatusColor = (status) => {
    if (status === 'Livrée' || status === 'Terminée') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Annulée') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // En attente, En cours...
  };

  const getStatusIcon = (status) => {
    if (status === 'Livrée' || status === 'Terminée') return <CheckCircle size={14}/>;
    if (status === 'Annulée') return <XCircle size={14}/>;
    return <Clock size={14}/>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div></div>;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER & FILTRES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-brand-brown" size={24}/> Historique des Ventes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Total généré : <span className="font-bold text-gray-800">{sales.length} ventes</span>
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-brand-brown shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En cours' : 'Validées'}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES VENTES */}
      {filteredSales.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={24}/>
          </div>
          <h3 className="font-bold text-gray-800">Aucune vente trouvée</h3>
          <p className="text-gray-500 text-sm">Partagez votre code pour commencer à gagner !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* VERSION MOBILE (CARDS) */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="p-5 flex justify-between items-center active:bg-gray-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${getStatusColor(sale.status)}`}>
                       {getStatusIcon(sale.status)} {sale.status}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                       <Calendar size={10}/> {formatDate(sale.createdAt)}
                    </span>
                  </div>
                  <div className="font-bold text-gray-800 text-sm">
                     Commande #{sale.code}
                  </div>
                  <div className="text-xs text-gray-500">
                     Montant: {sale.details?.finalTotal?.toLocaleString()} F
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xs text-gray-400 uppercase font-bold mb-1">Commission</div>
                   <div className={`text-lg font-black ${sale.status === 'Livrée' ? 'text-green-600' : 'text-gray-400'}`}>
                      +{sale.promo?.discountAmount ? Math.round(sale.promo.discountAmount * 1.5) : 0} F
                      {/* Note: Ici j'ai mis une formule temporaire car la commission exacte doit être stockée dans la commande lors de l'achat. 
                          Idéalement : +{sale.promo?.partnerCommission} F */}
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* VERSION DESKTOP (TABLEAU) */}
          <table className="hidden md:table w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="p-5">Date</th>
                <th className="p-5">Référence</th>
                <th className="p-5">Client (Masqué)</th>
                <th className="p-5 text-right">Montant Vente</th>
                <th className="p-5 text-center">Statut</th>
                <th className="p-5 text-right">Votre Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition">
                  <td className="p-5 text-sm text-gray-600 font-medium">{formatDate(sale.createdAt)}</td>
                  <td className="p-5 text-sm font-bold text-gray-800">#{sale.code}</td>
                  <td className="p-5 text-sm text-gray-500 italic">
                      {sale.customer?.name?.split(' ')[0]}***
                  </td>
                  <td className="p-5 text-right text-sm font-medium text-gray-600">
                     {sale.details?.finalTotal?.toLocaleString()} FCFA
                  </td>
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(sale.status)}`}>
                       {getStatusIcon(sale.status)} {sale.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                     <span className={`font-black text-lg ${sale.status === 'Livrée' ? 'text-green-600' : 'text-gray-300'}`}>
                        +{sale.promo?.partnerCommission || 0} FCFA
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartnerSales;