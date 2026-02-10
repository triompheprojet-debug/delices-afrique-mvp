import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, addDoc, serverTimestamp, 
  getDocs, updateDoc, doc 
} from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';
import { Lock, Send, AlertTriangle, Clock, Loader, RefreshCw, Wallet } from 'lucide-react';

const SupplierLayout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isClosedForNight, config, loading: configLoading } = useConfig();
  
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSettlement, setPendingSettlement] = useState(null);
  const [realTimeDebt, setRealTimeDebt] = useState(0);
  
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Référence pour éviter le recalcul pendant la validation
  const isValidating = useRef(false);

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
        
        // ✅ Utiliser directement la dette de Firestore si elle vient d'être mise à 0
        const firestoreDebt = supData.wallet?.platformDebt || 0;
        if (firestoreDebt === 0 && realTimeDebt > 0) {
          console.log('✅ Dette remise à 0 par l\'admin, mise à jour locale');
          setRealTimeDebt(0);
          isValidating.current = false;
        }
        
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

  // 2. CALCUL TEMPS RÉEL DE LA DETTE
  useEffect(() => {
    if (!supplier?.id) return;

    const calculateDebt = async () => {
      // ✅ NE PAS RECALCULER si en cours de validation
      if (isValidating.current) {
        console.log('⏸️ Validation en cours, recalcul ignoré');
        return;
      }

      try {
        const qOrders = query(
          collection(db, 'orders'),
          where('supplierId', '==', supplier.id),
          where('status', 'in', ['Livré', 'Terminé'])
        );
        
        const snapshot = await getDocs(qOrders);
        let totalDebt = 0;

        snapshot.forEach((doc) => {
          const order = doc.data();
          
          // ✅ Ignorer les commandes déjà payées
          if (order.settlementStatus === 'paid') return;

          const items = order.items || [];
          
          items.forEach(item => {
            const buyingPrice = Number(item.buyingPrice || item.supplierPrice || 0);
            const sellingPrice = Number(item.price || 0);
            const quantity = Number(item.quantity || 0);
            
            const productMargin = (sellingPrice - buyingPrice) * quantity;
            totalDebt += productMargin;
          });

          const deliveryFee = Number(order.details?.deliveryFee || 0);
          totalDebt += deliveryFee * 0.1;
        });

        console.log('📊 Dette calculée:', totalDebt);
        setRealTimeDebt(totalDebt);

        // ✅ Mise à jour Firestore SEULEMENT si différent
        const currentFirestoreDebt = supplier.wallet?.platformDebt || 0;
        if (Math.abs(totalDebt - currentFirestoreDebt) > 0.01) {
          const supplierRef = doc(db, 'suppliers', supplier.id);
          await updateDoc(supplierRef, {
            'wallet.platformDebt': totalDebt,
            'wallet.lastDebtUpdate': serverTimestamp()
          });
          console.log('💾 Dette mise à jour dans Firestore:', totalDebt);
        }

      } catch (error) {
        console.error("Erreur calcul dette:", error);
      }
    };

    calculateDebt();

    // ✅ Recalculer SEULEMENT quand une commande change de statut
    const qOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id)
    );
    
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      // Vérifier si une commande a changé de settlementStatus
      const hasStatusChange = snapshot.docChanges().some(change => {
        if (change.type === 'modified') {
          const oldData = change.doc.metadata.hasPendingWrites ? null : change.doc.data();
          return oldData && oldData.settlementStatus !== change.doc.data().settlementStatus;
        }
        return false;
      });

      if (hasStatusChange) {
        console.log('🔄 Changement de statut détecté, recalcul');
        calculateDebt();
      }
    });

    return () => unsubOrders();
  }, [supplier?.id]);

  // 3. ÉCOUTE DES SETTLEMENTS EN ATTENTE
  useEffect(() => {
    if (!supplier?.id) return;

    const qSettlements = query(
      collection(db, 'settlements'),
      where('supplierId', '==', supplier.id),
      where('status', '==', 'pending')
    );
    
    const unsubSettlements = onSnapshot(qSettlements, (sSnap) => {
      if (!sSnap.empty) {
        const settlements = sSnap.docs.map(d => ({id: d.id, ...d.data()}));
        settlements.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setPendingSettlement(settlements[0]);
        
        // ✅ Marquer comme en cours de validation
        isValidating.current = true;
      } else {
        setPendingSettlement(null);
        
        // ✅ Validation terminée, autoriser les recalculs
        if (isValidating.current) {
          console.log('✅ Validation terminée');
          isValidating.current = false;
        }
      }
    }, (error) => {
      console.error("Erreur écoute settlements:", error);
      setPendingSettlement(null);
    });
    
    return () => unsubSettlements();
  }, [supplier?.id]);

  // 4. ENVOI PAIEMENT DE FIN DE JOURNÉE
  const handleEndOfDayPayment = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    setIsSubmitting(true);

    try {
      const qUnpaid = query(
        collection(db, 'orders'),
        where('supplierId', '==', supplier.id),
        where('status', 'in', ['Livré', 'Terminé'])
      );
      const snapshot = await getDocs(qUnpaid);
      const orderIds = snapshot.docs
        .map(d => ({id: d.id, ...d.data()}))
        .filter(o => o.settlementStatus !== 'paid')
        .map(o => o.id);

      await addDoc(collection(db, "settlements"), {
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: realTimeDebt,
        transactionRef: transactionId.trim().toUpperCase(),
        status: 'pending',
        createdAt: serverTimestamp(),
        orderIds: orderIds, 
        context: 'end_of_day_blocking',
        type: 'settlement'
      });
      
      setTransactionId('');
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ÉCRAN DE CHARGEMENT
  if (loading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader className="text-white animate-spin mx-auto mb-4" size={48}/>
          <p className="text-white text-sm animate-pulse">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // LIEN INVALIDE
  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-6">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border-2 border-red-200 max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-600"/>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-3">Lien Invalide</h1>
          <p className="text-gray-600 mb-6">
            Ce lien d'accès fournisseur n'existe pas ou a été désactivé.
          </p>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-sm text-red-700">
              Vérifiez votre lien ou contactez l'administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // BLOCAGE ADMIN MANUEL
  if (supplier.status === 'suspended' || supplier.status === 'blocked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border-2 border-red-200 max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-red-600"/>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-3">Compte Suspendu</h1>
          <p className="text-gray-600 mb-6">
            Votre accès a été temporairement bloqué par l'administrateur.
          </p>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-sm text-red-700">
              Pour toute question, contactez l'administration au <strong>{config.phoneNumber}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ BLOCAGE FIN DE JOURNÉE
  const isLoginPage = location.pathname.endsWith(slug) || location.pathname.endsWith(`${slug}/`);
  
  if (isClosedForNight && realTimeDebt > 0 && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          
          <div className="bg-gradient-to-r from-brand-brown to-gray-800 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            <div className="relative z-10">
              <Clock size={48} className="mx-auto mb-4 opacity-90"/>
              <h1 className="text-3xl font-serif font-bold mb-2">Fermeture Journalière</h1>
              <p className="text-orange-100 text-sm">
                Il est {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - 
                La plateforme est fermée après {config.closingTime}
              </p>
            </div>
          </div>

          <div className="p-8">
            {pendingSettlement ? (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-200 shadow-inner">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <RefreshCw className="text-yellow-600 animate-spin" size={36}/>
                  </div>
                  <h3 className="font-bold text-yellow-900 text-2xl mb-2">Paiement Envoyé !</h3>
                  <p className="text-yellow-700 mb-4">
                    Votre justificatif a été transmis avec succès.
                  </p>
                  
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Référence de transaction</p>
                    <p className="font-mono font-bold text-lg text-gray-800">{pendingSettlement.transactionRef}</p>
                  </div>
                  
                  <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-center gap-2 text-yellow-800 mb-2">
                      <Clock size={16}/>
                      <span className="font-bold text-sm">En attente de validation</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      L'administrateur vérifiera votre paiement. Votre espace se débloquera automatiquement après validation.
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">Montant déclaré</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {(pendingSettlement.amount || 0).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border-2 border-red-100">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Wallet className="text-red-600" size={24}/>
                    <p className="text-sm font-bold uppercase text-red-600 tracking-wide">Dette à régulariser</p>
                  </div>
                  <p className="text-5xl font-bold text-red-700 mb-2">{realTimeDebt.toLocaleString()}</p>
                  <p className="text-2xl font-bold text-red-600">FCFA</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 mb-1">Effectuez le transfert</p>
                      <p className="text-sm text-blue-700">
                        Envoyez exactement <strong>{realTimeDebt.toLocaleString()} FCFA</strong> par Mobile Money au numéro :
                      </p>
                      <p className="font-mono font-bold text-lg text-blue-900 mt-2 bg-white px-3 py-2 rounded-lg border border-blue-200">
                        {config.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900 mb-3">Saisissez l'ID de transaction</p>
                      
                      <form onSubmit={handleEndOfDayPayment} className="space-y-3">
                        <input 
                          required
                          type="text" 
                          placeholder="Ex: MP240128.1234.A56789"
                          className="w-full p-4 border-2 border-green-300 rounded-xl text-center font-mono uppercase text-base focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                          value={transactionId}
                          onChange={e => setTransactionId(e.target.value)}
                        />
                        
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="animate-spin" size={20}/>
                              Envoi en cours...
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

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={20}/>
                    <div className="text-sm text-orange-800">
                      <p className="font-bold mb-1">Important</p>
                      <p>Assurez-vous que le montant et le numéro sont corrects. Un justificatif invalide retardera le déblocage de votre compte.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACCÈS AUTORISÉ
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-brand-brown to-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">
              FOURNISSEUR
            </div>
            <span className="font-bold text-gray-800 truncate text-lg">{supplier.name}</span>
          </div>
          
          {realTimeDebt > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <AlertTriangle size={16} className="text-red-600"/>
              <span className="text-sm font-bold text-red-600">
                Dette: {realTimeDebt.toLocaleString()} F
              </span>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto p-4">
        <Outlet context={{ supplier, realTimeDebt }} />
      </main>
    </div>
  );
};

export default SupplierLayout;