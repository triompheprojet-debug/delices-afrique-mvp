import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShoppingBag, Award, TrendingUp, 
  Clock, CheckCircle, Gift, Sparkles, ChefHat,
  MapPin, Shield, Zap, Share2, DollarSign, Users, Target,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';
import ProductCard from '../../components/client/ProductCard';

const Home = () => {
  const { config } = useConfig();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topPartners, setTopPartners] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeSuppliers: 0,
    satisfaction: 98,
    avgDelivery: '2h'
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour menus déroulants
  const [showAllPartners, setShowAllPartners] = useState(false);
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  
  // Refs pour scroll horizontal
  const productsScrollRef = useRef(null);
  const suppliersScrollRef = useRef(null);
  const partnersScrollRef = useRef(null);
  const companiesScrollRef = useRef(null);

  // Liste des entreprises partenaires (logos dans public/images/logo/)
  const companyPartners = [
    { name: 'Total Energies', logo: 'total.png' },
    { name: 'MTN', logo: 'mtn.png' },
    { name: 'Airtel', logo: 'airtel.png' },
    { name: 'Orange', logo: 'orange.png' },
    { name: 'SNPC', logo: 'snpc.png' },
    { name: 'Chevron', logo: 'chevron.png' },
    { name: 'ENI', logo: 'eni.png' },
    { name: 'Perenco', logo: 'perenco.png' },
    { name: 'Franprix', logo: 'franprix.png' },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      try {
        if (isMounted) {
          await Promise.all([
            loadFeaturedProducts(),
            loadTopPartners(),
            loadSuppliers(),
            loadStats()
          ]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        if (isMounted) setLoading(false);
      }
    };

    loadAllData();
    return () => { isMounted = false; };
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const q = query(collection(db, 'products'), limit(20));
      const snapshot = await getDocs(q);
      const products = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.status === 'active' && p.inStock);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Erreur produits:', error);
      setFeaturedProducts([]);
    }
  };

  const loadTopPartners = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'partners'));
      const partners = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.isActive)
        .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
      setTopPartners(partners);
    } catch (error) {
      console.error('Erreur partenaires:', error);
      setTopPartners([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'suppliers'));
      const suppliers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.status === 'active');
      setSuppliers(suppliers);
    } catch (error) {
      console.error('Erreur créateurs:', error);
      setSuppliers([]);
    }
  };

  const loadStats = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      
      const activeSuppliers = suppliersSnapshot.docs
        .map(doc => doc.data())
        .filter(s => s.status === 'active').length;

      setStats({
        totalOrders: ordersSnapshot.size,
        activeSuppliers: activeSuppliers,
        satisfaction: 98,
        avgDelivery: '2h'
      });
    } catch (error) {
      setStats({ totalOrders: 500, activeSuppliers: 50, satisfaction: 98, avgDelivery: '2h' });
    }
  };

  // Fonctions de scroll horizontal
  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      
      {/* Écran de chargement */}
      {loading && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4 mx-auto"></div>
            <p className="text-slate-300 font-serif text-base sm:text-lg animate-pulse">Chargement...</p>
          </div>
        </div>
      )}

      {/* ========================================
          1️⃣ HERO SECTION
          ======================================== */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950"></div>
          <div className="absolute top-10 right-5 w-32 h-32 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-10 left-5 w-40 h-40 sm:w-96 sm:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto relative z-30 text-center text-white px-4 py-8 sm:py-20 max-w-7xl">
          
          {/* Badge localisation */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-6 text-xs sm:text-sm font-bold"
          >
            <MapPin size={12} className="text-purple-400 sm:w-4 sm:h-4" />
            <span className="text-slate-200 text-[11px] sm:text-sm">Pointe-Noire, Congo</span>
            <CheckCircle size={12} className="text-green-400 sm:w-4 sm:h-4" />
          </motion.div>

          {/* Titre principal */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold mb-3 sm:mb-6 leading-tight px-2"
          >
            L'Excellence de la<br className="hidden xs:block"/>
            <span className="gradient-text"> Pâtisserie Africaine</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-light px-4"
          >
            Commandez en ligne, savourez chez vous.
            <span className="hidden sm:inline"> Des créateurs passionnés, des créations uniques.</span>
          </motion.p>

          {/* Boutons CTA - CÔTE À CÔTE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-row gap-2 sm:gap-4 justify-center items-center px-4 mb-6 sm:mb-8"
          >
            <Link to="/menu" className="flex-1 sm:flex-initial">
              <button className="group w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center justify-center gap-2 text-xs sm:text-base whitespace-nowrap">
                <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
                <span>Commander</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
              </button>
            </Link>
            
            <Link to="/about" className="flex-1 sm:flex-initial">
              <button className="w-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-slate-200 px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-2xl font-bold hover:bg-slate-800 transition-all inline-flex items-center justify-center gap-2 text-xs sm:text-base whitespace-nowrap">
                <Sparkles size={16} className="text-purple-400 sm:w-5 sm:h-5" />
                <span>Découvrir</span>
              </button>
            </Link>
          </motion.div>

          {/* Mini badges avantages */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto"
          >
            {[
              { icon: Zap, text: 'Livraison 2h' },
              { icon: Shield, text: 'Paiement sécurisé' },
              { icon: Award, text: 'Qualité premium' },
              { icon: CheckCircle, text: '100% artisanal' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-slate-800/30 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full backdrop-blur-sm">
                <item.icon size={14} className="text-purple-400 sm:w-4 sm:h-4" />
                <span className="font-medium text-[11px] sm:text-sm">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================
          2️⃣ STATS - Grid 4 colonnes sur toutes les tailles
          ======================================== */}
      <section className="py-8 sm:py-16 bg-slate-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-4 gap-2 sm:gap-6">
            {[
              { icon: ShoppingBag, value: `${stats.totalOrders}+`, label: 'Commandes', color: 'text-purple-500', bg: 'bg-purple-500/20' },
              { icon: ChefHat, value: `${stats.activeSuppliers}+`, label: 'Créateurs', color: 'text-blue-500', bg: 'bg-blue-500/20' },
              { icon: Award, value: `${stats.satisfaction}%`, label: 'Satisfaits', color: 'text-green-500', bg: 'bg-green-500/20' },
              { icon: Clock, value: stats.avgDelivery, label: 'Livraison', color: 'text-orange-500', bg: 'bg-orange-500/20' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-3 sm:p-6 rounded-lg sm:rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-all"
              >
                <div className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.bg} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <stat.icon size={16} className={`${stat.color} sm:w-6 sm:h-6`} />
                </div>
                <h3 className="text-lg sm:text-4xl font-bold text-slate-100 mb-1">{stat.value}</h3>
                <p className="text-[10px] sm:text-sm text-slate-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          3️⃣ PRODUITS VEDETTES
          ======================================== */}
      {featuredProducts.length > 0 && (
        <section className="py-8 sm:py-16 bg-slate-950">
          <div className="container mx-auto px-4 max-w-7xl">
            
            {/* Header - Titre centré sur mobile */}
            <div className="text-center sm:flex sm:items-center sm:justify-between mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-1 sm:mb-2">
                  Nos Créations
                </h2>
                <p className="text-slate-400 text-xs sm:text-base">
                  Découvrez nos pâtisseries d'exception
                </p>
              </div>
              
              {/* Boutons navigation - desktop uniquement */}
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => scroll(productsScrollRef, 'left')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scroll(productsScrollRef, 'right')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Carrousel - scroll horizontal */}
            <div className="relative">
              <div 
                ref={productsScrollRef}
                className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
              >
                {featuredProducts.map((product, index) => (
                  <div 
                    key={product.id || index} 
                    className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center"
                  >
                    <ProductCard 
                      product={product}
                      onProductClick={setSelectedProduct}
                    />
                  </div>
                ))}
              </div>
              
              {/* Indicateur scroll mobile */}
              <div className="sm:hidden text-center mt-2">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <ChevronLeft size={12} />
                  Glissez pour voir plus
                  <ChevronRight size={12} />
                </p>
              </div>
            </div>

            {/* Bouton voir tout */}
            <div className="text-center mt-6 sm:mt-10">
              <Link to="/menu">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-xl transition-all inline-flex items-center gap-2 text-sm sm:text-base">
                  Voir tout le catalogue
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========================================
          4️⃣ POURQUOI NOUS CHOISIR - Grid fixe
          ======================================== */}
      <section className="py-8 sm:py-16 bg-slate-900">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Titre centré sur mobile */}
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-2 sm:mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-slate-400 text-xs sm:text-base">
              Une expérience unique du début à la fin
            </p>
          </div>

          {/* Grid 2x2 mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
            {[
              { 
                icon: Shield, 
                title: 'Paiement sécurisé', 
                desc: 'Transactions protégées',
                color: 'blue'
              },
              { 
                icon: Clock, 
                title: 'Livraison rapide', 
                desc: 'En moyenne 2h',
                color: 'purple'
              },
              { 
                icon: Award, 
                title: 'Qualité garantie', 
                desc: 'Ingrédients premium',
                color: 'green'
              },
              { 
                icon: Zap, 
                title: 'Support 24/7', 
                desc: 'Équipe disponible',
                color: 'orange'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:bg-slate-800 transition-all group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-${feature.color}-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className={`text-${feature.color}-400 sm:w-7 sm:h-7`} />
                </div>
                <h3 className="font-bold text-sm sm:text-lg text-slate-100 mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
{/* ========================================
    5️⃣ PROGRAMME AMBASSADEURS - Défilement horizontal mobile
    ======================================== */}
<section className="py-8 sm:py-20 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

  <div className="container mx-auto relative z-10 px-4 max-w-7xl">
    {/* Titre centré */}
    <div className="text-center mb-8 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-purple-400"
      >
        <Gift size={14} />
        <span>Programme Ambassadeurs</span>
      </motion.div>
      
      <h2 className="text-2xl sm:text-5xl font-serif font-bold text-slate-100 mb-3 sm:mb-4 px-4">
        Transformez votre influence <br className="hidden sm:block"/>
        <span className="text-purple-400">en revenus passifs</span>
      </h2>
      <p className="text-slate-400 text-xs sm:text-lg max-w-2xl mx-auto">
        Rejoignez nos ambassadeurs et percevez des commissions automatiques
      </p>
    </div>

    {/* Niveaux ambassadeurs - Scroll horizontal sur mobile, grid sur desktop */}
    <div className="mb-8 sm:mb-12">
      {/* Indicateur scroll mobile uniquement */}
      <div className="sm:hidden text-center mb-4">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
          <ChevronLeft size={12} />
          Glissez pour voir les niveaux
          <ChevronRight size={12} />
        </p>
      </div>

      {/* Container - scroll mobile / grid desktop */}
      <div className="overflow-x-auto sm:overflow-visible pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth sm:max-w-5xl sm:mx-auto">
        <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { 
              icon: DollarSign,
              benefitTitle: 'Revenus récurrents',
              benefitDesc: 'Gagnez 150-300 FCFA par vente automatiquement',
              benefitColor: 'from-green-500 to-emerald-600',
              name: 'Standard', 
              commission: '150 FCFA',
              earnings: '4,500 FCFA/mois',
              sales: 'Dès la 1ère vente',
              color: 'from-slate-600 to-slate-700',
              highlight: false
            },
            { 
              icon: Users,
              benefitTitle: 'Système clé en main',
              benefitDesc: 'Votre code unique + tracking en temps réel',
              benefitColor: 'from-purple-500 to-purple-600',
              name: 'Actif', 
              commission: '250 FCFA',
              earnings: '7,500 FCFA/mois', 
              sales: 'Dès 30 ventes',
              color: 'from-purple-500 to-purple-600',
              highlight: true
            },
            { 
              icon: Target,
              benefitTitle: 'Évolution rapide',
              benefitDesc: 'Montez en grade et augmentez vos gains',
              benefitColor: 'from-amber-500 to-orange-600',
              name: 'Premium', 
              commission: '300 FCFA',
              earnings: '9,000 FCFA/mois',
              sales: 'Dès 150 ventes',
              color: 'from-amber-500 to-amber-600',
              highlight: false
            }
          ].map((level, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] sm:w-auto snap-center"
            >
              {/* Bloc avantage */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all mb-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.benefitColor} flex items-center justify-center mb-4 shadow-lg`}>
                  <level.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-base text-slate-100 mb-2">{level.benefitTitle}</h3>
                <p className="text-slate-400 text-xs">{level.benefitDesc}</p>
              </motion.div>

              {/* Bloc niveau */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-slate-800/50 rounded-xl p-5 border ${
                  level.highlight ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-slate-700/50'
                }`}
              >
                {level.highlight && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Populaire
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <Award size={20} className="text-white" />
                </div>
                
                <h3 className="font-serif text-xl font-bold text-center mb-2 text-slate-100">{level.name}</h3>
                
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-purple-400">{level.commission}</p>
                  <p className="text-xs text-slate-500">par vente</p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 mb-3 border border-slate-700/30">
                  <p className="text-xs text-slate-400 text-center mb-1">Potentiel mensuel</p>
                  <p className="text-base font-bold text-green-400 text-center">{level.earnings}</p>
                  <p className="text-[10px] text-slate-500 text-center">avec 30 ventes/mois</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <CheckCircle size={14} className="text-green-400" />
                  <span>{level.sales}</span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="text-center">
      <Link to="/partner/register">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-xl shadow-2xl inline-flex items-center justify-center gap-2 sm:gap-3"
        >
          Commencer à gagner maintenant
          <ArrowRight size={18} className="sm:w-5 sm:h-5" />
        </motion.button>
      </Link>
      
      <p className="text-slate-500 text-xs sm:text-sm mt-3 sm:mt-4">
        Gratuit • Sans engagement • Retraits instantanés
      </p>
    </div>
  </div>
</section>

        {/* ========================================
          6️⃣ ENTREPRISES PARTENAIRES - Défilement infini horizontal
          ======================================== */}
      <section className="py-8 sm:py-16 bg-slate-900 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Titre centré */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-2 sm:mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-slate-400 text-xs sm:text-base">
              Des entreprises leaders qui collaborent avec nous
            </p>
          </div>

          {/* Container du défilement infini */}
          <div className="relative">
            {/* Dégradés sur les côtés pour l'effet de fondu */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

            {/* Conteneur de défilement */}
            <div className="overflow-hidden py-4">
              <div className="flex animate-marquee hover:pause">
                {/* Premier ensemble de logos */}
                {companyPartners.map((company, i) => (
                  <div
                    key={`first-${i}`}
                    className="flex-shrink-0 w-[180px] sm:w-[220px] mx-3 sm:mx-4 bg-white/10 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 sm:p-8 flex items-center justify-center hover:bg-white/15 hover:border-purple-500/40 hover:scale-105 transition-all duration-300 group"
                  >
                    <img 
                      src={`/images/logo/${company.logo}`}
                      alt={company.name}
                      className="w-full h-auto max-h-14 sm:max-h-20 object-contain opacity-90 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="text-slate-100 font-bold text-sm sm:text-base text-center">${company.name}</div>`;
                      }}
                    />
                  </div>
                ))}

                {/* Duplication des logos pour l'effet infini */}
                {companyPartners.map((company, i) => (
                  <div
                    key={`second-${i}`}
                    className="flex-shrink-0 w-[180px] sm:w-[220px] mx-3 sm:mx-4 bg-white/10 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 sm:p-8 flex items-center justify-center hover:bg-white/15 hover:border-purple-500/40 hover:scale-105 transition-all duration-300 group"
                  >
                    <img 
                      src={`/images/logo/${company.logo}`}
                      alt={company.name}
                      className="w-full h-auto max-h-14 sm:max-h-20 object-contain opacity-90 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="text-slate-100 font-bold text-sm sm:text-base text-center">${company.name}</div>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Indicateur de défilement mobile */}
            <div className="sm:hidden text-center mt-4">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <span className="animate-pulse">⟵</span>
                Défilement automatique
                <span className="animate-pulse">⟶</span>
              </p>
            </div>
          </div>
        </div>
      </section>

          {/* ========================================
              7️⃣ TOP AMBASSADEURS - Design amélioré (version corrigée)
              ======================================== */}
          {topPartners.length > 0 && (
            <section className="py-8 sm:py-16 bg-slate-950 relative overflow-hidden">
              {/* Background décoratif */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>

              <div className="container mx-auto px-4 max-w-7xl relative z-10">
                
                {/* Titre */}
                <div className="text-center sm:flex sm:items-center sm:justify-between mb-6 sm:mb-10">
                  <div className="mb-4 sm:mb-0">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-3 text-amber-400">
                      <Award size={14} />
                      <span>Classement du mois</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-1 sm:mb-2">
                      Top Ambassadeurs du Mois
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-base">
                      Nos meilleurs performers et leurs gains
                    </p>
                  </div>
                  
                  {/* Boutons navigation desktop */}
                  {topPartners.length > 4 && (
                    <div className="hidden sm:flex gap-2">
                      <button
                        onClick={() => scroll(partnersScrollRef, 'left')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => scroll(partnersScrollRef, 'right')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid ou Scroll selon le nombre */}
                <div className="relative">
                  <div 
                    ref={partnersScrollRef}
                    className={`${
                      topPartners.length <= 4 
                        ? 'grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6' 
                        : 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth'
                    }`}
                  >
                    {topPartners.slice(0, showAllPartners ? topPartners.length : 8).map((partner, index) => (
                      <div 
                        key={partner.id || index}
                        className={`${topPartners.length > 4 ? 'flex-shrink-0 w-[200px] sm:w-[240px]' : ''} relative rounded-2xl p-6 text-center snap-center transition-all duration-300 group hover:scale-105 ${
                          index === 0 
                            ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                            : index === 1
                            ? 'bg-gradient-to-br from-slate-400/20 via-slate-400/10 to-transparent border-2 border-slate-400/50'
                            : index === 2
                            ? 'bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border-2 border-orange-500/50'
                            : 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/30'
                        }`}
                      >
                        {/* Badge position */}
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                          : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' 
                          : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                          : 'bg-gradient-to-br from-slate-600 to-slate-700'
                        }`}>
                          {index < 3 ? (
                            <Award size={16} />
                          ) : (
                            `#${index + 1}`
                          )}
                        </div>

                        {/* Avatar */}
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 mt-2 shadow-xl border-4 ${
                          index === 0 ? 'border-amber-400/30' : 'border-slate-700/30'
                        } group-hover:scale-110 transition-transform duration-300`}>
                          {partner.fullName?.charAt(0) || 'P'}
                        </div>

                        {/* Nom */}
                        <h3 className="font-bold text-base text-slate-100 mb-1 line-clamp-1">
                          {partner.fullName || 'Ambassadeur'}
                        </h3>
                        
                        {/* Badge niveau */}
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                          partner.level === 'Premium' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : partner.level === 'Actif'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                        }`}>
                          <Award size={12} />
                          <span>{partner.level || 'Standard'}</span>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2">
                          {/* Gains */}
                          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-3 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Gains totaux</p>
                            <p className="font-bold text-lg text-green-400">
                              {partner.totalEarnings ? `${partner.totalEarnings.toLocaleString()} F` : '0 F'}
                            </p>
                          </div>
                          
                          {/* Ventes */}
                          <div className="flex items-center justify-between bg-slate-900/50 px-3 py-2 rounded-lg">
                            <span className="text-xs text-slate-400">Ventes réalisées</span>
                            <span className="font-bold text-sm text-slate-200">{partner.totalSales || 0}</span>
                          </div>
                        </div>

                        {/* Effet glow pour le top 3 */}
                        {index < 3 && (
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Indicateur scroll mobile */}
                  {topPartners.length > 4 && (
                    <div className="sm:hidden text-center mt-4">
                      <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                        <ChevronLeft size={12} className="animate-pulse" />
                        Glissez pour voir plus
                        <ChevronRight size={12} className="animate-pulse" />
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA devenir ambassadeur */}
                <div className="text-center mt-8 sm:mt-12">
                  <Link to="/partner/register">
                    <button 
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all inline-flex items-center gap-3 text-base group"
                    >
                      <Users size={20} />
                      Devenir ambassadeur
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <p className="text-xs text-slate-500 mt-3">
                    Rejoignez nos ambassadeurs actifs
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ========================================
              8️⃣ NOS CRÉATEURS - Design amélioré (version corrigée)
              ======================================== */}
          {suppliers.length > 0 && (
            <section className="py-8 sm:py-16 bg-slate-900 relative overflow-hidden">
              {/* Background décoratif */}
              <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>

              <div className="container mx-auto px-4 max-w-7xl relative z-10">
                
                {/* Titre */}
                <div className="text-center sm:flex sm:items-center sm:justify-between mb-6 sm:mb-10">
                  <div className="mb-4 sm:mb-0">
                    <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-3 text-purple-400">
                      <CheckCircle size={14} />
                      <span>Artisans vérifiés</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-1 sm:mb-2">
                      Nos Créateurs
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-base">
                      Des artisans passionnés et talentueux
                    </p>
                  </div>
                  
                  {/* Boutons navigation desktop */}
                  {suppliers.length > 6 && (
                    <div className="hidden sm:flex gap-2">
                      <button
                        onClick={() => scroll(suppliersScrollRef, 'left')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => scroll(suppliersScrollRef, 'right')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid ou Scroll selon le nombre */}
                <div className="relative">
                  <div 
                    ref={suppliersScrollRef}
                    className={`${
                      suppliers.length <= 6 
                        ? 'grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4' 
                        : 'flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth'
                    }`}
                  >
                    {suppliers.map((supplier, index) => (
                      <div 
                        key={supplier.id || index}
                        className={`${suppliers.length > 6 ? 'flex-shrink-0 w-[110px] sm:w-[140px]' : ''} bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 text-center snap-center hover:bg-slate-800 hover:border-purple-500/30 transition-all group cursor-pointer hover:scale-105`}
                      >
                        <div className="relative mx-auto mb-3">
                          {/* Avatar avec dégradé unique */}
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                            index % 5 === 0 ? 'from-purple-500 to-purple-600' :
                            index % 5 === 1 ? 'from-blue-500 to-blue-600' :
                            index % 5 === 2 ? 'from-pink-500 to-pink-600' :
                            index % 5 === 3 ? 'from-amber-500 to-amber-600' :
                            'from-green-500 to-green-600'
                          } text-white flex items-center justify-center text-xl font-bold shadow-xl mx-auto group-hover:rotate-6 transition-transform duration-300`}>
                            {supplier.name?.charAt(0) || 'C'}
                          </div>
                          
                          {/* Badge vérifié */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        </div>

                        {/* Nom */}
                        <h3 className="font-bold text-xs text-slate-100 mb-1 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                          {supplier.name}
                        </h3>
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-[10px] text-green-400 font-medium">Vérifié</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Indicateur scroll mobile */}
                  {suppliers.length > 6 && (
                    <div className="sm:hidden text-center mt-4">
                      <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                        <ChevronLeft size={12} className="animate-pulse" />
                        Glissez pour voir plus
                        <ChevronRight size={12} className="animate-pulse" />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
      {/* ========================================
          9️⃣ COMMENT ÇA MARCHE - Grid 3 colonnes
          ======================================== */}
      <section className="py-8 sm:py-16 bg-slate-950">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Titre centré sur mobile */}
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-2 sm:mb-4">
              Commander en 3 étapes
            </h2>
            <p className="text-slate-400 text-xs sm:text-base">
              Simple, rapide et sécurisé
            </p>
          </div>

          {/* Grid 3 colonnes SUR TOUTES TAILLES */}
          <div className="grid grid-cols-3 gap-2 sm:gap-10 max-w-5xl mx-auto">
            {[
              { 
                icon: ShoppingBag, 
                title: 'Choisissez', 
                desc: 'Parcourez le catalogue',
                color: 'bg-blue-600',
                step: '1'
              },
              { 
                icon: MapPin, 
                title: 'Commandez', 
                desc: 'Validez l\'adresse',
                color: 'bg-purple-600',
                step: '2'
              },
              { 
                icon: Clock, 
                title: 'Savourez', 
                desc: 'Recevez en 2h',
                color: 'bg-green-600',
                step: '3'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Ligne de connexion - desktop uniquement */}
                {i < 2 && (
                  <div className="hidden sm:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent"></div>
                )}

                <div className={`${step.color} w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-5 shadow-xl`}>
                  <step.icon size={20} className="text-white sm:w-8 sm:h-8" strokeWidth={2} />
                </div>

                <h3 className="font-serif text-sm sm:text-2xl font-bold text-slate-100 mb-1 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-base leading-relaxed px-1">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          🔟 CTA FINAL - Grid 2 colonnes (même endroit que les 3 étapes)
          ======================================== */}
      <section className="py-8 sm:py-16 bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10 px-4 max-w-7xl">
          {/* Grid 2 colonnes sur toutes tailles */}
          <div className="grid grid-cols-2 gap-3 sm:gap-8 max-w-5xl mx-auto">
            
            {/* CTA Commander */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl sm:rounded-2xl p-5 sm:p-10 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <ShoppingBag size={28} className="mb-2 sm:mb-6 sm:w-10 sm:h-10" />
                <h3 className="text-base sm:text-3xl font-serif font-bold mb-2 sm:mb-4">
                  Commandez<br className="hidden sm:block"/> dès maintenant
                </h3>
                <p className="text-purple-100 mb-3 sm:mb-8 text-xs sm:text-base leading-relaxed hidden sm:block">
                  Découvrez notre catalogue
                </p>
                <Link to="/menu">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-purple-700 px-4 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2 text-xs sm:text-base"
                  >
                    Voir le menu
                    <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* CTA Ambassadeur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm text-slate-100 rounded-xl sm:rounded-2xl p-5 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-700/50 group hover:border-purple-500/30 transition-all"
            >
              <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <Gift size={28} className="mb-2 sm:mb-6 text-purple-400 sm:w-10 sm:h-10" />
                <h3 className="text-base sm:text-3xl font-serif font-bold mb-2 sm:mb-4">
                  Rejoignez<br className="hidden sm:block"/> notre réseau
                </h3>
                <p className="text-slate-400 mb-3 sm:mb-8 text-xs sm:text-base leading-relaxed hidden sm:block">
                  Gagnez des commissions
                </p>
                <Link to="/partner/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-purple-600 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2 text-xs sm:text-base"
                  >
                    Devenir ambassadeur
                    <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;