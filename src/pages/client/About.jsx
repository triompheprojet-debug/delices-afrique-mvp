import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Leaf, Users, Award, ArrowRight, ChefHat, 
  ShoppingBag, TrendingUp, Package, Globe, 
  CheckCircle, Star, Target, Zap, DollarSign,
  Clock, Shield, Truck, Gift, Sparkles, Share2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';

const About = () => {
   const { config } = useConfig();
  // États pour les stats dynamiques
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeSuppliers: 0,
    activePartners: 0,
    satisfaction: 98,
    avgDelivery: '2h'
  });
  const [loading, setLoading] = useState(true);

  // Charger les vraies stats depuis Firebase
  useEffect(() => {
    const loadStats = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
        const partnersSnapshot = await getDocs(collection(db, 'partners'));
        
        const activeSuppliers = suppliersSnapshot.docs
          .map(doc => doc.data())
          .filter(s => s.status === 'active').length;

        const activePartners = partnersSnapshot.docs
          .map(doc => doc.data())
          .filter(p => p.isActive).length;

        setStats({
          totalOrders: ordersSnapshot.size,
          activeSuppliers: activeSuppliers,
          activePartners: activePartners,
          satisfaction: 98,
          avgDelivery: '2h'
        });
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
        setStats({ 
          totalOrders: 500, 
          activeSuppliers: 50, 
          activePartners: 200,
          satisfaction: 98, 
          avgDelivery: '2h' 
        });
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Variantes d'animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-slate-950 min-h-screen font-sans">
      
      {/* ========================================
          1️⃣ HERO HEADER - Notre Histoire
          ======================================== */}
      <section className="relative min-h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            src="https://media.istockphoto.com/id/2048177034/fr/photo/groupe-d%C3%A9tudiants-souriant-dans-un-cours-de-cuisine.jpg?s=612x612&w=0&k=20&c=XG00qUYGWXZO8j-2ivMjXT4kwvoHa6qkMiB6hSpuHYY=" 
            alt="Restaurant africain" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-slate-950/90 to-slate-950"></div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 text-center px-4 max-w-5xl"
        >
          <span className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 text-purple-400 border border-purple-500/30">
            <Heart size={14} className="sm:w-4 sm:h-4" />
            Depuis 2019
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
            Révolutionner la Gastronomie <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              en Afrique Centrale
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed px-4">
            La première plateforme digitale connectant chefs talentueux, 
            ambassadeurs passionnés et clients gourmands à Pointe-Noire.
          </p>
        </motion.div>
      </section>

      {/* ========================================
          2️⃣ L'HISTOIRE - Notre Genèse
          ======================================== */}
      <section className="py-12 sm:py-20 container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src="https://media.istockphoto.com/id/2048176515/fr/photo/un-chef-parle-%C3%A0-un-%C3%A9tudiant-dans-un-cours-de-cuisine.jpg?s=612x612&w=0&k=20&c=GauT0dHZvNx3s1PFnsGbxcGYT2iLBi_B3NIXW-x1oGU=" 
                alt="Notre plateforme" 
                className="rounded-2xl sm:rounded-3xl shadow-2xl w-full object-cover h-[300px] sm:h-[400px] md:h-[550px] border-2 sm:border-4 border-slate-800"
              />

              <motion.img 
                initial={{ y: 40, opacity: 0, rotate: -5 }}
                whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=500&auto=format&fit=crop" 
                alt="Livraison"
                className="absolute -bottom-4 -right-3 w-28 h-28 sm:-bottom-6 sm:-right-4 sm:w-36 sm:h-36 md:-bottom-10 md:-right-10 md:w-56 md:h-56 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-800 shadow-2xl object-cover z-10"
              />

              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl z-20"
              >
                <div className="text-center leading-none">
                  <span className="block font-bold text-2xl sm:text-3xl">2019</span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider">Année de création</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 space-y-4 sm:space-y-6"
          >
            <h2 className="text-purple-400 font-bold text-xs sm:text-sm tracking-widest uppercase">L'Histoire</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              Une Vision Devenue Réalité
            </h3>
            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
              En 2019, un constat simple : les chefs et créateurs talentueux de Pointe-Noire 
              manquaient de visibilité, tandis que les clients cherchaient des produits de qualité 
              pour leurs événements, repas quotidiens et moments spéciaux.
            </p>
            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
              Nous avons créé <strong className="text-purple-400">Délices d'Afrique</strong>, 
              la première marketplace digitale qui connecte directement les créateurs culinaires aux clients, 
              de la pâtisserie fine aux plats traditionnels, tout en permettant à nos ambassadeurs 
              de générer des revenus passifs.
            </p>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <ChefHat size={16} className="text-purple-400 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base sm:text-lg">
                    {loading ? '...' : `${stats.activeSuppliers}+`}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Créateurs partenaires</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag size={16} className="text-green-400 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base sm:text-lg">
                    {loading ? '...' : `${stats.totalOrders}+`}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Commandes livrées</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          3️⃣ COMMENT ÇA MARCHE - Les 3 Piliers
          ======================================== */}
      <section className="py-12 sm:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-white mb-3 sm:mb-4">
              Notre Écosystème à <span className="text-purple-400">3 Piliers</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto px-4">
              Une plateforme qui crée de la valeur pour tous les acteurs
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Pilier 1 : Clients */}
            <motion.div 
              variants={fadeInUp} 
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-purple-500/30 transition-all group hover:scale-105"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Pour les Clients</h3>
              <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Accédez à une sélection premium de créations culinaires, 
                comparez les créateurs et commandez en quelques clics avec livraison à domicile.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Large choix de créations uniques</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Commande en ligne 24/7</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Livraison rapide & sécurisée</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Réductions exclusives via codes promo</span>
                </li>
              </ul>
            </motion.div>

            {/* Pilier 2 : Créateurs */}
            <motion.div 
              variants={fadeInUp} 
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-purple-500/50 hover:border-purple-500 transition-all group hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <ChefHat size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Pour les Créateurs</h3>
              <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Développez votre activité sans investir dans un site web ou une logistique complexe. 
                Nous gérons tout pour vous.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Vitrine digitale professionnelle</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Gestion automatisée des commandes</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Paiements sécurisés & rapides</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Support marketing & visibilité</span>
                </li>
              </ul>
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50">
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm group"
                >
                  Devenir fournisseur
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Pilier 3 : Ambassadeurs */}
            <motion.div 
              variants={fadeInUp} 
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-green-500/30 transition-all group hover:scale-105"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <DollarSign size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Pour les Ambassadeurs</h3>
              <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Partagez vos produits préférés avec votre réseau et gagnez des commissions 
                automatiques sur chaque vente générée.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Code promo personnalisé</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Commissions de 150-300 FCFA/vente</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Tracking en temps réel</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span>Retraits instantanés Mobile Money</span>
                </li>
              </ul>
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50">
                <Link 
                  to="/partner/register" 
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold text-sm group"
                >
                  Devenir ambassadeur
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
    SECTION 4️⃣ - PROGRAMME AMBASSADEUR DÉTAILLÉ
    ======================================== */}
