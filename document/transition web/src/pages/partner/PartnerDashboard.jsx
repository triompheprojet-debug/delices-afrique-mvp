import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  Copy, CheckCircle, Share2, TrendingUp, 
  DollarSign, Calendar, Star, ChevronRight, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerDashboard = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Récupération des données en temps réel
  useEffect(() => {
    const sessionStr = sessionStorage.getItem('partnerSession');
    if (!sessionStr) return;
    const sessionData = JSON.parse(sessionStr);
    
    const unsubscribe = onSnapshot(doc(db, "partners", sessionData.id), (doc) => {
      setPartner({ id: doc.id, ...doc.data() });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = () => {
    if (partner?.promoCode) {
      navigator.clipboard.writeText(partner.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calcul du niveau (Logique PDF)
  const getLevelDetails = (sales = 0) => {
    if (sales >= 150) return { name: 'Premium', color: 'from-amber-400 to-yellow-600', next: 'Max', nextTarget: 0, currentTarget: 150 };
    if (sales >= 30) return { name: 'Actif', color: 'from-gray-300 to-gray-500', next: 'Premium', nextTarget: 150, currentTarget: 30 };
    return { name: 'Standard', color: 'from-brand-brown to-amber-900', next: 'Actif', nextTarget: 30, currentTarget: 0 };
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-brown" size={40}/></div>;
  if (!partner) return null;

  const level = getLevelDetails(partner.totalSales);
  const progressPercent = level.name === 'Premium' ? 100 : ((partner.totalSales - level.currentTarget) / (level.nextTarget - level.currentTarget)) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. SECTION BIENVENUE & CARTE DE NIVEAU */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        
        {/* Intro Texte */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
            Bonjour, {partner.fullName.split(' ')[0]}
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Voici vos performances en temps réel. Continuez à partager votre code pour atteindre le niveau <span className="font-bold text-brand-brown">{level.next}</span>.
          </p>
        </div>

        {/* CARTE VIP (Design Carte Bancaire) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`relative rounded-2xl p-6 text-white shadow-xl overflow-hidden bg-gradient-to-br ${level.color}`}
        >
          {/* Texture de fond */}
          <div className="absolute top-0 right-0 p-4 opacity-10"><Star size={100}/></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Niveau Partenaire</p>
                <h3 className="text-3xl font-serif font-bold tracking-wide">{level.name}</h3>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                {partner.totalSales} Ventes
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-medium mb-2 opacity-90">
                <span>Progression vers {level.next}</span>
                <span>{level.next !== 'Max' ? `${Math.floor(progressPercent)}%` : 'Max atteint'}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. STATISTIQUES (GRID 4 BLOCS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={DollarSign} label="Solde Dispo" 
          value={`${partner.walletBalance?.toLocaleString()} F`} 
          sub="Prêt à retirer" color="text-green-600" bg="bg-green-50"
        />
        <StatCard 
          icon={TrendingUp} label="Gains Totaux" 
          value={`${partner.totalEarnings?.toLocaleString()} F`} 
          sub="Depuis le début" color="text-brand-brown" bg="bg-orange-50"
        />
        <StatCard 
          icon={Calendar} label="Ce Mois" 
          value={`${partner.currentMonthEarnings || 0} F`} 
          sub="Commissions" color="text-blue-600" bg="bg-blue-50"
        />
        <StatCard 
          icon={Star} label="Total Ventes" 
          value={partner.totalSales || 0} 
          sub="Commandes livrées" color="text-purple-600" bg="bg-purple-50"
        />
      </div>

      {/* 3. ZONE D'ACTION : CODE PROMO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="w-full md:w-auto">
          <h3 className="font-serif font-bold text-gray-800 text-lg mb-1">Votre Code Promo</h3>
          <p className="text-gray-500 text-sm">Partagez ce code. Le client a une réduction, vous une commission.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Zone Code */}
          <div 
            onClick={copyToClipboard}
            className="flex items-center justify-between gap-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-6 py-3 cursor-pointer hover:border-brand-brown hover:bg-brand-brown/5 transition group w-full sm:w-auto"
          >
            <span className="font-mono text-xl font-bold text-gray-800 tracking-wider select-all">
              {partner.promoCode}
            </span>
            <div className="text-gray-400 group-hover:text-brand-brown transition">
              {copied ? <CheckCircle size={20} className="text-green-500"/> : <Copy size={20}/>}
            </div>
          </div>
          
          {/* Bouton Partage Rapide */}
          <a 
            href={`https://wa.me/?text=Salut ! Profite d'une réduction sur les meilleurs gâteaux de la ville avec mon code *${partner.promoCode}* sur Délices d'Afrique !`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-500/20 w-full sm:w-auto"
          >
            <Share2 size={18} /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Lien vers Détails */}
      <div className="text-center">
        <a href="/partner/sales" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-brown transition">
          Voir l'historique détaillé des ventes <ChevronRight size={14}/>
        </a>
      </div>

    </div>
  );
};

// Sous-composant pour les cartes (propre et réutilisable)
const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32"
  >
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg ${bg} ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
      <p className="text-[10px] font-bold uppercase text-gray-400 mt-1">{label}</p>
    </div>
  </motion.div>
);

export default PartnerDashboard;