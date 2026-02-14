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
  Home, Package, DollarSign, BookOpen, Menu, X, TrendingUp, Store,
  LogOut, Shield, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ORDER_STATUS, WITHDRAWAL_STATUS } from '../../utils/constants';

const SupplierLayout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Récupération de isClosedForNight pour la logique de blocage
  const { isClosedForNight, config, loading: configLoading } = useConfig();
  
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSettlement, setPendingSettlement] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ✅ ÉTAT UNIFIÉ POUR DETTE ET GAINS
  const [financialStats, setFinancialStats] = useState({
    platformDebt: 0, // Ce que le fournisseur doit payer à la plateforme
    totalSupplierEarnings: 0, // Ce que le fournisseur gagne réellement
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

  // 2. CALCUL TEMPS RÉEL UNIFIÉ
  useEffect(() => {
    if (!supplier?.id) return;

    // Écoute des commandes pour calculer la dette en temps réel
    const qOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id)
    );
    
    const unsubOrders = onSnapshot(qOrders, async (snapshot) => {
      let totalDebtToPlatform = 0;
      let totalProductEarnings = 0;
      let totalDeliveryEarnings = 0;

      snapshot.docs.forEach((orderDoc) => {
        const order = orderDoc.data();
        const status = order.status;
        
        // ✅ RÈGLE : Dette et gains comptabilisés à partir de "En livraison", "Livré" ou "Terminé"
        // Car c'est à ce moment que le fournisseur a encaissé l'argent ou est en route pour le faire.
        const shouldCount = status === ORDER_STATUS.SHIPPING || status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETED;
        
        if (shouldCount) {
          // Ignorer si la dette de cette commande a déjà été réglée (statut PAID)
          if (order.settlementStatus === WITHDRAWAL_STATUS.PAID) return;

          // --- 1. CALCUL DE LA DETTE ENVERS LA PLATEFORME ---
          // A. La dette sur le produit (stockée dans la commande sous 'platformDebt')
          const productDebt = Number(order.platformDebt || 0);

          // B. La dette sur la livraison (10% des frais de livraison) 
          const deliveryFee = Number(order.details?.deliveryFee || 0);
          const deliveryDebt = deliveryFee * 0.10; 

          // Total à reverser pour cette commande
          totalDebtToPlatform += (productDebt + deliveryDebt);

          // --- 2. CALCUL DES GAINS FOURNISSEUR (POUR AFFICHAGE) ---
          // A. Gains produits (Prix fournisseur)
          const items = order.items || [];
          items.forEach(item => {
            // On prend le prix fournisseur s'il existe, sinon on estime (fallback)
            const supplierPrice = Number(item.supplierPrice || 0); 
            const quantity = Number(item.quantity || 0);
            totalProductEarnings += supplierPrice * quantity;
          });

          // B. Gains livraison (90% restant)
          totalDeliveryEarnings += deliveryFee * 0.90;
        }
      });

      const totalEarnings = totalProductEarnings + totalDeliveryEarnings;

      // ✅ MISE À JOUR DE L'ÉTAT LOCAL
      setFinancialStats({
        platformDebt: totalDebtToPlatform,
        totalSupplierEarnings: totalEarnings,
        productEarnings: totalProductEarnings,
        deliveryEarnings: totalDeliveryEarnings
      });

      // ✅ MISE À JOUR FIRESTORE (Optimisation : seulement si changement > 10 FCFA pour éviter écritures excessives)
      const currentFirestoreDebt = supplier.wallet?.platformDebt || 0;
      const diff = Math.abs(totalDebtToPlatform - currentFirestoreDebt);

      if (diff > 10) {
        try {
          const supplierRef = doc(db, 'suppliers', supplier.id);
          await updateDoc(supplierRef, {
            'wallet.platformDebt': totalDebtToPlatform,
            'wallet.totalSupplierEarnings': totalEarnings,
            'wallet.lastUpdate': serverTimestamp()
          });
        } catch (error) {
          console.error("Erreur mise à jour Firestore:", error);
        }
      }
    });

    return () => unsubOrders();
  }, [supplier?.id]);

  // 3. ÉCOUTE DES SETTLEMENTS EN ATTENTE (Justificatifs envoyés)
  useEffect(() => {
    if (!supplier?.id) return;

    const qSettlements = query(
      collection(db, 'settlements'),
      where('supplierId', '==', supplier.id),
      where('status', '==', WITHDRAWAL_STATUS.PENDING)
    );
    
    const unsubSettlements = onSnapshot(qSettlements, (sSnap) => {
      if (!sSnap.empty) {
        // On prend le plus récent
        const settlements = sSnap.docs.map(d => ({id: d.id, ...d.data()}));
        settlements.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setPendingSettlement(settlements[0]);
      } else {
        setPendingSettlement(null);
      }
    });
    
    return () => unsubSettlements();
  }, [supplier?.id]);

  // 4. ENVOI PAIEMENT DE FIN DE JOURNÉE
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
        period: new Date().toLocaleDateString('fr-FR') // Indique la date du jour payé
      });
      
      alert(`✅ Paiement enregistré.\nRéférence: ${transactionId.toUpperCase()}\n\nVotre compte sera débloqué après validation de l'admin.`);
      setTransactionId('');
      setIsSubmitting(false);
    } catch (error) {
      console.error("Erreur envoi paiement:", error);
      alert("❌ Erreur lors de l'envoi. Réessayez.");
      setIsSubmitting(false);
    }
  };

  // --- RENDU CONDITIONNEL (LOADING / LOGIN) ---

  if (loading || configLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-purple-400 mx-auto mb-4" size={48}/>
          <p className="text-slate-400 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-md shadow-elegant">
          <AlertTriangle className="text-red-400 mx-auto mb-4" size={48}/>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Fournisseur introuvable</h1>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl mt-4">
            <Home size={18}/> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const isAuthenticated = sessionStorage.getItem('supplierAuthenticated') === supplier.id;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-elegant">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="text-white" size={32}/>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{supplier.name}</h1>
            <p className="text-slate-400">Espace Fournisseur</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (e.target.code.value === supplier.supplierCode) {
              sessionStorage.setItem('supplierAuthenticated', supplier.id);
              navigate(`/fournisseur/${supplier.accessSlug}/dashboard`);
            } else {
              alert('❌ Code incorrect');
            }
          }} className="space-y-4">
            <input required type="text" name="code" placeholder="Code d'accès" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-center text-white uppercase font-mono tracking-widest outline-none focus:border-purple-500"/>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition">Se connecter</button>
          </form>
        </div>
      </div>
    );
  }

  // --- LOGIQUE DE BLOCAGE (NUIT + DETTE) ---
  
  // Cas 1 : Justificatif envoyé, en attente de validation (Bloqué mais rassurant)
  if (isClosedForNight && financialStats.platformDebt > 0 && pendingSettlement) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-orange-600 p-8 rounded-2xl max-w-2xl w-full">
          <div className="text-center mb-6">
            <Clock className="text-orange-400 mx-auto mb-4" size={48}/>
            <h1 className="text-3xl font-bold text-slate-100">Paiement en vérification</h1>
            <p className="text-slate-400 mt-2">Le site est fermé. Votre justificatif est en cours de traitement.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Montant déclaré</span>
              <span className="font-bold text-white">{pendingSettlement.amount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Réf. Transaction</span>
              <span className="font-mono text-purple-400">{pendingSettlement.transactionRef}</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700">Actualiser</button>
        </div>
      </div>
    );
  }

  // Cas 2 : BLOQUÉ (Nuit + Dette + Pas de justificatif) [cite: 517, 518]
  // La condition est stricte : isClosedForNight DOIT être true.
  if (isClosedForNight && financialStats.platformDebt > 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-red-600 p-8 rounded-2xl max-w-3xl w-full shadow-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="text-red-500" size={40}/>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Fin de journée - Paiement requis</h1>
            <p className="text-slate-400">La boutique est fermée. Veuillez régler la dette de la journée pour débloquer votre espace pour demain.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center">
                <p className="text-sm text-red-300 uppercase font-bold mb-1">Montant à reverser</p>
                <p className="text-4xl font-bold text-red-500">{financialStats.platformDebt.toLocaleString()} F</p>
                <p className="text-xs text-red-300/70 mt-2">Marge plateforme + 10% livraisons</p>
              </div>
              
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-3">Envoyez le montant via Mobile Money au :</p>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-600">
                  <span className="font-mono text-xl text-white font-bold">{config.phoneNumber}</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">ADMIN</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <form onSubmit={handleEndOfDayPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Preuve de paiement (ID Transaction)</label>
                  <input 
                    required
                    type="text" 
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="Ex: PP230412.1540.B87654"
                    className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white font-mono placeholder-slate-500 focus:border-green-500 outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader className="animate-spin"/> : <Send size={20}/>}
                  Confirmer le paiement
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LAYOUT NORMAL (ACCÈS AUTORISÉ) ---
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center font-bold text-white">D</div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-100">Délices d'Afrique</h1>
                <p className="text-xs text-purple-400 font-bold">Espace Fournisseur • {supplier.name}</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                <p className="text-xs text-green-400 font-bold">Vos Gains: {financialStats.totalSupplierEarnings.toLocaleString()} F</p>
              </div>
              {/* Dette affichée en rouge si > 0, pour info en temps réel */}
              {financialStats.platformDebt > 0 && (
                <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                  <p className="text-xs text-red-400 font-bold">Dette courante: {financialStats.platformDebt.toLocaleString()} F</p>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-400">
              {mobileMenuOpen ? <X/> : <Menu/>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-[calc(100vh-5rem)] top-20 z-40">
          <div className="flex-1 p-4 space-y-2">
            {[
              { path: 'dashboard', icon: Home, label: 'Accueil' },
              { path: 'products', icon: Package, label: 'Produits' },
              { path: 'orders', icon: Store, label: 'Commandes' },
              { path: 'wallet', icon: Wallet, label: 'Finances' },
              { path: 'infos', icon: BookOpen, label: 'Infos' }
            ].map(item => (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.includes(item.path)
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20}/>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => {
                 if(window.confirm('Se déconnecter ?')) {
                    sessionStorage.removeItem('supplierAuthenticated');
                    navigate(`/fournisseur/${supplier.accessSlug}`);
                 }
              }} 
              className="flex items-center gap-3 text-slate-400 hover:text-red-400 px-4 py-3 w-full transition"
            >
              <LogOut size={20}/> Déconnexion
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-4 lg:p-8">
          <Outlet context={{ supplier, financialStats }} />
        </main>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-16 bg-slate-900 border-b border-slate-800 z-40 p-4"
          >
             {/* Navigation mobile items here if needed */}
             <div className="grid gap-2">
               {/* Mobile links similar to sidebar */}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierLayout;