import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { 
  Wallet, TrendingUp, Send, Clock, CheckCircle, 
  AlertTriangle, History, DollarSign, FileText, Package,
  Truck, PieChart, BarChart3, Zap, Target,
  Award, Sparkles, X, ZoomIn, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { ORDER_STATUS, WITHDRAWAL_STATUS } from '../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPOSANT UTILITAIRE POUR L'AFFICHAGE DES MONTANTS (LOGIQUE CORRIGÉE) ---
const MoneyDisplay = ({ amount, className = "", currency = "F", forceCompact = false }) => {
  const [showExact, setShowExact] = useState(false);
  const numericAmount = Number(amount || 0);

  // Logique : Affiche 'k' seulement si >= 10 000 ou si forceCompact est activé
  // Sinon affiche le montant complet (ex: 2 500)
  const formatValue = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + ' M'; // Millions
    if (n >= 10000 || forceCompact) return (n / 1000).toFixed(1) + ' k'; // > 10k ou espace réduit
    return n.toLocaleString('fr-FR'); // < 10k (ex: 2 000, 9 500)
  };

  return (
    <span 
      onClick={(e) => { e.stopPropagation(); setShowExact(!showExact); }}
      className={`cursor-pointer select-none transition-all active:scale-95 inline-flex items-baseline gap-1 ${className}`}
      title="Cliquer pour voir le montant exact"
    >
      {showExact ? (
        <span className="font-mono tracking-tight">
          {numericAmount.toLocaleString('fr-FR')} 
          <span className="text-[0.7em] ml-0.5 opacity-70">{currency}</span>
        </span>
      ) : (
        <span className="font-mono tracking-tight">
          {formatValue(numericAmount)} 
          <span className="text-[0.7em] ml-0.5 opacity-70">{currency}</span>
        </span>
      )}
    </span>
  );
};

