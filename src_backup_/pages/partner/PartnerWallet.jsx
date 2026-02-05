import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  Wallet, Lock, ArrowRight, History, 
  AlertTriangle, CheckCircle, Clock, Loader2, X,
  Smartphone, User, DollarSign, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerWallet = () => {
  const [partner, setPartner] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // États Modales
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // État Formulaire
  const [form, setForm] = useState({ amount: '', phone: '', name: '' });
  const [errors, setErrors] = useState({});

  // SEUILS DE RETRAIT
  const WITHDRAWAL_THRESHOLDS = {
    'Standard': 2000,
    'Actif': 3000,
    'Premium': 5000
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const sessionData = JSON.parse(sessionStr);

    const unsubPartner = onSnapshot(doc(db, "partners", sessionData.id), (doc) => {
      setPartner({ id: doc.id, ...doc.data() });
    });

    const qWithdrawals = query(
      collection(db, "withdrawals"), 
      where("partnerId", "==", sessionData.id),
      orderBy("createdAt", "desc")
    );
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubPartner(); unsubWithdrawals(); };
  }, []);

  // --- LOGIQUE DE VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    const threshold = WITHDRAWAL_THRESHOLDS[partner.level || 'Standard'];
    const amountNum = Number(form.amount);

    // 1. Validation Montant
    if (!form.amount || amountNum <= 0) newErrors.amount = "Montant invalide.";
    else if (amountNum < threshold) newErrors.amount = `Le minimum est de ${threshold} FCFA.`;
    else if (amountNum > (partner.walletBalance || 0)) newErrors.amount = "Solde insuffisant.";

    // 2. Validation Téléphone (Airtel vs MTN)
    const phoneClean = form.phone.replace(/\s/g, ''); // Enlève les espaces
    const isAirtel = /^0[45]/.test(phoneClean); // Commence par 04 ou 05
    const isMtn = /^06/.test(phoneClean);       // Commence par 06

    if (!form.phone) newErrors.phone = "Numéro requis.";
    else if (!isAirtel && !isMtn) newErrors.phone = "Doit commencer par 04, 05 (Airtel) ou 06 (MTN).";

    // 3. Validation Nom
    if (!form.name.trim()) newErrors.name = "Le nom du bénéficiaire est requis.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = () => {
    // On préremplit avec les infos du profil pour gagner du temps
    setForm({ 
        amount: '', 
        phone: partner.phone || '', 
        name: partner.fullName || '' 
    });
    setErrors({});
    setIsWithdrawModalOpen(true);
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessing(true);
    try {
      await addDoc(collection(db, "withdrawals"), {
        partnerId: partner.id,
        partnerName: partner.fullName, // Nom du compte partenaire
        recipientName: form.name,      // Nom renseigné pour le Mobile Money
        phone: form.phone,
        operator: /^06/.test(form.phone) ? 'MTN Mobile Money' : 'Airtel Money',
        amount: Number(form.amount),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setIsWithdrawModalOpen(false);
      setIsSuccessModalOpen(true); // Affiche le succès
      
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-brown"/></div>;
  if (!partner) return null;

  const currentThreshold = WITHDRAWAL_THRESHOLDS[partner.level || 'Standard'];

  return (
    <div className="space-y-8 pb-24 animate-fade-in relative">

      {/* TITRE */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-brown/10 rounded-xl text-brand-brown">
           <Wallet size={24}/>
        </div>
        <div>
           <h1 className="text-2xl font-serif font-bold text-gray-800">Mon Portefeuille</h1>
           <p className="text-sm text-gray-500">Gérez vos gains et vos retraits.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* CARTE SOLDE (Style Carte Bancaire) */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-72">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
           
           <div className="flex justify-between items-start z-10">
              <div>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Solde Disponible</p>
                 <h2 className="text-4xl font-mono font-bold tracking-tight text-white">
                    {(partner.walletBalance || 0).toLocaleString()} <span className="text-lg text-gray-400">FCFA</span>
                 </h2>
              </div>
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <CreditCard className="text-white" size={24}/>
              </div>
           </div>

           <div className="z-10 space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                 <Lock size={12}/> Seuil minimum : {currentThreshold.toLocaleString()} FCFA
              </div>

              {/* BOUTON D'ACTION PRINCIPAL */}
              <button 
                onClick={handleOpenModal}
                disabled={partner.walletBalance <= 0}
                className="w-full py-4 bg-brand-brown text-white hover:bg-brand-beige hover:text-brand-brown rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Demander un retrait <ArrowRight size={18}/>
              </button>
           </div>
        </div>

        {/* RÉSUMÉ */}
        <div className="space-y-4">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                 <CheckCircle size={24}/>
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Total Retiré</p>
                 <p className="text-2xl font-bold text-gray-800">
                    {(partner.totalWithdrawn || 0).toLocaleString()} FCFA
                 </p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                 <Clock size={24}/>
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">En attente</p>
                 <p className="text-2xl font-bold text-gray-800">
                    {withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} FCFA
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* HISTORIQUE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <History size={20} className="text-gray-400"/>
            <h3 className="font-bold text-gray-800">Dernières transactions</h3>
         </div>
         {withdrawals.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">Aucune transaction récente.</div>
         ) : (
            <div className="divide-y divide-gray-50">
               {withdrawals.map((w) => (
                  <div key={w.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition">
                     <div>
                        <p className="font-bold text-gray-800 text-sm">{w.operator} - {w.phone}</p>
                        <p className="text-xs text-gray-500">{new Date(w.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="font-mono font-bold text-gray-800">-{w.amount.toLocaleString()} F</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                           w.status === 'paid' ? 'bg-green-100 text-green-700' : 
                           w.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                           'bg-yellow-100 text-yellow-700'
                        }`}>
                           {w.status === 'paid' ? 'Payé' : w.status === 'rejected' ? 'Rejeté' : 'En traitement'}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* --- MODALE DE RETRAIT (POP-UP) --- */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-serif font-bold text-xl text-gray-800">Demander un retrait</h3>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmitWithdrawal} className="p-6 space-y-5">
                
                {/* Champ Montant */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Montant à retirer</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                      type="number" 
                      placeholder="Ex: 5000"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border font-bold text-lg outline-none focus:ring-2 focus:ring-brand-brown/20 transition ${errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      value={form.amount}
                      onChange={e => setForm({...form, amount: e.target.value})}
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><AlertTriangle size={10}/> {errors.amount}</p>}
                </div>

                {/* Champ Téléphone */}
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Numéro Mobile Money</label>
                   <div className="relative">
                     <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input 
                       type="tel" 
                       placeholder="06 123 4567"
                       className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-brand-brown/20 transition ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                       value={form.phone}
                       onChange={e => setForm({...form, phone: e.target.value})}
                     />
                   </div>
                   {errors.phone ? (
                     <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.phone}</p>
                   ) : (
                     <p className="text-[10px] text-gray-400 mt-1 ml-1">Airtel (04/05) ou MTN (06) uniquement.</p>
                   )}
                </div>

                {/* Champ Nom */}
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nom du bénéficiaire</label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input 
                       type="text" 
                       placeholder="Nom complet enregistré sur la SIM"
                       className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-brand-brown/20 transition ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                       value={form.name}
                       onChange={e => setForm({...form, name: e.target.value})}
                     />
                   </div>
                   {errors.name && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.name}</p>}
                </div>

                {/* Info Solde */}
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                   <Wallet size={16}/>
                   <span>Solde actuel : <strong>{(partner.walletBalance || 0).toLocaleString()} FCFA</strong></span>
                </div>

                <button 
                  type="submit" 
                  disabled={processing}
                  className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="animate-spin"/> : 'Confirmer le retrait'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODALE SUCCÈS --- */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
               onClick={() => setIsSuccessModalOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
               className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative z-10 shadow-2xl"
             >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle className="text-green-600 w-10 h-10 animate-bounce"/>
                </div>
                <h3 className="font-serif font-bold text-2xl text-gray-800 mb-2">Demande envoyée !</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                   Votre demande de retrait de <span className="font-bold text-gray-800">{Number(form.amount).toLocaleString()} FCFA</span> a bien été reçue.
                   <br/><br/>
                   <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-bold text-sm">
                     Vous recevrez votre virement dans moins de 24 heures.
                   </span>
                </p>
                <button 
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition"
                >
                  Fermer
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PartnerWallet;