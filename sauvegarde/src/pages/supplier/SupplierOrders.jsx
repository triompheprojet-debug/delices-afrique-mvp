import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
import { 
  Package, Clock, CheckCircle, Truck, MapPin, Phone, 
  AlertCircle, ChevronRight, ShoppingBag, XCircle 
} from 'lucide-react';

const SupplierOrders = () => {
  const { supplier } = useOutletContext();
  const [activeOrder, setActiveOrder] = useState(null); // La commande "En cours"
  const [pendingCount, setPendingCount] = useState(0);  // Combien attendent derrière
  const [loading, setLoading] = useState(true);

  // --- 1. ÉCOUTE DES COMMANDES ---
  useEffect(() => {
    // On cherche toutes les commandes NON terminées contenant des produits de ce fournisseur
    // Note: Dans une vraie app complexe, il faudrait une collection 'supplier_orders' dédiée.
    // Ici, on va filtrer côté client ou via une requête simple si tes commandes ont un champ 'supplierId'.
    
    // HYPOTHÈSE : Chaque commande a un champ 'supplierId' (si commande mono-fournisseur)
    // OU on filtre les commandes qui ont des items de ce fournisseur.
    // Pour simplifier selon tes règles "Marketplace", disons qu'une commande est liée à un fournisseur principal
    // ou qu'on filtre celles qui ont le statut != 'Terminé'.

    const q = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id), // Assure-toi que lors de la création de commande, ce champ est mis !
      where('status', 'in', ['En attente', 'En préparation', 'En livraison']),
      orderBy('createdAt', 'asc') // Les plus vieilles d'abord (FIFO)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (allOrders.length > 0) {
        // Règle Séquentielle : On ne prend que la toute première
        setActiveOrder(allOrders[0]);
        setPendingCount(allOrders.length - 1); // Les autres attendent
      } else {
        setActiveOrder(null);
        setPendingCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [supplier.id]);

  // --- 2. ACTIONS DE STATUT ---
  const handleUpdateStatus = async (newStatus) => {
    if (!activeOrder) return;

    try {
      const orderRef = doc(db, 'orders', activeOrder.id);
      
      await updateDoc(orderRef, {
        status: newStatus,
        [`statusHistory.${newStatus}`]: serverTimestamp(), // Log l'heure du changement
        lastUpdated: serverTimestamp()
      });

      // Feedback visuel (l'UI se mettra à jour via le snapshot)
    } catch (error) {
      console.error("Erreur update:", error);
      alert("Impossible de mettre à jour la commande.");
    }
  };

  // --- 3. RENDU VISUEL ---
  if (loading) return <div className="p-10 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-brand-brown rounded-full mx-auto"></div></div>;

  return (
    <div className="pb-32 max-w-3xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-brand-brown"/> Commandes
        </h1>
        {pendingCount > 0 && (
           <div className="mt-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-pulse">
              <AlertCircle size={16}/>
              {pendingCount} autre(s) commande(s) en attente de traitement.
           </div>
        )}
      </div>

      {/* ZONE COMMANDE ACTIVE */}
      {activeOrder ? (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-brand-brown">
          
          {/* BANDEAU STATUT */}
          <div className="bg-brand-brown text-white p-6 flex justify-between items-center">
             <div>
                <p className="text-xs font-bold opacity-75 uppercase tracking-wider">Commande en cours</p>
                <h2 className="text-3xl font-mono font-bold">#{activeOrder.code}</h2>
             </div>
             <div className="text-right">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                   {activeOrder.status}
                </div>
                <p className="text-xs mt-1 opacity-75">
                   {new Date(activeOrder.createdAt?.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
             </div>
          </div>

          {/* CONTENU */}
          <div className="p-6 md:p-8 space-y-8">
             
             {/* 1. ARTICLES À PRÉPARER */}
             <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <ShoppingBag size={16}/> À Préparer
                </h3>
                <ul className="space-y-4">
                   {activeOrder.items?.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="flex items-center gap-4">
                            <span className="bg-brand-brown text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg">
                               {item.quantity}
                            </span>
                            <span className="font-bold text-gray-800 text-lg">{item.name}</span>
                         </div>
                         {/* Le prix n'est pas nécessaire pour le préparateur, mais utile pour vérif */}
                      </li>
                   ))}
                </ul>
             </div>

             {/* 2. CLIENT & LIVRAISON (Uniquement si En préparation ou plus) */}
             {activeOrder.status !== 'En attente' && (
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2"><Truck size={14}/> Livraison</h4>
                      <p className="font-bold text-gray-800">{activeOrder.customer?.name}</p>
                      <p className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                         <MapPin size={14} className="shrink-0 mt-0.5"/> 
                         {activeOrder.customer?.address || "Retrait en boutique"}
                      </p>
                   </div>
                   <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                      <div>
                         <h4 className="text-xs font-bold text-green-800 uppercase mb-1">Contact</h4>
                         <p className="font-bold text-gray-800">{activeOrder.customer?.phone}</p>
                      </div>
                      <a href={`tel:${activeOrder.customer?.phone}`} className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                         <Phone size={20}/>
                      </a>
                   </div>
                </div>
             )}

             {/* 3. ACTIONS (LE COEUR DU SYSTÈME) */}
             <div className="pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-500 mb-4 font-medium">
                   Action requise pour avancer :
                </p>
                
                {activeOrder.status === 'En attente' && (
                   <button 
                     onClick={() => handleUpdateStatus('En préparation')}
                     className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                   >
                      <Clock size={24}/> Commencer la préparation
                   </button>
                )}

                {activeOrder.status === 'En préparation' && (
                   <button 
                     onClick={() => handleUpdateStatus('En livraison')}
                     className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                   >
                      <Truck size={24}/> Expédier / Prêt au retrait
                   </button>
                )}

                {activeOrder.status === 'En livraison' && (
                   <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-600 font-bold mb-2">Commande en cours de livraison.</p>
                      <p className="text-xs text-gray-400">
                         Une fois livrée, le client ou vous pourrez confirmer la réception. 
                         Le paiement sera débloqué après validation Admin.
                      </p>
                      {/* Optionnel: Bouton "Marquer comme Livré" si tu fais confiance au livreur */}
                      <button 
                        onClick={() => {
                            if(window.confirm("Confirmer que le client a bien reçu la commande ?")) {
                                handleUpdateStatus('Livré');
                            }
                        }}
                        className="mt-3 text-green-600 text-sm font-bold underline"
                      >
                         Confirmer la livraison (Manuelle)
                      </button>
                   </div>
                )}

             </div>
          </div>
        </div>
      ) : (
        // AUCUNE COMMANDE
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
           <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500"/>
           </div>
           <h2 className="text-2xl font-bold text-gray-800">Tout est calme !</h2>
           <p className="text-gray-500 mt-2">Aucune commande en attente pour le moment.</p>
           <p className="text-sm text-gray-400 mt-6">Restez connecté, ça peut arriver vite.</p>
        </div>
      )}

      {/* Instructions Rapides */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
         <h4 className="font-bold flex items-center gap-2 mb-2"><AlertCircle size={16}/> Règle d'or :</h4>
         <p>Traitez une commande à la fois. Ne commencez pas la suivante tant que l'actuelle n'est pas <strong>En livraison</strong> ou <strong>Livrée</strong>.</p>
      </div>

    </div>
  );
};

export default SupplierOrders;