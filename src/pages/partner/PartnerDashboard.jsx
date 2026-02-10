import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { 
  Copy, CheckCircle, Share2, TrendingUp, TrendingDown,
  DollarSign, Calendar, Star, ChevronRight, Loader2,
  Award, Target, Zap, Users, Gift, Eye, BarChart3,
  Clock, Sparkles, Trophy, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PartnerDashboard = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    topProducts: []
  });

  const WITHDRAWAL_THRESHOLDS = {
    'Standard': 2000,
    'Actif': 5000,
    'Premium': 10000
  };

  // ✅ Récupération des données partenaire en temps réel
  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const sessionData = JSON.parse(sessionStr);
    
    const unsubscribe = onSnapshot(doc(db, "partners", sessionData.id), (doc) => {
      if (!doc.exists()) return;
      
      const partnerData = { id: doc.id, ...doc.data() };
      setPartner(partnerData);
      
      // Charger les analytics dès qu'on a les données partenaire
      loadSalesAnalytics(doc.id);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadSalesAnalytics = async (partnerId) => {
    try {
      // ✅ Requête correcte : utiliser promo.partnerId
      const q = query(
        collection(db, "orders"), 
        where("promo.partnerId", "==", partnerId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      calculateStats(orders);
      generateChartData(orders);
    } catch (error) {
      console.error('Erreur analytics:', error);
    }
  };

  const calculateStats = (orders) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ✅ CORRECTION : Filtrer les commandes "Livré" et "Terminé" (selon ta base de données)
    const deliveredOrders = orders.filter(o => o.status === 'Livré' || o.status === 'Terminé');

    // ✅ Gains aujourd'hui
    const todayEarnings = deliveredOrders
      .filter(o => {
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt.seconds * 1000);
        return orderDate >= today;
      })
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    // ✅ Gains cette semaine
    const weekEarnings = deliveredOrders
      .filter(o => {
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt.seconds * 1000);
        return orderDate >= sevenDaysAgo;
      })
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    // ✅ Gains ce mois
    const monthEarnings = deliveredOrders
      .filter(o => {
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt.seconds * 1000);
        return orderDate >= thirtyDaysAgo;
      })
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    const totalOrders = orders.length;
    const successfulOrders = deliveredOrders.length;
    const conversionRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;

    const avgOrderValue = successfulOrders > 0
      ? deliveredOrders.reduce((sum, o) => sum + (o.details?.finalTotal || 0), 0) / successfulOrders
      : 0;

    // ✅ Top produits
    const productMap = {};
    deliveredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = { name: item.name, count: 0, revenue: 0 };
        }
        productMap[item.id].count += item.quantity;
        productMap[item.id].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      todayEarnings,
      weekEarnings,
      monthEarnings,
      conversionRate,
      avgOrderValue,
      topProducts
    });
  };

  const generateChartData = (orders) => {
    // ✅ Filtrer uniquement les commandes validées
    const deliveredOrders = orders.filter(o => o.status === 'Livré' || o.status === 'Terminé');
    
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        sales: 0,
        earnings: 0
      };
    });

    deliveredOrders.forEach(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt.seconds * 1000);
      orderDate.setHours(0, 0, 0, 0);
      const dateStr = orderDate.toISOString().split('T')[0];
      
      const dayData = last30Days.find(d => d.date === dateStr);
      if (dayData) {
        dayData.sales += 1;
        dayData.earnings += order.promo?.partnerCommission || 0;
      }
    });

    setSalesData(last30Days);
  };

  const copyToClipboard = () => {
    if (partner?.promoCode) {
      navigator.clipboard.writeText(partner.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLevelDetails = (sales = 0) => {
    if (sales >= 150) return { 
      name: 'Premium', 
      color: 'from-amber-400 to-yellow-600', 
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      next: 'Max', 
      nextTarget: 0, 
      currentTarget: 150,
      icon: Trophy
    };
    if (sales >= 30) return { 
      name: 'Actif', 
      color: 'from-gray-300 to-gray-500', 
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-400/10',
      borderColor: 'border-slate-400/30',
      next: 'Premium', 
      nextTarget: 150, 
      currentTarget: 30,
      icon: Award
    };
    return { 
      name: 'Standard', 
      color: 'from-amber-900 to-amber-700', 
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-700/10',
      borderColor: 'border-amber-700/30',
      next: 'Actif', 
      nextTarget: 30, 
      currentTarget: 0,
      icon: Star
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48}/>
          <p className="text-slate-400">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  const level = getLevelDetails(partner.totalSales);
  const progressPercent = level.name === 'Premium' ? 100 : ((partner.totalSales - level.currentTarget) / (level.nextTarget - level.currentTarget)) * 100;
  const salesRemaining = level.name === 'Premium' ? 0 : level.nextTarget - partner.totalSales;
  const earningsChange = stats.weekEarnings > 0 ? ((stats.todayEarnings / (stats.weekEarnings / 7)) - 1) * 100 : 0;
  const minWithdrawal = WITHDRAWAL_THRESHOLDS[partner.level] || 2000;

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
      
      {/* En-tête avec informations partenaire */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-2">
                Bonjour, {partner.fullName?.split(' ')[0] || 'Partenaire'} 👋
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Voici vos performances en temps réel
              </p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-3 ${level.bgColor} ${level.borderColor} border-2 px-4 py-3 rounded-2xl`}
            >
              <level.icon className={level.textColor} size={24} />
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Niveau</p>
                <p className={`text-lg font-bold ${level.textColor}`}>{level.name}</p>
              </div>
            </motion.div>
          </div>

          {/* Barre de progression (si pas Premium) */}
          {level.name !== 'Premium' && (
            <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="text-purple-400" size={20} />
                  <span className="text-slate-300 font-medium">
                    Progression vers <span className={`font-bold ${level.textColor}`}>{level.next}</span>
                  </span>
                </div>
                <span className="text-slate-400 text-sm">
                  {salesRemaining} ventes restantes
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>{partner.totalSales || 0} ventes</span>
                <span>{level.nextTarget} ventes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Solde disponible */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-green-600/20 to-green-700/20 border-2 border-green-500/30 rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-green-500/20 p-2.5 rounded-xl">
                <DollarSign className="text-green-400" size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${earningsChange > 0 ? 'text-green-400' : earningsChange < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {earningsChange > 0 ? <ArrowUp size={14} /> : earningsChange < 0 ? <ArrowDown size={14} /> : <Minus size={14} />}
                {Math.abs(earningsChange).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
              {partner.walletBalance?.toLocaleString() || 0} F
            </h3>
            <p className="text-xs font-bold text-green-300/70 uppercase tracking-wide">Solde disponible</p>
            <p className="text-[10px] text-green-400/60 mt-1">Min. retrait: {minWithdrawal.toLocaleString()}F</p>
          </div>
        </motion.div>

        {/* Gains totaux */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-500/20 p-2.5 rounded-xl">
              <TrendingUp className="text-purple-400" size={20} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
            {partner.totalEarnings?.toLocaleString() || 0} F
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gains totaux</p>
        </motion.div>

        {/* 30 derniers jours */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-500/20 p-2.5 rounded-xl">
              <Calendar className="text-blue-400" size={20} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
            {stats.monthEarnings?.toLocaleString() || 0} F
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">30 derniers jours</p>
        </motion.div>

        {/* Ventes validées */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-yellow-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-yellow-500/20 p-2.5 rounded-xl">
              <Star className="text-yellow-400" size={20} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
            {partner.totalSales || 0}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ventes validées</p>
        </motion.div>
      </div>

      {/* Graphique des performances */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2">
              <BarChart3 className="text-purple-400" size={24} />
              Évolution des performances
            </h2>
            <p className="text-slate-400 text-sm">30 derniers jours</p>
          </div>
        </div>

        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="day" 
                stroke="#64748B" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748B" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px'
                }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#earningsGradient)" 
                name="Gains (FCFA)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section statistiques clés + Top produits */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Statistiques clés */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            Statistiques clés
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Taux de conversion</span>
                <span className="text-green-400 font-bold text-lg">{stats.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                  style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Valeur panier moyen</span>
                <span className="text-purple-400 font-bold text-lg">{Math.round(stats.avgOrderValue).toLocaleString()} F</span>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Gains cette semaine</span>
                <span className="text-blue-400 font-bold text-lg">{stats.weekEarnings.toLocaleString()} F</span>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Gains aujourd'hui</span>
                <span className="text-pink-400 font-bold text-lg">{stats.todayEarnings.toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top produits recommandés */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            Top produits recommandés
          </h3>

          {stats.topProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div 
                  key={i}
                  className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-400' :
                      i === 2 ? 'bg-amber-700/20 text-amber-700' :
                      'bg-slate-700/20 text-slate-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-slate-500 text-xs">{product.count} ventes</p>
                    </div>
                  </div>
                  <span className="text-purple-400 font-bold text-sm">{product.revenue.toLocaleString()} F</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="text-slate-700 mx-auto mb-3" size={48} />
              <p className="text-slate-500 text-sm">Aucune vente pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Code promo */}
      <div className="bg-gradient-to-br from-purple-900/20 via-slate-900 to-pink-900/20 border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2 flex items-center justify-center lg:justify-start gap-2">
                <Sparkles className="text-purple-400" size={24} />
                Votre code promo unique
              </h3>
              <p className="text-slate-400 text-sm sm:text-base">
                Partagez ce code. Le client a une réduction, vous une commission.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              
              <div 
                onClick={copyToClipboard}
                className="relative flex items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-md border-2 border-dashed border-purple-500/50 rounded-2xl px-6 py-4 cursor-pointer hover:border-purple-400 hover:bg-slate-900/80 transition-all group"
              >
                <span className="font-mono text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wider select-all">
                  {partner.promoCode}
                </span>
                <div className="text-slate-400 group-hover:text-purple-400 transition">
                  {copied ? (
                    <CheckCircle className="text-green-400" size={24}/>
                  ) : (
                    <Copy size={24}/>
                  )}
                </div>
                
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
                  >
                    Copié ! ✓
                  </motion.div>
                )}
              </div>
              
              <a 
                href={`https://wa.me/?text=Salut ! Profite d'une réduction sur les meilleurs gâteaux de la ville avec mon code *${partner.promoCode}* sur Délices d'Afrique ! 🎂✨`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Share2 size={20} />
                <span>Partager</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Liens vers Sales et Wallet */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        <a href="/partner/sales">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl group-hover:bg-purple-500/30 transition-all">
                  <BarChart3 className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 mb-1">Historique des ventes</h4>
                  <p className="text-slate-500 text-sm">Détails de chaque transaction</p>
                </div>
              </div>
              <ChevronRight className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" size={24} />
            </div>
          </motion.div>
        </a>

        <a href="/partner/wallet">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-green-500/50 rounded-2xl p-6 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-xl group-hover:bg-green-500/30 transition-all">
                  <DollarSign className="text-green-400" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 mb-1">Gérer mon portefeuille</h4>
                  <p className="text-slate-500 text-sm">Retraits et historique</p>
                </div>
              </div>
              <ChevronRight className="text-slate-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" size={24} />
            </div>
          </motion.div>
        </a>
      </div>

    </div>
  );
};

export default PartnerDashboard;