<section className="py-12 sm:py-24 bg-gradient-to-br from-green-900/20 via-slate-950 to-slate-950 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
  
  <div className="container mx-auto px-4 max-w-7xl relative z-10">
    {/* En-tête */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12 sm:mb-16"
    >
      <div className="inline-flex items-center gap-2 bg-green-500/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-4 text-green-400 border border-green-500/30">
        <Gift size={16} />
        Programme Ambassadeur
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
        Gagnez de l'Argent en Partageant <br className="hidden sm:block"/>
        <span className="text-green-400">ce que Vous Aimez</span>
      </h2>
      <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto">
        Transformez votre influence en revenus passifs. Recommandez nos produits 
        et percevez des commissions automatiques sur chaque vente.
      </p>
    </motion.div>

    {/* Comment ça marche */}
    <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl font-bold">1</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Inscrivez-vous Gratuitement</h3>
        <p className="text-slate-400 text-sm">
          Créez votre compte en 2 minutes et recevez instantanément votre code promo personnalisé
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Share2 size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Partagez Votre Code</h3>
        <p className="text-slate-400 text-sm">
          Diffusez votre code sur WhatsApp, Facebook, Instagram ou avec vos proches
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <DollarSign size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Gagnez des Commissions</h3>
        <p className="text-slate-400 text-sm">
          Chaque vente avec votre code génère une commission automatique dans votre portefeuille
        </p>
      </motion.div>
    </div>

    {/* Tableau des niveaux */}
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden mb-12">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-slate-300 font-bold">Niveau</th>
              <th className="px-6 py-4 text-slate-300 font-bold">Condition</th>
              <th className="px-6 py-4 text-slate-300 font-bold">Commission/Vente</th>
              <th className="px-6 py-4 text-slate-300 font-bold">Potentiel Mensuel</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-700/50">
              <td className="px-6 py-4 text-white font-bold">🥉 Standard</td>
              <td className="px-6 py-4 text-slate-400">Dès la 1ère vente</td>
              <td className="px-6 py-4 text-green-400 font-bold">150 FCFA</td>
              <td className="px-6 py-4 text-slate-300">4,500 FCFA (30 ventes)</td>
            </tr>
            <tr className="border-t border-slate-700/50 bg-purple-500/10">
              <td className="px-6 py-4 text-white font-bold">🥈 Actif</td>
              <td className="px-6 py-4 text-slate-400">30 ventes réalisées</td>
              <td className="px-6 py-4 text-green-400 font-bold">250 FCFA</td>
              <td className="px-6 py-4 text-slate-300">7,500 FCFA (30 ventes)</td>
            </tr>
            <tr className="border-t border-slate-700/50 bg-amber-500/10">
              <td className="px-6 py-4 text-white font-bold">🥇 Premium</td>
              <td className="px-6 py-4 text-slate-400">150 ventes réalisées</td>
              <td className="px-6 py-4 text-green-400 font-bold">300 FCFA</td>
              <td className="px-6 py-4 text-slate-300">9,000 FCFA (30 ventes)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Avantages exclusifs */}
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
        <Sparkles className="text-purple-400 mb-4" size={32} />
        <h3 className="text-xl font-bold text-white mb-3">Tracking en Temps Réel</h3>
        <p className="text-slate-400 mb-4">
          Suivez vos ventes, vos gains et vos performances en direct depuis votre tableau de bord
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            Dashboard interactif
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            Historique complet des ventes
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            Notifications instantanées
          </li>
        </ul>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
        <Zap className="text-amber-400 mb-4" size={32} />
        <h3 className="text-xl font-bold text-white mb-3">Retraits Instantanés</h3>
        <p className="text-slate-400 mb-4">
          Retirez vos gains quand vous voulez via Mobile Money (MTN ou Airtel)
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            Retrait à partir de 2,000 FCFA
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            Traitement en moins de 24h
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            Aucuns frais cachés
          </li>
        </ul>
      </div>
    </div>

    {/* Témoignage */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm p-8 rounded-3xl border border-green-500/30 mb-12"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          M
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-slate-300 italic mb-3">
            "En 3 mois, j'ai généré plus de 45,000 FCFA juste en partageant les produits 
            avec mes contacts WhatsApp. C'est devenu un vrai revenu d'appoint !"
          </p>
          <p className="text-slate-400 text-sm font-bold">
            Marie K. - Ambassadrice Premium depuis 4 mois
          </p>
        </div>
      </div>
    </motion.div>

    {/* CTA */}
    <div className="text-center">
      <Link to="/partner/register">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl inline-flex items-center gap-3 hover:shadow-green-500/50 transition-all"
        >
          S'inscrire Maintenant - C'est Gratuit
          <ArrowRight size={24} />
        </motion.button>
      </Link>
      <p className="text-slate-500 text-sm mt-4">
        {loading ? 'Chargement...' : `Rejoignez ${stats.activePartners}+ ambassadeurs actifs`}
      </p>
    </div>
  </div>
</section>
{/* ========================================
    SECTION 5️⃣ - DEVENEZ FOURNISSEUR
    ======================================== */}
<section className="py-12 sm:py-24 bg-slate-900">
  <div className="container mx-auto px-4 max-w-7xl">
    
    {/* En-tête */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12 sm:mb-16"
    >
      <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-4 text-amber-400 border border-amber-500/30">
        <ChefHat size={16} />
        Pour les Professionnels
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
        Développez Votre Activité <br className="hidden sm:block"/>
        <span className="text-amber-400">Sans Investir un Centime</span>
      </h2>
      <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto">
        Rejoignez la plateforme #1 de vente en ligne de produits culinaires à Pointe-Noire. 
        Concentrez-vous sur votre passion, on s'occupe du reste.
      </p>
    </motion.div>

    {/* Ce que nous offrons */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {[
        {
          icon: Globe,
          title: 'Vitrine Digitale Professionnelle',
          desc: 'Vos produits en ligne 24/7, accessibles à des milliers de clients potentiels'
        },
        {
          icon: ShoppingBag,
          title: 'Gestion Automatisée',
          desc: 'Commandes, paiements et livraisons gérés entièrement par notre plateforme'
        },
        {
          icon: TrendingUp,
          title: 'Marketing & Visibilité',
          desc: 'Promotions sur réseaux sociaux et mise en avant de vos créations'
        },
        {
          icon: DollarSign,
          title: 'Paiements Sécurisés',
          desc: 'Règlements garantis et versements réguliers sur votre compte'
        },
        {
          icon: Target,
          title: 'Support Dédié',
          desc: 'Équipe disponible pour vous accompagner dans votre croissance'
        },
        {
          icon: Package,
          title: 'Zéro Frais d\'Inscription',
          desc: 'Aucuns coûts de démarrage, commencez à vendre immédiatement'
        }
      ].map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all group"
        >
          <feature.icon size={32} className="text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm">{feature.desc}</p>
        </motion.div>
      ))}
    </div>

    {/* Stats fournisseurs */}
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-amber-500/30 mb-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
        <div className="text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {loading ? '...' : stats.activeSuppliers}+
          </h3>
          <p className="text-slate-400 text-sm">Créateurs actifs</p>
        </div>
        <div className="text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {loading ? '...' : stats.totalOrders}+
          </h3>
          <p className="text-slate-400 text-sm">Commandes traitées</p>
        </div>
        <div className="text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">95%</h3>
          <p className="text-slate-400 text-sm">Taux de réussite</p>
        </div>
        <div className="text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">24/7</h3>
          <p className="text-slate-400 text-sm">Support disponible</p>
        </div>
      </div>
    </div>

    {/* Processus d'inscription */}
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-slate-700/50 mb-12">
      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-8 text-center">
        Comment Commencer ?
      </h3>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">1</span>
          </div>
          <h4 className="font-bold text-white mb-2">Contactez-nous</h4>
          <p className="text-slate-400 text-sm">
            Remplissez le formulaire ou appelez-nous directement
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">2</span>
          </div>
          <h4 className="font-bold text-white mb-2">Validation</h4>
          <p className="text-slate-400 text-sm">
            Nous vérifions votre profil et créons votre compte
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">3</span>
          </div>
          <h4 className="font-bold text-white mb-2">Commencez à vendre</h4>
          <p className="text-slate-400 text-sm">
            Ajoutez vos produits et recevez vos premières commandes
          </p>
        </div>
      </div>
    </div>

    {/* CTA Final */}
    <div className="text-center">
      <Link to="/contact">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl inline-flex items-center gap-3 hover:shadow-amber-500/50 transition-all"
        >
          Demander Plus d'Informations
          <ArrowRight size={24} />
        </motion.button>
      </Link>
      <p className="text-slate-500 text-sm mt-4">
        Appelez-nous au {config.phoneNumber} ou écrivez-nous
      </p>
    </div>
  </div>
</section>
{/* ========================================
    SECTION 6️⃣ - NOS VALEURS (Responsive)
    ======================================== */}
<section className="py-12 sm:py-24 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
  
  <div className="container mx-auto px-4 max-w-7xl relative z-10">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10 sm:mb-16"
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
        Nos Valeurs Fondamentales
      </h2>
      <div className="w-24 h-1 bg-purple-500 mx-auto mt-4 rounded-full"></div>
    </motion.div>

    {/* Scroll horizontal sur mobile, grid sur desktop */}
    <div className="overflow-x-auto pb-4 sm:overflow-visible no-scrollbar">
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-w-max sm:min-w-0">
        {[
          { 
            icon: Leaf, 
            title: 'Qualité Premium', 
            desc: 'Sélection rigoureuse des créateurs pour garantir l\'excellence',
            color: 'from-green-500 to-emerald-600'
          },
          { 
            icon: Heart, 
            title: 'Passion & Authenticité', 
            desc: 'Chaque création raconte une histoire, chaque plat est unique',
            color: 'from-pink-500 to-rose-600'
          },
          { 
            icon: Users, 
            title: 'Communauté', 
            desc: 'Connecter les talents locaux et créer des opportunités',
            color: 'from-purple-500 to-purple-600'
          },
          { 
            icon: Shield, 
            title: 'Confiance', 
            desc: 'Transactions sécurisées et service client réactif 24/7',
            color: 'from-blue-500 to-blue-600'
          }
        ].map((value, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="flex-shrink-0 w-[280px] sm:w-auto bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all group hover:scale-105 snap-center"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
              <value.icon size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{value.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{value.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Indicateur scroll mobile */}
    <div className="sm:hidden text-center mt-4">
      <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
        <ChevronLeft size={12} />
        Glissez pour voir plus
        <ChevronRight size={12} />
      </p>
    </div>
  </div>
</section>
</div>
  );
}

export default About;