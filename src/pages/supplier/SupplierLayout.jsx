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

  // 1. CHARGEMENT DU FOURNISSEUR (Logique uploadée)
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
// 2. CALCUL FINANCIER TEMPS RÉEL (CORRIGÉ & OPTIMISÉ)
  useEffect(() => {
    if (!supplier?.id) return;
    
    // On écoute toutes les commandes du fournisseur
    const qOrders = query(collection(db, 'orders'), where('supplierId', '==', supplier.id));
    
    const unsubOrders = onSnapshot(qOrders, async (snapshot) => {
      let currentDebtToPlatform = 0; // Dette actuelle (non payée)
      let lifetimeProductEarnings = 0; // Gains produits cumulés (à vie)
      let lifetimeDeliveryEarnings = 0; // Gains livraison cumulés (à vie)

      snapshot.docs.forEach((orderDoc) => {
        const order = orderDoc.data();
        const status = order.status;
        
        // On ne compte que les commandes validées/livrées (pas les annulées ou en attente simple)
        // Note: On inclut SHIPPING car l'argent est considéré comme "en cours d'encaissement" par le fournisseur
        const shouldCount = status === ORDER_STATUS.SHIPPING || status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETED;
        
        if (shouldCount) {
          // 1. Calcul des gains de CETTE commande
          let orderProductEarnings = 0;
          const items = order.items || [];
          
          items.forEach(item => {
            const supplierPrice = Number(item.supplierPrice || 0); 
            const quantity = Number(item.quantity || 0);
            orderProductEarnings += supplierPrice * quantity;
          });

          const deliveryFee = Number(order.details?.deliveryFee || 0);
          const orderDeliveryGain = deliveryFee * 0.90; // Le fournisseur garde 90%

          // 2. AJOUT AUX TOTAUX HISTORIQUES (Indépendamment du paiement de la dette)
          // C'est ici que c'est corrigé : on accumule toujours les gains pour les statistiques
          lifetimeProductEarnings += orderProductEarnings;
          lifetimeDeliveryEarnings += orderDeliveryGain;

          // 3. CALCUL DE LA DETTE (Conditionnel)
          // La dette ne s'accumule QUE si la commande n'a pas encore été réglée à la plateforme
          if (order.settlementStatus !== WITHDRAWAL_STATUS.PAID) {
            const currentOrderDebt = Number(order.platformDebt || 0);
            currentDebtToPlatform += currentOrderDebt;
          }
        }
      });

      const totalLifetimeEarnings = lifetimeProductEarnings + lifetimeDeliveryEarnings;

      // Mise à jour de l'état local pour l'affichage immédiat
      setFinancialStats({
        platformDebt: currentDebtToPlatform,
        totalSupplierEarnings: totalLifetimeEarnings, 
        productEarnings: lifetimeProductEarnings,
        deliveryEarnings: lifetimeDeliveryEarnings
      });

      // Synchronisation avec Firestore (CORRIGÉE : Ajout des champs manquants)
      // On vérifie s'il y a une différence significative pour éviter les écritures en boucle inutiles
      const storedDebt = supplier.wallet?.platformDebt || 0;
      const storedTotal = supplier.wallet?.totalSupplierEarnings || 0;
      
      const debtChanged = Math.abs(currentDebtToPlatform - storedDebt) > 5;
      const earningsChanged = Math.abs(totalLifetimeEarnings - storedTotal) > 5;

      if (debtChanged || earningsChanged) {
        try {
          const supplierRef = doc(db, 'suppliers', supplier.id);
          await updateDoc(supplierRef, {
            'wallet.platformDebt': currentDebtToPlatform,           // Ce que le fournisseur doit payer maintenant
            'wallet.totalSupplierEarnings': totalLifetimeEarnings,  // Ce qu'il a gagné depuis le début (Total)
            'wallet.productEarnings': lifetimeProductEarnings,      // Ce qu'il a gagné sur les produits (Nouveau champ stocké)
            'wallet.deliveryEarnings': lifetimeDeliveryEarnings,    // Ce qu'il a gagné sur les livraisons (Nouveau champ stocké)
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

  // 3. ÉCOUTE DES SETTLEMENTS (Logique uploadée)
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

  // 4. ACTION DE PAIEMENT (Logique uploadée : type correct + period + toUpperCase)
  const handleEndOfDayPayment = async (e) => {
    e.preventDefault();
    if (!transactionId.trim() || financialStats.platformDebt <= 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'settlements'), {
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: financialStats.platformDebt,
        transactionRef: transactionId.toUpperCase(), // Normalisation
        status: WITHDRAWAL_STATUS.PENDING,
        createdAt: serverTimestamp(),
        type: 'platform_payment', // Type exact du fichier uploadé
        period: new Date().toLocaleDateString('fr-FR') // Champ period du fichier uploadé
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

  if (loading || configLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader className="animate-spin text-purple-500" size={40}/>
    </div>
  );

  if (!supplier) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
      <div className="max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={48}/>
        <h2 className="text-white text-xl font-bold">Accès refusé</h2>
        <Link to="/" className="mt-4 inline-block text-purple-400">Retourner à l'accueil</Link>
      </div>
    </div>
  );

  const isAuthenticated = sessionStorage.getItem('supplierAuthenticated') === supplier.id;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full">
          <Lock className="text-purple-500 mx-auto mb-4" size={40}/>
          <h1 className="text-xl font-bold text-white text-center mb-6">{supplier.name}</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (e.target.code.value === supplier.supplierCode) {
              sessionStorage.setItem('supplierAuthenticated', supplier.id);
              navigate(`/fournisseur/${supplier.accessSlug}/dashboard`);
            } else { alert('❌ Code incorrect'); }
          }} className="space-y-4">
            <input name="code" type="text" placeholder="CODE D'ACCÈS" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-center font-mono uppercase tracking-widest outline-none focus:border-purple-500"/>
            <button className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl">Se connecter</button>
          </form>
        </div>
      </div>
    );
  } 

  // ÉCRAN DE BLOCAGE (Design moderne + Logique uploadée)
  if (isClosedForNight && financialStats.platformDebt > 0) {
    if (pendingSettlement) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
           <div className="bg-slate-900 border border-orange-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl">
              <Clock className="text-orange-400 mx-auto mb-4 animate-pulse" size={50}/>
              <h2 className="text-2xl font-bold text-white mb-2">Vérification en cours</h2>
              <p className="text-slate-400 text-sm mb-6">Votre justificatif de {pendingSettlement.amount.toLocaleString()} F est en cours de traitement par l'admin.</p>
              <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2"><RefreshCw size={18}/> Actualiser</button>
           </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-red-600/50 p-6 rounded-2xl max-w-3xl w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-red-500" size={32}/></div>
            <h1 className="text-2xl font-bold text-white">Fin de journée - Paiement requis</h1>
            <p className="text-slate-400 text-sm mt-2">Veuillez régler votre dette pour débloquer l'espace.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl text-center">
              <span className="text-xs text-red-400 uppercase font-bold">Montant à reverser</span>
              <p className="text-4xl font-black text-red-500 my-2">{financialStats.platformDebt.toLocaleString()} F</p>
              <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 mb-1">Mobile Money Admin :</p>
                <p className="font-mono text-white font-bold">{config.phoneNumber}</p>
              </div>
            </div>
            <form onSubmit={handleEndOfDayPayment} className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase">ID de la transaction</label>
              <input required value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Ex: PP2304..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-green-500 outline-none"/>
              <button disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                {isSubmitting ? <Loader className="animate-spin"/> : <Send size={20}/>} Confirmer le paiement
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT NORMAL AVEC NAVIGATION DESIGN (Tab Bar + Sidebar)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center font-bold text-white">D</div>
          <span className="font-bold text-sm hidden sm:inline">Espace {supplier.name}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 text-[11px] font-bold text-green-400">
            Gains: {financialStats.totalSupplierEarnings.toLocaleString()} F
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu size={24}/></button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop (Design Copié) */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-[calc(100vh-4rem)] sticky top-16">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <item.icon size={20}/> <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button onClick={() => { if(window.confirm('Quitter ?')) { sessionStorage.removeItem('supplierAuthenticated'); navigate(`/fournisseur/${supplier.accessSlug}`); }}} className="p-4 border-t border-slate-800 text-slate-500 hover:text-red-400 flex items-center gap-3">
            <LogOut size={20}/> Déconnexion
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 pb-24 lg:pb-8 lg:p-8">
          <Outlet context={{ supplier, financialStats }} />
        </main>
      </div>

      {/* Tab Bar Mobile (Design Copié) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around p-2 z-40 pb-safe">
        {navItems.map(item => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-purple-500' : 'text-slate-500'}`}>
              <item.icon size={20}/>
              <span className="text-[10px] font-medium mt-1">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>

      {/* Overlay Mobile Menu (Design Copié) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-950 z-[60] flex flex-col p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-800 rounded-full"><X/></button>
            </div>
            <div className="space-y-4">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                  <div className="flex items-center gap-4"><item.icon className="text-purple-500"/> <span className="font-bold">{item.label}</span></div>
                  <ChevronRight size={18} className="text-slate-600"/>
                </Link>
              ))}
            </div>
            <button onClick={() => { sessionStorage.removeItem('supplierAuthenticated'); navigate(`/fournisseur/${supplier.accessSlug}`); }} className="mt-auto w-full p-4 text-red-400 font-bold border border-red-400/20 rounded-2xl flex items-center justify-center gap-2">
              <LogOut size={20}/> Se déconnecter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierLayout;