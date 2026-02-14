import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';

// Import des composants
import LoadingScreen from '../../components/client/home/LoadingScreen';
import HeroSection from '../../components/client/home/HeroSection';
import StatsSection from '../../components/client/home/StatsSection';
import FeaturedProductsSection from '../../components/client/home/FeaturedProductsSection';
import WhyChooseUsSection from '../../components/client/home/WhyChooseUsSection';
import AmbassadorProgramSection from '../../components/client/home/AmbassadorProgramSection';
import CompanyPartnersSection from '../../components/client/home/CompanyPartnersSection';
import TopAmbassadorsSection from '../../components/client/home/TopAmbassadorsSection';
import SuppliersSection from '../../components/client/home/SuppliersSection';
import HowItWorksSection from '../../components/client/home/HowItWorksSection';
import FinalCTASection from '../../components/client/home/FinalCTASection';

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
      <LoadingScreen loading={loading} />

      {/* 1️⃣ HERO SECTION */}
      <HeroSection />

      {/* 2️⃣ STATS */}
      <StatsSection stats={stats} />

      {/* 3️⃣ PRODUITS VEDETTES */}
      <FeaturedProductsSection 
        featuredProducts={featuredProducts}
        setSelectedProduct={setSelectedProduct}
        productsScrollRef={productsScrollRef}
        scroll={scroll}
      />

      {/* 4️⃣ POURQUOI NOUS CHOISIR */}
      <WhyChooseUsSection />

      {/* 5️⃣ PROGRAMME AMBASSADEURS */}
      <AmbassadorProgramSection />

      {/* 6️⃣ ENTREPRISES PARTENAIRES */}
      <CompanyPartnersSection companyPartners={companyPartners} />

      {/* 7️⃣ TOP AMBASSADEURS */}
      <TopAmbassadorsSection 
        topPartners={topPartners}
        showAllPartners={showAllPartners}
        partnersScrollRef={partnersScrollRef}
        scroll={scroll}
      />

      {/* 8️⃣ NOS CRÉATEURS */}
      <SuppliersSection 
        suppliers={suppliers}
        suppliersScrollRef={suppliersScrollRef}
        scroll={scroll}
      />

      {/* 9️⃣ COMMENT ÇA MARCHE */}
      <HowItWorksSection />

      {/* 🔟 CTA FINAL */}
      <FinalCTASection />

    </div>
  );
};

export default Home;
