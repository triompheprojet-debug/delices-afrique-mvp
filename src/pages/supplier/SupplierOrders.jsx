import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ORDER_STATUS } from '../../utils/constants';
import { 
  Package, Clock, CheckCircle, Truck, MapPin, Phone, 
  AlertCircle, ChevronRight, ShoppingBag, XCircle, 
  ArrowRight, Timer, PlayCircle, Send, Eye, User,
  ChefHat, Sparkles, TrendingUp, Activity, X, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SupplierOrders = () => {
  const { supplier } = useOutletContext();
  const [activeOrder, setActiveOrder] = useState(null); 
  const [pendingCount, setPendingCount] = useState(0); 
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        setActiveOrder(allOrders[0]);
        setPendingCount(allOrders.length - 1);
      } else {
        setActiveOrder(null);
        setPendingCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [supplier.id]);

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

  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetails = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      [ORDER_STATUS.PENDING]: { label: ORDER_STATUS.PENDING, icon: Clock, color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
      [ORDER_STATUS.PREPARING]: { label: ORDER_STATUS.PREPARING, icon: ChefHat, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
      [ORDER_STATUS.SHIPPING]: { label: ORDER_STATUS.SHIPPING, icon: Truck, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
      [ORDER_STATUS.DELIVERED]: { label: ORDER_STATUS.DELIVERED, icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-emerald-500' },
      [ORDER_STATUS.COMPLETED]: { label: ORDER_STATUS.COMPLETED, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
      [ORDER_STATUS.CANCELLED]: { label: ORDER_STATUS.CANCELLED, icon: XCircle, color: 'red', gradient: 'from-red-500 to-rose-500' }
    };
    return statusMap[status] || statusMap[ORDER_STATUS.PENDING];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] container-safe">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-purple-500/20 rounded-full animate-ping"></div>
          </div>
          <div className="relative glass-effect p-6 sm:p-8 rounded-3xl">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-t-4 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-300 font-bold text-center text-sm sm:text-base">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-safe space-y-6 sm:space-y-8 pt-2 sm:pt-4">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect shadow-elegant rounded-2xl sm:rounded-3xl p-5 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative inline-flex self-start sm:self-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-3 sm:p-4 rounded-2xl">
              <Package size={28} className="text-white sm:w-8 sm:h-8"/>
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
              Gestion des Commandes
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base flex flex-wrap items-center gap-2">
              <Activity size={16} className="text-purple-400 animate-pulse-soft"/>
              <span>{activeOrder ? '1 active' : '0 active'}</span>
              <span className="hidden sm:inline">·</span>
              {pendingCount > 0 && <span>{pendingCount} en attente <span className="hidden sm:inline">·</span></span>}
              <span>{orderHistory.length} terminée{orderHistory.length > 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ALERTE: COMMANDES EN ATTENTE */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-900/40 via-red-900/40 to-orange-900/40 border-2 border-orange-500/40 rounded-2xl p-4 sm:p-6 shadow-elegant"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30 animate-pulse self-start">
              <AlertCircle className="text-orange-400" size={24}/>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-300 text-base sm:text-xl mb-2 flex items-center gap-2">
                <Timer size={20} className="animate-spin" style={{ animationDuration: '3s' }}/>
                {pendingCount} commande{pendingCount > 1 ? 's' : ''} en attente
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Traitez d'abord la commande active. Les autres apparaîtront automatiquement une fois celle-ci passée en <strong className="text-purple-400">{ORDER_STATUS.SHIPPING}</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 1: COMMANDE ACTIVE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="bg-blue-500/10 p-2 sm:p-3 rounded-xl border border-blue-500/30">
            <TrendingUp className="text-blue-400" size={20}/>
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100">Commande Active</h2>
          </div>
        </div>

        {activeOrder ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect hover-lift rounded-2xl p-4 sm:p-6 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              
              {/* Infos principales */}
              <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                {/* Badge #1 */}
                <div className="bg-purple-500/10 border border-purple-500/30 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-purple-400 font-bold text-base sm:text-lg">#1</span>
                </div>

                {/* Détails */}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="font-bold text-slate-100 text-lg sm:text-xl">#{activeOrder.code}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-${getStatusInfo(activeOrder.status).color}-500/10 text-${getStatusInfo(activeOrder.status).color}-400 border border-${getStatusInfo(activeOrder.status).color}-500/30`}>
                      {React.createElement(getStatusInfo(activeOrder.status).icon, { size: 14 })}
                      {getStatusInfo(activeOrder.status).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShoppingBag size={16} className="text-slate-500 shrink-0"/>
                      <span className="truncate">{activeOrder.items?.length || 0} article{(activeOrder.items?.length || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={16} className="text-slate-500 shrink-0"/>
                      <span className="truncate">
                        {activeOrder.createdAt ? 
                          `Il y a ${Math.floor((Date.now() - activeOrder.createdAt.toDate()) / 60000)} min`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={16} className="text-slate-500 shrink-0"/>
                      <span className="truncate">{activeOrder.customer?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={16} className="text-slate-500 shrink-0"/>
                      <span className="truncate">{activeOrder.customer?.address?.substring(0, 20) || 'N/A'}...</span>
                    </div>
                  </div>

                  {/* Note client visible directement */}
                  {activeOrder.details?.notes && (
                    <div className="mt-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                      <MessageSquare size={16} className="text-amber-400 shrink-0 mt-0.5"/>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-500/80 mb-0.5 uppercase tracking-wider">Note du client</p>
                        <p className="text-sm text-amber-200/90 leading-snug italic">"{activeOrder.details.notes}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                {/* Montant */}
                <div className="bg-slate-800/50 border border-slate-700 px-4 py-3 sm:py-4 rounded-xl text-center sm:text-left lg:text-center w-full sm:w-auto">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                  <p className="text-lg sm:text-xl font-mono font-bold text-purple-400 whitespace-nowrap">
                    {(activeOrder.details?.finalTotal || 0).toLocaleString()} F
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openDetails(activeOrder)}
                    className="flex-1 xs:flex-none flex items-center justify-center gap-2 bg-slate-700/80 hover:bg-slate-600 text-slate-100 px-4 py-3 sm:py-4 rounded-xl transition-all font-medium whitespace-nowrap"
                  >
                    <Eye size={18}/>
                    <span>Détails</span>
                  </button>

                  {/* Action rapide selon statut */}
                  {activeOrder.status === ORDER_STATUS.PENDING && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, ORDER_STATUS.PREPARING)}
                      disabled={isProcessing}
                      className="flex-1 xs:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-3 sm:py-4 rounded-xl transition-all font-medium disabled:opacity-50 shadow-elegant"
                    >
                      <PlayCircle size={18}/>
                      <span>Préparer</span>
                    </button>
                  )}

                  {activeOrder.status === ORDER_STATUS.PREPARING && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, ORDER_STATUS.SHIPPING)}
                      disabled={isProcessing}
                      className="flex-1 xs:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-3 sm:py-4 rounded-xl transition-all font-medium disabled:opacity-50 shadow-elegant"
                    >
                      <Send size={18}/>
                      <span>Expédier</span>
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
                      className="flex-1 xs:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 sm:py-4 rounded-xl transition-all font-medium disabled:opacity-50 shadow-elegant"
                    >
                      <CheckCircle size={18}/>
                      <span>Livré</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 sm:py-20 glass-effect border-2 border-dashed border-slate-700 rounded-2xl">
            <div className="bg-green-500/10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle size={32} className="text-green-400 sm:w-10 sm:h-10"/>
            </div>
            <h3 className="text-slate-100 font-bold text-lg sm:text-xl mb-2">Aucune commande active</h3>
            <p className="text-slate-400 text-sm sm:text-base">Toutes les commandes sont traitées !</p>
          </div>
        )}
      </motion.div>

      {/* SECTION 2: HISTORIQUE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="bg-slate-500/10 p-2 sm:p-3 rounded-xl border border-slate-500/30">
            <Timer className="text-slate-400" size={20}/>
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100">Historique</h2>
          </div>
        </div>

        {orderHistory.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {orderHistory.map((order, idx) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="glass-effect hover:bg-slate-800/50 hover-lift border-slate-700/50 rounded-xl p-4 sm:p-5 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Infos */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full min-w-0">
                      <div className={`bg-${statusInfo.color}-500/10 border border-${statusInfo.color}-500/30 p-2.5 rounded-lg shrink-0 mt-1 md:mt-0`}>
                        {React.createElement(statusInfo.icon, { size: 20, className: `text-${statusInfo.color}-400` })}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-200 text-sm sm:text-base truncate">#{order.code}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-${statusInfo.color}-500/10 text-${statusInfo.color}-400 border border-${statusInfo.color}-500/30`}>
                            {statusInfo.label}
                          </span>
                          {/* Indicateur de note dans l'historique */}
                          {order.details?.notes && (
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <MessageSquare size={10} />
                              Note
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <ShoppingBag size={12}/>
                            {order.items?.length || 0} art.
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12}/>
                            {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                          {order.customer?.phone && (
                            <span className="flex items-center gap-1 truncate max-w-[120px]">
                              <Phone size={12}/>
                              {order.customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Montant + Bouton */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-700/50 md:border-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold mb-0.5 md:mb-1">Total</p>
                        <p className="text-base sm:text-lg font-mono font-bold text-slate-300">
                          {(order.details?.finalTotal || 0).toLocaleString()} F
                        </p>
                      </div>

                      <button
                        onClick={() => openDetails(order)}
                        className="flex items-center gap-2 bg-slate-700/80 hover:bg-slate-600 text-slate-200 px-4 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm font-medium"
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
          <div className="text-center py-12 sm:py-16 glass-effect border-2 border-dashed border-slate-700 rounded-xl">
            <div className="bg-slate-700/20 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Timer className="text-slate-500 sm:w-8 sm:h-8" size={24}/>
            </div>
            <h3 className="text-slate-300 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Aucun historique</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Les commandes terminées apparaîtront ici</p>
          </div>
        )}
      </motion.div>

      {/* MODAL DÉTAILS */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-safe"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border-0 sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-elegant-lg overflow-hidden"
            >
              {/* Header modal */}
              <div className={`bg-gradient-to-r ${getStatusInfo(selectedOrder.status).gradient} p-4 sm:p-6 shrink-0 relative`}>
                {/* Drag handle for mobile */}
                <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4 sm:hidden"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="pr-4">
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 truncate">Commande #{selectedOrder.code}</h2>
                    <p className="text-white/80 flex items-center gap-1.5 text-xs sm:text-sm">
                      {React.createElement(getStatusInfo(selectedOrder.status).icon, { size: 14 })}
                      {getStatusInfo(selectedOrder.status).label}
                    </p>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="bg-black/20 hover:bg-black/30 backdrop-blur-md w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0"
                  >
                    <X className="text-white" size={18}/>
                  </button>
                </div>
              </div>

              {/* Contenu modal scrollable */}
              <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Produits */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-3 sm:mb-4 flex items-center gap-2">
                    <ShoppingBag className="text-purple-400" size={18}/>
                    Articles commandés
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 sm:p-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-slate-800 border border-slate-600 overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-slate-600" size={20}/>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-200 mb-0.5 sm:mb-1 text-sm sm:text-base truncate">{item.name}</h4>
                          <p className="text-xs sm:text-sm text-slate-400">
                            {item.quantity}x <span className="hidden xs:inline">· Prix unitaire:</span> {item.price?.toLocaleString()} F
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-purple-400 text-sm sm:text-base">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString()} F
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes du client */}
                {selectedOrder.details?.notes && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="text-amber-400" size={18}/>
                      <h4 className="font-bold text-amber-500 text-sm sm:text-base">Note du client</h4>
                    </div>
                    <p className="text-amber-200/90 text-sm leading-relaxed italic">"{selectedOrder.details.notes}"</p>
                  </div>
                )}

                {/* Infos client */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="text-blue-400" size={18}/>
                      <h4 className="font-bold text-slate-200 text-sm sm:text-base">Adresse</h4>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedOrder.customer?.address || 'Non spécifiée'}</p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-green-400" size={18}/>
                      <h4 className="font-bold text-slate-200 text-sm sm:text-base">Contact</h4>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-slate-300 font-mono text-base sm:text-lg truncate">{selectedOrder.customer?.phone || 'N/A'}</p>
                      {selectedOrder.customer?.phone && (
                        <a 
                          href={`tel:${selectedOrder.customer?.phone}`}
                          className="inline-flex items-center justify-center bg-green-600/20 hover:bg-green-600/40 text-green-400 w-10 h-10 rounded-lg transition-all"
                        >
                          <Phone size={18}/>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Totaux */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 sm:p-5">
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between text-slate-300">
                      <span>Sous-total</span>
                      <span className="font-mono">{selectedOrder.details?.subTotal?.toLocaleString() || 0} F</span>
                    </div>
                    {selectedOrder.details?.discount > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Réduction</span>
                        <span className="font-mono text-green-400">-{selectedOrder.details?.discount?.toLocaleString() || 0} F</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Livraison</span>
                      <span className="font-mono">{selectedOrder.details?.deliveryFee?.toLocaleString() || 0} F</span>
                    </div>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-slate-100">TOTAL</span>
                      <span className="text-xl sm:text-2xl font-mono font-bold text-purple-400">
                        {selectedOrder.details?.finalTotal?.toLocaleString() || 0} F
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions sticky en bas si commande active */}
              {[ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPING].includes(selectedOrder.status) && (
                <div className="p-4 sm:p-6 bg-slate-800 border-t border-slate-700 shrink-0">
                  {selectedOrder.status === ORDER_STATUS.PENDING && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, ORDER_STATUS.PREPARING);
                        closeDetails();
                      }}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 shadow-elegant hover-lift"
                    >
                      <PlayCircle size={20}/>
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
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 shadow-elegant hover-lift"
                    >
                      <Send size={20}/>
                      Expédier la commande
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
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 shadow-elegant hover-lift"
                    >
                      <CheckCircle size={20}/>
                      Confirmer la livraison
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierOrders;