import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  Search, Filter, Truck, ShoppingBag, Phone, MapPin, 
  Clock, CheckCircle, XCircle, AlertCircle, Calendar,
  ArrowUpRight, DollarSign
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS POUR LA RECHERCHE ET LES FILTRES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // 1. Récupération des données (Real-time)
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Son de notification si nouvelle commande
      if (!loading && ordersData.length > orders.length) {
         audioRef.current.play().catch(e => console.log("Audio autoplay bloqué"));
      }

      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Moteur de Recherche et Filtrage
  useEffect(() => {
    let result = orders;

    // Filtre par Statut
    if (statusFilter !== 'Tous') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Filtre par Recherche (Nom, Tel, Code)
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

  // Fonction update statut
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      console.error("Erreur update:", error);
    }
  };

  // --- STATISTIQUES RAPIDES (Calculées à la volée) ---
  const stats = {
    pending: orders.filter(o => o.status === 'En attente').length,
    revenue: orders.reduce((acc, curr) => acc + (curr.details?.finalTotal || 0), 0),
    delivery: orders.filter(o => o.details?.method === 'Livraison').length
  };

  return (
    <div className="pb-20 max-w-6xl mx-auto">
      
      {/* --- EN-TÊTE & STATS --- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Commandes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Carte 1 : En attente */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En attente</p>
              <h3 className="text-2xl font-bold text-orange-600">{stats.pending}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>

          {/* Carte 2 : Chiffre d'affaire (Total théorique) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Revenu Total</p>
              <h3 className="text-2xl font-bold text-green-700">{stats.revenue.toLocaleString()} <span className="text-sm">FCFA</span></h3>
            </div>
            <div className="p-3 bg-green-50 text-green-700 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>

          {/* Carte 3 : Livraisons */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Demandes Livraison</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.delivery}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Truck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* --- BARRE D'OUTILS (Recherche + Filtres) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 border border-gray-100">
        
        {/* Barre de recherche */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher (Nom, Tel, Code CMD...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brown/20 transition"
          />
        </div>

        {/* Filtres Statut */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter size={20} className="text-gray-400 hidden md:block" />
          {['Tous', 'En attente', 'En préparation', 'En livraison', 'Terminé'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                statusFilter === status 
                  ? 'bg-brand-brown text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* --- LISTE DES COMMANDES --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement des commandes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucune commande trouvée pour cette recherche.</p>
          <button onClick={() => {setSearchTerm(''); setStatusFilter('Tous')}} className="mt-2 text-brand-brown underline">Réinitialiser les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-xl border transition-all hover:shadow-md ${order.status === 'En attente' ? 'border-l-4 border-l-red-500 border-gray-200' : 'border-gray-200'}`}>
              
              {/* En-tête de la carte */}
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex gap-4">
                  {/* Icone Type (Livraison vs Retrait) */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${order.details?.method === 'Livraison' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {order.details?.method === 'Livraison' ? <Truck size={24}/> : <ShoppingBag size={24}/>}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{order.code}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{order.customer?.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <a href={`tel:${order.customer?.phone}`} className="flex items-center gap-1 hover:text-brand-brown font-medium"><Phone size={14}/> {order.customer?.phone}</a>
                    </div>
                  </div>
                </div>

                {/* Sélecteur de Statut */}
                <div className="flex flex-col items-end gap-2">
                   <div className="relative">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-bold cursor-pointer border focus:ring-2 focus:ring-opacity-50 outline-none
                          ${order.status === 'En attente' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-200' : 
                            order.status === 'Livré' || order.status === 'Terminé' ? 'bg-green-50 text-green-700 border-green-200' : 
                            'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        <option>En attente</option>
                        <option>En préparation</option>
                        {order.details?.method === 'Livraison' ? <option>En livraison</option> : <option>Prêt au retrait</option>}
                        <option>Livré</option>
                        <option>Terminé</option>
                        <option>Annulé</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                   </div>
                   <span className="text-2xl font-bold text-gray-800">
                      {order.details?.finalTotal?.toLocaleString()} <span className="text-sm font-normal text-gray-500">FCFA</span>
                   </span>
                </div>
              </div>

              {/* Corps : Adresse & Produits */}
              <div className="p-5 grid md:grid-cols-2 gap-6">
                
                {/* Info Livraison / Retrait */}
                <div className="bg-gray-50 p-4 rounded-xl">
                   <h4 className="font-bold text-gray-700 text-xs uppercase mb-3 flex items-center gap-2">
                      {order.details?.method === 'Livraison' ? <><MapPin size={14}/> Adresse de livraison</> : <><Clock size={14}/> Date de retrait</>}
                   </h4>
                   {order.details?.method === 'Livraison' ? (
                      <p className="text-gray-800 font-medium leading-relaxed">{order.customer?.address}</p>
                   ) : (
                      <p className="text-gray-800 font-medium">
                        {order.details?.pickupDate ? new Date(order.details.pickupDate).toLocaleString('fr-FR') : 'Non spécifié'}
                      </p>
                   )}
                   
                   {order.details?.notes && (
                     <div className="mt-3 text-sm bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 flex gap-2 items-start">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                        <span>"{order.details.notes}"</span>
                     </div>
                   )}
                </div>

                {/* Liste Produits */}
                <div>
                  <h4 className="font-bold text-gray-700 text-xs uppercase mb-3 flex items-center gap-2"><ShoppingBag size={14}/> Détail commande</h4>
                  <ul className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-1 last:border-0">
                        <span className="text-gray-600"><span className="font-bold text-gray-800">{item.quantity}x</span> {item.name}</span>
                        <span className="font-medium text-gray-800">{(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between text-sm pt-2 border-t border-gray-200">
                     <span className="text-gray-500">Livraison</span>
                     <span className="font-medium">{order.details?.deliveryFee > 0 ? order.details.deliveryFee : 'Gratuit'}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;