import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  Search, Filter, Truck, ShoppingBag, Phone, MapPin, 
  Clock, Calendar, DollarSign, User, ChevronDown, 
  ChevronUp, ExternalLink, CreditCard
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gestion de l'expansion des cartes (pour voir les détails)
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // --- 1. RÉCUPÉRATION DATA ---
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Notification sonore (si nouvelle commande arrive)
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

    if (statusFilter !== 'Tous') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.customer?.name.toLowerCase().includes(lowerTerm) ||
        order.customer?.phone.includes(lowerTerm) ||
        order.code?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  // --- 3. ACTIONS ---
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      console.error("Erreur update:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Helper pour ouvrir Google Maps avec les coordonnées
  const openGps = (lat, lng) => {
    if(lat && lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  // --- STATS ---
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
          <h1 className="text-3xl font-serif font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 text-sm">Gérez vos livraisons et retraits en temps réel.</p>
        </div>
        
        {/* Stats Rapides */}
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
              <div className="text-xs text-gray-500 font-bold uppercase">Revenu</div>
              <div className="font-bold text-xl text-gray-800">{(stats.revenue / 1000).toFixed(1)}k</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BARRE DE CONTRÔLE (Sticky) --- */}
      <div className="sticky top-2 z-30 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un client, N°..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-brown/20 transition text-sm"
          />
        </div>

        {/* Filtres (Scrollable sur mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {['Tous', 'En attente', 'En préparation', 'En livraison', 'Terminé'].map((status) => (
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

      {/* --- LISTE DES CARTES --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Chargement des commandes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Search size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isDelivery = order.details?.method === 'Livraison';
            const statusColor = 
                order.status === 'En attente' ? 'bg-red-100 text-red-700 border-red-200' :
                order.status === 'Terminé' || order.status === 'Livré' ? 'bg-green-100 text-green-700 border-green-200' :
                'bg-blue-100 text-blue-700 border-blue-200';

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                
                {/* --- HEADER CARTE (Toujours visible) --- */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                  
                  {/* Gauche: Icone + Info Client */}
                  <div className="flex gap-4 flex-grow">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDelivery ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {isDelivery ? <Truck size={24}/> : <ShoppingBag size={24}/>}
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-gray-500 tracking-wider">#{order.code}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                          <Calendar size={10}/> 
                          {/* Affichage intelligent de la date */}
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) : ''}
                           à {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.customer?.name}</h3>
                      <a href={`tel:${order.customer?.phone}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-brown font-medium mt-1">
                        <Phone size={14}/> {order.customer?.phone}
                      </a>
                    </div>
                  </div>

                  {/* Droite: Statut + Prix + Toggle */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                    
                    {/* Selecteur Statut Stylisé */}
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
                       <button 
                         onClick={() => toggleExpand(order.id)}
                         className="hidden md:flex items-center gap-1 text-xs text-gray-400 hover:text-gray-800 ml-auto transition"
                       >
                         {isExpanded ? 'Masquer détails' : 'Voir détails'} <ChevronDown size={12} className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}/>
                       </button>
                    </div>
                  </div>
                </div>

                {/* --- DÉTAILS EXPANDABLES (Visible si click ou bouton) --- */}
                {/* Sur mobile, on affiche toujours un bouton "Voir plus" en bas, ou on laisse ouvert si expanded */}
                <div className={`bg-gray-50/50 border-t border-gray-100 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-5 grid md:grid-cols-2 gap-6">
                    
                    {/* Colonne 1 : Logistique */}
                    <div className="space-y-4">
                      {/* Adresse / Lieu */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                           {isDelivery ? <><MapPin size={14}/> Destination</> : <><Clock size={14}/> Retrait prévu</>}
                         </h4>
                         
                         {isDelivery ? (
                           <>
                             <p className="text-gray-800 font-medium mb-3">{order.customer?.address || "Adresse non spécifiée"}</p>
                             {/* BOUTON GPS IMPORTANȚ */}
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
                             <p className="text-gray-800 font-bold text-lg">
                               {order.details?.scheduledDate ? new Date(order.details.scheduledDate).toLocaleDateString() : 'Date inconnue'}
                             </p>
                             <p className="text-gray-600">
                               à {order.details?.scheduledTime || '--:--'}
                             </p>
                           </div>
                         )}
                      </div>

                      {/* Paiement & Notes */}
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100">
                           <div className="text-xs text-gray-400 mb-1">Paiement</div>
                           <div className="font-bold text-gray-700 text-sm flex items-center gap-1">
                             <CreditCard size={14}/> {order.details?.paymentMethod || 'Espèces'}
                           </div>
                        </div>
                        {order.details?.deliveryDistance && (
                          <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100">
                             <div className="text-xs text-gray-400 mb-1">Distance</div>
                             <div className="font-bold text-gray-700 text-sm">{order.details.deliveryDistance} km</div>
                          </div>
                        )}
                      </div>

                      {order.details?.notes && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm border border-yellow-100">
                          <span className="font-bold">Note client :</span> "{order.details.notes}"
                        </div>
                      )}
                    </div>

                    {/* Colonne 2 : Panier */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ShoppingBag size={14}/> Contenu du panier
                      </h4>
                      <ul className="divide-y divide-gray-50">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="py-2 flex justify-between text-sm">
                            <div className="flex items-start gap-3">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold h-fit">{item.quantity}x</span>
                              <span className="text-gray-700">{item.name} <span className="text-gray-400 text-xs block">{item.variant}</span></span>
                            </div>
                            <span className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                         <span>Frais de livraison</span>
                         <span className="font-medium text-gray-800">
                           {order.details?.deliveryFee > 0 ? `+ ${order.details.deliveryFee.toLocaleString()}` : 'Offert'}
                         </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bouton Toggle Mobile Uniquement */}
                <button 
                  onClick={() => toggleExpand(order.id)}
                  className="w-full py-3 bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 md:hidden flex items-center justify-center gap-2 border-t border-gray-100"
                >
                  {isExpanded ? 'Fermer' : 'Détails Commande'} <ChevronDown size={14} className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}/>
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