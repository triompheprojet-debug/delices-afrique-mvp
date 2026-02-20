import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, addDoc, serverTimestamp, 
  doc, updateDoc
} from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';
import { 
  Lock, Send, AlertTriangle, Clock, Loader, RefreshCw, Wallet, 
  Home, Package, BookOpen, Menu, X, Store,
  LogOut, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ORDER_STATUS, WITHDRAWAL_STATUS } from '../../utils/constants';

const SupplierLayout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // LOGIQUE : Configuration et état de fermeture
  const { isClosedForNight, config, loading: configLoading } = useConfig();
  
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSettlement, setPendingSettlement] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [financialStats, setFinancialStats] = useState({
    platformDebt: 0,
    totalSupplierEarnings: 0,
    deliveryEarnings: 0,
    productEarnings: 0
  });
  
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. CHARGEMENT DU FOURNISSEUR
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'suppliers'), where('accessSlug', '==', slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const supData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setSupplier(supData);
        setLoading(false);
      } else {
        setSupplier(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Erreur chargement fournisseur:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [slug]);

  // 2. CALCUL FINANCIER TEMPS RÉEL
  useEffect(() => {
    if (!supplier?.id) return;
    
    const qOrders = query(collection(db, 'orders'), where('supplierId', '==', supplier.id));
    
    const unsubOrders = onSnapshot(qOrders, async (snapshot) => {
      let currentDebtToPlatform = 0; 
      let lifetimeProductEarnings = 0;
      let lifetimeDeliveryEarnings = 0;

      snapshot.docs.forEach((orderDoc) => {
        const order = orderDoc.data();
        const status = order.status;
        
        const shouldCount = status === ORDER_STATUS.SHIPPING || status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETED;
        
        if (shouldCount) {
          let orderProductEarnings = 0;
          const items = order.items || [];
          
          items.forEach(item => {
            const supplierPrice = Number(item.supplierPrice || 0); 
            const quantity = Number(item.quantity || 0);
            orderProductEarnings += supplierPrice * quantity;
          });

          const deliveryFee = Number(order.details?.deliveryFee || 0);
          const orderDeliveryGain = deliveryFee * 0.90; 

          lifetimeProductEarnings += orderProductEarnings;
          lifetimeDeliveryEarnings += orderDeliveryGain;

          if (order.settlementStatus !== WITHDRAWAL_STATUS.PAID) {
            const currentOrderDebt = Number(order.platformDebt || 0);
            currentDebtToPlatform += currentOrderDebt;
          }
        }
      });

      const totalLifetimeEarnings = lifetimeProductEarnings + lifetimeDeliveryEarnings;

      setFinancialStats({
        platformDebt: currentDebtToPlatform,
        totalSupplierEarnings: totalLifetimeEarnings, 
        productEarnings: lifetimeProductEarnings,
        deliveryEarnings: lifetimeDeliveryEarnings
      });

      const storedDebt = supplier.wallet?.platformDebt || 0;
      const storedTotal = supplier.wallet?.totalSupplierEarnings || 0;
      
      const debtChanged = Math.abs(currentDebtToPlatform - storedDebt) > 5;
      const earningsChanged = Math.abs(totalLifetimeEarnings - storedTotal) > 5;

      if (debtChanged || earningsChanged) {
        try {
          const supplierRef = doc(db, 'suppliers', supplier.id);
          await updateDoc(supplierRef, {
            'wallet.platformDebt': currentDebtToPlatform,           
            'wallet.totalSupplierEarnings': totalLifetimeEarnings,  
            'wallet.productEarnings': lifetimeProductEarnings,      
            'wallet.deliveryEarnings': lifetimeDeliveryEarnings,    
            'wallet.lastUpdate': serverTimestamp()
          });
          console.log("Portefeuille fournisseur synchronisé avec succès");
        } catch (error) { 
          console.error("Erreur sync Firestore:", error); 
        }
      }
    });
    return () => unsubOrders();
  }, [supplier?.id]);

  // 3. ÉCOUTE DES SETTLEMENTS
  useEffect(() => {
    if (!supplier?.id) return;
    const qSettlements = query(
      collection(db, 'settlements'),
      where('supplierId', '==', supplier.id),
      where('status', '==', WITHDRAWAL_STATUS.PENDING)
    );
    const unsubSettlements = onSnapshot(qSettlements, (sSnap) => {
      if (!sSnap.empty) {
        const settlements = sSnap.docs.map(d => ({id: d.id, ...d.data()}));
        settlements.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setPendingSettlement(settlements[0]);
      } else { setPendingSettlement(null); }
    });
    return () => unsubSettlements();
  }, [supplier?.id]);

  // 4. ACTION DE PAIEMENT
  const handleEndOfDayPayment = async (e) => {
    e.preventDefault();
    if (!transactionId.trim() || financialStats.platformDebt <= 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'settlements'), {
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: financialStats.platformDebt,
        transactionRef: transactionId.toUpperCase(), 
        status: WITHDRAWAL_STATUS.PENDING,
        createdAt: serverTimestamp(),
        type: 'platform_payment', 
        period: new Date().toLocaleDateString('fr-FR') 
      });
      alert(`✅ Paiement enregistré.\nRéférence: ${transactionId.toUpperCase()}\n\nValidation admin en cours.`);
      setTransactionId('');
    } catch (error) {
      alert("❌ Erreur lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { path: 'dashboard', icon: Home, label: 'Accueil', shortLabel: 'Accueil' },
    { path: 'products', icon: Package, label: 'Produits', shortLabel: 'Produits' },
    { path: 'orders', icon: Store, label: 'Commandes', shortLabel: 'Ordres' },
    { path: 'wallet', icon: Wallet, label: 'Finances', shortLabel: 'Finances' },
    { path: 'infos', icon: BookOpen, label: 'Infos', shortLabel: 'Infos' }
  ];

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading || configLoading) return (
    <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center">
      <Loader className="animate-spin text-purple-500" size={40}/>
    </div>
  );

  // ==========================================
  // ACCESS DENIED (NO SUPPLIER FOUND)
  // ==========================================
  if (!supplier) return (
    <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={48}/>
        <h2 className="text-white text-2xl font-bold mb-2">Accès refusé</h2>
        <p className="text-slate-400 mb-6">Fournisseur introuvable ou lien invalide.</p>
        <Link to="/" className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-xl transition-colors font-medium">
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );

  // ==========================================
  // AUTHENTICATION SCREEN
  // ==========================================
  const isAuthenticated = sessionStorage.getItem('supplierAuthenticated') === supplier.id;
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-lg relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-500"></div>
          
          <Lock className="text-purple-500 mx-auto mb-6" size={48}/>
          <h1 className="text-2xl font-bold text-white text-center mb-2">{supplier.name}</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Veuillez entrer votre code secret pour accéder à votre espace.</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (e.target.code.value === supplier.supplierCode) {
              sessionStorage.setItem('supplierAuthenticated', supplier.id);
              navigate(`/fournisseur/${supplier.accessSlug}/dashboard`);
            } else { alert('❌ Code incorrect'); }
          }} className="space-y-4">
            <input 
              name="code" 
              type="tel" // Clavier numérique sur mobile
              autoComplete="off"
              placeholder="CODE D'ACCÈS" 
              className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-center font-mono text-xl uppercase tracking-[0.5em] outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-600"
            />
            <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  } 

  // ==========================================
  // BLOCAGE FIN DE JOURNÉE (PAIEMENT REQUIS)
  // ==========================================
  if (isClosedForNight && financialStats.platformDebt > 0) {
    if (pendingSettlement) {
      return (
        <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4 text-center">
           <div className="bg-slate-900 border border-orange-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
              <div className="absolute top-4 right-4 animate-pulse"><div className="w-2 h-2 rounded-full bg-orange-500"></div></div>
              <Clock className="text-orange-400 mx-auto mb-6 animate-pulse" size={56}/>
              <h2 className="text-2xl font-bold text-white mb-2">Vérification en cours</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Votre justificatif de <strong className="text-white">{pendingSettlement.amount.toLocaleString()} F</strong> est en cours de traitement par l'administrateur.
              </p>
              <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                <RefreshCw size={20}/> Actualiser le statut
              </button>
           </div>
        </div>
      );
    }

    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-900 border-2 border-red-600/50 p-6 sm:p-8 rounded-3xl max-w-3xl w-full shadow-[0_0_50px_-12px_rgba(220,38,38,0.25)]">
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30">
              <Lock className="text-red-500" size={40}/>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Fin de journée</h1>
            <p className="text-slate-400 text-sm sm:text-base">Le service est fermé. Veuillez régler votre dette pour débloquer l'espace.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Colonne Montant */}
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl text-center h-full flex flex-col justify-center">
              <span className="text-xs text-red-400 uppercase font-bold tracking-wider">Montant à reverser</span>
              <p className="text-4xl sm:text-5xl font-black text-red-500 my-4 tracking-tighter">
                {financialStats.platformDebt.toLocaleString()} <span className="text-2xl align-top">F</span>
              </p>
              <div className="mt-2 p-3 bg-slate-950/50 rounded-lg border border-red-900/30">
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Numéro Admin (OM/MOMO)</p>
                <p className="font-mono text-white font-bold text-lg select-all">{config.phoneNumber}</p>
              </div>
            </div>

            {/* Colonne Formulaire */}
            <form onSubmit={handleEndOfDayPayment} className="space-y-5 h-full flex flex-col justify-center">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">ID de la transaction</label>
                <input 
                  required 
                  value={transactionId} 
                  onChange={e => setTransactionId(e.target.value)} 
                  placeholder="Ex: PP230412..." 
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                />
              </div>
              <button 
                disabled={isSubmitting} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader className="animate-spin" size={24}/> : <Send size={20}/>} 
                <span>Confirmer le paiement</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUT NORMAL AVEC NAVIGATION
  // ==========================================
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 flex flex-col">
      {/* Header Sticky */}
      <header className="sticky top-0 z-40 bg-slate-900/80 supports-[backdrop-filter]:bg-slate-900/60 backdrop-blur-md border-b border-slate-800 h-16 sm:h-20 w-full transition-all duration-300">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-[1920px] mx-auto">
          {/* Logo / Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm sm:text-base leading-tight">Espace Fournisseur</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate max-w-[120px] sm:max-w-none">{supplier.name}</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-bold text-white">
                {financialStats.totalSupplierEarnings.toLocaleString()} <span className="text-slate-500 hidden sm:inline">F</span>
              </span>
            </div>
            
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24}/>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1920px] mx-auto w-full">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-72 bg-slate-900/50 border-r border-slate-800 h-[calc(100vh-5rem)] sticky top-20">
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar-thin">
            {navItems.map(item => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-purple-400'}/> 
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button 
              onClick={() => { if(window.confirm('Quitter ?')) { sessionStorage.removeItem('supplierAuthenticated'); navigate(`/fournisseur/${supplier.accessSlug}`); }}} 
              className="w-full px-4 py-3 rounded-xl border border-red-500/10 hover:bg-red-500/10 text-slate-500 hover:text-red-400 flex items-center justify-center gap-2 transition-all font-medium text-sm"
            >
              <LogOut size={18}/> Déconnexion
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full p-4 pb-28 lg:pb-8 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ supplier, financialStats }} />
          </div>
        </main>
      </div>

      {/* Tab Bar Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 supports-[backdrop-filter]:bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 flex justify-around items-end z-40 pb-safe pt-2 px-2 transition-transform duration-300">
        {navItems.map(item => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center justify-center p-2 rounded-xl w-full max-w-[4.5rem] transition-all duration-200 active:scale-95 ${
                isActive ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-full mb-1 transition-all ${isActive ? 'bg-purple-500/10' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Overlay Mobile Menu Full Screen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-slate-950 z-[60] flex flex-col p-6 pt-safe pb-safe"
          >
            <div className="flex justify-between items-center mb-10 mt-2">
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">Menu</span>
                <span className="text-slate-500 text-sm">Navigation rapide</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"
              >
                <X size={24}/>
              </button>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl border border-slate-800 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg text-purple-500">
                      <item.icon size={24}/>
                    </div>
                    <span className="font-bold text-lg text-slate-200">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-600"/>
                </Link>
              ))}
            </div>

            <button 
              onClick={() => { sessionStorage.removeItem('supplierAuthenticated'); navigate(`/fournisseur/${supplier.accessSlug}`); }} 
              className="mt-6 w-full p-5 text-red-400 font-bold bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 active:bg-red-500/10 transition-colors"
            >
              <LogOut size={22}/> Se déconnecter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierLayout;