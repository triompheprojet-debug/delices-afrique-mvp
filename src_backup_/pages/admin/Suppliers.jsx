import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, addDoc, onSnapshot, doc, updateDoc, 
  query, orderBy, serverTimestamp, writeBatch, where, getDocs 
} from 'firebase/firestore';
import { 
  Users, Phone, CheckCircle, XCircle, 
  Clock, DollarSign, History, ShieldCheck, AlertCircle, 
  ExternalLink, Ban, Check
} from 'lucide-react';

const SuppliersAdmin = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // CHARGEMENT DES DONNÉES
  useEffect(() => {
    const qSup = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'));
    const unsubSup = onSnapshot(qSup, (snap) => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const qSet = query(collection(db, 'settlements'), orderBy('createdAt', 'desc'));
    const unsubSet = onSnapshot(qSet, (snap) => {
      setSettlements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubSup(); unsubSet(); };
  }, []);

  // CRÉER UN NOUVEAU FOURNISSEUR
  const handleCreate = async (e) => {
    e.preventDefault();
    
    const slug = Math.random().toString(36).substring(2, 15);
    const supplierCode = 'SUP-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await addDoc(collection(db, 'suppliers'), {
      ...formData,
      accessSlug: slug,
      supplierCode,
      tempPassword,
      status: 'active',
      wallet: {
        platformDebt: 0,
        totalEarned: 0
      },
      createdAt: serverTimestamp()
    });
    
    setFormData({ name: '', phone: '' });
    setIsModalOpen(false);
  };

  // VALIDER UN PAIEMENT - VERSION CORRIGÉE
  const handleApproveSettlement = async (settlement) => {
    const settlementAmount = settlement.amount || settlement.amountDeclared || 0;
    
    if (!window.confirm(
      `Confirmer la réception de ${Number(settlementAmount).toLocaleString()} FCFA ?\n\n` +
      `Cette action va :\n` +
      `• Valider le paiement\n` +
      `• Marquer toutes les commandes comme réglées\n` +
      `• Remettre la dette du fournisseur à 0\n\n` +
      `Cette opération est irréversible.`
    )) return;

    try {
      console.log('🔄 Début validation settlement:', settlement.id);
      
      // ÉTAPE 1 : Récupérer TOUTES les commandes du fournisseur livrées/terminées
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('supplierId', '==', settlement.supplierId),
        where('status', 'in', ['Livré', 'Terminé'])
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`📦 ${querySnapshot.size} commandes trouvées`);
      
      // Filtrer côté client celles non payées
      const unpaidOrders = [];
      querySnapshot.forEach((orderDoc) => {
        const order = orderDoc.data();
        if (order.settlementStatus !== 'paid') {
          unpaidOrders.push({ id: orderDoc.id, ...order });
        }
      });
      
      console.log(`💰 ${unpaidOrders.length} commandes non payées à marquer`);

      // ÉTAPE 2 : Batch update
      const batch = writeBatch(db);

      // 2.1 - Marquer le settlement comme approuvé
      const settlementRef = doc(db, 'settlements', settlement.id);
      batch.update(settlementRef, { 
        status: 'approved',
        validatedAt: serverTimestamp(),
        validatedBy: 'admin',
        processedOrders: unpaidOrders.length
      });

      // 2.2 - Marquer toutes les commandes non payées comme "paid"
      unpaidOrders.forEach((order) => {
        const orderRef = doc(db, 'orders', order.id);
        batch.update(orderRef, {
          settlementStatus: 'paid',
          settlementId: settlement.id,
          paidAt: serverTimestamp()
        });
      });

      // 2.3 - Remettre la dette à 0
      const supplierRef = doc(db, 'suppliers', settlement.supplierId);
      batch.update(supplierRef, {
        'wallet.platformDebt': 0,
        'wallet.lastDebtReset': serverTimestamp(),
        lastSettlementAt: serverTimestamp()
      });

      // ÉTAPE 3 : Commit le batch
      await batch.commit();
      
      console.log('✅ Validation terminée avec succès');
      alert(
        `✅ Paiement validé avec succès !\n\n` +
        `• ${unpaidOrders.length} commandes marquées comme réglées\n` +
        `• Dette remise à 0\n` +
        `• Fournisseur débloqué`
      );
            
    } catch (error) {
      console.error("❌ Erreur validation:", error);
      alert(`❌ Erreur technique lors de la validation.\n\n${error.message}`);
    }
  };

  // REJETER UN PAIEMENT
  const handleRejectSettlement = async (settlement) => {
    const reason = prompt(
      "Pourquoi rejetez-vous ce paiement ?\n\n" +
      "Le fournisseur recevra cette explication."
    );
    
    if (!reason || !reason.trim()) return;

    try {
      await updateDoc(doc(db, 'settlements', settlement.id), { 
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason.trim()
      });
      
      alert("❌ Paiement rejeté.\nLe fournisseur devra soumettre un nouveau justificatif.");
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert("Erreur lors du rejet.");
    }
  };

  // BLOQUER/DÉBLOQUER UN FOURNISSEUR
  const handleToggleStatus = async (supplierId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    if (!window.confirm(
      newStatus === 'suspended' 
        ? "Suspendre ce fournisseur ? Il ne pourra plus accéder à son espace." 
        : "Réactiver ce fournisseur ?"
    )) return;

    try {
      await updateDoc(doc(db, 'suppliers', supplierId), {
        status: newStatus,
        statusChangedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur changement statut:", error);
      alert("Erreur lors du changement de statut.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-brand-brown rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-brand-brown" size={32}/> 
            Gestion Fournisseurs
          </h1>
          <p className="text-gray-500 text-sm mt-1">Contrôle des accès et validation des paiements</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'list' 
                ? 'bg-gradient-to-r from-brand-brown to-gray-700 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={16} className="inline mr-2"/>
            Comptes ({suppliers.length})
          </button>
          <button 
            onClick={() => setActiveTab('finances')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'finances' 
                ? 'bg-gradient-to-r from-brand-brown to-gray-700 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <DollarSign size={16} className="inline mr-2"/>
            Paiements ({settlements.filter(s => s.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* ONGLET: LISTE DES COMPTES */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-gradient-to-r from-brand-brown to-gray-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Users size={20}/>
            Nouveau Fournisseur
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(sup => {
              const debt = sup.wallet?.platformDebt || 0;
              const totalEarned = sup.wallet?.totalEarned || 0;
              
              return (
                <div key={sup.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  
                  {/* EN-TÊTE */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{sup.name}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Phone size={12}/> {sup.phone}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase shadow-sm ${
                      sup.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {sup.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </div>
                  
                  {/* IDENTIFIANTS */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl mb-4 space-y-2 border border-gray-200">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Code fournisseur</p>
                      <code className="text-sm text-brand-brown font-mono font-bold">{sup.supplierCode}</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Mot de passe temporaire</p>
                      <code className="text-sm text-gray-700 font-mono font-bold">{sup.tempPassword}</code>
                    </div>
                  </div>

                  {/* FINANCES */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-[10px] text-red-600 uppercase font-bold mb-1">Dette</p>
                      <p className="text-lg font-bold text-red-700">{debt.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Gains</p>
                      <p className="text-lg font-bold text-green-700">{totalEarned.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* LIEN D'ACCÈS */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                    <p className="text-[10px] text-blue-600 uppercase font-bold mb-2">Lien d'accès</p>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] text-blue-900 break-all flex-1 font-mono">
                        /fournisseur/{sup.accessSlug}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/fournisseur/${sup.accessSlug}`);
                          alert('Lien copié !');
                        }}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shrink-0"
                        title="Copier le lien"
                      >
                        <ExternalLink size={14}/>
                      </button>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleStatus(sup.id, sup.status)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        sup.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {sup.status === 'active' ? (
                        <>
                          <Ban size={14}/>
                          Suspendre
                        </>
                      ) : (
                        <>
                          <Check size={14}/>
                          Activer
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => window.open(`/fournisseur/${sup.accessSlug}`, '_blank')}
                      className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                      title="Voir l'espace fournisseur"
                    >
                      <ExternalLink size={16}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ONGLET: TRANSACTIONS / FINANCES */}
      {activeTab === 'finances' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <DollarSign size={24}/>
                  Validation des Paiements
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {settlements.filter(s => s.status === 'pending').length} paiement(s) en attente de validation
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-bold">Fournisseur</th>
                  <th className="p-4 font-bold">Référence & Date</th>
                  <th className="p-4 font-bold text-right">Montant</th>
                  <th className="p-4 font-bold text-center">Statut</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.map(set => {
                  const settlementAmount = set.amount || set.amountDeclared || 0;
                  
                  return (
                    <tr key={set.id} className={`hover:bg-gray-50 transition-colors ${
                      set.status === 'pending' ? 'bg-yellow-50/50' : ''
                    }`}>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-800">{set.supplierName}</p>
                        <p className="text-xs text-gray-500 font-mono">{set.supplierId?.substring(0, 8)}...</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <code className="text-sm font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                            {set.transactionRef}
                          </code>
                          <p className="text-xs text-gray-500">
                            {set.createdAt?.seconds 
                              ? new Date(set.createdAt.seconds * 1000).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '---'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {Number(settlementAmount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">FCFA</p>
                      </td>
                      <td className="p-4 text-center">
                        {set.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
                            <Clock size={14}/>
                            EN ATTENTE
                          </span>
                        )}
                        {set.status === 'approved' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                            <CheckCircle size={14}/>
                            VALIDÉ
                          </span>
                        )}
                        {set.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                            <XCircle size={14}/>
                            REJETÉ
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {set.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApproveSettlement(set)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm font-bold"
                              title="Valider le paiement"
                            >
                              <CheckCircle size={16}/>
                              Valider
                            </button>
                            <button 
                              onClick={() => handleRejectSettlement(set)}
                              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 text-sm font-bold"
                              title="Rejeter le paiement"
                            >
                              <XCircle size={16}/>
                              Rejeter
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                            {set.status === 'approved' && (
                              <>
                                <CheckCircle size={14} className="text-green-500"/>
                                {set.processedOrders && `${set.processedOrders} cmd réglées`}
                              </>
                            )}
                            {set.status === 'rejected' && set.rejectionReason && (
                              <span className="text-red-600 italic" title={set.rejectionReason}>
                                Raison: {set.rejectionReason.substring(0, 20)}...
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {settlements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <History size={56} className="mx-auto mb-4 text-gray-300"/>
                      <p className="text-gray-400 font-medium text-lg">Aucune transaction enregistrée</p>
                      <p className="text-sm text-gray-400 mt-2">Les paiements des fournisseurs apparaîtront ici.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
            <h3 className="font-bold text-2xl mb-6 text-gray-800 flex items-center gap-2">
              <Users className="text-brand-brown"/>
              Nouveau Fournisseur
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-2 block tracking-wide">
                  Nom de l'entreprise
                </label>
                <input 
                  required 
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/20 outline-none transition-all text-base" 
                  placeholder="Ex: Boulangerie Martin"
                  value={formData.name} 
                  onChange={e=>setFormData({...formData, name:e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-2 block tracking-wide">
                  Numéro de téléphone
                </label>
                <input 
                  required 
                  type="tel"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/20 outline-none transition-all text-base" 
                  placeholder="Ex: 06 123 45 67"
                  value={formData.phone} 
                  onChange={e=>setFormData({...formData, phone:e.target.value})}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                  Un code fournisseur et un mot de passe temporaire seront générés automatiquement.
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={()=>setIsModalOpen(false)} 
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-brand-brown to-gray-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersAdmin;