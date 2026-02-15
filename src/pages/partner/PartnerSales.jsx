import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, Calendar,
  Search, TrendingUp, Eye, Package, Truck, DollarSign,
  Filter, Download, BarChart3, Target, Award,
  ChevronDown, ChevronUp, Gift, Sparkles, Tag,
  X, User, CreditCard, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ORDER_STATUS, PROMO_STATUS, DELIVERY_METHODS, SALES_FILTERS } from '../../utils/constants';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (ts) => {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  } catch { return '—'; }
};

const formatDateShort = (ts) => {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch { return '—'; }
};

const formatTime = (ts) => {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(d);
  } catch { return ''; }
};

// ─── RÈGLE MÉTIER : couleur de la commission selon statut de la commande ────
// • Gris  → commande pas encore "Terminé" ni "Annulé"
// • Vert  → commande "Terminé" (promo.status === PROMO_STATUS.VALIDATED → walletBalance crédité)
// • Rouge → commande "Annulé"
const getCommStyle = (sale) => {
  if (sale.status === ORDER_STATUS.CANCELLED) {
    return {
      text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
      badge: 'bg-red-500/15 border-red-500/30 text-red-400',
      dot: 'bg-red-400', label: 'Annulé', icon: XCircle, paid: false
    };
  }
  if (sale.status === ORDER_STATUS.COMPLETED || sale.promo?.status === PROMO_STATUS.VALIDATED) {
    return {
      text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400', label: 'Payé ✓', icon: CheckCircle, paid: true
    };
  }
  return {
    text: 'text-slate-400', bg: 'bg-slate-700/20', border: 'border-slate-700/30',
    badge: 'bg-slate-700/30 border-slate-600/30 text-slate-400',
    dot: 'bg-slate-500', label: sale.status || 'En attente', icon: Clock, paid: false
  };
};

// ─── Modal Détails ───────────────────────────────────────────────────────────
const SaleDetailModal = ({ sale, onClose }) => {
  if (!sale) return null;
  const cs = getCommStyle(sale);
  const Icon = cs.icon;
  const commission = sale.promo?.partnerCommission || 0;
  const discount = sale.details?.discount || sale.promo?.discountAmount || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-5 border-b border-slate-800">
            <div>
              <p className="font-mono text-xs text-slate-500 mb-1">{sale.code}</p>
              <h3 className="text-xl font-bold text-slate-100">Détails de la vente</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cs.badge}`}>
                <Icon size={11}/>{cs.label}
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-slate-300"/>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[72vh] divide-y divide-slate-800/50">

            {/* Infos générales */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informations</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Calendar, label: 'Date', val: formatDateShort(sale.createdAt) },
                  { icon: User, label: 'Client', val: sale.customer?.name || '—' },
                  {
                    icon: sale.details?.method === DELIVERY_METHODS.DELIVERY ? Truck : Package,
                    label: 'Réception', val: sale.details?.method || '—'
                  },
                  { icon: CreditCard, label: 'Paiement', val: sale.details?.paymentMethod || '—' }
                ].map(({ icon: Ic, label, val }) => (
                  <div key={label} className="bg-slate-800/40 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Ic size={11}/>{label}</p>
                    <p className="text-sm font-semibold text-slate-200 truncate">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Articles */}
            <div className="px-6 py-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag size={11}/> Articles ({sale.items?.length || 0})
              </p>
              <div className="space-y-2">
                {sale.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-800/30 rounded-xl p-3">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"/>
                      : <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-slate-500"/>
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        <span className="text-purple-400 font-bold">{item.quantity}×</span> {item.price?.toLocaleString()} F
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-100 flex-shrink-0">
                      {((item.price || 0) * item.quantity).toLocaleString()} F
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Récap financier */}
            <div className="px-6 py-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <DollarSign size={11}/> Récapitulatif financier
              </p>
              <div className="bg-slate-800/30 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Prix de la commande</span>
                  <span className="font-semibold text-slate-200">{sale.details?.subTotal?.toLocaleString() || 0} F</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1"><Gift size={11}/>Réduction client</span>
                    <span className="font-semibold text-amber-400">-{discount.toLocaleString()} F</span>
                  </div>
                )}
                {sale.details?.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1"><Truck size={11}/>Livraison</span>
                    <span className="font-semibold text-slate-300">+{sale.details.deliveryFee.toLocaleString()} F</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Total payé</span>
                  <span className="font-bold text-slate-100">{sale.details?.finalTotal?.toLocaleString() || 0} F</span>
                </div>

                {/* Commission — couleur contextuelle (règle métier) */}
                <div className={`flex justify-between items-center pt-3 mt-1 border-t-2 border-dashed ${
                  sale.status === ORDER_STATUS.CANCELLED ? 'border-red-500/30'
                  : cs.paid ? 'border-emerald-500/30' : 'border-slate-700/40'
                }`}>
                  <span className={`font-bold text-sm flex items-center gap-1.5 ${cs.text}`}>
                    <Award size={14}/>Ma commission
                  </span>
                  <span className={`text-2xl font-black ${cs.text}`}>
                    {commission.toLocaleString()}<span className="text-sm font-normal ml-1">F</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Message statut */}
            <div className="px-6 py-4 pb-7">
              <div className={`${cs.bg} border ${cs.border} rounded-xl p-4 flex items-start gap-3`}>
                <Icon size={15} className={`${cs.text} flex-shrink-0 mt-0.5`}/>
                <div>
                  <p className={`text-sm font-bold ${cs.text} mb-1`}>
                    {sale.status === ORDER_STATUS.CANCELLED
                      ? 'Commande annulée'
                      : cs.paid ? 'Commission confirmée et créditée'
                      : `Statut actuel : ${sale.status || 'En attente'}`
                    }
                  </p>
                  <p className="text-xs text-slate-500">
                    {sale.status === ORDER_STATUS.CANCELLED
                      ? 'Aucune commission ne sera versée pour cette commande.'
                      : cs.paid
                        ? `Créditée le ${sale.promo?.paidAt ? formatDateShort(sale.promo.paidAt) : '—'}. Visible dans votre portefeuille.`
                        : 'Votre commission sera créditée automatiquement dès que la commande sera marquée "Terminé" par l\'admin.'
                    }
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Ligne de la liste ───────────────────────────────────────────────────────
const SaleRow = ({ sale, onDetails }) => {
  const cs = getCommStyle(sale);
  const Icon = cs.icon;
  const commission = sale.promo?.partnerCommission || 0;
  const discount = sale.details?.discount || sale.promo?.discountAmount || 0;
  const salePrice = sale.details?.subTotal || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all duration-150 overflow-hidden"
    >
      {/* ── Ligne principale ── */}
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Barre couleur commission */}
        <div className={`w-[3px] h-11 rounded-full flex-shrink-0 ${cs.dot}`}></div>

        {/* Date — desktop */}
        <div className="hidden sm:flex flex-col w-28 flex-shrink-0">
          <span className="text-xs font-medium text-slate-300">{formatDateShort(sale.createdAt)}</span>
          <span className="text-xs text-slate-600 mt-0.5">{formatTime(sale.createdAt)}</span>
        </div>

        {/* Code + badge + date mobile */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-sm font-bold text-slate-100 tracking-wide">{sale.code || '—'}</span>
            <span className="sm:hidden text-xs text-slate-600">{formatDateShort(sale.createdAt)}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cs.badge}`}>
            <Icon size={10}/>{cs.label}
          </span>
        </div>

        {/* Prix commande — desktop */}
        <div className="hidden md:flex flex-col items-end w-24 flex-shrink-0">
          <span className="text-xs text-slate-500 mb-0.5">Commande</span>
          <span className="text-sm font-bold text-slate-200">{salePrice.toLocaleString()} F</span>
        </div>

        {/* Réduction — large desktop */}
        <div className="hidden lg:flex flex-col items-end w-20 flex-shrink-0">
          <span className="text-xs text-slate-500 mb-0.5">Réduction</span>
          <span className="text-sm font-medium text-amber-400">
            {discount > 0 ? `-${discount.toLocaleString()} F` : '—'}
          </span>
        </div>

        {/* Commission — avec couleur (pièce maîtresse) */}
        <div className={`flex flex-col items-end w-24 flex-shrink-0 ${cs.bg} rounded-xl px-3 py-2 border ${cs.border}`}>
          <span className="text-xs text-slate-500 mb-0.5">Commission</span>
          <span className={`text-sm font-black ${cs.text}`}>
            {commission > 0 ? `${commission.toLocaleString()} F` : '—'}
          </span>
        </div>

        {/* Bouton Détails */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => onDetails(sale)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-purple-500"
        >
          <Eye size={13}/>
          <span className="hidden sm:inline">Détails</span>
        </motion.button>
      </div>

      {/* ── Ligne mobile complémentaire (prix + réduction) ── */}
      <div className="md:hidden flex items-center gap-4 px-5 pb-3 border-t border-slate-800/40 pt-2">
        <span className="text-xs text-slate-500">
          Commande : <span className="font-bold text-slate-300">{salePrice.toLocaleString()} F</span>
        </span>
        {discount > 0 && (
          <span className="text-xs text-slate-500">
            Réduction : <span className="font-medium text-amber-400">-{discount.toLocaleString()} F</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ─── Composant principal ─────────────────────────────────────────────────────
const PartnerSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(SALES_FILTERS.STATUS.ALL);
  const [dateRange, setDateRange] = useState(SALES_FILTERS.DATE.ALL);
  const [sortBy, setSortBy] = useState(SALES_FILTERS.SORT.RECENT);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [stats, setStats] = useState({
    total: 0, validated: 0, pending: 0, cancelled: 0,
    totalCommission: 0, pendingCommission: 0,
    todayCount: 0, weekCount: 0, monthCount: 0, conversionRate: 0
  });

  // ── Firebase temps réel ──────────────────────────────────────────────────
  // onSnapshot réagit automatiquement à tout changement Firebase :
  // quand l'admin passe une commande à "Terminé" (dans Orders.jsx),
  // promo.status passe à "validated" et le walletBalance est incrémenté.
  // → PartnerSales se met à jour immédiatement (commission passe au vert)
  // → PartnerWallet se met à jour via son propre onSnapshot sur le doc partenaire
  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const { id: partnerId } = JSON.parse(sessionStr);

    const q = query(
      collection(db, 'orders'),
      where('promo.partnerId', '==', partnerId),
      orderBy('createdAt', 'desc')
    );


    const computeStats = (data) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // ✅ FIX BUG-13 : Gérer createdAt null/undefined pour éviter Invalid Date
      const getD = (s) => {
        if (!s.createdAt) return new Date(0); // Date epoch si null
        return s.createdAt.toDate ? s.createdAt.toDate() : new Date((s.createdAt.seconds || 0) * 1000);
      };

      // ✅ FIX BUG-6 : Éviter le double comptage - prioriser status 'Annulé'
      // Logique : Une commande annulée reste annulée même si promo.status = 'validated'
      const cancelled = data.filter(s => s.status === ORDER_STATUS.CANCELLED).length;
      const validated = data.filter(s => 
        s.status !== ORDER_STATUS.CANCELLED && // ✅ Exclure les annulées du comptage validé
        (s.status === ORDER_STATUS.COMPLETED || s.promo?.status === PROMO_STATUS.VALIDATED)
      ).length;
      const pending = data.length - validated - cancelled;

      const totalCommission = data
        .filter(s => s.status !== ORDER_STATUS.CANCELLED && (s.status === ORDER_STATUS.COMPLETED || s.promo?.status === PROMO_STATUS.VALIDATED))
        .reduce((sum, s) => sum + (s.promo?.partnerCommission || 0), 0);

      const pendingCommission = data
        .filter(s => s.status !== ORDER_STATUS.CANCELLED && s.status !== ORDER_STATUS.COMPLETED && s.promo?.status !== PROMO_STATUS.VALIDATED)
        .reduce((sum, s) => sum + (s.promo?.partnerCommission || 0), 0);

      setStats({
        total: data.length, validated, pending, cancelled,
        totalCommission, pendingCommission,
        todayCount: data.filter(s => getD(s) >= today).length,
        weekCount: data.filter(s => getD(s) >= new Date(today.getTime() - 7 * 864e5)).length,
        monthCount: data.filter(s => getD(s) >= new Date(today.getTime() - 30 * 864e5)).length,
        conversionRate: data.length > 0 ? ((validated / data.length) * 100).toFixed(1) : 0
      });
    };

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSales(data);
      computeStats(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredSales = (() => {
    let list = [...sales];

    if (statusFilter === SALES_FILTERS.STATUS.VALIDATED)
      list = list.filter(s => s.status === ORDER_STATUS.COMPLETED || s.promo?.status === PROMO_STATUS.VALIDATED);
    else if (statusFilter === SALES_FILTERS.STATUS.PENDING)
      list = list.filter(s => s.status !== ORDER_STATUS.CANCELLED && s.status !== ORDER_STATUS.COMPLETED && s.promo?.status !== PROMO_STATUS.VALIDATED);
    else if (statusFilter === SALES_FILTERS.STATUS.CANCELLED)
      list = list.filter(s => s.status === ORDER_STATUS.CANCELLED);

    if (dateRange !== SALES_FILTERS.DATE.ALL) {
      const today = new Date(); today.setHours(0,0,0,0);
      list = list.filter(s => {
        const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt?.seconds * 1000);
        if (dateRange === SALES_FILTERS.DATE.TODAY) return d >= today;
        if (dateRange === SALES_FILTERS.DATE.WEEK) return d >= new Date(today.getTime() - 7 * 864e5);
        if (dateRange === SALES_FILTERS.DATE.MONTH) return d >= new Date(today.getTime() - 30 * 864e5);
        return true;
      });
    }

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.code?.toLowerCase().includes(t) ||
        s.customer?.name?.toLowerCase().includes(t)
      );
    }

    if (sortBy === SALES_FILTERS.SORT.AMOUNT) list.sort((a, b) => (b.details?.subTotal || 0) - (a.details?.subTotal || 0));
    else if (sortBy === SALES_FILTERS.SORT.COMMISSION) list.sort((a, b) => (b.promo?.partnerCommission || 0) - (a.promo?.partnerCommission || 0));

    return list;
  })();

  const exportCSV = () => {
    const headers = ['Code', 'Date', 'Client', 'Prix commande', 'Réduction client', 'Ma commission', 'Statut'];
    const rows = filteredSales.map(s => [
      s.code,
      formatDate(s.createdAt),
      s.customer?.name || '',
      s.details?.subTotal || 0,
      s.details?.discount || s.promo?.discountAmount || 0,
      s.promo?.partnerCommission || 0,
      s.status === ORDER_STATUS.CANCELLED ? 'Annulé'
        : (s.status === ORDER_STATUS.COMPLETED || s.promo?.status === PROMO_STATUS.VALIDATED) ? 'Payé' : 'En attente'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `ventes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm animate-pulse">Chargement de vos ventes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 pb-28 space-y-6">

      {/* ══════════════════════════════════════════
          HEADER + STATS
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-7">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-pink-600/8 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="bg-purple-500/20 p-2 rounded-xl">
                  <BarChart3 size={20} className="text-purple-400"/>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Mes Ventes</h1>
              </div>
              <p className="text-slate-400 text-sm">Historique et commissions en temps réel</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={exportCSV}
              className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-medium border border-slate-700 transition-all text-sm"
            >
              <Download size={15}/>Exporter CSV
            </motion.button>
          </div>

          {/* 4 stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ShoppingBag size={10}/>Total
              </p>
              <p className="text-3xl font-black text-slate-100">{stats.total}</p>
              <p className="text-xs text-slate-600 mt-1">vente{stats.total !== 1 ? 's' : ''}</p>
            </div>

            {/* Commissions payées */}
            <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4">
              <p className="text-xs text-emerald-400/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle size={10}/>Payées
              </p>
              <p className="text-3xl font-black text-emerald-400">{stats.validated}</p>
              <p className="text-xs text-emerald-400/60 mt-1 font-semibold">
                {stats.totalCommission.toLocaleString()} F
              </p>
            </div>

            {/* En attente */}
            <div className="bg-slate-700/15 border border-slate-700/30 rounded-2xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock size={10}/>En cours
              </p>
              <p className="text-3xl font-black text-slate-400">{stats.pending}</p>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                {stats.pendingCommission.toLocaleString()} F att.
              </p>
            </div>

            {/* Taux conversion */}
            <div className="bg-purple-500/8 border border-purple-500/25 rounded-2xl p-4">
              <p className="text-xs text-purple-400/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target size={10}/>Taux
              </p>
              <p className="text-3xl font-black text-purple-400">{stats.conversionRate}%</p>
              <p className="text-xs text-purple-400/60 mt-1">conversion</p>
            </div>
          </div>

          {/* Sous-stats périodes - Cards empilées mobile */}
          <div className="mt-3 sm:mt-4">
            {/* Mobile : une seule carte avec 3 lignes */}
            <div className="sm:hidden bg-slate-950/40 border border-slate-800/60 rounded-xl divide-y divide-slate-800/40">
              {[
                { label: "Aujourd'hui", val: stats.todayCount, icon: Clock },
                { label: 'Cette semaine', val: stats.weekCount, icon: Calendar },
                { label: 'Ce mois', val: stats.monthCount, icon: TrendingUp }
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className="text-slate-500"/>
                    <span className="text-sm text-slate-400 font-medium">{label}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-200 tabular-nums">{val}</span>
                </div>
              ))}
            </div>

            {/* Desktop : 3 cards */}
            <div className="hidden sm:grid grid-cols-3 gap-3">
              {[
                { label: "Aujourd'hui", val: stats.todayCount, icon: Clock },
                { label: 'Cette semaine', val: stats.weekCount, icon: Calendar },
                { label: 'Ce mois', val: stats.monthCount, icon: TrendingUp }
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="bg-slate-950/40 border border-slate-800/60 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Icon size={10}/>{label}
                  </span>
                  <span className="text-sm font-bold text-slate-300 tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RECHERCHE & FILTRES
      ══════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15}/>
            <input
              type="text"
              placeholder="Code commande ou nom client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500/60 transition-all placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
              showFilters || statusFilter !== SALES_FILTERS.STATUS.ALL || dateRange !== SALES_FILTERS.DATE.ALL
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Filter size={14}/>
            <span className="hidden sm:inline">Filtres</span>
            {(statusFilter !== SALES_FILTERS.STATUS.ALL || dateRange !== SALES_FILTERS.DATE.ALL) && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            )}
          </button>
          <button
            onClick={exportCSV}
            className="sm:hidden bg-slate-900 border border-slate-800 text-slate-400 px-3 py-3 rounded-xl transition-all hover:border-slate-700"
          >
            <Download size={14}/>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Statut commission</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value={SALES_FILTERS.STATUS.ALL}>Toutes les commandes</option>
                    <option value={PROMO_STATUS.VALIDATED}>✓ Commission payée</option>
                    <option value={PROMO_STATUS.PENDING}>⏳ En attente de paiement</option>
                    <option value={PROMO_STATUS.CANCELLED}>✕ Annulées</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Période</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Toute la période</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">7 derniers jours</option>
                    <option value="month">30 derniers jours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="recent">Plus récentes</option>
                    <option value="amount">Montant vente</option>
                    <option value="commission">Ma commission</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-400">{filteredSales.length}</span>{' '}
            résultat{filteredSales.length !== 1 ? 's' : ''}
          </p>
          {(searchTerm || statusFilter !== SALES_FILTERS.STATUS.ALL || dateRange !== SALES_FILTERS.DATE.ALL) && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(SALES_FILTERS.STATUS.ALL); setDateRange(SALES_FILTERS.DATE.ALL); }}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              <X size={12}/>Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LISTE HISTORIQUE
      ══════════════════════════════════════════ */}
      <div className="space-y-2">
        {/* En-têtes colonnes — visible desktop */}
        {filteredSales.length > 0 && (
          <div className="hidden md:flex items-center gap-3 px-5 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div className="w-[3px] flex-shrink-0"></div>
            <div className="w-28 flex-shrink-0">Date</div>
            <div className="flex-1">Code & Statut</div>
            <div className="w-24 text-right flex-shrink-0">Commande</div>
            <div className="w-20 text-right flex-shrink-0 hidden lg:block">Réduction</div>
            <div className="w-24 text-right flex-shrink-0">Commission</div>
            <div className="w-20 flex-shrink-0"></div>
          </div>
        )}

        {filteredSales.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 max-w-sm mx-auto">
              <Activity className="text-slate-700 mx-auto mb-4" size={48}/>
              <h3 className="text-lg font-bold text-slate-400 mb-2">Aucune vente trouvée</h3>
              <p className="text-slate-600 text-sm">
                {searchTerm || statusFilter !== SALES_FILTERS.STATUS.ALL || dateRange !== SALES_FILTERS.DATE.ALL
                  ? 'Essayez de modifier vos filtres'
                  : 'Partagez votre code promo pour générer des ventes'
                }
              </p>
            </div>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} onDetails={setSelectedSale}/>
          ))
        )}
      </div>

      {/* ══════════════════════════════════════════
          LÉGENDE COULEURS
      ══════════════════════════════════════════ */}
      {filteredSales.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={11} className="text-purple-400"/>Légende des commissions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { dot: 'bg-slate-500', label: 'Gris', desc: 'En cours — commission en attente de validation admin' },
              { dot: 'bg-emerald-400', label: 'Vert', desc: 'Terminé — commission créditée dans votre portefeuille' },
              { dot: 'bg-red-400', label: 'Rouge', desc: 'Annulé — aucune commission versée' }
            ].map(({ dot, label, desc }) => (
              <div key={label} className="flex items-start gap-2.5 bg-slate-950/40 rounded-xl px-3 py-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0 mt-0.5`}></div>
                <span className="text-xs text-slate-400">
                  <strong className="text-slate-300">{label} :</strong> {desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL DÉTAILS
      ══════════════════════════════════════════ */}
      {selectedSale && (
        <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)}/>
      )}
    </div>
  );
};

export default PartnerSales;