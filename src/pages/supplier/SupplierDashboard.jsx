import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Package, Wallet, Store, Shield, LogOut, AlertTriangle, 
  TrendingUp, Clock, CheckCircle, Activity, ArrowRight, 
  Zap, DollarSign, ShoppingBag, BookOpen, TrendingDown,
  Bell, Star, Users, Eye, Calendar, BarChart3, PieChart,
  Target, Award, Sparkles, CircleDollarSign, ArrowUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ORDER_STATUS } from '../../utils/constants';

const SupplierDashboard = () => {
  const { supplier, financialStats } = useOutletContext();
  const navigate = useNavigate();
  
  // États pour les indicateurs temps réel
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);

  // Calculs statistiques avancés
  const advancedStats = useMemo(() => {
    const delivered = allOrders.filter(o => 
      o.status === ORDER_STATUS.DELIVERED || o.status === ORDER_STATUS.COMPLETED
    );
    
    // Revenus par jour (7 derniers jours)
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = delivered.filter(o => {
        if (!o.createdAt?.seconds) return false;
        const orderDate = new Date(o.createdAt.seconds * 1000);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      let dayRevenue = 0;
      dayOrders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
          const buyingPrice = Number(item.buyingPrice || item.supplierPrice || 0);
          const quantity = Number(item.quantity || 0);
          dayRevenue += buyingPrice * quantity;
        });
        const deliveryFee = Number(order.details?.deliveryFee || 0);
        dayRevenue += deliveryFee * 0.9;
      });
      
      last7Days.push({
        date: dayStart,
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }
    
    // Tendance (croissance)
    const recentRevenue = last7Days.slice(4, 7).reduce((sum, day) => sum + day.revenue, 0);
    const olderRevenue = last7Days.slice(0, 3).reduce((sum, day) => sum + day.revenue, 0);
    const growthTrend = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;
    
    return {
      last7Days,
      growthTrend,
      totalDelivered: delivered.length,
      avgDailyOrders: delivered.length / 7
    };
  }, [allOrders]);

  // Sécurité de Session
  useEffect(() => {
    const sessionId = sessionStorage.getItem('supplierAuthenticated');
    if (sessionId !== supplier.id) {
      navigate(`/fournisseur/${supplier.accessSlug}`);
    }
  }, [supplier, navigate]);

  // Écoute temps réel des commandes en cours
  useEffect(() => {
    const qActiveOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id),
      where('status', 'in', [
        ORDER_STATUS.PENDING,
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.SHIPPING
      ])
    );

    const unsubscribeActive = onSnapshot(qActiveOrders, (snap) => {
      setActiveOrderCount(snap.size);
    });

    // Charger toutes les commandes pour les stats
    const qAllOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id)
    );

    const unsubscribeAll = onSnapshot(qAllOrders, (snap) => {
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllOrders(orders);
      setLoading(false);
    });

    return () => {
      unsubscribeActive();
      unsubscribeAll();
    };
  }, [supplier]);

  const handleLogout = () => {
    sessionStorage.removeItem('supplierAuthenticated');
    navigate(`/fournisseur/${supplier.accessSlug}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* ========================================
          HEADER ACCUEIL - Hero Section
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 p-8 rounded-2xl shadow-elegant-lg border border-purple-500/30 relative overflow-hidden"
      >
        {/* Grain texture overlay */}
        <div className="grain-texture absolute inset-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Store className="text-white" size={28}/>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 flex items-center gap-3">
                  Bonjour, {supplier.name} 
                  <span className="text-3xl">👋</span>
                </h1>
                <p className="text-purple-200 text-sm">
                  Bienvenue dans votre espace fournisseur
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-purple-200">Code Vendeur :</span>
              <span className="font-mono font-bold bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/20 text-lg">
                {supplier.supplierCode}
              </span>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <Shield className="text-green-300" size={16}/>
                <span className="text-sm font-bold text-green-300">Vérifié</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="group flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 hover:border-white/40 font-medium shadow-lg"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform"/>
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.div>

      {/* ========================================
          ALERTES CRITIQUES (DETTE)
          ======================================== */}
      {financialStats.platformDebt > 0 && (
        <motion.div 
          variants={itemVariants}
          className={`p-6 rounded-2xl border-2 flex items-start gap-4 animate-pulse-soft ${
            financialStats.platformDebt > 50000 
              ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/40' 
              : 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/40'
          }`}
        >
          <div className={`shrink-0 p-4 rounded-xl ${
            financialStats.platformDebt > 50000 ? 'bg-red-500/30' : 'bg-orange-500/30'
          } border-2 ${
            financialStats.platformDebt > 50000 ? 'border-red-500/50' : 'border-orange-500/50'
          }`}>
            <AlertTriangle className={financialStats.platformDebt > 50000 ? 'text-red-400' : 'text-orange-400'} size={28}/>
          </div>
          <div className="flex-1">
            <p className={`font-bold text-xl mb-2 ${
              financialStats.platformDebt > 50000 ? 'text-red-400' : 'text-orange-400'
            }`}>
              ⚠️ Régularisation requise
            </p>
            <p className="text-slate-200 mb-4 text-lg">
              Vous devez reverser <span className="font-bold text-2xl mx-1 text-white">{financialStats.platformDebt.toLocaleString()} FCFA</span> à la plateforme.
            </p>
            <Link 
              to="../wallet" 
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ${
                financialStats.platformDebt > 50000
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              Payer maintenant
              <ArrowRight size={18}/>
            </Link>
          </div>
        </motion.div>
      )}

      {/* ========================================
          STATUT OPÉRATIONNEL - Commandes actives
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl shadow-elegant"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-purple-400 text-2xl flex items-center gap-3 mb-3">
              <Clock size={26}/>
              Commandes en cours
            </h3>
            <p className="text-slate-300 text-base leading-relaxed">
              {activeOrderCount > 0 
                ? `Vous avez ${activeOrderCount} commande${activeOrderCount > 1 ? 's' : ''} active${activeOrderCount > 1 ? 's' : ''}. Traitez-les une par une.` 
                : "Aucune commande en attente. Votre stand est calme. 🎉"}
            </p>
            {activeOrderCount > 0 && (
              <Link 
                to="../orders" 
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                Voir les commandes
                <ArrowRight size={16}/>
              </Link>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
            <div className="relative text-5xl font-bold text-purple-400 bg-slate-900 w-24 h-24 rounded-2xl flex items-center justify-center shadow-elegant border-2 border-purple-500/40">
              {activeOrderCount}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================
          STATISTIQUES FINANCIÈRES - Vue rapide
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Gains Produits */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-6 rounded-2xl hover:shadow-elegant-lg transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform border border-green-500/40">
              <ShoppingBag className="text-green-400" size={24}/>
            </div>
            <span className="text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/30">Produits</span>
          </div>
          <p className="text-sm text-slate-400 mb-2 font-medium">Gains sur produits</p>
          <p className="text-3xl font-bold text-green-400">{financialStats.productEarnings.toLocaleString()} F</p>
        </div>

        {/* Gains Livraison */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-6 rounded-2xl hover:shadow-elegant-lg transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform border border-blue-500/40">
              <Package className="text-blue-400" size={24}/>
            </div>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">Livraison</span>
          </div>
          <p className="text-sm text-slate-400 mb-2 font-medium">Gains sur livraisons</p>
          <p className="text-3xl font-bold text-blue-400">{financialStats.deliveryEarnings.toLocaleString()} F</p>
        </div>

        {/* Gains Totaux */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-6 rounded-2xl hover:shadow-elegant-lg transition-all duration-300 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform border border-purple-500/40">
              <TrendingUp className="text-purple-400" size={24}/>
            </div>
            <span className="text-xs font-bold bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30">Total</span>
          </div>
          <p className="text-sm text-slate-400 mb-2 font-medium">Gains totaux cumulés</p>
          <p className="text-3xl font-bold text-purple-400">{financialStats.totalSupplierEarnings.toLocaleString()} F</p>
        </div>
      </motion.div>

      {/* ========================================
          GRAPHIQUES - Évolution des revenus
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl shadow-elegant"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
              <BarChart3 className="text-purple-400" size={28}/>
              Évolution de vos revenus
            </h3>
            <p className="text-slate-400 text-sm">7 derniers jours</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            advancedStats.growthTrend >= 0 
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {advancedStats.growthTrend >= 0 ? (
              <ArrowUp size={18}/>
            ) : (
              <TrendingDown size={18}/>
            )}
            <span className="font-bold">{Math.abs(advancedStats.growthTrend).toFixed(1)}%</span>
          </div>
        </div>

        {/* Graphique en barres */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-around gap-2">
            {advancedStats.last7Days.map((day, index) => {
              const maxRevenue = Math.max(...advancedStats.last7Days.map(d => d.revenue), 1);
              const heightPercentage = (day.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-700/30 rounded-t-lg relative group cursor-pointer hover:bg-slate-700/50 transition-all"
                       style={{ height: `${heightPercentage}%`, minHeight: '4px' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg"></div>
                    
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg shadow-lg transition-opacity whitespace-nowrap z-10">
                      <p className="text-xs text-purple-400 font-bold">{day.revenue.toLocaleString()} F</p>
                      <p className="text-xs text-slate-400">{day.orders} commande{day.orders > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <span className="text-xs text-slate-500 font-medium">
                    {day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 pt-6 border-t border-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Calendar className="text-purple-400" size={20}/>
            </div>
            <div>
              <p className="text-xs text-slate-500">Moyenne/jour</p>
              <p className="text-lg font-bold text-slate-200">
                {(advancedStats.last7Days.reduce((sum, d) => sum + d.revenue, 0) / 7).toFixed(0)} F
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <Target className="text-green-400" size={20}/>
            </div>
            <div>
              <p className="text-xs text-slate-500">Meilleur jour</p>
              <p className="text-lg font-bold text-slate-200">
                {Math.max(...advancedStats.last7Days.map(d => d.revenue)).toLocaleString()} F
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Activity className="text-blue-400" size={20}/>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total période</p>
              <p className="text-lg font-bold text-slate-200">
                {advancedStats.last7Days.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} F
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================
          RÉPARTITION REVENUS - Visualisation
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl shadow-elegant"
      >
        <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <PieChart className="text-purple-400" size={28}/>
          Composition de vos revenus
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Donut Chart */}
          <div className="relative h-64 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-xs">
              {/* Background circle */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="#334155" strokeWidth="30"/>
              
              {/* Product earnings (green) */}
              {financialStats.totalSupplierEarnings > 0 && (
                <circle 
                  cx="100" 
                  cy="100" 
                  r="70" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="30"
                  strokeDasharray={`${(financialStats.productEarnings / financialStats.totalSupplierEarnings) * 439.6} 439.6`}
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000"
                />
              )}
              
              {/* Delivery earnings (blue) */}
              {financialStats.totalSupplierEarnings > 0 && (
                <circle 
                  cx="100" 
                  cy="100" 
                  r="70" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="30"
                  strokeDasharray={`${(financialStats.deliveryEarnings / financialStats.totalSupplierEarnings) * 439.6} 439.6`}
                  strokeDashoffset={`-${(financialStats.productEarnings / financialStats.totalSupplierEarnings) * 439.6}`}
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000"
                />
              )}
              
              {/* Center text */}
              <text x="100" y="95" textAnchor="middle" className="text-xs fill-slate-400">
                Total
              </text>
              <text x="100" y="115" textAnchor="middle" className="text-lg font-bold fill-slate-200">
                {financialStats.totalSupplierEarnings.toLocaleString()}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium text-slate-300">Gains produits</span>
                </div>
                <span className="text-lg font-bold text-green-400">
                  {financialStats.totalSupplierEarnings > 0 
                    ? ((financialStats.productEarnings / financialStats.totalSupplierEarnings) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <p className="text-2xl font-bold text-green-400">{financialStats.productEarnings.toLocaleString()} F</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium text-slate-300">Gains livraison</span>
                </div>
                <span className="text-lg font-bold text-blue-400">
                  {financialStats.totalSupplierEarnings > 0 
                    ? ((financialStats.deliveryEarnings / financialStats.totalSupplierEarnings) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{financialStats.deliveryEarnings.toLocaleString()} F</p>
            </div>

            <div className="bg-slate-700/30 border border-slate-600 p-3 rounded-xl">
              <div className="flex items-start gap-2">
                <Sparkles className="text-purple-400 shrink-0 mt-0.5" size={16}/>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Les gains de livraison représentent 90% des frais payés par le client. 
                  Plus vous livrez, plus vous gagnez !
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================
          GRILLE DE NAVIGATION RAPIDE - Cartes actions
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        
        {/* CARTE PRODUITS */}
        <Link to="../products" className="group bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 shadow-lg hover:shadow-elegant-lg hover:-translate-y-2 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl text-blue-400 group-hover:scale-110 transition-transform border border-blue-500/30">
              <Store size={28}/>
            </div>
            <span className="text-xs font-bold bg-slate-700 text-slate-400 px-3 py-1.5 rounded-full border border-slate-600">Catalogue</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors mb-3">Mes Produits</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Ajouter des articles, gérer les stocks et voir les validations.
          </p>
          
          <div className="mt-6 pt-4 border-t border-slate-600 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Gérer le catalogue</span>
            <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-2 transition-all"/>
          </div>
        </Link>

        {/* CARTE COMMANDES */}
        <Link to="../orders" className="group bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 shadow-lg hover:shadow-elegant-lg hover:-translate-y-2 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-xl text-orange-400 group-hover:scale-110 transition-transform relative border border-orange-500/30">
              <Package size={28}/>
              {activeOrderCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-slate-800 font-bold animate-pulse">
                  {activeOrderCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold bg-slate-700 text-slate-400 px-3 py-1.5 rounded-full border border-slate-600">Livraisons</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors mb-3">Commandes</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Traiter les commandes entrantes et gérer les livraisons.
          </p>
          
          <div className="mt-6 pt-4 border-t border-slate-600 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Voir les commandes</span>
            <ArrowRight size={18} className="text-slate-500 group-hover:text-orange-400 group-hover:translate-x-2 transition-all"/>
          </div>
        </Link>

        {/* CARTE FINANCES */}
        <Link to="../wallet" className="group bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 shadow-lg hover:shadow-elegant-lg hover:-translate-y-2 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl text-green-400 group-hover:scale-110 transition-transform border border-green-500/30">
              <Wallet size={28}/>
            </div>
            <span className="text-xs font-bold bg-slate-700 text-slate-400 px-3 py-1.5 rounded-full border border-slate-600">Trésorerie</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 group-hover:text-green-400 transition-colors mb-3">Portefeuille & Dettes</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Voir vos gains, votre dette plateforme et déclarer un paiement.
          </p>
          
          <div className="mt-6 pt-4 border-t border-slate-600 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Gérer les finances</span>
            <ArrowRight size={18} className="text-slate-500 group-hover:text-green-400 group-hover:translate-x-2 transition-all"/>
          </div>
        </Link>

        {/* CARTE RÈGLES */}
        <Link to="../rules" className="group bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 shadow-lg hover:shadow-elegant-lg hover:-translate-y-2 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl text-purple-400 group-hover:scale-110 transition-transform border border-purple-500/30">
              <BookOpen size={28}/>
            </div>
            <span className="text-xs font-bold bg-slate-700 text-slate-400 px-3 py-1.5 rounded-full border border-slate-600">Important</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors mb-3">Aides & Règles</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Comprendre le fonctionnement, les commissions et éviter les blocages.
          </p>
          
          <div className="mt-6 pt-4 border-t border-slate-600 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Consulter les règles</span>
            <ArrowRight size={18} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-2 transition-all"/>
          </div>
        </Link>

      </motion.div>

      {/* ========================================
          ÉTAT OPTIMAL - Tout va bien
          ======================================== */}
      {financialStats.platformDebt === 0 && activeOrderCount === 0 && (
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-8 rounded-2xl text-center shadow-elegant"
        >
          <div className="bg-green-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-green-500/40">
            <CheckCircle size={40} className="text-green-400"/>
          </div>
          <h3 className="text-2xl font-bold text-green-400 mb-3">Tout est en ordre ! 🎉</h3>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Aucune commande en cours et aucune dette. Profitez de cette accalmie pour vérifier vos produits et préparer votre stock.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link 
              to="../products" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              <Store size={18}/>
              Gérer mes produits
            </Link>
            <Link 
              to="../wallet" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition-all border border-slate-600"
            >
              <Eye size={18}/>
              Voir mes gains
            </Link>
          </div>
        </motion.div>
      )}

      {/* ========================================
          CONSEILS RAPIDES - Tips
          ======================================== */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30 shrink-0">
            <Zap className="text-purple-400" size={24}/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-400 mb-3">💡 Conseils du jour</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Mettez à jour régulièrement vos stocks pour éviter les ruptures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Traitez les commandes rapidement pour améliorer votre réputation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Régularisez vos dettes avant la fin de journée pour éviter le blocage</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SupplierDashboard;