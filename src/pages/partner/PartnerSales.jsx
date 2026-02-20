import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, Calendar,
  Search, TrendingUp, Eye, Package, Truck, DollarSign,
  Filter, Download, BarChart3, Target, Award,
  Gift, Sparkles, X, User, CreditCard, Activity,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ─── RÈGLE MÉTIER : Affichage contextuel selon le statut dynamique ────
const getCommStyle = (sale) => {
  // 1. Annulé
  if (sale.status === 'Annulé') {
    return {
      text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
      badge: 'bg-red-500/15 border-red-500/30 text-red-400',
      dot: 'bg-red-400', label: 'Annulé', icon: XCircle, paid: false
    };
  }
  
  // 2. Terminé = Argent disponible (Vert)
  if (sale.status === 'Terminé') {
    return {
      text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400', label: 'Commission Acquise', icon: CheckCircle, paid: true
    };
  }

  // 3. Livré = Vente réussie mais argent en attente (Bleu/Violet)
  if (sale.status === 'Livré') {
    return {
      text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
      badge: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      dot: 'bg-blue-400', label: 'Livré (Validation en cours)', icon: Truck, paid: false
    };
  }

  // 4. Autres (En attente, En préparation...) = Gris
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
              <button onClick={onClose} className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors">
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
                  { icon: Truck, label: 'Mode', val: sale.details?.method || '—' },
                  { icon: CreditCard, label: 'Paiement', val: sale.details?.paymentMethod || '—' }
                ].map(({ icon: Ic, label, val }) => (
                  <div key={label} className="bg-slate-800/40 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Ic size={11}/>{label}</p>
                    <p className="text-sm font-semibold text-slate-200 truncate">{val}</p>
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
                  <span className="text-slate-400">Total payé par client</span>
                  <span className="font-bold text-slate-100">{sale.details?.finalTotal?.toLocaleString() || 0} F</span>
                </div>

                {/* Commission — couleur contextuelle */}
                <div className={`flex justify-between items-center pt-3 mt-1 border-t-2 border-dashed ${
                  sale.status === 'Annulé' ? 'border-red-500/30' : cs.paid ? 'border-emerald-500/30' : 'border-slate-700/40'
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
                    {sale.status === 'Annulé' ? 'Commande annulée' : 
                     sale.status === 'Terminé' ? 'Commission disponible' : 
                     sale.status === 'Livré' ? 'Commande Livrée - Validation en cours' :
                     `Statut : ${sale.status}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {sale.status === 'Annulé' ? 'Aucune commission.' : 
                     sale.status === 'Terminé' ? 'Le montant est ajouté à votre solde disponible.' : 
                     sale.status === 'Livré' ? 'Bravo ! Le client a reçu sa commande. La commission sera créditée dès que l\'admin passera le statut à "Terminé".' :
                     'En attente de traitement par le fournisseur.'}
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
  const salePrice = sale.details?.finalTotal || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all duration-150 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className={`w-[3px] h-11 rounded-full flex-shrink-0 ${cs.dot}`}></div>

        <div className="hidden sm:flex flex-col w-28 flex-shrink-0">
          <span className="text-xs font-medium text-slate-300">{formatDateShort(sale.createdAt)}</span>
          <span className="text-xs text-slate-600 mt-0.5">{formatTime(sale.createdAt)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-sm font-bold text-slate-100 tracking-wide">{sale.code || '—'}</span>
            <span className="sm:hidden text-xs text-slate-600">{formatDateShort(sale.createdAt)}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cs.badge}`}>
            <Icon size={10}/>{cs.label}
          </span>
        </div>

        <div className="hidden md:flex flex-col items-end w-24 flex-shrink-0">
          <span className="text-xs text-slate-500 mb-0.5">Vente</span>
          <span className="text-sm font-bold text-slate-200">{salePrice.toLocaleString()} F</span>
        </div>

        <div className={`flex flex-col items-end w-28 flex-shrink-0 ${cs.bg} rounded-xl px-3 py-2 border ${cs.border}`}>
          <span className="text-xs text-slate-500 mb-0.5">Commission</span>
          <span className={`text-sm font-black ${cs.text}`}>
            {commission > 0 ? `${commission.toLocaleString()} F` : '—'}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => onDetails(sale)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-purple-500"
        >
          <Eye size={13}/>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Composant principal ─────────────────────────────────────────────────────
const PartnerSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [stats, setStats] = useState({
    total: 0, 
    paid: 0,        // Terminé uniquement
    pending: 0,     // Livré ou En cours
    cancelled: 0,
    totalCommission: 0,   // Argent encaissé (Terminé)
    pendingCommission: 0  // Argent potentiel (Livré + En cours)
  });

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const { id: partnerId } = JSON.parse(sessionStr);

    const q = query(
      collection(db, 'orders'),
      where('promo.partnerId', '==', partnerId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSales(data);
      computeStats(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ─── CALCUL DYNAMIQUE DES STATS ───
  const computeStats = (data) => {
    // 1. Payé = Terminé uniquement
    const paidOrders = data.filter(s => s.status === 'Terminé');
    
    // 2. Annulé
    const cancelledOrders = data.filter(s => s.status === 'Annulé');
    
    // 3. En attente = Tout le reste (y compris Livré)
    const pendingOrders = data.filter(s => s.status !== 'Terminé' && s.status !== 'Annulé');

    // Calcul sommes
    const totalCommission = paidOrders.reduce((sum, s) => sum + (s.promo?.partnerCommission || 0), 0);
    const pendingCommission = pendingOrders.reduce((sum, s) => sum + (s.promo?.partnerCommission || 0), 0);

    setStats({
      total: data.length,
      paid: paidOrders.length,
      pending: pendingOrders.length,
      cancelled: cancelledOrders.length,
      totalCommission,
      pendingCommission
    });
  };

  const filteredSales = sales.filter(s => {
    // Filtre texte
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (!s.code?.toLowerCase().includes(t) && !s.customer?.name?.toLowerCase().includes(t)) return false;
    }
    // Filtre Statut
    if (statusFilter === 'paid') return s.status === 'Terminé';
    if (statusFilter === 'pending') return s.status !== 'Terminé' && s.status !== 'Annulé';
    if (statusFilter === 'cancelled') return s.status === 'Annulé';
    
    return true;
  });

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

      {/* HEADER + STATS */}
      <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-7">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

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
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ShoppingBag size={10}/>Total
              </p>
              <p className="text-3xl font-black text-slate-100">{stats.total}</p>
            </div>

            {/* Commissions payées (Terminé) */}
            <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4">
              <p className="text-xs text-emerald-400/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle size={10}/>Commissions Acquises
              </p>
              <p className="text-3xl font-black text-emerald-400">{stats.paid}</p>
              <p className="text-xs text-emerald-400/60 mt-1 font-semibold">
                {stats.totalCommission.toLocaleString()} F
              </p>
            </div>

            {/* En attente (Livré + En cours) */}
            <div className="bg-blue-500/8 border border-blue-500/25 rounded-2xl p-4">
              <p className="text-xs text-blue-400/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock size={10}/>En attente
              </p>
              <p className="text-3xl font-black text-blue-400">{stats.pending}</p>
              <p className="text-xs text-blue-400/60 mt-1 font-semibold">
                {stats.pendingCommission.toLocaleString()} F pot.
              </p>
            </div>

            {/* Annulé */}
            <div className="bg-red-500/8 border border-red-500/25 rounded-2xl p-4">
              <p className="text-xs text-red-400/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <XCircle size={10}/>Annulés
              </p>
              <p className="text-3xl font-black text-red-400">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RECHERCHE & FILTRES */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15}/>
            <input
              type="text"
              placeholder="Code commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500/60 transition-all placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
              showFilters || statusFilter !== 'all'
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Filter size={14}/>
            <span className="hidden sm:inline">Filtres</span>
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
              <div className="pt-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="all">Toutes les commandes</option>
                  <option value="paid">✅ Payées (Terminé)</option>
                  <option value="pending">⏳ En attente (Livré / En cours)</option>
                  <option value="cancelled">✕ Annulées</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LISTE HISTORIQUE */}
      <div className="space-y-2">
        {filteredSales.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 max-w-sm mx-auto">
              <Activity className="text-slate-700 mx-auto mb-4" size={48}/>
              <h3 className="text-lg font-bold text-slate-400 mb-2">Aucune vente trouvée</h3>
            </div>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} onDetails={setSelectedSale}/>
          ))
        )}
      </div>

      {/* Légende */}
      {filteredSales.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={11} className="text-purple-400"/>Légende
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Terminé (Argent dispo)</div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-400"></div>Livré (Validation en cours)</div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-500"></div>En préparation</div>
          </div>
        </div>
      )}

      {selectedSale && (
        <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)}/>
      )}
    </div>
  );
};

export default PartnerSales;