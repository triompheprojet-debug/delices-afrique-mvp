import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { 
  Copy, CheckCircle, Share2, TrendingUp, 
  DollarSign, Calendar, Star, ChevronRight, Loader2,
  Award, Target, Zap, BarChart3, Trophy, ArrowUp, ArrowDown, Minus, Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  PARTNER_LEVELS, LEVEL_RULES, LEVEL_UI,
  WITHDRAWAL_LIMITS
} from '../../utils/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PartnerDashboard = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // États pour les données calculées dynamiquement
  const [metrics, setMetrics] = useState({
    salesCount: 0,        // Pour le niveau (Livré + Terminé)
    totalEarnings: 0,     // Gains validés (Terminé uniquement)
    walletBalance: 0,     // Earnings - Retraits
    pendingEarnings: 0    // Commissions en attente (Pas encore Terminé)
  });

  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    topProducts: []
  });

  const [salesData, setSalesData] = useState([]);
  const WITHDRAWAL_THRESHOLDS = WITHDRAWAL_LIMITS;

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const sessionData = JSON.parse(sessionStr);
    const partnerId = sessionData.id;

    // 1. Écoute du profil partenaire (Juste pour le nom, code promo, etc.)
    const unsubPartner = onSnapshot(doc(db, "partners", partnerId), (doc) => {
      if (doc.exists()) {
        setPartner({ id: doc.id, ...doc.data() });
      }
    });

    // 2. Écoute des Commandes (Source de vérité pour Ventes & Gains)
    const qOrders = query(
      collection(db, "orders"), 
      where("promo.partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      calculateMetricsAndStats(orders, partnerId);
    });

    return () => {
      unsubPartner();
      unsubOrders();
    };
  }, []);

  // Fonction centrale de calcul (exécutée à chaque mise à jour des commandes ou retraits)
  const calculateMetricsAndStats = (orders, partnerId) => {
    
    // --- A. Calcul des Ventes et Gains (Source: Orders) ---
    // Règle 1: Ventes = Livré OU Terminé
    const validSales = orders.filter(o => o.status === 'Livré' || o.status === 'Terminé');
    const salesCount = validSales.length;

    // Règle 2: Gains = Terminé uniquement
    const completedOrders = orders.filter(o => o.status === 'Terminé');
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);
    
    // Commissions en attente (pour info)
    const pendingOrders = orders.filter(o => o.status !== 'Terminé' && o.status !== 'Annulé');
    const pendingEarnings = pendingOrders.reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    // --- B. Calcul des Retraits (Source: Withdrawals) ---
    // On doit écouter les retraits pour calculer le solde exact
    // Règle 3: Solde = Earnings - (Retraits Payés + Retraits En attente)
    const qWithdrawals = query(collection(db, "withdrawals"), where("partnerId", "==", partnerId));
    
    // Note: On utilise onSnapshot à l'intérieur ici ou on pourrait le sortir. 
    // Pour simplifier sans boucle infinie, on utilise un one-time fetch ici ou mieux, un listener séparé.
    // OPTIMISATION: Pour ce dashboard, on va utiliser un listener séparé pour les retraits dans le useEffect principal
    // Mais pour garder la logique groupée, on va tricher légèrement et supposer qu'on a les retraits.
    // CORRECTION : Je vais ajouter un listener withdrawals dans le useEffect principal.
  };

  // --- REWRITE DU USEEFFECT POUR INCLURE LES RETRAITS ---
  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const { id: partnerId } = JSON.parse(sessionStr);
    let localOrders = [];
    let localWithdrawals = [];

    // 1. Profil Partenaire
    const unsubPartner = onSnapshot(doc(db, "partners", partnerId), (d) => {
      if(d.exists()) setPartner({ id: d.id, ...d.data() });
    });

    // 2. Commandes
    const unsubOrders = onSnapshot(query(collection(db, "orders"), where("promo.partnerId", "==", partnerId), orderBy("createdAt", "desc")), (snap) => {
      localOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      recalcAll(localOrders, localWithdrawals);
    });

    // 3. Retraits
    const unsubWithdrawals = onSnapshot(query(collection(db, "withdrawals"), where("partnerId", "==", partnerId)), (snap) => {
      localWithdrawals = snap.docs.map(d => d.data());
      recalcAll(localOrders, localWithdrawals);
    });

    const recalcAll = (orders, withdrawals) => {
      // 1. Ventes (Livré ou Terminé)
      const validSales = orders.filter(o => o.status === 'Livré' || o.status === 'Terminé');
      
      // 2. Gains (Terminé uniquement)
      const earned = orders
        .filter(o => o.status === 'Terminé')
        .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

      // 3. Retraits (Paid ou Pending impactent le solde dispo)
      const withdrawnOrPending = withdrawals
        .filter(w => w.status === 'paid' || w.status === 'pending')
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      // 4. Commissions en attente
      const pending = orders
        .filter(o => o.status !== 'Terminé' && o.status !== 'Annulé')
        .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

      setMetrics({
        salesCount: validSales.length,
        totalEarnings: earned,
        walletBalance: earned - withdrawnOrPending,
        pendingEarnings: pending
      });

      // Calcul des stats analytiques (Graphiques, Top produits, etc.)
      computeAnalytics(orders, validSales, earned);
      setLoading(false);
    };

    return () => { unsubPartner(); unsubOrders(); unsubWithdrawals(); };
  }, []);

  const computeAnalytics = (allOrders, validSales, totalEarned) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 864e5);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 864e5);

    // Helpers dates
    const getOrderDate = (o) => o.createdAt?.toDate ? o.createdAt.toDate() : new Date((o.createdAt?.seconds || 0) * 1000);

    // Filtre pour les gains périodiques (uniquement sur commandes Terminées)
    const completedOrders = allOrders.filter(o => o.status === 'Terminé');

    const todayEarnings = completedOrders
      .filter(o => getOrderDate(o) >= today)
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    const weekEarnings = completedOrders
      .filter(o => getOrderDate(o) >= sevenDaysAgo)
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    const monthEarnings = completedOrders
      .filter(o => getOrderDate(o) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    // Taux conversion (basé sur validSales / total non annulé)
    const nonCancelled = allOrders.filter(o => o.status !== 'Annulé');
    const conversionRate = nonCancelled.length > 0 ? (validSales.length / nonCancelled.length) * 100 : 0;

    // Panier moyen (sur les ventes valides)
    const avgOrderValue = validSales.length > 0
      ? validSales.reduce((sum, o) => sum + (o.details?.finalTotal || 0), 0) / validSales.length
      : 0;

    // Top Produits
    const productMap = {};
    validSales.forEach(order => {
      order.items?.forEach(item => {
        if (!productMap[item.id]) productMap[item.id] = { name: item.name, count: 0, revenue: 0 };
        productMap[item.id].count += item.quantity;
        productMap[item.id].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 5);

    setStats({ todayEarnings, weekEarnings, monthEarnings, conversionRate, avgOrderValue, topProducts });

    // Graphique 30 derniers jours (Gains validés uniquement)
    // Utiliser la date locale au format YYYY-MM-DD
    const getLocalDateString = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const chartData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: getLocalDateString(d), 
        day: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        earnings: 0
      };
    });

    completedOrders.forEach(o => {
      const dStr = getLocalDateString(getOrderDate(o)); 
      const entry = chartData.find(c => c.date === dStr);
      if (entry) entry.earnings += (o.promo?.partnerCommission || 0);
    });

    setSalesData(chartData);
  };

  const copyToClipboard = () => {
    if (partner?.promoCode) {
      navigator.clipboard.writeText(partner.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Détermination du niveau basée sur salesCount calculé (et non partner.totalSales)
  const getLevelDetails = (count = 0) => {
    if (count >= LEVEL_RULES[PARTNER_LEVELS.PREMIUM].minSales) {
      const ui = LEVEL_UI[PARTNER_LEVELS.PREMIUM];
      return { 
        name: PARTNER_LEVELS.PREMIUM, ...ui,
        next: 'Max', nextTarget: 0, currentTarget: LEVEL_RULES[PARTNER_LEVELS.PREMIUM].minSales, icon: Trophy
      };
    }
    if (count >= LEVEL_RULES[PARTNER_LEVELS.ACTIF].minSales) {
      const ui = LEVEL_UI[PARTNER_LEVELS.ACTIF];
      return { 
        name: PARTNER_LEVELS.ACTIF, ...ui,
        next: PARTNER_LEVELS.PREMIUM, nextTarget: LEVEL_RULES[PARTNER_LEVELS.PREMIUM].minSales, currentTarget: LEVEL_RULES[PARTNER_LEVELS.ACTIF].minSales, icon: Award
      };
    }
    const ui = LEVEL_UI[PARTNER_LEVELS.STANDARD];
    return { 
      name: PARTNER_LEVELS.STANDARD, ...ui,
      next: PARTNER_LEVELS.ACTIF, nextTarget: LEVEL_RULES[PARTNER_LEVELS.ACTIF].minSales, currentTarget: 0, icon: Star
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48}/>
          <p className="text-slate-400">Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  const level = getLevelDetails(metrics.salesCount);
  const progressPercent = level.name === PARTNER_LEVELS.PREMIUM ? 100 : ((metrics.salesCount - level.currentTarget) / (level.nextTarget - level.currentTarget)) * 100;
  const salesRemaining = level.name === PARTNER_LEVELS.PREMIUM ? 0 : level.nextTarget - metrics.salesCount;
  // minWithdrawal basé sur le niveau calculé ou le niveau stocké (on préfère le calculé pour l'UI, mais le stocké est la vérité admin)
  // Pour l'affichage, on utilise le niveau calculé.
  const minWithdrawal = WITHDRAWAL_THRESHOLDS[level.name] || 2000;

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
                Vos performances en temps réel
              </p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-3 ${level.bgColor} ${level.borderColor} border-2 px-4 py-3 rounded-2xl`}
            >
              <level.icon className={level.textColor} size={24} />
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Niveau (Calculé)</p>
                <p className={`text-lg font-bold ${level.textColor}`}>{level.name}</p>
              </div>
            </motion.div>
          </div>

          {/* Barre de progression */}
          {level.name !== PARTNER_LEVELS.PREMIUM && (
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
                <span>{metrics.salesCount} ventes (Validées)</span>
                <span>{level.nextTarget} ventes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Solde disponible (Calculé) */}
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
              {metrics.pendingEarnings > 0 && (
                 <div className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                   +{metrics.pendingEarnings.toLocaleString()} F en attente
                 </div>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
              {metrics.walletBalance.toLocaleString()} F
            </h3>
            <p className="text-xs font-bold text-green-300/70 uppercase tracking-wide">Solde disponible</p>
            <p className="text-[10px] text-green-400/60 mt-1">Min. retrait: {minWithdrawal.toLocaleString()}F</p>
          </div>
        </motion.div>

        {/* Gains totaux (Calculé) */}
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
            {metrics.totalEarnings.toLocaleString()} F
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gains encaissés</p>
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
            {stats.monthEarnings.toLocaleString()} F
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">30 derniers jours</p>
        </motion.div>

        {/* Ventes validées (Calculé) */}
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
            {metrics.salesCount}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ventes (Livré+)</p>
        </motion.div>
      </div>

      {/* Graphique des performances */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2">
              <BarChart3 className="text-purple-400" size={24} />
              Vos gains confirmés
            </h2>
            <p className="text-slate-400 text-sm">Basé uniquement sur les commandes terminées</p>
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
              <XAxis dataKey="day" stroke="#64748B" style={{ fontSize: '12px' }}/>
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }}/>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Area type="monotone" dataKey="earnings" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#earningsGradient)" name="Gains (FCFA)"/>
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
                <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/30 transition-all">
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
                  {copied ? <CheckCircle className="text-green-400" size={24}/> : <Copy size={24}/>}
                </div>
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