import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Wallet, DollarSign, TrendingUp, Clock, CheckCircle,
  AlertCircle, Download, Eye, EyeOff, Smartphone, 
  Calendar, Gift, Trophy, Sparkles, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PARTNER_LEVELS, WITHDRAWAL_LIMITS, MOBILE_OPERATORS,
  ORDER_STATUS, WITHDRAWAL_STATUS
} from '../../utils/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PartnerWallet = () => {
  const [partner, setPartner] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    recipientName: '',
    phone: '',
    operator: MOBILE_OPERATORS[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Stats calculées dynamiquement
  const [stats, setStats] = useState({
    availableBalance: 0,    // Calculé: Earnings - (Paid + Pending Withdrawals)
    totalEarned: 0,         // Calculé: Somme des commissions "Terminé"
    totalWithdrawn: 0,      // Calculé: Somme des retraits "paid"
    pendingWithdrawals: 0,  // Calculé: Somme des retraits "pending"
    projectedMonthly: 0,
    last7DaysEarnings: []
  });

  const WITHDRAWAL_THRESHOLDS = WITHDRAWAL_LIMITS;

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const sessionData = JSON.parse(sessionStr);
    const partnerId = sessionData.id;

    let localOrders = [];
    let localWithdrawals = [];

    // 1. Écoute Profil Partenaire (pour le nom et le niveau)
    const unsubPartner = onSnapshot(doc(db, "partners", partnerId), (d) => {
      if(d.exists()) setPartner({ id: d.id, ...d.data() });
    });

    // 2. Écoute Commandes (Source de vérité des Gains)
    const qOrders = query(
      collection(db, "orders"), 
      where("promo.partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      localOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      recalculateWallet(localOrders, localWithdrawals);
    });

    // 3. Écoute Retraits (Source de vérité des Dépenses)
    const qWithdrawals = query(
      collection(db, "withdrawals"),
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
      localWithdrawals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWithdrawals(localWithdrawals); // Mise à jour de la liste UI
      recalculateWallet(localOrders, localWithdrawals);
    });

    return () => {
      unsubPartner();
      unsubOrders();
      unsubWithdrawals();
    };
  }, []);

  // --- COEUR DU SYSTÈME : CALCUL DYNAMIQUE ---
  const recalculateWallet = (orders, withdrawalsList) => {
    
    // A. Calcul des Gains (Règle : Uniquement statut "Terminé")
    const completedOrders = orders.filter(o => o.status === 'Terminé');
    const totalEarned = completedOrders.reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);

    // B. Calcul des Retraits
    // Ce qui a été payé réellement
    const totalPaidWithdrawn = withdrawalsList
      .filter(w => w.status === WITHDRAWAL_STATUS.PAID)
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    
    // Ce qui est bloqué (en attente)
    const totalPendingWithdrawn = withdrawalsList
      .filter(w => w.status === WITHDRAWAL_STATUS.PENDING)
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    // C. Calcul du Solde Disponible
    // Solde = Gains Totaux - (Déjà payé + En attente de paiement)
    const availableBalance = totalEarned - (totalPaidWithdrawn + totalPendingWithdrawn);

    // D. Analytics (Graphiques & Projections)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Projection mensuelle (basée sur les 30 derniers jours de gains validés)
    const last30Earnings = completedOrders
      .filter(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date((o.createdAt?.seconds || 0) * 1000);
        return d >= thirtyDaysAgo;
      })
      .reduce((sum, o) => sum + (o.promo?.partnerCommission || 0), 0);
    
    // Graphique 7 derniers jours
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        earnings: 0
      };
    });

    completedOrders.forEach(order => {
      const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date((order.createdAt?.seconds || 0) * 1000);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = last7Days.find(d => d.date === dateStr);
      if (dayData) {
        dayData.earnings += order.promo?.partnerCommission || 0;
      }
    });

    setStats({
      availableBalance,
      totalEarned,
      totalWithdrawn: totalPaidWithdrawn,
      pendingWithdrawals: totalPendingWithdrawn,
      projectedMonthly: Math.round(last30Earnings),
      last7DaysEarnings: last7Days
    });
    
    setLoading(false);
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    
    const amount = Number(withdrawForm.amount);
    // On utilise le niveau affiché dans le partner doc, ou par défaut standard
    const currentLevel = partner?.level || PARTNER_LEVELS.STANDARD;
    const minWithdrawal = WITHDRAWAL_THRESHOLDS[currentLevel] || 2000;
    
    // Validation avec le solde CALCULÉ (stats.availableBalance)
    if (amount < minWithdrawal) {
      setWithdrawError(`Le montant minimum pour le niveau ${currentLevel} est de ${minWithdrawal.toLocaleString()} FCFA`);
      return;
    }
    
    if (amount > stats.availableBalance) {
      setWithdrawError('Solde insuffisant (vérifiez vos retraits en attente)');
      return;
    }
    
    if (!withdrawForm.recipientName || !withdrawForm.phone) {
      setWithdrawError('Veuillez remplir tous les champs');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addDoc(collection(db, "withdrawals"), {
        partnerId: partner.id,
        partnerName: partner.fullName,
        recipientName: withdrawForm.recipientName,
        phone: withdrawForm.phone,
        operator: withdrawForm.operator,
        amount: amount,
        status: WITHDRAWAL_STATUS.PENDING,
        transactionRef: null,
        createdAt: serverTimestamp(),
        processedAt: null
      });
      
      // Pas besoin de recharger manuellement, le listener withdrawals va mettre à jour le solde automatiquement
      alert('✅ Demande de retrait envoyée !');
      setShowWithdrawModal(false);
      setWithdrawForm({
        amount: '',
        recipientName: '',
        phone: '',
        operator: MOBILE_OPERATORS[0]
      });
      
    } catch (error) {
      console.error('Erreur retrait:', error);
      setWithdrawError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Calcul du solde en cours...</p>
        </div>
      </div>
    );
  }

  const minWithdrawal = WITHDRAWAL_THRESHOLDS[partner?.level] || WITHDRAWAL_LIMITS[PARTNER_LEVELS.STANDARD];

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
      
      {/* Hero Card Portefeuille */}
      <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-3xl p-8 sm:p-10 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <Wallet className="text-white" size={28} />
              </div>
              <div>
                <p className="text-purple-200 text-sm font-medium">Portefeuille</p>
                <p className="text-white font-bold text-lg">{partner?.fullName}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-xl transition-all"
            >
              {showBalance ? <Eye className="text-white" size={20} /> : <EyeOff className="text-white" size={20} />}
            </button>
          </div>

          <div className="mb-8">
            <p className="text-purple-200 text-sm mb-2">Solde disponible</p>
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-4">
              {showBalance ? `${stats.availableBalance.toLocaleString()} F` : '••••••'}
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                <p className="text-purple-100 text-xs mb-0.5">Gains totaux</p>
                <p className="text-white font-bold">{stats.totalEarned.toLocaleString()} F</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                <p className="text-purple-100 text-xs mb-0.5">Déjà retiré</p>
                <p className="text-white font-bold">{stats.totalWithdrawn.toLocaleString()} F</p>
              </div>
              <div className="bg-yellow-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-yellow-400/30">
                <p className="text-yellow-100 text-xs mb-0.5">Min. retrait ({partner?.level})</p>
                <p className="text-yellow-300 font-bold">{minWithdrawal.toLocaleString()} F</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowWithdrawModal(true)}
            disabled={stats.availableBalance < minWithdrawal}
            className="w-full bg-white hover:bg-purple-50 text-purple-900 font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download size={20} />
            {stats.availableBalance < minWithdrawal 
              ? `Minimum ${minWithdrawal.toLocaleString()} F requis` 
              : 'Demander un retrait'
            }
          </button>
          
          {stats.pendingWithdrawals > 0 && (
            <div className="mt-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <Clock className="text-yellow-400" size={18} />
              <p className="text-yellow-100 text-sm font-medium">
                {stats.pendingWithdrawals.toLocaleString()} F en attente de traitement
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics & Projections */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Graphique 7 jours (Gains validés) */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-400" size={20} />
            Évolution des gains (validés)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.last7DaysEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#64748B" style={{ fontSize: '12px' }}/>
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Bar dataKey="earnings" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projection & Objectifs */}
        <div className="space-y-4">
          
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border-2 border-green-500/30 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Target className="text-green-400" size={24} />
              </div>
              <div className="text-right">
                <p className="text-green-400 text-xs font-bold uppercase mb-1">Projection mensuelle</p>
                <h4 className="text-3xl font-black text-green-400">
                  {stats.projectedMonthly.toLocaleString()} F
                </h4>
              </div>
            </div>
            <p className="text-green-300/80 text-sm">
              Basé sur vos performances des 30 derniers jours
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Objectifs suggérés</h4>
            <div className="space-y-3">
              {[
                { label: '10K ce mois', target: 10000, icon: Gift },
                { label: '50K en 3 mois', target: 50000, icon: Trophy },
                { label: '100K en 6 mois', target: 100000, icon: Sparkles }
              ].map((goal, i) => {
                const progress = (stats.totalEarned / goal.target) * 100;
                return (
                  <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <goal.icon className="text-purple-400" size={16} />
                        <span className="text-slate-300 text-sm font-medium">{goal.label}</span>
                      </div>
                      <span className="text-slate-400 text-xs">{Math.min(progress, 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Historique retraits */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Calendar className="text-blue-400" size={20} />
          Historique des retraits
        </h3>

        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="text-slate-600" size={28} />
            </div>
            <p className="text-slate-400 text-sm">Aucun retrait effectué pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div 
                key={withdrawal.id}
                className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    withdrawal.status === WITHDRAWAL_STATUS.PAID 
                      ? 'bg-green-500/20' 
                      : 'bg-yellow-500/20'
                  }`}>
                    {withdrawal.status === WITHDRAWAL_STATUS.PAID ? (
                      <CheckCircle className="text-green-400" size={20} />
                    ) : (
                      <Clock className="text-yellow-400" size={20} />
                    )}
                  </div>
                  
                  <div>
                    <p className="text-slate-200 font-medium text-sm mb-1">
                      {withdrawal.amount.toLocaleString()} FCFA
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatDate(withdrawal.createdAt)} · {withdrawal.operator}
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  withdrawal.status === WITHDRAWAL_STATUS.PAID
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {withdrawal.status === WITHDRAWAL_STATUS.PAID ? 'Payé' : 'En attente'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Retrait */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">
                    Demander un retrait
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Recevez votre argent sous 24-48h via Mobile Money
                  </p>
                </div>
                <button 
                  onClick={() => !submitting && setShowWithdrawModal(false)}
                  disabled={submitting}
                  className="text-slate-400 hover:text-slate-200 transition-all disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mb-6">
                <p className="text-purple-400 text-xs font-bold uppercase mb-1">Solde disponible</p>
                <p className="text-3xl font-black text-purple-400">{stats.availableBalance.toLocaleString()} F</p>
                <p className="text-purple-300/70 text-xs mt-2">
                  Minimum {partner?.level} : {minWithdrawal.toLocaleString()} FCFA
                </p>
              </div>

              <form onSubmit={handleWithdrawRequest} className="space-y-4">
                
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase mb-2 block">
                    Montant à retirer
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="number"
                      required
                      min={minWithdrawal}
                      max={stats.availableBalance}
                      placeholder={`Ex: ${minWithdrawal}`}
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Minimum: {minWithdrawal.toLocaleString()} FCFA</p>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase mb-2 block">
                    Nom du bénéficiaire
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Nom complet"
                    value={withdrawForm.recipientName}
                    onChange={(e) => setWithdrawForm({...withdrawForm, recipientName: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase mb-2 block">
                    Numéro Mobile Money
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="tel"
                      required
                      placeholder="06 123 4567"
                      value={withdrawForm.phone}
                      onChange={(e) => setWithdrawForm({...withdrawForm, phone: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase mb-2 block">
                    Opérateur
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {MOBILE_OPERATORS.map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setWithdrawForm({...withdrawForm, operator: op})}
                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                          withdrawForm.operator === op
                            ? 'bg-purple-600 text-white border-2 border-purple-500'
                            : 'bg-slate-950/50 text-slate-400 border-2 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {withdrawError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {withdrawError}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Confirmer le retrait
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
                <p className="text-blue-300 text-xs">
                  <strong>Important :</strong> Vérifiez bien votre numéro. Les transferts sont irréversibles.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerWallet;