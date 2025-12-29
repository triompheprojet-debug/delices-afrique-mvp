import React, { useState } from 'react';
import { Eye, CheckCircle, Truck, XCircle, Clock, MapPin, Phone, User, ChefHat,Store } from 'lucide-react';
 // On utilisera des données fictives incluses dans le code pour simplifier

const Orders = () => {
  // Données fictives pour la démo (si le fichier json n'existe pas encore, on les met ici)
  const demoOrders = [
    {
      id: "CMD-8832",
      customer: "Jean Kouassi",
      phone: "06 555 1234",
      total: 18500,
      date: "2024-05-20",
      time: "14:00",
      method: "delivery",
      address: "Quartier Plateau, Av. de la Gare",
      status: "pending", // pending, processing, ready, delivered, cancelled
      items: [
        { name: "Forêt Noire Royale", quantity: 1, price: 15000 },
        { name: "Éclair Caramel", quantity: 2, price: 1750 }
      ]
    },
    {
      id: "CMD-8833",
      customer: "Aminata Diallo",
      phone: "06 444 9876",
      total: 45000,
      date: "2024-05-20",
      time: "16:30",
      method: "pickup",
      address: null,
      status: "processing",
      items: [
        { name: "Gâteau Anniversaire Personnalisé", quantity: 1, price: 45000 }
      ]
    },
    {
      id: "CMD-8830",
      customer: "Paul Mukendi",
      phone: "05 111 2233",
      total: 12000,
      date: "2024-05-19",
      time: "10:00",
      method: "delivery",
      address: "Mikalou, arrêt pharmacie",
      status: "delivered",
      items: [
        { name: "Tarte Citron", quantity: 1, price: 12000 }
      ]
    }
  ];

  const [orders, setOrders] = useState(demoOrders);
  const [selectedOrder, setSelectedOrder] = useState(null); // Pour la modale de détails

  // --- LOGIQUE METIER ---

  // Changer le statut 
  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Couleurs et labels des statuts
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> En attente</span>;
      case 'processing': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ChefHat size={12}/> En cuisine</span>;
      case 'ready': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Prête</span>;
      case 'delivered': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Livrée</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Annulée</span>;
      default: return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Commandes</h1>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Livraison</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono font-bold text-brand-brown">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{order.customer}</div>
                  <div className="text-xs text-gray-400">{order.phone}</div>
                </td>
                <td className="px-6 py-4 font-bold">{order.total.toLocaleString()} FCFA</td>
                <td className="px-6 py-4">
                  {order.method === 'delivery' ? (
                    <span className="flex items-center gap-1 text-gray-600"><Truck size={14}/> Livraison</span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-600"><Store size={14}/> Retrait</span>
                  )}
                </td>
                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-brand-brown/10 hover:bg-brand-brown hover:text-white text-brand-brown p-2 rounded-lg transition"
                    title="Voir détails"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALE DÉTAILS COMMANDE --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          ></div>
          
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto animate-fade-in-right">
            
            {/* Header Modale */}
            <div className="flex justify-between items-start mb-8 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-brown">Commande {selectedOrder.id}</h2>
                <p className="text-gray-500 text-sm mt-1">Passée le {selectedOrder.date} à {selectedOrder.time}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><XCircle size={24} className="text-gray-400"/></button>
            </div>

            {/* Actions Rapides (Changement de statut) */}
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Mettre à jour le statut</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateStatus(selectedOrder.id, 'processing')} className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm font-bold">
                  <ChefHat size={16}/> En Cuisine
                </button>
                <button onClick={() => updateStatus(selectedOrder.id, 'ready')} className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 text-sm font-bold">
                  <CheckCircle size={16}/> Prête
                </button>
                <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 text-green-700 hover:bg-green-50 text-sm font-bold">
                  <Truck size={16}/> Livrée / Retirée
                </button>
              </div>
            </div>

            {/* Infos Client */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={18}/> Client</h3>
              <p className="text-gray-700">{selectedOrder.customer}</p>
              <p className="text-gray-700 flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {selectedOrder.phone}</p>
              {selectedOrder.method === 'delivery' && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                   <p className="text-gray-700 flex items-start gap-2"><MapPin size={16} className="text-brand-red mt-1"/> {selectedOrder.address}</p>
                </div>
              )}
            </div>

            {/* Liste des Produits */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Détails de la commande</h3>
              <ul className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-brown text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.price.toLocaleString()} F</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-brand-brown/10">
                <span className="text-xl font-bold text-brand-brown">Total à payer</span>
                <span className="text-2xl font-bold text-brand-red">{selectedOrder.total.toLocaleString()} FCFA</span>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">Paiement à la livraison</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;