const SupplierWallet = () => {
  const { supplier, financialStats } = useOutletContext();
  const { config } = useConfig();
  
  const [orders, setOrders] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // États UI
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // CHARGEMENT DES DONNÉES
  useEffect(() => {
    if (!supplier?.id) return;

    const qOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id),
      orderBy('createdAt', 'desc')
    );

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(loadedOrders);
      setLoading(false);
    });

    const qSettlements = query(
      collection(db, 'settlements'),
      where('supplierId', '==', supplier.id),
      orderBy('createdAt', 'desc')
    );

    const unsubSettlements = onSnapshot(qSettlements, (snapshot) => {
      setSettlements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOrders();
      unsubSettlements();
    };
  }, [supplier?.id]);

  // CALCULS STATISTIQUES
  const stats = useMemo(() => {
    let unpaidOrders = 0;
    let deliveredOrders = 0;
    let totalPlatformShare = 0;
    let totalSupplierShare = 0;

    orders.forEach(order => {
      const status = order.status;
      const isDelivered = status === ORDER_STATUS.SHIPPING || status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETED;
      
      if (isDelivered) {
        deliveredOrders++;
        
        if (order.settlementStatus !== WITHDRAWAL_STATUS.PAID) {
          unpaidOrders++;
        }

        const platformDebt = Number(order.platformDebt || 0);
        totalPlatformShare += platformDebt;

        const items = order.items || [];
        items.forEach(item => {
          const buyingPrice = Number(item.supplierPrice || 0);
          const quantity = Number(item.quantity || 0);
          totalSupplierShare += buyingPrice * quantity;
        });

        const deliveryFee = Number(order.details?.deliveryFee || 0);
        totalSupplierShare += deliveryFee * 0.9;
      }
    });

    const totalRevenue = totalPlatformShare + totalSupplierShare;
    const avgOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;
    const avgSupplierEarning = deliveredOrders > 0 ? totalSupplierShare / deliveredOrders : 0;

    return {
      platformDebt: financialStats.platformDebt,
      totalSupplierEarnings: financialStats.totalSupplierEarnings,
      productEarnings: financialStats.productEarnings,
      deliveryEarnings: financialStats.deliveryEarnings,
      unpaidOrders,
      deliveredOrders,
      totalOrders: orders.length,
      totalPlatformShare,
      totalSupplierShare,
      totalRevenue,
      avgOrderValue,
      avgSupplierEarning,
      supplierSharePercentage: totalRevenue > 0 ? (totalSupplierShare / totalRevenue) * 100 : 0,
      platformSharePercentage: totalRevenue > 0 ? (totalPlatformShare / totalRevenue) * 100 : 0
    };
  }, [orders, financialStats]);

  // PRÉDICTIONS
  const predictions = useMemo(() => {
    if (stats.deliveredOrders === 0) return null;
    const avgPerOrder = stats.avgSupplierEarning;
    return {
      conservative: avgPerOrder * 60,
      average: avgPerOrder * 90,
      optimistic: avgPerOrder * 150,
      avgPerOrder
    };
  }, [stats]);

  // PAIEMENT
  const handleDeclarePayment = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim() || stats.platformDebt <= 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'settlements'), {
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: stats.platformDebt,
        transactionRef: transactionRef.toUpperCase(),
        status: 'pending',
        createdAt: serverTimestamp(),
        type: 'settlement',
        context: 'manual_payment'
      });
      setTransactionRef('');
      setActiveTab('history');
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("Erreur lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingSettlement = settlements.some(s => s.status === WITHDRAWAL_STATUS.PENDING);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-premium mx-auto space-y-4 md:space-y-6 pb-20 md:pb-8"
    >
      
      {/* ========================================
          1. HERO SECTION (Responsive Grid)
          ======================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-5 md:p-8 text-white shadow-elegant border border-white/10 relative overflow-hidden">
        <div className="grain-texture absolute inset-0 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-display font-bold flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-xl border border-purple-500/30">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8 text-purple-300"/>
                </div>
                Portefeuille
              </h1>
              <p className="text-slate-400 text-sm md:text-base mt-1">Gérez vos revenus et transactions</p>
            </div>
            
            {/* Badge Status */}
            <div className="self-start md:self-center flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-emerald-400 text-xs md:text-sm font-bold uppercase tracking-wide">Compte Actif</span>
            </div>
          </div>
          
          {/* STATS CARDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {[
              { label: 'Commandes', val: stats.totalOrders, icon: Package, color: 'text-white' },
              { label: 'Livrées', val: stats.deliveredOrders, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Non réglées', val: stats.unpaidOrders, icon: Clock, color: 'text-orange-400' },
              { label: 'Moyenne/Cmd', val: <MoneyDisplay amount={Math.round(stats.avgSupplierEarning)} />, icon: TrendingUp, color: 'text-yellow-400' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <stat.icon size={14} className="md:w-4 md:h-4"/>
                  <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold">{stat.label}</span>
                </div>
                <div className={`text-lg md:text-2xl lg:text-3xl font-bold font-display ${stat.color}`}>
                  {stat.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================
          2. NAVIGATION (Sticky Mobile Scroll)
          ======================================== */}
      <div className="sticky top-[4rem] md:top-20 z-40 -mx-4 md:mx-0 px-4 md:px-0 bg-slate-900/80 backdrop-blur-xl md:bg-transparent md:backdrop-filter-none py-2 md:py-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 snap-x">
          {[
            { id: 'overview', label: 'Aperçu', icon: PieChart },
            { id: 'details', label: 'Commandes', icon: FileText },
            { id: 'predictions', label: 'Futur', icon: Sparkles },
            { id: 'pay', label: 'Régler', icon: Send },
            { id: 'history', label: 'Historique', icon: History },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================
          3. CONTENU DES ONGLETS
          ======================================== */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden shadow-elegant min-h-[400px]">
        
        {/* --- A. APERÇU (OVERVIEW) --- */}
        {activeTab === 'overview' && (
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              
              {/* Carte REVENUS (Verte) */}
              <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 md:p-6 transition-all hover:border-emerald-500/40">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={100} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Wallet size={20} />
                    </div>
                    <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider">Vos Revenus Nets</h3>
                  </div>
                  <div className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                    <MoneyDisplay amount={stats.totalSupplierEarnings} />
                  </div>
                  
                  {/* Détails revenus */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Package size={10}/> Ventes Produits</p>
                      <p className="text-sm md:text-lg font-bold text-slate-200"><MoneyDisplay amount={stats.productEarnings} /></p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Truck size={10}/> Livraisons</p>
                      <p className="text-sm md:text-lg font-bold text-slate-200"><MoneyDisplay amount={stats.deliveryEarnings} /></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte DETTE (Rouge/Neutre) */}
              <div className={`relative overflow-hidden rounded-2xl p-5 md:p-6 border transition-all ${
                stats.platformDebt > 0 
                  ? 'bg-gradient-to-br from-red-900/20 to-slate-900 border-red-500/30 hover:border-red-500/50'
                  : 'bg-slate-800/50 border-slate-600'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stats.platformDebt > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-300'}`}>
                      {stats.platformDebt > 0 ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
                    </div>
                    <h3 className={`font-bold uppercase text-xs tracking-wider ${stats.platformDebt > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      Dette Plateforme
                    </h3>
                  </div>
                  {stats.platformDebt > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                      ACTION REQUISE
                    </span>
                  )}
                </div>
                
                <div className={`text-3xl md:text-5xl font-display font-bold mb-6 ${stats.platformDebt > 0 ? 'text-white' : 'text-slate-500'}`}>
                  <MoneyDisplay amount={stats.platformDebt} />
                </div>

                {stats.platformDebt > 0 ? (
                  <button 
                    onClick={() => setActiveTab('pay')}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-900/20"
                  >
                    <Send size={16}/> Régler maintenant
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={16}/>
                    <span className="text-sm font-medium">Vous êtes à jour !</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section Graphique Simplifiée */}
            <div className="bg-slate-900/50 rounded-2xl p-5 md:p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="text-purple-400" size={20}/> Répartition du Chiffre d'Affaires
              </h3>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* SVG Chart Responsive */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                    {/* Segment Supplier */}
                    <circle 
                      cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12"
                      strokeDasharray={`${stats.supplierSharePercentage * 2.51} 251`}
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Segment Platform */}
                    <circle 
                      cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="12"
                      strokeDasharray={`${stats.platformSharePercentage * 2.51} 251`}
                      strokeDashoffset={`-${stats.supplierSharePercentage * 2.51}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400">Total</span>
                    <span className="text-sm font-bold text-white"><MoneyDisplay amount={stats.totalRevenue} forceCompact={true} /></span>
                  </div>
                </div>

                {/* Légende */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-sm text-slate-300">Votre Part</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400">{stats.supplierSharePercentage.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400"><MoneyDisplay amount={stats.totalSupplierShare} /></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                      <span className="text-sm text-slate-300">Plateforme</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">{stats.platformSharePercentage.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400"><MoneyDisplay amount={stats.totalPlatformShare} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- B. COMMANDES (DETAILS) - RESPONSIVE LIST --- */}
        {activeTab === 'details' && (
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                <FileText className="text-purple-400" size={20}/>
                Détail des Livraisons
              </h3>
              <div className="text-sm text-slate-400">
                {stats.deliveredOrders} commande(s) trouvée(s)
              </div>
            </div>
            
            <div className="space-y-4">
              {orders
                .filter(o => o.status === 'Livré' || o.status === 'Terminé' || o.status === 'En livraison')
                .map(order => {
                  const items = order.items || [];
                  const firstImage = items[0]?.image || 'https://placehold.co/100?text=IMG';
                  const deliveryFee = Number(order.details?.deliveryFee || 0);
                  const supplierDeliveryGain = deliveryFee * 0.9;
                  
                  // Calcul du gain total pour cette commande
                  let productsGain = 0;
                  items.forEach(item => {
                    const price = Number(item.buyingPrice || item.supplierPrice || 0);
                    productsGain += price * Number(item.quantity || 0);
                  });
                  const totalGain = productsGain + supplierDeliveryGain;
                  const debt = Number(order.platformDebt || 0);

                  return (
                    <div key={order.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-all group">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* 1. Info Principale & Image */}
                        <div className="flex gap-4 md:w-1/3">
                          <div 
                            className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border border-slate-700 cursor-pointer group-hover:scale-105 transition-transform"
                            onClick={() => setPreviewImage(firstImage)}
                          >
                            <img src={firstImage} alt="" className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ZoomIn size={16} className="text-white"/>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-purple-400">#{order.code}</span>
                              <span className="text-xs text-slate-500">• {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-300 truncate mb-2">{items.length} article(s)</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                              order.settlementStatus === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                              {order.settlementStatus === 'paid' ? 'Payé' : 'En attente règlement'}
                            </span>
                          </div>
                        </div>

                        {/* 2. Détails Financiers (Responsive Grid inside Card) */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Votre Gain Net</p>
                            <div className="text-sm md:text-base font-bold text-emerald-400">
                              <MoneyDisplay amount={totalGain} />
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Commission</p>
                            <div className={`text-sm md:text-base font-bold ${debt > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                               {debt > 0 ? '-' : ''}<MoneyDisplay amount={debt} />
                            </div>
                          </div>

                          <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-700 pt-2 md:pt-0 md:pl-3 mt-1 md:mt-0 flex md:flex-col justify-between items-center md:items-start">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Client</p>
                            <div className="text-sm font-bold text-slate-300">
                              <MoneyDisplay amount={order.details?.finalTotal} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
              })}
              
              {orders.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Package className="mx-auto w-12 h-12 mb-3 opacity-20"/>
                  <p>Aucune commande pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- C. PRÉVISIONS --- */}
        {activeTab === 'predictions' && (
           <div className="p-4 md:p-8">
             <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex gap-4">
                <Sparkles className="text-purple-400 shrink-0" size={24}/>
                <div>
                  <h3 className="font-bold text-purple-100">Projections Mensuelles</h3>
                  <p className="text-sm text-purple-200/70 mt-1">
                    Estimations basées sur votre moyenne actuelle de <span className="font-bold text-white"><MoneyDisplay amount={Math.round(stats.avgSupplierEarning)} /></span> par commande livrée.
                  </p>
                </div>
             </div>

             {predictions ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { title: 'Conservateur', orders: 60, val: predictions.conservative, color: 'blue', icon: Target },
                   { title: 'Standard', orders: 90, val: predictions.average, color: 'emerald', icon: TrendingUp },
                   { title: 'Optimiste', orders: 150, val: predictions.optimistic, color: 'amber', icon: Zap },
                 ].map((p, i) => (
                   <div key={i} className={`p-6 rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300
                      ${p.color === 'blue' ? 'border-blue-500/30 hover:border-blue-500' : ''}
                      ${p.color === 'emerald' ? 'border-emerald-500/30 hover:border-emerald-500' : ''}
                      ${p.color === 'amber' ? 'border-amber-500/30 hover:border-amber-500' : ''}
                   `}>
                      <div className={`p-3 rounded-full mb-4 bg-${p.color}-500/10 text-${p.color}-400`}>
                        <p.icon size={24} />
                      </div>
                      <h4 className={`uppercase text-xs font-bold tracking-widest text-${p.color}-400 mb-2`}>{p.title}</h4>
                      <div className="text-3xl font-display font-bold text-white mb-2">
                        <MoneyDisplay amount={p.val} />
                      </div>
                      <div className="text-sm text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                        ~{p.orders} commandes
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-10 text-slate-500">Pas assez de données pour les prédictions.</div>
             )}
           </div>
        )}

        {/* --- D. RÉGLER (PAY) --- */}
        {activeTab === 'pay' && (
          <div className="p-4 md:p-8 max-w-2xl mx-auto">
             {stats.platformDebt > 0 ? (
               <div className="space-y-6">
                 <div className="text-center mb-8">
                   <div className="inline-block p-4 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                     <AlertTriangle size={32} className="text-red-500"/>
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-2">Régularisation requise</h2>
                   <div className="text-4xl font-display font-bold text-red-400 my-4">
                      <MoneyDisplay amount={stats.platformDebt} />
                   </div>
                   <p className="text-slate-400 text-sm">Montant cumulé des commissions sur vos ventes livrées.</p>
                 </div>

                 <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6">
                    {/* Étape 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">1</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-2">Envoyez le montant</h4>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Numéro Mobile Money</span>
                          <span className="font-mono font-bold text-white text-lg select-all">{config?.phoneNumber || '---'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Étape 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">2</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-2">Confirmez le transfert</h4>
                        <form onSubmit={handleDeclarePayment} className="space-y-3">
                          <input 
                            type="text" 
                            placeholder="ID de Transaction (ex: MP2024...)" 
                            required
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                          />
                          <button 
                            type="submit" 
                            disabled={isSubmitting || hasPendingSettlement}
                            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                            ) : (
                              <>
                                <CheckCircle size={18}/> Confirmer le paiement
                              </>
                            )}
                          </button>
                        </form>
                        {hasPendingSettlement && (
                          <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                            <Clock size={12}/> Un paiement est déjà en attente de validation.
                          </p>
                        )}
                      </div>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                    <CheckCircle size={40} className="text-emerald-500"/>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Tout est en ordre</h2>
                 <p className="text-slate-400 max-w-sm">Vous n'avez aucune dette envers la plateforme actuellement. Continuez à vendre !</p>
                 <button onClick={() => setActiveTab('details')} className="mt-8 text-purple-400 font-bold hover:text-purple-300">
                   Voir mes dernières ventes &rarr;
                 </button>
               </div>
             )}
          </div>
        )}

        {/* --- E. HISTORIQUE (HISTORY) --- */}
        {activeTab === 'history' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <History size={18}/> Historique des transactions
              </h3>
            </div>
            
            <div className="p-0">
              {settlements.length > 0 ? (
                <div className="flex flex-col">
                  {/* Header Table (Desktop Only) */}
                  <div className="hidden md:grid grid-cols-4 gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 bg-slate-900/30">
                    <div>Date</div>
                    <div>Référence</div>
                    <div className="text-right">Montant</div>
                    <div className="text-center">Statut</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-700">
                    {settlements.map((s) => (
                      <div key={s.id} className="p-4 md:grid md:grid-cols-4 md:items-center md:gap-4 hover:bg-slate-700/30 transition-colors flex flex-col gap-3 md:flex-row">
                        
                        {/* Mobile: Top Row with Date & Status */}
                        <div className="flex justify-between items-center md:hidden">
                           <span className="text-sm text-slate-400">
                             {s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                           </span>
                           <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                             s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                             s.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                             'bg-amber-500/10 text-amber-400'
                           }`}>
                             {s.status === 'approved' ? 'Validé' : s.status === 'rejected' ? 'Rejeté' : 'En attente'}
                           </span>
                        </div>

                        {/* Desktop Date */}
                        <div className="hidden md:block text-sm text-slate-300">
                          {s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                        </div>

                        {/* Reference */}
                        <div className="flex items-center gap-2">
                           <span className="md:hidden text-xs text-slate-500">Réf:</span>
                           <code className="bg-slate-900 px-2 py-1 rounded text-xs font-mono text-purple-300 border border-slate-600">
                             {s.transactionRef}
                           </code>
                        </div>

                        {/* Amount */}
                        <div className="flex justify-between md:justify-end md:text-right font-bold text-white">
                           <span className="md:hidden text-sm text-slate-400">Montant:</span>
                           <MoneyDisplay amount={s.amount} />
                        </div>

                        {/* Desktop Status */}
                        <div className="hidden md:flex justify-center">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                             s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                             s.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                             'bg-amber-500/10 text-amber-400 border-amber-500/20'
                           }`}>
                             {s.status === 'approved' ? 'Validé' : s.status === 'rejected' ? 'Rejeté' : 'En attente'}
                           </span>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-slate-500">Aucun historique de paiement.</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL IMAGE ZOOM */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full max-h-[80vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 z-10"
              >
                <X size={20}/>
              </button>
              <img src={previewImage} alt="Zoom" className="w-full h-full object-contain" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SupplierWallet;