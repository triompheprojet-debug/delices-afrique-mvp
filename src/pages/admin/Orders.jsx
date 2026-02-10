import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
import { 
  Search, Truck, ShoppingBag, Phone, MapPin, 
  Clock, Calendar, DollarSign, ChevronDown, ChevronUp,
  CreditCard, User, AlertCircle, Store, Shield,
  Package, Gift, FileText, CheckCircle2, Eye, X,
  Filter, TrendingUp, Download, Sparkles, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);
  
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // Récupération données en temps réel
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (!loading && ordersData.length > orders.length) {
         audioRef.current.play().catch(e => console.log("Audio autoplay bloqué"));
      }

      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrage
  useEffect(() => {
    let result = orders;
    
    if (statusFilter !== 'Tous') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.customer?.name?.toLowerCase().includes(lowerTerm) ||
        order.customer?.phone?.includes(lowerTerm) ||
        order.code?.toLowerCase().includes(lowerTerm) ||
        order.supplierName?.toLowerCase().includes(lowerTerm)
      );
    }
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  // Mise à jour statut avec paiement commission
  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        alert('❌ Commande introuvable');
        return;
      }
      
      const orderData = orderSnap.data();
      
      // Sécurité : Empêcher retour en arrière
      const statusOrder = ['En attente', 'En préparation', 'En livraison', 'Livré', 'Terminé'];
      const currentIndex = statusOrder.indexOf(orderData.status);
      const newIndex = statusOrder.indexOf(newStatus);
      
      if (newIndex < currentIndex && newStatus !== 'Annulé') {
        alert('❌ Impossible de revenir en arrière dans les statuts !');
        return;
      }
      
      // Paiement commission quand statut = "Terminé"
      if (newStatus === 'Terminé') {
        
        if (orderData.promo?.partnerId) {
          const partnerId = orderData.promo.partnerId;
          const commission = orderData.promo.partnerCommission || 0;
          
          // Vérifier si déjà payé
          if (orderData.promo.status === 'validated') {
            await updateDoc(orderRef, { 
              status: newStatus,
              [`statusHistory.${newStatus}`]: serverTimestamp()
            });
            alert('✅ Statut mis à jour (commission déjà payée)');
            return;
          }
          
          if (commission <= 0) {
            await updateDoc(orderRef, { 
              status: newStatus,
              [`statusHistory.${newStatus}`]: serverTimestamp()
            });
            alert('✅ Statut mis à jour (commission = 0)');
            return;
          }
          
          // Vérifier que le partenaire existe et est actif
          const partnerRef = doc(db, "partners", partnerId);
          const partnerSnap = await getDoc(partnerRef);
          
          if (!partnerSnap.exists()) {
            alert('⚠️ Partenaire introuvable. Commission non payée.');
            return;
          }
          
          const partnerData = partnerSnap.data();
          
          if (!partnerData.isActive) {
            alert('⚠️ Partenaire inactif. Impossible de payer la commission.');
            return;
          }
          
          // Payer la commission
          try {
            await updateDoc(partnerRef, {
              walletBalance: increment(commission),
              totalEarnings: increment(commission)
            });
            
            // Marquer comme payé
            await updateDoc(orderRef, {
              status: newStatus,
              "promo.status": "validated",
              "promo.paidAt": serverTimestamp(),
              [`statusHistory.${newStatus}`]: serverTimestamp()
            });
            
            alert(`✅ Commission de ${commission} FCFA payée à ${partnerData.fullName}`);
            
          } catch (paymentError) {
            console.error('❌ Erreur paiement commission:', paymentError);
            alert('❌ Erreur lors du paiement de la commission');
            throw paymentError;
          }
          
        } else {
          // Pas de partenaire, juste changer le statut
          await updateDoc(orderRef, { 
            status: newStatus,
            [`statusHistory.${newStatus}`]: serverTimestamp()
          });
          alert('✅ Statut mis à jour');
        }
        
      } else {
        // Autres statuts
        await updateDoc(orderRef, { 
          status: newStatus,
          [`statusHistory.${newStatus}`]: serverTimestamp()
        });
        alert('✅ Statut mis à jour');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'En attente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'En préparation': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'En livraison': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Livré': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Terminé': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Annulé': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Calcul gain admin pour une commande
  const calculateAdminEarnings = (order) => {
    const subTotal = order.details?.subTotal || 0;
    const deliveryFee = order.details?.deliveryFee || 0;
    const discount = order.details?.discount || 0;
    const partnerCommission = order.promo?.partnerCommission || 0;
    
    // Prix site (sans réduction) + frais livraison
    const totalRevenue = subTotal + deliveryFee;
    
    // Prix fournisseur (on suppose 0 pour l'instant, à ajuster selon votre logique)
    const supplierCost = 0; // À définir selon votre système
    
    // Gain admin = Revenue total - Réduction client - Commission partenaire - Coût fournisseur
    const adminEarnings = totalRevenue - discount - partnerCommission - supplierCost;
    
    return {
      totalRevenue,
      discount,
      partnerCommission,
      supplierCost,
      adminEarnings
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 animate-pulse">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2 flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <ShoppingBag size={32} className="text-purple-400"/>
              </div>
              Commandes
            </h1>
            <p className="text-slate-400">
              <span className="font-bold text-slate-300">{orders.length}</span> commande{orders.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Rechercher par code, nom, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-2.5 font-medium flex items-center gap-2 hover:border-slate-700 transition-all"
          >
            <Filter size={18} />
            Filtres
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <div className={`${showFilters ? 'flex' : 'hidden md:flex'} gap-2 flex-wrap w-full md:w-auto`}>
            {['Tous', 'En attente', 'En préparation', 'En livraison', 'Livré', 'Terminé', 'Annulé'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Compteur résultats */}
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-400">{filteredOrders.length}</span> résultat{filteredOrders.length > 1 ? 's' : ''}
          </p>
          {(searchTerm || statusFilter !== 'Tous') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('Tous');
              }}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
              <ShoppingBag className="text-slate-700 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-slate-600 text-sm">
                {searchTerm || statusFilter !== 'Tous'
                  ? "Essayez de modifier vos filtres"
                  : "Les commandes apparaîtront ici"}
              </p>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const earnings = calculateAdminEarnings(order);

            return (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
              >
                
                {/* Header carte - Toujours visible */}
                <div 
                  className="p-5 md:p-6 cursor-pointer"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      
                      {/* Code et badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="font-mono font-bold text-slate-100 text-lg">
                          #{order.code}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        
                        {order.promo?.partnerId && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                            order.promo.status === 'validated' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}>
                            <Award size={12}/>
                            Partenaire
                            {order.promo.status === 'validated' && (
                              <CheckCircle2 size={12} />
                            )}
                          </span>
                        )}
                      </div>
                      
                      {/* Infos rapides */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-500" />
                          <span className="truncate">{order.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-500" />
                          <span className="truncate">{order.customer?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-slate-500" />
                          <span className="truncate">{order.supplierName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-500" />
                          <span className="text-xs">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Montant et toggle */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Total</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {order.details?.finalTotal?.toLocaleString() || 0} F
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={24} className="text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails expandables */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-800"
                    >
                      <div className="p-5 md:p-6 space-y-6 bg-slate-950/30">
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          
                          {/* Colonne gauche - Infos client & livraison */}
                          <div className="space-y-4">
                            
                            {/* Client */}
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                              <h4 className="font-bold text-slate-300 mb-3 flex items-center gap-2 text-sm">
                                <User size={16} className="text-purple-400" />
                                Client
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Nom</span>
                                  <span className="text-slate-200 font-medium">{order.customer?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Téléphone</span>
                                  <a href={`tel:${order.customer?.phone}`} className="text-purple-400 font-medium hover:text-purple-300">
                                    {order.customer?.phone || 'N/A'}
                                  </a>
                                </div>
                                <div className="pt-2 border-t border-slate-800/50">
                                  <span className="text-slate-500 block mb-1.5">Adresse</span>
                                  <p className="text-slate-200 text-sm">
                                    {order.customer?.address || 'Non spécifiée'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Livraison/Retrait */}
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                              <h4 className="font-bold text-slate-300 mb-3 flex items-center gap-2 text-sm">
                                {order.details?.method === 'Livraison' ? (
                                  <Truck size={16} className="text-purple-400" />
                                ) : (
                                  <Package size={16} className="text-purple-400" />
                                )}
                                {order.details?.method || 'N/A'}
                              </h4>
                              
                              <div className="space-y-2 text-sm">
                                {order.details?.method === 'Livraison' ? (
                                  <>
                                    {order.details?.deliveryDistance > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Distance</span>
                                        <span className="text-slate-200 font-medium">{order.details?.deliveryDistance} km</span>
                                      </div>
                                    )}
                                    
                                    {order.details?.deliveryFee > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Frais</span>
                                        <span className="text-purple-400 font-bold">{order.details?.deliveryFee.toLocaleString()} F</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {order.details?.scheduledDate && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-500 flex items-center gap-1">
                                          <Calendar size={12} />
                                          Date
                                        </span>
                                        <span className="text-slate-200 font-medium">{order.details?.scheduledDate}</span>
                                      </div>
                                    )}
                                    
                                    {order.details?.scheduledTime && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-500 flex items-center gap-1">
                                          <Clock size={12} />
                                          Heure
                                        </span>
                                        <span className="text-slate-200 font-medium">{order.details?.scheduledTime}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Paiement */}
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                              <h4 className="font-bold text-slate-300 mb-3 flex items-center gap-2 text-sm">
                                <CreditCard size={16} className="text-purple-400" />
                                Paiement
                              </h4>
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                  {order.details?.paymentMethod === 'Espèces' ? '💵' : '📱'}
                                </div>
                                <div>
                                  <p className="text-slate-200 font-medium text-sm">{order.details?.paymentMethod || 'N/A'}</p>
                                  <p className="text-xs text-slate-500">
                                    À la {order.details?.method === 'Livraison' ? 'livraison' : 'réception'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Colonne droite - Finances */}
                          <div className="space-y-4">
                            
                            {/* Détails financiers ADMIN */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-xl p-4">
                              <h4 className="font-bold text-purple-400 mb-4 flex items-center gap-2 text-sm">
                                <DollarSign size={16}/>
                                Détails Financiers (Admin)
                              </h4>
                              
                              <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Prix site (sans réduction)</span>
                                  <span className="text-slate-200 font-bold">{order.details?.subTotal?.toLocaleString() || 0} F</span>
                                </div>

                                {order.details?.discount > 0 && (
                                  <div className="flex justify-between text-green-400">
                                    <span className="flex items-center gap-1">
                                      <Gift size={12} />
                                      Réduction client
                                    </span>
                                    <span className="font-bold">-{order.details?.discount.toLocaleString()} F</span>
                                  </div>
                                )}

                                {order.details?.deliveryFee > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Frais livraison</span>
                                    <span className="text-slate-200 font-bold">+{order.details?.deliveryFee.toLocaleString()} F</span>
                                  </div>
                                )}

                                {order.promo?.partnerCommission > 0 && (
                                  <div className="flex justify-between text-purple-400">
                                    <span className="flex items-center gap-1">
                                      <Award size={12} />
                                      Commission partenaire
                                    </span>
                                    <span className="font-bold">-{order.promo?.partnerCommission.toLocaleString()} F</span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center pt-2 border-t border-purple-500/30">
                                  <span className="text-slate-300 font-bold">Total client payé</span>
                                  <span className="text-xl font-bold text-slate-100">
                                    {order.details?.finalTotal?.toLocaleString() || 0} F
                                  </span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-purple-500/30 bg-purple-500/10 -mx-4 px-4 py-2 rounded-lg">
                                  <span className="text-purple-400 font-bold flex items-center gap-1">
                                    <TrendingUp size={14} />
                                    Votre gain (estimé)
                                  </span>
                                  <span className="text-xl font-bold text-purple-400">
                                    {earnings.adminEarnings.toLocaleString()} F
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Info partenaire si existe */}
                            {order.promo?.partnerId && (
                              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2 text-sm">
                                  <Award size={16}/>
                                  Programme Partenaire
                                </h4>
                                
                                <div className="space-y-3 text-sm">
                                  <div className="bg-slate-950/50 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <span className="text-slate-500 text-xs block mb-1">Code promo</span>
                                        <p className="font-bold text-purple-400 font-mono">{order.promo.code}</p>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 text-xs block mb-1">Niveau</span>
                                        <p className="font-bold text-purple-400">{order.promo.partnerLevel || 'Standard'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center bg-slate-950/50 rounded-lg p-2.5">
                                    <span className="text-slate-400 text-xs">Statut paiement</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      order.promo.status === 'validated' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                      {order.promo.status === 'validated' ? '✓ Payé' : '⏳ En attente'}
                                    </span>
                                  </div>
                                  
                                  {order.promo.paidAt && (
                                    <p className="text-xs text-slate-500">
                                      Payé le {formatDate(order.promo.paidAt)}
                                    </p>
                                  )}

                                  {order.promo.status === 'validated' && (
                                    <div className="flex items-start gap-2 text-xs text-green-400 bg-green-500/10 p-2 rounded-lg">
                                      <Shield size={12} className="mt-0.5 flex-shrink-0"/>
                                      <span>Protection anti-double-paiement active</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Articles */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                          <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm">
                            <ShoppingBag size={16} className="text-purple-400"/>
                            Articles ({order.items?.length || 0})
                          </h4>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {order.items?.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="flex gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/30"
                              >
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag size={24} className="text-slate-600" />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-200 truncate">{item.name}</p>
                                  <p className="text-xs text-slate-500">{item.category || 'Sans catégorie'}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm text-slate-400">
                                      <span className="font-bold text-purple-400">{item.quantity}×</span> {item.price.toLocaleString()} F
                                    </span>
                                    <span className="font-bold text-slate-100">
                                      {(item.price * item.quantity).toLocaleString()} F
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {order.details?.notes && (
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                            <h4 className="font-bold text-slate-300 mb-3 flex items-center gap-2 text-sm">
                              <FileText size={16} className="text-purple-400"/>
                              Instructions spéciales
                            </h4>
                            <p className="text-sm text-slate-400 italic bg-slate-950/50 p-3 rounded-lg border-l-4 border-yellow-500">
                              "{order.details?.notes}"
                            </p>
                          </div>
                        )}

                        {/* Actions changement de statut */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-2 border-purple-500/30 rounded-xl p-5">
                          <h4 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <AlertCircle size={18}/>
                            Changer le statut de la commande
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                            {['En attente', 'En préparation', 'En livraison', 'Livré', 'Terminé', 'Annulé'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateStatus(order.id, status)}
                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                  order.status === status
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg border border-purple-500'
                                }`}
                                disabled={order.status === status}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                          
                          <div className="flex items-start gap-2 text-xs text-purple-400 bg-purple-500/10 p-3 rounded-lg">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            <span>
                              "Terminé" déclenche automatiquement le paiement de la commission partenaire (si applicable)
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;