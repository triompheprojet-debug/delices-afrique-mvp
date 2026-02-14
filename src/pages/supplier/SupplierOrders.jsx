import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ORDER_STATUS } from '../../utils/constants';
import { 
  Package, Clock, CheckCircle, Truck, MapPin, Phone, 
  AlertCircle, ChevronRight, ShoppingBag, XCircle, 
  ArrowRight, Timer, PlayCircle, Send, Eye, User,
  ChefHat, Sparkles, TrendingUp, Activity, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SupplierOrders = () => {
  const { supplier } = useOutletContext();
  const [activeOrder, setActiveOrder] = useState(null); // UNE seule commande visible
  const [pendingCount, setPendingCount] = useState(0); // Compteur des autres en attente
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Écoute des commandes actives - UNE À LA FOIS
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id),
      where('status', 'in', [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPING]),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (allOrders.length > 0) {
        // RÈGLE: Afficher UNIQUEMENT la première commande
        setActiveOrder(allOrders[0]);
        // Compter les autres en attente
        setPendingCount(allOrders.length - 1);
      } else {
        setActiveOrder(null);
        setPendingCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [supplier.id]);

  // Écoute de l'historique des commandes
  useEffect(() => {
    const historyQuery = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id),
      where('status', 'in', [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrderHistory(history);
    });

    return () => unsubscribe();
  }, [supplier.id]);

  // Mise à jour du statut
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      await updateDoc(orderRef, {
        status: newStatus,
        [`statusHistory.${newStatus}`]: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur update:", error);
      alert("Impossible de mettre à jour la commande.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ouvrir modal détails
  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Fermer modal
  const closeDetails = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Helper pour le badge statut
  const getStatusInfo = (status) => {
    const statusMap = {
      [ORDER_STATUS.PENDING]: {
        label: ORDER_STATUS.PENDING,
        icon: Clock,
        color: 'yellow',
        gradient: 'from-yellow-500 to-orange-500'
      },
      [ORDER_STATUS.PREPARING]: {
        label: ORDER_STATUS.PREPARING,
        icon: ChefHat,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500'
      },
      [ORDER_STATUS.SHIPPING]: {
        label: ORDER_STATUS.SHIPPING,
        icon: Truck,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500'
      },
      [ORDER_STATUS.DELIVERED]: {
        label: ORDER_STATUS.DELIVERED,
        icon: CheckCircle,
        color: 'green',
        gradient: 'from-green-500 to-emerald-500'
      },
      [ORDER_STATUS.COMPLETED]: {
        label: ORDER_STATUS.COMPLETED,
        icon: CheckCircle,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-500'
      },
      [ORDER_STATUS.CANCELLED]: {
        label: ORDER_STATUS.CANCELLED,
        icon: XCircle,
        color: 'red',
        gradient: 'from-red-500 to-rose-500'
      }
    };
    return statusMap[status] || statusMap[ORDER_STATUS.PENDING];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-purple-500/20 rounded-full animate-ping"></div>
          </div>
          <div className="relative bg-slate-900 border-2 border-purple-500/30 p-8 rounded-3xl backdrop-blur-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-300 font-bold text-center whitespace-nowrap">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-7xl mx-auto space-y-8 px-4">
      
      {/* ========================================
          HEADER
          ======================================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl">
              <Package size={32} className="text-white"/>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-100 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Gestion des Commandes
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Activity size={16} className="text-purple-400 animate-pulse"/>
              {activeOrder ? '1 active' : '0 active'} · {pendingCount > 0 && `${pendingCount} en attente · `}{orderHistory.length} terminée{orderHistory.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========================================
          ALERTE: COMMANDES EN ATTENTE
          ======================================== */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-900/40 via-red-900/40 to-orange-900/40 border-2 border-orange-500/40 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30 animate-pulse">
              <AlertCircle className="text-orange-400" size={28}/>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-300 text-xl mb-2 flex items-center gap-2">
                <Timer size={20} className="animate-spin" style={{ animationDuration: '3s' }}/>
                {pendingCount} commande{pendingCount > 1 ? 's' : ''} en attente
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Traitez d'abord la commande active. Les autres apparaîtront automatiquement une fois celle-ci passée en <strong className="text-purple-400">{ORDER_STATUS.SHIPPING}</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================
          SECTION 1: COMMANDES ACTIVES
          ======================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/30">
            <TrendingUp className="text-blue-400" size={24}/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Commande Active</h2>
            <p className="text-slate-400 text-sm">
              {activeOrder ? 'Une commande en cours de traitement' : 'Aucune commande active'}
            </p>
          </div>
        </div>

        {activeOrder ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-6 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Infos principales */}
              <div className="flex items-start gap-4 flex-1">
                {/* Badge #1 */}
                <div className="bg-purple-500/10 border border-purple-500/30 w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-purple-400 font-bold text-lg">#1</span>
                </div>

                {/* Détails */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-bold text-slate-100 text-xl">#{activeOrder.code}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-${getStatusInfo(activeOrder.status).color}-500/10 text-${getStatusInfo(activeOrder.status).color}-400 border border-${getStatusInfo(activeOrder.status).color}-500/30`}>
                      {React.createElement(getStatusInfo(activeOrder.status).icon, { size: 14 })}
                      {getStatusInfo(activeOrder.status).label}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShoppingBag size={16} className="text-slate-500"/>
                      <span>{activeOrder.items?.length || 0} article{(activeOrder.items?.length || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={16} className="text-slate-500"/>
                      <span>
                        {activeOrder.createdAt ? 
                          `Il y a ${Math.floor((Date.now() - activeOrder.createdAt.toDate()) / 60000)} min`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={16} className="text-slate-500"/>
                      <span>{activeOrder.customer?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={16} className="text-slate-500"/>
                      <span className="truncate">{activeOrder.customer?.address?.substring(0, 20) || 'N/A'}...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-auto w-full">
                {/* Montant */}
                <div className="bg-slate-800/50 border border-slate-700 px-6 py-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                  <p className="text-xl font-mono font-bold text-purple-400">
                    {(activeOrder.details?.finalTotal || 0).toLocaleString()} F
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetails(activeOrder)}
                    className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap"
                  >
                    <Eye size={18}/>
                    <span className="hidden sm:inline">Détails</span>
                  </button>

                  {/* Action rapide selon statut */}
                  {activeOrder.status === ORDER_STATUS.PENDING && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, ORDER_STATUS.PREPARING)}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-3 rounded-xl transition-all font-medium disabled:opacity-50"
                    >
                      <PlayCircle size={18}/>
                      <span className="hidden sm:inline">Préparer</span>
                    </button>
                  )}

                  {activeOrder.status === ORDER_STATUS.PREPARING && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, ORDER_STATUS.SHIPPING)}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl transition-all font-medium disabled:opacity-50"
                    >
                      <Send size={18}/>
                      <span className="hidden sm:inline">Expédier</span>
                    </button>
                  )}

                  {activeOrder.status === ORDER_STATUS.SHIPPING && (
                    <button
                      onClick={() => {
                        if(window.confirm("Confirmer la livraison ?")) {
                          handleUpdateStatus(activeOrder.id, ORDER_STATUS.DELIVERED);
                        }
                      }}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl transition-all font-medium disabled:opacity-50"
                    >
                      <CheckCircle size={18}/>
                      <span className="hidden sm:inline">Livré</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl">
            <div className="bg-green-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle size={40} className="text-green-400"/>
            </div>
            <h3 className="text-slate-100 font-bold text-xl mb-2">Aucune commande active</h3>
            <p className="text-slate-400">Toutes les commandes sont traitées !</p>
          </div>
        )}
      </motion.div>

      {/* ========================================
          SECTION 2: HISTORIQUE
          ======================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-500/10 p-3 rounded-xl border border-slate-500/30">
            <Timer className="text-slate-400" size={24}/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Historique</h2>
            <p className="text-slate-400 text-sm">
              {orderHistory.length} commande{orderHistory.length > 1 ? 's' : ''} terminée{orderHistory.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {orderHistory.length > 0 ? (
          <div className="space-y-3">
            {orderHistory.map((order, idx) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Infos */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`bg-${statusInfo.color}-500/10 border border-${statusInfo.color}-500/30 p-2 rounded-lg shrink-0`}>
                        {React.createElement(statusInfo.icon, { size: 20, className: `text-${statusInfo.color}-400` })}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-200">#{order.code}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-${statusInfo.color}-500/10 text-${statusInfo.color}-400 border border-${statusInfo.color}-500/30`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <ShoppingBag size={12}/>
                            {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12}/>
                            {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                          {order.customer?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12}/>
                              {order.customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Montant + Bouton */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                        <p className="text-lg font-mono font-bold text-slate-300">
                          {(order.details?.finalTotal || 0).toLocaleString()} F
                        </p>
                      </div>

                      <button
                        onClick={() => openDetails(order)}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                      >
                        <Eye size={16}/>
                        Détails
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-xl">
            <div className="bg-slate-700/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Timer className="text-slate-500" size={32}/>
            </div>
            <h3 className="text-slate-300 font-bold mb-2">Aucun historique</h3>
            <p className="text-slate-500 text-sm">Les commandes terminées apparaîtront ici</p>
          </div>
        )}
      </motion.div>

      {/* ========================================
          MODAL DÉTAILS
          ======================================== */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header modal */}
              <div className={`bg-gradient-to-r ${getStatusInfo(selectedOrder.status).gradient} p-6 relative`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Commande #{selectedOrder.code}</h2>
                    <p className="text-white/70 flex items-center gap-2">
                      {React.createElement(getStatusInfo(selectedOrder.status).icon, { size: 16 })}
                      {getStatusInfo(selectedOrder.status).label}
                    </p>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X className="text-white" size={20}/>
                  </button>
                </div>
              </div>

              {/* Contenu modal */}
              <div className="p-6 space-y-6">
                
                {/* Produits */}
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <ShoppingBag className="text-purple-400" size={20}/>
                    Articles commandés
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-600 overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-slate-600" size={24}/>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-100 mb-1">{item.name}</h4>
                          <p className="text-sm text-slate-400">Quantité: {item.quantity}x · Prix unitaire: {item.price?.toLocaleString()} FCFA</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-purple-400">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString()} F
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-300">
                      <span>Sous-total produits</span>
                      <span className="font-mono">{selectedOrder.details?.subTotal?.toLocaleString() || 0} FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Réduction</span>
                      <span className="font-mono text-green-400">-{selectedOrder.details?.discount?.toLocaleString() || 0} FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Frais de livraison</span>
                      <span className="font-mono">{selectedOrder.details?.deliveryFee?.toLocaleString() || 0} FCFA</span>
                    </div>
                    <div className="h-px bg-slate-600"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-100">TOTAL</span>
                      <span className="text-2xl font-mono font-bold text-purple-400">
                        {selectedOrder.details?.finalTotal?.toLocaleString() || 0} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Infos client */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/5 border border-blue-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="text-blue-400" size={20}/>
                      <h4 className="font-bold text-slate-200">Adresse de livraison</h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{selectedOrder.customer?.address || 'Non spécifiée'}</p>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="text-green-400" size={20}/>
                      <h4 className="font-bold text-slate-200">Contact client</h4>
                    </div>
                    <p className="text-slate-300 font-mono text-lg">{selectedOrder.customer?.phone || 'N/A'}</p>
                    <a 
                      href={`tel:${selectedOrder.customer?.phone}`}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-3 transition-all text-sm font-medium"
                    >
                      <Phone size={16}/>
                      Appeler
                    </a>
                  </div>
                </div>

                {/* Actions si commande active */}
                {[ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPING].includes(selectedOrder.status) && (
                  <div className="border-t border-slate-700 pt-6">
                    <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Activity className="text-purple-400" size={20}/>
                      Actions disponibles
                    </h4>

                    {selectedOrder.status === ORDER_STATUS.PENDING && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, ORDER_STATUS.PREPARING);
                          closeDetails();
                        }}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <PlayCircle size={24}/>
                        Commencer la préparation
                      </button>
                    )}

                    {selectedOrder.status === ORDER_STATUS.PREPARING && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, ORDER_STATUS.SHIPPING);
                          closeDetails();
                        }}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <Send size={24}/>
                        Expédier / Prêt au retrait
                      </button>
                    )}

                    {selectedOrder.status === ORDER_STATUS.SHIPPING && (
                      <button
                        onClick={() => {
                          if(window.confirm("Confirmer que le client a bien reçu la commande ?")) {
                            handleUpdateStatus(selectedOrder.id, ORDER_STATUS.DELIVERED);
                            closeDetails();
                          }
                        }}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <CheckCircle size={24}/>
                        Confirmer la livraison
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierOrders;