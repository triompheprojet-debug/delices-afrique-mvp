import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { 
  Wallet, TrendingUp, Send, Clock, CheckCircle, 
  AlertTriangle, History, DollarSign, FileText, Package,
  ArrowUpRight, ArrowDownRight, Info, Truck, PieChart
} from 'lucide-react';

const SupplierWallet = () => {
  const { supplier, realTimeDebt } = useOutletContext();
  
  const [orders, setOrders] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CHARGEMENT DES DONNÉES
  useEffect(() => {
    if (!supplier?.id) return;

    // ✅ Récupérer TOUTES les commandes (pas seulement Livré/Terminé)
    const qOrders = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplier.id),
      orderBy('createdAt', 'desc')
    );

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(loadedOrders);
      setLoading(false);
    });

    const qSettlements = query(
      collection(db, 'settlements'),
      where('supplierId', '==', supplier.id),
      orderBy('createdAt', 'desc')
    );

    const unsubSettlements = onSnapshot(qSettlements, (snapshot) => {
      setSettlements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOrders();
      unsubSettlements();
    };
  }, [supplier?.id]);

  // CALCULS FINANCIERS DÉTAILLÉS
  const stats = useMemo(() => {
    let supplierProductEarnings = 0;  // Gains sur produits
    let totalSales = 0;                // Total des ventes
    let deliveryEarnings = 0;          // Gains sur livraisons (90%)
    let platformDeliveryShare = 0;     // Part plateforme livraison (10%)
    let unpaidOrders = 0;
    let paidOrders = 0;
    let deliveredOrders = 0;           // Commandes livrées/terminées

    orders.forEach(order => {
      const items = order.items || [];
      const deliveryCost = Number(order.details?.deliveryFee || 0);
      const status = order.status;
      const isDelivered = status === 'Livré' || status === 'Terminé';
      
      if (isDelivered) {
        deliveredOrders++;
        
        // Calcul par item
        items.forEach(item => {
          // ✅ Gère buyingPrice ET supplierPrice (compatibilité migration)
          const buyingPrice = Number(item.buyingPrice || item.supplierPrice || 0);
          const sellingPrice = Number(item.price || 0);
          const quantity = Number(item.quantity || 0);
          
          supplierProductEarnings += buyingPrice * quantity;
          totalSales += sellingPrice * quantity;
        });
        
        // Part livraison (90% pour fournisseur, 10% pour plateforme)
        const supplierDeliveryShare = deliveryCost * 0.9;
        const platformDeliveryPart = deliveryCost * 0.1;
        
        deliveryEarnings += supplierDeliveryShare;
        platformDeliveryShare += platformDeliveryPart;

        // Compter payé/non payé
        if (order.settlementStatus !== 'paid') {
          unpaidOrders++;
        } else {
          paidOrders++;
        }
      }
    });

    // Calcul de la marge plateforme sur produits
    const platformProductShare = totalSales - supplierProductEarnings;
    
    // Total des gains fournisseur (produits + livraisons)
    const totalSupplierEarnings = supplierProductEarnings + deliveryEarnings;
    
    // Total part plateforme (produits + livraisons)
    const totalPlatformShare = platformProductShare + platformDeliveryShare;

    return {
      platformDebt: realTimeDebt || 0,
      supplierProductEarnings,           // Gains produits uniquement
      deliveryEarnings,                   // Gains livraison uniquement
      totalSupplierEarnings,              // Total gains fournisseur
      totalSales,                         // Total ventes
      platformProductShare,               // Marge plateforme produits
      platformDeliveryShare,              // Part plateforme livraison
      totalPlatformShare,                 // Total part plateforme
      unpaidOrders,
      paidOrders,
      deliveredOrders,
      totalOrders: orders.length
    };
  }, [orders, realTimeDebt]);

  // DÉCLARATION DE PAIEMENT
  const handleDeclarePayment = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim() || stats.platformDebt <= 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'settlements'), {
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: stats.platformDebt,
        transactionRef: transactionRef.toUpperCase(),
        status: 'pending',
        createdAt: serverTimestamp(),
        type: 'settlement',
        context: 'manual_payment'
      });

      setTransactionRef('');
      setActiveTab('history');
      
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingSettlement = settlements.some(s => s.status === 'pending');

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 pb-24">
      
      {/* EN-TÊTE */}
      <div className="bg-gradient-to-r from-brand-brown to-gray-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Finances</h1>
            <p className="text-gray-300 text-sm">Gestion de vos revenus et paiements</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <Wallet size={40} className="opacity-90"/>
          </div>
        </div>
        
        {/* STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-xs text-gray-300 mb-1">Total commandes</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-xs text-gray-300 mb-1">Livrées</p>
            <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-xs text-gray-300 mb-1">Non réglées</p>
            <p className="text-2xl font-bold text-orange-300">{stats.unpaidOrders}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-xs text-gray-300 mb-1">Réglées</p>
            <p className="text-2xl font-bold text-green-300">{stats.paidOrders}</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION PAR ONGLETS */}
      <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
          { id: 'pay', label: 'Régulariser', icon: Send },
          { id: 'history', label: 'Historique', icon: History },
          { id: 'details', label: 'Détails', icon: FileText }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-brand-brown to-gray-700 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <tab.icon size={16}/>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENU DES ONGLETS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* ONGLET: VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            
            {/* CARTES PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DETTE À REVERSER */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border-2 border-red-200 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-5">
                  <AlertTriangle size={120}/>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="text-red-600" size={20}/>
                    <p className="text-sm font-bold text-red-700 uppercase tracking-wide">À reverser</p>
                  </div>
                  <p className="text-5xl font-bold text-red-700 mb-2">
                    {stats.platformDebt.toLocaleString()}
                  </p>
                  <p className="text-sm text-red-600 mb-4">FCFA à payer à la plateforme</p>
                  
                  {stats.platformDebt > 0 && (
                    <button 
                      onClick={() => setActiveTab('pay')}
                      className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={16}/>
                      Régulariser maintenant
                    </button>
                  )}
                </div>
              </div>

              {/* MES GAINS */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-5">
                  <TrendingUp size={120}/>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownRight className="text-green-600" size={20}/>
                    <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Mes gains</p>
                  </div>
                  <p className="text-5xl font-bold text-green-700 mb-2">
                    {stats.totalSupplierEarnings.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mb-4">FCFA de revenus cumulés</p>
                  
                  {/* Détail des gains */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white/50 p-2 rounded-lg">
                      <p className="text-xs text-green-700">Produits</p>
                      <p className="font-bold text-green-800">{stats.supplierProductEarnings.toLocaleString()} F</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded-lg">
                      <p className="text-xs text-green-700">Livraisons</p>
                      <p className="font-bold text-green-800">{stats.deliveryEarnings.toLocaleString()} F</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RÉPARTITION DÉTAILLÉE */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info size={18}/>
                Répartition des revenus
              </h3>
              
              <div className="space-y-4">
                {/* Total ventes */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      Σ
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Total des ventes</p>
                      <p className="text-xs text-gray-600">Montant total payé par les clients</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalSales.toLocaleString()} F
                  </p>
                </div>

                {/* Gains produits */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Package className="text-green-600" size={20}/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Vos gains sur produits</p>
                      <p className="text-xs text-gray-500">Prix d'achat de vos articles vendus</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {stats.supplierProductEarnings.toLocaleString()} F
                  </p>
                </div>

                {/* Gains livraison */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Truck className="text-blue-600" size={20}/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Vos gains sur livraisons</p>
                      <p className="text-xs text-gray-500">90% des frais de livraison</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {stats.deliveryEarnings.toLocaleString()} F
                  </p>
                </div>

                {/* Part plateforme */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <DollarSign className="text-red-600" size={20}/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Part plateforme</p>
                      <p className="text-xs text-gray-500">Marge produits + 10% livraisons</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-red-600">
                    {stats.totalPlatformShare.toLocaleString()} F
                  </p>
                </div>
              </div>

              {/* Vérification totale */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-800">
                  <strong>Vérification :</strong> {stats.totalSupplierEarnings.toLocaleString()} (vous) + {stats.totalPlatformShare.toLocaleString()} (plateforme) = {(stats.totalSupplierEarnings + stats.totalPlatformShare).toLocaleString()} FCFA (total ventes)
                </p>
              </div>
            </div>

            {/* INFO IMPORTANTE */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={20}/>
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">Comment sont calculés vos gains ?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Vous gardez 100% du prix d'achat de vos produits</li>
                    <li>• Vous gardez 90% des frais de livraison</li>
                    <li>• La plateforme prend la marge sur les produits + 10% des livraisons</li>
                    <li>• Seules les commandes livrées/terminées sont comptabilisées</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET: PAYER */}
        {activeTab === 'pay' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-bold text-xl text-gray-800 mb-2">Déclarer un transfert</h3>
              <p className="text-gray-600 text-sm">Envoyez les fonds par Mobile Money puis entrez la référence de transaction.</p>
            </div>

            {hasPendingSettlement ? (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock size={36} className="text-yellow-600"/>
                </div>
                <h4 className="font-bold text-yellow-900 text-2xl mb-2">Vérification en cours</h4>
                <p className="text-yellow-800 mb-4">
                  Un paiement est déjà en attente de validation par l'administrateur.
                </p>
                <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Dès qu'il sera validé, votre dette sera remise à zéro et votre espace sera débloqué en fin de journée.
                  </p>
                </div>
              </div>
            ) : stats.platformDebt > 0 ? (
              <div className="max-w-lg mx-auto space-y-6">
                
                {/* MONTANT */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 text-center">
                  <p className="text-sm text-blue-700 mb-2 font-bold uppercase tracking-wide">Montant à transférer</p>
                  <p className="text-5xl font-bold text-blue-900 mb-1">{stats.platformDebt.toLocaleString()}</p>
                  <p className="text-lg font-bold text-blue-700">FCFA</p>
                </div>

                {/* FORMULAIRE */}
                <form onSubmit={handleDeclarePayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">
                      Référence de transaction Mobile Money
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: MP240128.1234.A56789" 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl font-mono text-base focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/20 outline-none transition-all"
                      value={transactionRef} 
                      onChange={(e) => setTransactionRef(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Saisissez exactement l'ID fourni par votre opérateur après le transfert.
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="animate-spin" size={20}/>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20}/>
                        Confirmer le transfert
                      </>
                    )}
                  </button>
                </form>

                {/* AVERTISSEMENT */}
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18}/>
                    <div className="text-sm text-orange-800">
                      <p className="font-bold mb-1">Attention</p>
                      <p>Vérifiez bien le montant et la référence. Un justificatif erroné retardera le traitement de votre demande.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} className="text-green-600"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Tout est en ordre !</h3>
                <p className="text-gray-600">Vous n'avez aucune dette envers la plateforme actuellement.</p>
              </div>
            )}
          </div>
        )}

        {/* ONGLET: HISTORIQUE */}
        {activeTab === 'history' && (
          <div>
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <History size={20}/>
                Historique des paiements
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Référence</th>
                    <th className="p-4 text-right font-bold">Montant</th>
                    <th className="p-4 text-center font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.length > 0 ? (
                    settlements.map((settlement) => (
                      <tr key={settlement.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-700">
                          {settlement.createdAt?.seconds 
                            ? new Date(settlement.createdAt.seconds * 1000).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '---'}
                        </td>
                        <td className="p-4">
                          <code className="text-sm font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                            {settlement.transactionRef}
                          </code>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-base font-bold text-gray-800">
                            {Number(settlement.amount || settlement.amountDeclared || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">FCFA</span>
                        </td>
                        <td className="p-4 text-center">
                          {settlement.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
                              <Clock size={14}/>
                              En attente
                            </span>
                          )}
                          {settlement.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                              <CheckCircle size={14}/>
                              Validé
                            </span>
                          )}
                          {settlement.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                              <AlertTriangle size={14}/>
                              Rejeté
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-16 text-center">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300"/>
                        <p className="text-gray-400 font-medium">Aucun historique de paiement disponible.</p>
                        <p className="text-sm text-gray-400 mt-1">Vos futurs paiements apparaîtront ici.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONGLET: DÉTAILS COMMANDES */}
        {activeTab === 'details' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20}/>
              Détail de toutes les commandes livrées
            </h3>
            
            {orders.filter(o => o.status === 'Livré' || o.status === 'Terminé').length > 0 ? (
              <div className="space-y-3">
                {orders
                  .filter(o => o.status === 'Livré' || o.status === 'Terminé')
                  .map(order => {
                    const items = order.items || [];
                    let supplierGain = 0;
                    let platformShare = 0;
                    
                    items.forEach(item => {
                      // ✅ Gère buyingPrice ET supplierPrice
                      const buyingPrice = Number(item.buyingPrice || item.supplierPrice || 0);
                      const sellingPrice = Number(item.price || 0);
                      const quantity = Number(item.quantity || 0);
                      
                      supplierGain += buyingPrice * quantity;
                      platformShare += (sellingPrice - buyingPrice) * quantity;
                    });
                    
                    const deliveryCost = Number(order.details?.deliveryFee || 0);
                    const supplierDeliveryGain = deliveryCost * 0.9;
                    const platformDeliveryGain = deliveryCost * 0.1;
                    
                    return (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-mono font-bold text-gray-800">#{order.code}</p>
                            <p className="text-xs text-gray-500">
                              {order.createdAt?.seconds 
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                                : '---'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.settlementStatus === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.settlementStatus === 'paid' ? 'Réglée' : 'Non réglée'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600 mb-1">Vos gains totaux</p>
                            <p className="font-bold text-green-700">{(supplierGain + supplierDeliveryGain).toLocaleString()} F</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-xs text-red-600 mb-1">Part plateforme</p>
                            <p className="font-bold text-red-700">{(platformShare + platformDeliveryGain).toLocaleString()} F</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Frais livraison</p>
                            <p className="font-bold text-blue-700">{deliveryCost.toLocaleString()} F</p>
                          </div>
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Total client</p>
                            <p className="font-bold text-gray-800">{(order.details?.finalTotal || 0).toLocaleString()} F</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package size={48} className="mx-auto mb-4 text-gray-300"/>
                <p className="text-gray-400">Aucune commande livrée pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierWallet;