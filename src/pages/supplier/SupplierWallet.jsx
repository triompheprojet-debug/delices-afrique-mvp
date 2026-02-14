import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { 
  Wallet, TrendingUp, Send, Clock, CheckCircle, 
  AlertTriangle, History, DollarSign, FileText, Package,
  ArrowUpRight, ArrowDownRight, Info, Truck, PieChart,
  TrendingDown, BarChart3, Zap, Target, Calendar,
  ArrowRight, Eye, Award, Sparkles, CircleDollarSign
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { motion } from 'framer-motion';
import {WITHDRAWAL_STATUS,ORDER_STATUS,DELIVERY_METHODS} from '../../utils/constants';

const SupplierWallet = () => {
  const { supplier, financialStats } = useOutletContext();
  const { config } = useConfig();
  
  const [orders, setOrders] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // CALCULS STATISTIQUES AVANCÉS
  const stats = useMemo(() => {
    let unpaidOrders = 0;
    let paidOrders = 0;
    let deliveredOrders = 0;
    let totalPlatformShare = 0;
    let totalSupplierShare = 0;

    orders.forEach(order => {
      const status = order.status;
      const isDelivered = status === 'Livré' || status === 'Terminé';
      
      if (isDelivered) {
        deliveredOrders++;
        
        if (order.settlementStatus !== 'paid') {
          unpaidOrders++;
        } else {
          paidOrders++;
        }

        // Calcul des parts
        const platformDebt = Number(order.platformDebt || 0);
        totalPlatformShare += platformDebt;

        const items = order.items || [];
        items.forEach(item => {
          const buyingPrice = Number(item.buyingPrice || item.supplierPrice || 0);
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
      paidOrders,
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

  // PRÉDICTIONS MENSUELLES
  const predictions = useMemo(() => {
    if (stats.deliveredOrders === 0) return null;

    const avgPerOrder = stats.avgSupplierEarning;
    
    // Estimation basée sur la moyenne actuelle
    const conservativeMonthly = avgPerOrder * 60; // 2 commandes/jour
    const averageMonthly = avgPerOrder * 90; // 3 commandes/jour
    const optimisticMonthly = avgPerOrder * 150; // 5 commandes/jour

    return {
      conservative: conservativeMonthly,
      average: averageMonthly,
      optimistic: optimisticMonthly,
      avgPerOrder
    };
  }, [stats]);

  // DÉCLARATION DE PAIEMENT
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
      alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingSettlement = settlements.some(s => s.status === 'pending');

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 pb-24"
    >
      
      {/* ========================================
          EN-TÊTE HERO - Vue d'ensemble financière
          ======================================== */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-elegant-lg border border-purple-500/30 relative overflow-hidden">
        <div className="grain-texture absolute inset-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                <Wallet size={36}/>
                Portefeuille & Finances
              </h1>
              <p className="text-purple-200">Suivez vos revenus et gérez vos paiements</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <Award className="text-yellow-300" size={20}/>
              <span className="font-bold">Fournisseur Actif</span>
            </div>
          </div>
          
          {/* STATISTIQUES RAPIDES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <p className="text-xs text-purple-200 mb-1 flex items-center gap-1">
                <Package size={14}/>
                Total commandes
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <p className="text-xs text-purple-200 mb-1 flex items-center gap-1">
                <CheckCircle size={14}/>
                Livrées
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-300">{stats.deliveredOrders}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <p className="text-xs text-purple-200 mb-1 flex items-center gap-1">
                <Clock size={14}/>
                Non réglées
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-300">{stats.unpaidOrders}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <p className="text-xs text-purple-200 mb-1 flex items-center gap-1">
                <DollarSign size={14}/>
                Moyenne/commande
              </p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-300">{Math.round(stats.avgSupplierEarning).toLocaleString()} F</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          NAVIGATION PAR ONGLETS
          ======================================== */}
      <div className="flex gap-2 bg-slate-800 p-2 rounded-xl shadow-elegant border border-slate-700 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
          { id: 'predictions', label: 'Prévisions', icon: TrendingUp },
          { id: 'pay', label: 'Régulariser', icon: Send },
          { id: 'history', label: 'Historique', icon: History },
          { id: 'details', label: 'Détails', icon: FileText }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <tab.icon size={18}/>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================
          CONTENU DES ONGLETS
          ======================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-elegant overflow-hidden">
        
        {/* ONGLET: VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Répartition des revenus - Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Vos gains totaux */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/40">
                    <TrendingUp className="text-green-400" size={28}/>
                  </div>
                  <span className="text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
                    Vos revenus
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">Gains totaux cumulés</p>
                <p className="text-4xl font-bold text-green-400 mb-4">
                  {stats.totalSupplierEarnings.toLocaleString()} <span className="text-2xl">FCFA</span>
                </p>
                
                <div className="space-y-3 pt-4 border-t border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Package size={16} className="text-green-400"/>
                      Gains produits
                    </span>
                    <span className="font-bold text-green-400">{stats.productEarnings.toLocaleString()} F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Truck size={16} className="text-green-400"/>
                      Gains livraison
                    </span>
                    <span className="font-bold text-green-400">{stats.deliveryEarnings.toLocaleString()} F</span>
                  </div>
                </div>
              </div>

              {/* Dette plateforme */}
              <div className={`border-2 p-6 rounded-2xl ${
                stats.platformDebt > 0 
                  ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
                  : 'bg-gradient-to-br from-slate-700/30 to-slate-600/30 border-slate-600'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${
                    stats.platformDebt > 0
                      ? 'bg-red-500/20 border-red-500/40'
                      : 'bg-slate-600 border-slate-500'
                  }`}>
                    {stats.platformDebt > 0 ? (
                      <AlertTriangle className="text-red-400" size={28}/>
                    ) : (
                      <CheckCircle className="text-green-400" size={28}/>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    stats.platformDebt > 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-green-500/10 text-green-400 border-green-500/30'
                  }`}>
                    {stats.platformDebt > 0 ? 'À régler' : 'Réglé'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">Dette envers la plateforme</p>
                <p className={`text-4xl font-bold mb-4 ${
                  stats.platformDebt > 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {stats.platformDebt.toLocaleString()} <span className="text-2xl">FCFA</span>
                </p>
                
                {stats.platformDebt > 0 ? (
                  <button
                    onClick={() => setActiveTab('pay')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send size={18}/>
                    Régulariser maintenant
                  </button>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={20}/>
                    <span className="text-sm text-green-400 font-medium">Aucune dette en cours</span>
                  </div>
                )}
              </div>
            </div>

            {/* Graphique de répartition */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <PieChart size={24} className="text-purple-400"/>
                Répartition des revenus totaux
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Chart */}
                <div className="relative h-64 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full max-w-xs">
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#334155" strokeWidth="40"/>
                    
                    {/* Supplier share (green) */}
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="80" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="40"
                      strokeDasharray={`${stats.supplierSharePercentage * 5.02} 502`}
                      transform="rotate(-90 100 100)"
                      className="transition-all duration-1000"
                    />
                    
                    {/* Platform share (purple) */}
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="80" 
                      fill="none" 
                      stroke="#8b5cf6" 
                      strokeWidth="40"
                      strokeDasharray={`${stats.platformSharePercentage * 5.02} 502`}
                      strokeDashoffset={`-${stats.supplierSharePercentage * 5.02}`}
                      transform="rotate(-90 100 100)"
                      className="transition-all duration-1000"
                    />
                    
                    {/* Center text */}
                    <text x="100" y="95" textAnchor="middle" className="text-xs fill-slate-400">
                      Total
                    </text>
                    <text x="100" y="115" textAnchor="middle" className="text-lg font-bold fill-slate-200">
                      {stats.totalRevenue.toLocaleString()}
                    </text>
                  </svg>
                </div>

                {/* Légende */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Votre part</p>
                        <p className="text-xs text-slate-500">{stats.deliveredOrders} commandes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">{stats.supplierSharePercentage.toFixed(1)}%</p>
                      <p className="text-sm text-slate-400">{stats.totalSupplierShare.toLocaleString()} F</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Part plateforme</p>
                        <p className="text-xs text-slate-500">Commissions & marketing</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-400">{stats.platformSharePercentage.toFixed(1)}%</p>
                      <p className="text-sm text-slate-400">{stats.totalPlatformShare.toLocaleString()} F</p>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 border border-slate-600 p-4 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Info className="text-blue-400 shrink-0 mt-0.5" size={16}/>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        La plateforme prend en charge le marketing, la technologie, et le support client. 
                        Vous gardez la majorité des revenus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET: PRÉVISIONS */}
        {activeTab === 'predictions' && (
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-5 rounded-xl mb-6">
              <Sparkles className="text-purple-400 shrink-0" size={24}/>
              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">Potentiel de revenus</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Basé sur votre moyenne actuelle de <strong className="text-purple-400">{Math.round(stats.avgSupplierEarning).toLocaleString()} FCFA</strong> par commande,
                  voici vos projections mensuelles selon différents scénarios.
                </p>
              </div>
            </div>

            {predictions ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Scénario Conservateur */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 p-6 rounded-2xl hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/40">
                      <Target className="text-blue-400" size={24}/>
                    </div>
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/30">
                      Conservateur
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">~60 commandes/mois</p>
                  <p className="text-xs text-slate-500 mb-3">(2 commandes/jour)</p>
                  <p className="text-3xl font-bold text-blue-400 mb-4">
                    {Math.round(predictions.conservative).toLocaleString()} <span className="text-lg">F</span>
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                    <p className="text-xs text-blue-300">Revenus mensuels estimés</p>
                  </div>
                </div>

                {/* Scénario Moyen */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 p-6 rounded-2xl hover:-translate-y-1 transition-all ring-2 ring-green-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/40">
                      <TrendingUp className="text-green-400" size={24}/>
                    </div>
                    <span className="text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-1">
                      <Award size={12}/>
                      Réaliste
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">~90 commandes/mois</p>
                  <p className="text-xs text-slate-500 mb-3">(3 commandes/jour)</p>
                  <p className="text-3xl font-bold text-green-400 mb-4">
                    {Math.round(predictions.average).toLocaleString()} <span className="text-lg">F</span>
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                    <p className="text-xs text-green-300">Scénario le plus probable</p>
                  </div>
                </div>

                {/* Scénario Optimiste */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 p-6 rounded-2xl hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/40">
                      <Zap className="text-orange-400" size={24}/>
                    </div>
                    <span className="text-xs font-bold bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/30">
                      Optimiste
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">~150 commandes/mois</p>
                  <p className="text-xs text-slate-500 mb-3">(5 commandes/jour)</p>
                  <p className="text-3xl font-bold text-orange-400 mb-4">
                    {Math.round(predictions.optimistic).toLocaleString()} <span className="text-lg">F</span>
                  </p>
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                    <p className="text-xs text-orange-300">Fort potentiel de croissance</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <BarChart3 size={48} className="mx-auto mb-4 text-slate-600"/>
                <p className="text-slate-400 font-medium">Pas assez de données pour générer des prévisions</p>
                <p className="text-sm text-slate-500 mt-2">Complétez quelques commandes pour voir vos projections</p>
              </div>
            )}

            {/* Comment augmenter vos revenus */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={24}/>
                Comment augmenter vos revenus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <Package size={18}/>
                    Diversifiez vos produits
                  </h4>
                  <p className="text-sm text-slate-300">
                    Plus vous avez de produits populaires, plus vous attirez de clients différents.
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                    <Clock size={18}/>
                    Livraison rapide
                  </h4>
                  <p className="text-sm text-slate-300">
                    Traitez les commandes rapidement pour obtenir de meilleures notes et plus de visibilité.
                  </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <TrendingUp size={18}/>
                    Prix compétitifs
                  </h4>
                  <p className="text-sm text-slate-300">
                    Proposez des tarifs attractifs tout en maintenant votre marge.
                  </p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                    <Award size={18}/>
                    Qualité constante
                  </h4>
                  <p className="text-sm text-slate-300">
                    Maintenez une qualité excellente pour fidéliser votre clientèle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET: RÉGULARISER */}
        {activeTab === 'pay' && (
          <div>
            {stats.platformDebt > 0 ? (
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30 p-6 rounded-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/40">
                      <AlertTriangle className="text-red-400" size={28}/>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-400 mb-2">Dette à régulariser</h3>
                      <p className="text-3xl font-bold text-slate-100 mb-2">
                        {stats.platformDebt.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-slate-300">
                        Cette dette correspond à la commission plateforme sur vos ventes livrées non réglées.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions de paiement */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-xl border-2 border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-blue-400 mb-3 text-lg">Effectuez le paiement par Mobile Money</p>
                        <div className="bg-slate-800/50 p-5 rounded-lg border border-blue-500/20">
                          <p className="text-slate-300 mb-4 text-base">
                            Envoyez exactement <strong className="text-blue-400 text-xl">{stats.platformDebt.toLocaleString()} FCFA</strong> au numéro :
                          </p>
                          <div className="bg-slate-700/50 px-6 py-4 rounded-lg border border-blue-500/20 text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Numéro de paiement</p>
                            <p className="font-mono font-bold text-3xl text-slate-200">
                              {config?.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border-2 border-green-500/20">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-400 mb-4 text-lg">Saisissez l'ID de transaction</p>
                        
                        <form onSubmit={handleDeclarePayment} className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                              Référence de transaction Mobile Money
                            </label>
                            <input 
                              required
                              type="text" 
                              placeholder="Ex: MP240128.1234.A56789"
                              className="w-full p-4 bg-slate-800 border-2 border-green-500/20 rounded-xl text-center font-mono uppercase text-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-slate-200 placeholder-slate-500"
                              value={transactionRef}
                              onChange={e => setTransactionRef(e.target.value)}
                              disabled={hasPendingSettlement}
                            />
                          </div>
                          
                          <button 
                            type="submit" 
                            disabled={isSubmitting || hasPendingSettlement}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Envoi en cours...
                              </>
                            ) : hasPendingSettlement ? (
                              <>
                                <Clock size={20}/>
                                Paiement en attente de validation
                              </>
                            ) : (
                              <>
                                <Send size={20}/>
                                Confirmer le paiement
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border-l-4 border-orange-500 p-5 rounded-r-xl">
                    <div className="flex items-start gap-3">
                      <Info className="text-orange-400 shrink-0 mt-0.5" size={22}/>
                      <div className="text-sm text-slate-300">
                        <p className="font-bold mb-2 text-orange-400 text-base">Important</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Vérifiez le montant exact avant d'envoyer</li>
                          <li>Copiez correctement la référence de transaction</li>
                          <li>Votre compte sera réactivé sous 24h après validation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center">
                <CheckCircle size={64} className="mx-auto mb-4 text-green-400"/>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">Aucune dette en cours</h3>
                <p className="text-slate-400">Vous n'avez aucune dette envers la plateforme actuellement.</p>
              </div>
            )}
          </div>
        )}

        {/* ONGLET: HISTORIQUE */}
        {activeTab === 'history' && (
          <div>
            <div className="p-6 bg-slate-800/50 border-b border-slate-700">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 text-lg">
                <History size={22}/>
                Historique des paiements
              </h3>
              <p className="text-sm text-slate-400 mt-1">Tous vos règlements à la plateforme</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-4 font-bold">Date & Heure</th>
                    <th className="p-4 font-bold">Référence</th>
                    <th className="p-4 text-right font-bold">Montant</th>
                    <th className="p-4 text-center font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {settlements.length > 0 ? (
                    settlements.map((settlement) => (
                      <tr key={settlement.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-sm text-slate-300">
                          {settlement.createdAt?.seconds 
                            ? new Date(settlement.createdAt.seconds * 1000).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '---'}
                        </td>
                        <td className="p-4">
                          <code className="text-sm font-mono font-bold text-purple-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-purple-500/30">
                            {settlement.transactionRef}
                          </code>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-lg font-bold text-slate-200">
                            {Number(settlement.amount || settlement.amountDeclared || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">FCFA</span>
                        </td>
                        <td className="p-4 text-center">
                          {settlement.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500/10 text-yellow-400 text-sm rounded-full font-bold border border-yellow-500/30">
                              <Clock size={16}/>
                              En attente
                            </span>
                          )}
                          {settlement.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 text-sm rounded-full font-bold border border-green-500/30">
                              <CheckCircle size={16}/>
                              Validé
                            </span>
                          )}
                          {settlement.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 text-sm rounded-full font-bold border border-red-500/30">
                              <AlertTriangle size={16}/>
                              Rejeté
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-16 text-center">
                        <FileText size={48} className="mx-auto mb-4 text-slate-600"/>
                        <p className="text-slate-400 font-medium">Aucun historique de paiement</p>
                        <p className="text-sm text-slate-500 mt-2">Vos futurs paiements apparaîtront ici</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONGLET: DÉTAILS */}
        {activeTab === 'details' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2">
                <Package size={22}/>
                Détail de toutes les commandes livrées
              </h3>
              <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                {stats.deliveredOrders} commande{stats.deliveredOrders > 1 ? 's' : ''}
              </span>
            </div>
            
            {orders.filter(o => o.status === 'En livraison' || o.status === 'Livré' || o.status === 'Terminé').length > 0 ? (
              <div className="space-y-3">
                {orders
                  .filter(o => o.status === 'En livraison' || o.status === 'Livré' || o.status === 'Terminé')
                  .map(order => {
                    const items = order.items || [];
                    let supplierGain = 0;
                    
                    items.forEach(item => {
                      const buyingPrice = Number(item.buyingPrice || item.supplierPrice || 0);
                      const quantity = Number(item.quantity || 0);
                      supplierGain += buyingPrice * quantity;
                    });
                    
                    const deliveryCost = Number(order.details?.deliveryFee || 0);
                    const supplierDeliveryGain = deliveryCost * 0.9;
                    const platformDebt = Number(order.platformDebt || 0);
                    const totalGain = supplierGain + supplierDeliveryGain;
                    
                    return (
                      <div key={order.id} className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-5 hover:shadow-elegant transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-mono font-bold text-purple-400 text-lg">#{order.code}</p>
                            <p className="text-sm text-slate-400 mt-1">
                              {order.createdAt?.seconds 
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : '---'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                              order.settlementStatus === 'paid' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                            }`}>
                              {order.settlementStatus === 'paid' ? '✓ Réglée' : '⏳ Non réglée'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300 border border-slate-600">
                              {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
                            <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
                              <TrendingUp size={14}/>
                              Vos gains totaux
                            </p>
                            <p className="text-xl font-bold text-green-400">{totalGain.toLocaleString()} F</p>
                          </div>
                          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30">
                            <p className="text-xs text-red-400 mb-1 flex items-center gap-1">
                              <AlertTriangle size={14}/>
                              Dette plateforme
                            </p>
                            <p className="text-xl font-bold text-red-400">{platformDebt.toLocaleString()} F</p>
                          </div>
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                            <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                              <Truck size={14}/>
                              Frais livraison
                            </p>
                            <p className="text-xl font-bold text-blue-400">{deliveryCost.toLocaleString()} F</p>
                          </div>
                          <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <CircleDollarSign size={14}/>
                              Total client
                            </p>
                            <p className="text-xl font-bold text-slate-200">{(order.details?.finalTotal || 0).toLocaleString()} F</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package size={64} className="mx-auto mb-4 text-slate-600"/>
                <p className="text-slate-400 font-medium text-lg">Aucune commande livrée</p>
                <p className="text-sm text-slate-500 mt-2">Vos commandes livrées apparaîtront ici</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SupplierWallet;