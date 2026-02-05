import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, orderBy, query, increment } from 'firebase/firestore';
import { 
  Users, Wallet, Settings, Search, CheckCircle, XCircle, 
  AlertTriangle, TrendingUp, Eye, Shield, Lock, Filter,
  FileText, DollarSign, Activity, X, BarChart3, Tag
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { motion, AnimatePresence } from 'framer-motion';

const PartnersAdmin = () => {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState('overview'); // overview, partners, payouts, codes, rules
  
  const [partners, setPartners] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [orders, setOrders] = useState([]); // Nécessaire pour les stats globales
  const [loading, setLoading] = useState(true);

  // État pour la Modale "Détail Partenaire"
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerDetailTab, setPartnerDetailTab] = useState('info'); // info, sales, history
  
  // État pour la configuration
  const [rulesForm, setRulesForm] = useState(config.partnerRules || {});

  // 1. CHARGEMENT DONNÉES
  useEffect(() => {
    const unsubPartners = onSnapshot(query(collection(db, "partners"), orderBy("createdAt", "desc")), (snap) => {
      setPartners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubWithdrawals = onSnapshot(query(collection(db, "withdrawals"), orderBy("createdAt", "desc")), (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => { unsubPartners(); unsubWithdrawals(); unsubOrders(); };
  }, []);

  // --- CALCULS FINANCIERS PLATEFORME (KPIs) ---
  const platformStats = useMemo(() => {
    let totalSalesVolume = 0; // CA total généré par les partenaires
    let totalCommissions = 0; // Commissions versées
    let platformNetGain = 0;  // Gain net plateforme

    orders.forEach(order => {
      if (order.promo?.partnerId && order.status === 'Livré') {
        totalSalesVolume += order.details.finalTotal;
        totalCommissions += (order.promo.partnerCommission || 0);
        
        // ✅ CORRECTION: Utiliser le platformGain calculé et stocké dans la commande
        // Ce gain a déjà été calculé selon les règles (baseMargin + surplus split)
        // Si platformGain n'existe pas encore (anciennes commandes), on fait le calcul basique
        if (order.promo.platformGain !== undefined) {
          platformNetGain += order.promo.platformGain;
        } else {
          // Fallback pour anciennes commandes (avant correction)
          const totalBuyingPrice = order.items.reduce((sum, item) => sum + ((item.buyingPrice || 0) * item.quantity), 0);
          const net = order.details.finalTotal - totalBuyingPrice - (order.promo.partnerCommission || 0);
          platformNetGain += net;
        }
      }
    });

    return { totalSalesVolume, totalCommissions, platformNetGain };
  }, [orders]);

  // --- ACTIONS PARTENAIRES ---
  const handleUpdateLevel = async (partnerId, newLevel) => {
    if(!window.confirm(`Changer le niveau vers ${newLevel} ?`)) return;
    await updateDoc(doc(db, "partners", partnerId), { level: newLevel });
  };

  const togglePartnerStatus = async (partner) => {
    const action = partner.isActive ? 'Suspendre' : 'Réactiver';
    if(!window.confirm(`${action} ce partenaire ?`)) return;
    await updateDoc(doc(db, "partners", partner.id), { isActive: !partner.isActive });
  };

  // --- ACTIONS PAIEMENTS ---
  const handleApproveWithdrawal = async (withdrawal) => {
    const ref = prompt("Entrez la référence de transaction (ID Mobile Money) :");
    if (ref === null) return; // Annulé

    try {
      await updateDoc(doc(db, "withdrawals", withdrawal.id), { 
        status: 'paid',
        transactionRef: ref,
        processedAt: new Date()
      });

      // Déduire du solde partenaire
      await updateDoc(doc(db, "partners", withdrawal.partnerId), {
        walletBalance: increment(-withdrawal.amount),
        totalWithdrawn: increment(withdrawal.amount)
      });
      alert("Paiement validé.");
    } catch (error) { console.error(error); alert("Erreur"); }
  };

  const handleRejectWithdrawal = async (withdrawal) => {
    const reason = prompt("Motif du refus (sera visible par le partenaire) :");
    if (!reason) return;
    await updateDoc(doc(db, "withdrawals", withdrawal.id), { status: 'rejected', note: reason, processedAt: new Date() });
  };

  // --- ACTIONS CONFIG ---
  const saveRules = async () => {
    if(!window.confirm("Modifier les règles financières ?")) return;
    await updateDoc(doc(db, "settings", "config"), { partnerRules: rulesForm });
    alert("Règles mises à jour.");
  };

  // --- HELPER : Ventes d'un partenaire spécifique ---
  const getPartnerOrders = (partnerId) => orders.filter(o => o.promo?.partnerId === partnerId);
  const getTopProducts = (partnerId) => {
    const pOrders = getPartnerOrders(partnerId);
    const productCounts = {};
    pOrders.forEach(order => {
      order.items.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
      });
    });
    return Object.entries(productCounts).sort((a,b) => b[1] - a[1]).slice(0, 3);
  };

  if (loading) return <div className="p-10 flex justify-center"><Activity className="animate-spin text-brand-brown"/></div>;

  return (
    <div className="pb-20 space-y-6">
      
      {/* HEADER & STATS PLATEFORME */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
             <Users className="text-brand-brown"/> Administration Partenaires
           </h1>
           <p className="text-gray-500 text-sm">Vue globale du programme d'affiliation.</p>
        </div>
        
        {/* CARTE GAIN PLATEFORME */}
        <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
           <div className="p-3 bg-white/10 rounded-lg"><TrendingUp size={24} className="text-green-400"/></div>
           <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gain Net Plateforme</p>
              <p className="text-2xl font-mono font-bold text-green-400">+{platformStats.platformNetGain.toLocaleString()} F</p>
           </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
          { id: 'partners', label: 'Partenaires', icon: Users },
          { id: 'payouts', label: 'Paiements', icon: Wallet },
          { id: 'codes', label: 'Codes Promo', icon: Tag },
          { id: 'rules', label: 'Configuration', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-lg transition ${
              activeTab === tab.id 
                ? 'bg-white border border-gray-200 border-b-white text-brand-brown -mb-px' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16}/> {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTENU DES ONGLETS --- */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        
        {/* 1. VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
             <StatBox label="Volume de Ventes Partenaires" value={platformStats.totalSalesVolume} icon={Activity} color="text-blue-600" bg="bg-blue-50"/>
             <StatBox label="Commissions Versées" value={platformStats.totalCommissions} icon={Wallet} color="text-orange-600" bg="bg-orange-50"/>
             <StatBox label="Nombre de Partenaires" value={partners.length} icon={Users} color="text-purple-600" bg="bg-purple-50"/>
          </div>
        )}

        {/* 2. LISTE PARTENAIRES */}
        {activeTab === 'partners' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Partenaire</th>
                  <th className="p-4">Niveau</th>
                  <th className="p-4 text-right">Ventes</th>
                  <th className="p-4 text-right">Gains Total</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 group">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{p.fullName}</div>
                      <div className="text-xs text-gray-500 font-mono">{p.promoCode} • {p.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        p.level === 'Premium' ? 'bg-amber-100 text-amber-700' :
                        p.level === 'Actif' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{p.level}</span>
                    </td>
                    <td className="p-4 text-right font-medium">{p.totalSales}</td>
                    <td className="p-4 text-right font-bold text-gray-800">{(p.totalEarnings || 0).toLocaleString()} F</td>
                    <td className="p-4 text-center">
                       {p.isActive 
                         ? <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Actif</span> 
                         : <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded">Suspendu</span>
                       }
                    </td>
                    <td className="p-4 text-right">
                       <button onClick={() => setSelectedPartner(p)} className="text-brand-brown hover:bg-brand-brown/10 p-2 rounded-lg transition font-bold text-xs flex items-center gap-1 ml-auto">
                         <Eye size={14}/> Voir Détail
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. PAIEMENTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            {withdrawals.length === 0 && <p className="text-center text-gray-400 py-10">Aucune demande de paiement.</p>}
            {withdrawals.map(w => (
              <div key={w.id} className={`flex flex-col md:flex-row justify-between items-center p-4 border rounded-xl ${w.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100 opacity-75'}`}>
                 <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className={`p-3 rounded-full ${w.status === 'pending' ? 'bg-yellow-200 text-yellow-700' : w.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       <DollarSign size={20}/>
                    </div>
                    <div>
                       <div className="font-bold text-gray-800">{w.amount.toLocaleString()} FCFA</div>
                       <div className="text-xs text-gray-500">
                          Pour: <strong>{w.partnerName}</strong> ({w.phone}) • {w.operator}
                       </div>
                       <div className="text-xs text-gray-400 mt-1">
                          Nom Mobile Money: <span className="font-mono bg-white px-1 rounded border">{w.recipientName}</span>
                       </div>
                    </div>
                 </div>
                 
                 {w.status === 'pending' ? (
                   <div className="flex gap-2">
                      <button onClick={() => handleRejectWithdrawal(w)} className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition">Refuser</button>
                      <button onClick={() => handleApproveWithdrawal(w)} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2">
                        <CheckCircle size={14}/> Valider Paiement
                      </button>
                   </div>
                 ) : (
                   <div className="text-right">
                      <span className={`text-xs font-bold uppercase ${w.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{w.status === 'paid' ? 'Payé' : 'Refusé'}</span>
                      {w.transactionRef && <div className="text-[10px] text-gray-400 font-mono">Ref: {w.transactionRef}</div>}
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}

        {/* 4. CODES PROMO */}
        {activeTab === 'codes' && (
           <div className="grid md:grid-cols-2 gap-4">
              {partners.map(p => (
                 <div key={p.id} className="border p-4 rounded-xl flex justify-between items-center hover:shadow-md transition bg-white">
                    <div>
                       <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-brand-brown tracking-wider">{p.promoCode}</span>
                          {!p.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Inactif</span>}
                       </div>
                       <p className="text-xs text-gray-500">Lié à : {p.fullName}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-400 uppercase font-bold">Utilisations</p>
                       <p className="font-bold text-xl">{p.totalSales}</p>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {/* 5. RÈGLES (CONFIG) */}
        {activeTab === 'rules' && (
           <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-sm flex gap-2">
                 <AlertTriangle className="shrink-0"/>
                 <p>Attention : Ces paramètres affectent le calcul des commissions pour <strong>toutes les futures commandes</strong>.</p>
              </div>
              
              <div className="space-y-4">
                 <h3 className="font-bold text-gray-800 border-b pb-2">Marges & Surplus</h3>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Marge de Base (Sécurité)</label>
                    <div className="flex items-center gap-2 mt-1">
                       <input type="number" value={rulesForm.baseMargin} onChange={e=>setRulesForm({...rulesForm, baseMargin: Number(e.target.value)})} className="border p-2 rounded-lg w-full font-bold"/>
                       <span className="text-gray-500 font-bold">FCFA</span>
                    </div>
                 </div>
                 
                 <h3 className="font-bold text-gray-800 border-b pb-2 pt-4">Répartition du Surplus</h3>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Plateforme</label>
                       <input type="number" step="0.1" value={rulesForm.surplusSplit?.platform} onChange={e=>setRulesForm({...rulesForm, surplusSplit: {...rulesForm.surplusSplit, platform: Number(e.target.value)}})} className="border p-2 rounded-lg w-full text-center font-bold"/>
                    </div>
                    <div className="text-center">
                       <label className="text-[10px] font-bold text-brand-brown uppercase">Partenaire</label>
                       <input type="number" step="0.1" value={rulesForm.surplusSplit?.partner} onChange={e=>setRulesForm({...rulesForm, surplusSplit: {...rulesForm.surplusSplit, partner: Number(e.target.value)}})} className="border p-2 rounded-lg w-full text-center font-bold text-brand-brown"/>
                    </div>
                    <div className="text-center">
                       <label className="text-[10px] font-bold text-green-600 uppercase">Client (Réduc)</label>
                       <input type="number" step="0.1" value={rulesForm.surplusSplit?.client} onChange={e=>setRulesForm({...rulesForm, surplusSplit: {...rulesForm.surplusSplit, client: Number(e.target.value)}})} className="border p-2 rounded-lg w-full text-center font-bold text-green-600"/>
                    </div>
                 </div>
                 <button onClick={saveRules} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition">Enregistrer Configuration</button>
              </div>
           </div>
        )}
      </div>

      {/* --- MODALE DÉTAIL PARTENAIRE (POP-UP) --- */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectedPartner(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
               
               {/* HEADER MODAL */}
               <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
                  <div className="flex gap-4">
                     <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold">{selectedPartner.fullName.charAt(0)}</div>
                     <div>
                        <h2 className="text-2xl font-serif font-bold">{selectedPartner.fullName}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                           <span className="bg-white/20 px-2 py-0.5 rounded text-white font-mono">{selectedPartner.promoCode}</span>
                           <span>{selectedPartner.phone}</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedPartner(null)} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
               </div>

               {/* BODY MODAL */}
               <div className="flex flex-1 overflow-hidden">
                  
                  {/* SIDEBAR GAUCHE (INFO) */}
                  <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-100 overflow-y-auto hidden md:block">
                     <div className="space-y-6">
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase">Niveau Actuel</label>
                           <select 
                             value={selectedPartner.level} 
                             onChange={(e) => handleUpdateLevel(selectedPartner.id, e.target.value)}
                             className="w-full mt-1 border border-gray-300 rounded-lg p-2 font-bold text-gray-800"
                           >
                              <option value="Standard">Standard</option>
                              <option value="Actif">Actif</option>
                              <option value="Premium">Premium</option>
                           </select>
                           <p className="text-[10px] text-gray-400 mt-1">Modifiable exceptionnellement.</p>
                        </div>

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase">État du compte</label>
                           <div className="flex items-center justify-between mt-2 p-3 bg-white border rounded-lg">
                              <span className={`text-sm font-bold ${selectedPartner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                 {selectedPartner.isActive ? 'Actif' : 'Suspendu'}
                              </span>
                              <button onClick={() => togglePartnerStatus(selectedPartner)} className="text-xs underline text-gray-500">Modifier</button>
                           </div>
                        </div>

                        <div className="pt-4 border-t">
                           <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-500">Ventes Totales</span>
                              <span className="font-bold">{selectedPartner.totalSales}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Gains Cumulés</span>
                              <span className="font-bold text-green-600">{(selectedPartner.totalEarnings || 0).toLocaleString()} F</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* CONTENU DROITE (TABS) */}
                  <div className="flex-1 flex flex-col">
                     <div className="flex border-b">
                        <button onClick={()=>setPartnerDetailTab('info')} className={`flex-1 p-4 font-bold text-sm ${partnerDetailTab==='info' ? 'border-b-2 border-brand-brown text-brand-brown' : 'text-gray-400'}`}>Historique Ventes</button>
                        <button onClick={()=>setPartnerDetailTab('stats')} className={`flex-1 p-4 font-bold text-sm ${partnerDetailTab==='stats' ? 'border-b-2 border-brand-brown text-brand-brown' : 'text-gray-400'}`}>Produits Tops</button>
                     </div>
                     
                     <div className="p-6 overflow-y-auto flex-1 bg-white">
                        {partnerDetailTab === 'info' && (
                           <div className="space-y-4">
                              <h3 className="font-bold text-gray-800">Dernières commandes liées</h3>
                              {getPartnerOrders(selectedPartner.id).length === 0 ? (
                                 <p className="text-gray-400 text-sm">Aucune vente pour le moment.</p>
                              ) : (
                                 getPartnerOrders(selectedPartner.id).map(o => (
                                    <div key={o.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                       <div>
                                          <div className="font-bold text-sm">#{o.code}</div>
                                          <div className="text-xs text-gray-500">{new Date(o.createdAt.seconds*1000).toLocaleDateString()}</div>
                                       </div>
                                       <div className="text-right">
                                          <div className="font-bold text-green-600">+{o.promo.partnerCommission} F</div>
                                          <div className="text-xs text-gray-400">{o.status}</div>
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        )}

                        {partnerDetailTab === 'stats' && (
                           <div className="space-y-4">
                              <h3 className="font-bold text-gray-800">Top 3 Produits vendus</h3>
                              {getTopProducts(selectedPartner.id).map(([name, count], idx) => (
                                 <div key={name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-brand-brown text-white flex items-center justify-center font-bold text-sm">#{idx+1}</div>
                                    <div className="flex-1 font-medium text-gray-800">{name}</div>
                                    <div className="font-bold text-gray-600">{count}x</div>
                                 </div>
                              ))}
                              {getTopProducts(selectedPartner.id).length === 0 && <p className="text-gray-400 text-sm">Pas assez de données.</p>}
                           </div>
                        )}
                     </div>
                  </div>

               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Petit composant pour les stats Overview
const StatBox = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`p-6 rounded-xl flex items-center gap-4 ${bg}`}>
     <div className={`p-3 rounded-full bg-white ${color}`}><Icon size={24}/></div>
     <div>
        <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>
           {typeof value === 'number' && label.includes('Volume') || label.includes('Commissions') ? value.toLocaleString() + ' F' : value}
        </p>
     </div>
  </div>
);

export default PartnersAdmin;