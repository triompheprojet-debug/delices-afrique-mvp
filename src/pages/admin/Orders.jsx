import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { 
  Search, Truck, ShoppingBag, Phone, MapPin, 
  Clock, Calendar, DollarSign, ChevronDown, 
  ExternalLink, CreditCard, User, AlertCircle, Store
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // --- 1. RÉCUPÉRATION DATA ---
  useEffect(() => {
    // Note : C'est ici que l'Admin récupère TOUT (pas de filtre fournisseur)
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Son de notification pour nouvelle commande (sauf au chargement initial)
      if (!loading && ordersData.length > orders.length) {
         audioRef.current.play().catch(e => console.log("Audio autoplay bloqué"));
      }

      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. FILTRAGE ---
  useEffect(() => {
    let result = orders;
    
    // Filtre par statut
    if (statusFilter !== 'Tous') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Recherche globale
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.customer?.name?.toLowerCase().includes(lowerTerm) ||
        order.customer?.phone?.includes(lowerTerm) ||
        order.code?.toLowerCase().includes(lowerTerm) ||
        order.supplierName?.toLowerCase().includes(lowerTerm) // Ajout recherche par fournisseur
      );
    }
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  // --- 3. ACTIONS ---
  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      
      // LOGIQUE COMMISSION PARTENAIRE (Apporteur d'affaire)
      if (newStatus === 'Livré' || newStatus === 'Terminé') {
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.data();

        // Vérifier si un PARTENAIRE PROMO (Affilié) doit être payé
        if (orderData.promo?.partnerId && orderData.promo?.status === 'pending') {
            const commission = orderData.promo.partnerCommission || 0;
            const partnerId = orderData.promo.partnerId;

            if (commission > 0) {
                const partnerRef = doc(db, "partners", partnerId);
                await updateDoc(partnerRef, {
                    walletBalance: increment(commission),
                    totalSales: increment(1),
                    totalEarnings: increment(commission)
                });

                await updateDoc(orderRef, {
                    status: newStatus,
                    "promo.status": "validated"
                });
            } else {
               await updateDoc(orderRef, { status: newStatus });
            }
        } else {
            await updateDoc(orderRef, { status: newStatus });
        }
      } else {
        await updateDoc(orderRef, { status: newStatus });
      }

    } catch (error) {
      console.error("Erreur update:", error);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const openGps = (lat, lng) => {
    if(lat && lng) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  // --- STATS RAPIDES ---
  const stats = {
    pending: orders.filter(o => o.status === 'En attente').length,
    revenue: orders.reduce((acc, curr) => acc + (curr.details?.finalTotal || 0), 0),
    delivery: orders.filter(o => o.details?.method === 'Livraison').length
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Suivi des Commandes</h1>
          <p className="text-gray-500 text-sm">Gestion globale (Admin).</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-orange-100 flex items-center gap-3 min-w-[140px]">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock size={18}/></div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase">Attente</div>
              <div className="font-bold text-xl text-gray-800">{stats.pending}</div>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-green-100 flex items-center gap-3 min-w-[140px]">
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign size={18}/></div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase">CA Total</div>
              <div className="font-bold text-xl text-gray-800">{(stats.revenue / 1000).toFixed(1)}k</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BARRE DE FILTRES --- */}
      <div className="sticky top-2 z-10 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher client, code, fournisseur..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-brown/20 transition text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {['Tous', 'En attente', 'En préparation', 'En livraison', 'Livré', 'Terminé'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                statusFilter === status 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* --- LISTE DES COMMANDES --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Chargement des données...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isDelivery = order.details?.method === 'Livraison';
            // Couleurs dynamiques selon statut
            const statusColor = 
                order.status === 'En attente' ? 'bg-red-100 text-red-700 border-red-200' :
                order.status === 'En préparation' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                order.status === 'En livraison' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-green-100 text-green-700 border-green-200';

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                
                {/* === HEADER CARTE === */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                  
                  {/* Info Principale */}
                  <div className="flex gap-4 flex-grow">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDelivery ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {isDelivery ? <Truck size={24}/> : <ShoppingBag size={24}/>}
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-gray-500 tracking-wider">#{order.code}</span>
                        
                        {/* BADGE FOURNISSEUR (NOUVEAU) */}
                        {order.supplierName ? (
                            <span className="flex items-center gap-1 bg-brand-brown/10 text-brand-brown px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-brand-brown/20">
                                <Store size={10}/> Fournisseur: {order.supplierName}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-gray-200">
                                <Store size={10}/> Plateforme
                            </span>
                        )}

                        {/* BADGE PARTENAIRE PROMO */}
                        {order.promo?.code && (
                            <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-200">
                                <User size={10}/> Promo: {order.promo.code}
                            </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.customer?.name}</h3>
                      <a href={`tel:${order.customer?.phone}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-brown font-medium mt-1">
                        <Phone size={14}/> {order.customer?.phone}
                      </a>
                    </div>
                  </div>

                  {/* Contrôles & Prix */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                    <div className="relative">
                       <select 
                         value={order.status} 
                         onChange={(e) => updateStatus(order.id, e.target.value)}
                         className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold cursor-pointer border focus:ring-2 focus:ring-offset-1 outline-none transition-colors ${statusColor}`}
                       >
                         <option>En attente</option>
                         <option>En préparation</option>
                         <option>{isDelivery ? 'En livraison' : 'Prêt au retrait'}</option>
                         <option>Livré</option>
                         <option>Terminé</option>
                         <option>Annulé</option>
                       </select>
                       <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"/>
                    </div>

                    <div className="text-right">
                       <div className="text-xl font-serif font-bold text-gray-900">
                         {order.details?.finalTotal?.toLocaleString()} <span className="text-xs font-sans text-gray-400 font-normal">FCFA</span>
                       </div>
                       <button onClick={() => toggleExpand(order.id)} className="hidden md:flex items-center gap-1 text-xs text-gray-400 hover:text-gray-800 ml-auto transition">
                         {isExpanded ? 'Masquer' : 'Détails'} <ChevronDown size={12} className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}/>
                       </button>
                    </div>
                  </div>
                </div>

                {/* === DÉTAILS DÉPLIABLES === */}
                <div className={`bg-gray-50/50 border-t border-gray-100 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-5 grid md:grid-cols-2 gap-6">
                    
                    {/* Colonne 1 : Logistique & Financier */}
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                           {isDelivery ? <><MapPin size={14}/> Destination</> : <><Clock size={14}/> Retrait prévu</>}
                         </h4>
                         
                         {isDelivery ? (
                           <>
                             <p className="text-gray-800 font-medium mb-3">{order.customer?.address}</p>
                             {order.customer?.location && (
                               <button 
                                 onClick={() => openGps(order.customer.location.lat, order.customer.location.lng)}
                                 className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
                               >
                                 <ExternalLink size={16}/> Ouvrir GPS
                               </button>
                             )}
                           </>
                         ) : (
                           <div>
                             <p className="text-gray-800 font-bold text-lg">{order.details?.scheduledDate}</p>
                             <p className="text-gray-600">à {order.details?.scheduledTime}</p>
                           </div>
                         )}
                         
                         {order.details?.notes && (
                            <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                                <strong>Note client:</strong> {order.details.notes}
                            </div>
                         )}
                      </div>

                      {/* Info Commission Partenaire (Promo) */}
                      {order.promo?.code && (
                         <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex justify-between items-center">
                            <div>
                               <p className="text-xs font-bold text-purple-800 uppercase">Affilié (Promo)</p>
                               <p className="text-sm text-purple-900">{order.promo.code}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs text-purple-600">Com. Affilié</p>
                               <p className="font-bold text-purple-800">+{order.promo.partnerCommission} F</p>
                            </div>
                         </div>
                      )}
                    </div>

                    {/* Colonne 2 : Contenu du Panier */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit">
                      <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><ShoppingBag size={14}/> Panier</h4>
                          {order.supplierName && <span className="text-[10px] bg-brand-brown text-white px-2 py-0.5 rounded-full">{order.supplierName}</span>}
                      </div>
                      
                      <ul className="divide-y divide-gray-50">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="py-2 flex justify-between text-sm">
                            <div className="flex items-start gap-3">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold h-fit">{item.quantity}x</span>
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                         <span>Livraison</span>
                         <span className="font-medium text-gray-800">{order.details?.deliveryFee > 0 ? `+ ${order.details.deliveryFee}` : 'Offert'}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bouton Mobile */}
                <button onClick={() => toggleExpand(order.id)} className="w-full py-3 bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 md:hidden flex items-center justify-center gap-2 border-t border-gray-100">
                  {isExpanded ? 'Fermer' : 'Détails'} <ChevronDown size={14} className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}/>
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;