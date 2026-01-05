import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChefHat, Clock, Truck, ShoppingBag, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProductCard from '../../components/client/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le Carrousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Valeur par défaut

  // 1. CHARGEMENT DES PRODUITS (Seulement en stock)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), where("inStock", "==", true));
        const querySnapshot = await getDocs(q);
        let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Mélange aléatoire (Fisher-Yates)
        for (let i = products.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [products[i], products[j]] = [products[j], products[i]];
        }

        setFeaturedProducts(products);
        setLoading(false);
      } catch (error) {
        console.error("Erreur fetch home:", error);
        setLoading(false);
      }
    };

    fetchFeatured();
    
    // 2. LOGIQUE RESPONSIVE (MOBILE = 2 PRODUITS)
    const handleResize = () => {
      // Si l'écran est petit (< 768px), on affiche 2 items. Sinon 4.
      if (window.innerWidth < 768) {
        setItemsPerPage(2); 
      } else {
        setItemsPerPage(4); 
      }
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. ROTATION AUTOMATIQUE
  useEffect(() => {
    if (featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); 

    return () => clearInterval(interval);
  }, [currentIndex, featuredProducts.length, itemsPerPage]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + itemsPerPage >= featuredProducts.length) ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex === 0) ? Math.max(0, featuredProducts.length - itemsPerPage) : prevIndex - 1
    );
  };

  const visibleProducts = featuredProducts.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="font-sans bg-gray-50">
      
      {/* HERO SECTION 
         - pt-24 : Ajoute de l'espace en haut pour éviter que le header (barre blanche) ne cache le texte 
         - text-white : Force le texte en blanc malgré le index.css 
      */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12">
        {/* Fond */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1920&auto=format&fit=crop" 
            alt="Pâtisserie Background" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-brand-brown/90"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-6 md:space-y-8">
          <div className="animate-fade-in-down">
            <span className="inline-block border border-brand-beige/50 text-brand-beige px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-md bg-black/30 mb-4">
              <Star size={12} className="inline mb-1 mr-1"/> Artisanat d'Exception
            </span>
            {/* On force text-white ici pour surcharger le h1 du index.css */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight drop-shadow-xl">
              L'Art de la <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-beige to-brand-red">Gourmandise.</span>
            </h1>
          </div>
          
          <p className="text-gray-200 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-light opacity-95 animate-fade-in-up delay-100">
            Une fusion audacieuse entre la finesse de la pâtisserie française et les saveurs vibrantes de l'Afrique.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-fade-in-up delay-200">
            <Link 
              to="/menu" 
              className="bg-brand-red hover:bg-red-700 text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-brand-red/30 flex items-center justify-center gap-2 group"
            >
              <ShoppingBag size={20} className="group-hover:-translate-y-1 transition-transform" />
              Commander
            </Link>
            <Link 
              to="/contact" 
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-brand-brown px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              Nous trouver
            </Link>
          </div>
        </div>
      </section>

      {/* VALEURS (Décalage vers le haut pour mordre sur le hero) */}
      <section className="relative -mt-10 z-20 container mx-auto px-4 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border border-gray-100">
          {[
            { icon: ChefHat, title: "Fait Maison", text: "Ingrédients locaux." },
            { icon: Clock, title: "Fraîcheur 24h", text: "Préparé le matin." },
            { icon: Truck, title: "Livraison Rapide", text: "Directement chez vous." }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-brand-beige/20 text-brand-brown rounded-xl flex items-center justify-center mb-2">
                <item.icon size={24} />
              </div>
              <h3 className="font-bold text-gray-800">{item.title}</h3>
              <p className="text-gray-500 text-xs">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NOS COUPS DE CŒUR (Carrousel) */}
      <section className="py-8 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-row justify-between items-end mb-6">
             <div>
                <span className="text-brand-red font-bold text-xs tracking-widest uppercase">Nos Vedettes</span>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-brand-brown mt-1">À la Une</h2>
             </div>
             <div className="flex gap-2">
                <button onClick={prevSlide} className="p-2 rounded-full border border-gray-300 hover:bg-brand-brown hover:text-white transition"><ChevronLeft size={18}/></button>
                <button onClick={nextSlide} className="p-2 rounded-full border border-gray-300 hover:bg-brand-brown hover:text-white transition"><ChevronRight size={18}/></button>
             </div>
          </div>
          
          {/* GRID : 
             - grid-cols-2 sur mobile (pour afficher 2 produits côte à côte)
             - gap-3 sur mobile (espacement réduit pour que ça rentre)
          */}
          <div className="min-h-[300px]">
            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                 ))}
               </div>
            ) : featuredProducts.length > 0 ? (
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-fade-in">
                  {visibleProducts.map((product) => (
                     <div key={product.id} className="transform transition-all duration-500">
                        {/* On passe une prop "compact" au ProductCard si on veut ajuster l'affichage interne (optionnel) */}
                        <ProductCard product={product} />
                     </div>
                  ))}
               </div>
            ) : (
               <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                 <p className="text-gray-500 text-sm">Chargement des délices...</p>
               </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/menu" 
              className="inline-flex items-center gap-2 text-brand-brown font-bold text-sm md:text-base hover:underline underline-offset-4 decoration-brand-red transition"
            >
              Voir tout le menu <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-brown text-white overflow-hidden relative">
        {/* Cercles déco */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
             <div className="lg:w-1/2">
                <div className="relative">
                   <img 
                     src="https://images.unsplash.com/photo-1615690055356-14dc400892d6?q=80&w=1114&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                     alt="Chef" 
                     className="rounded-3xl shadow-2xl w-full object-cover h-[500px]"
                   />
                   <div className="absolute -bottom-6 -right-6 bg-brand-beige text-brand-brown p-6 rounded-2xl shadow-lg hidden md:block">
                      <p className="font-serif font-bold text-3xl">15+</p>
                      <p className="text-sm font-bold uppercase tracking-wide">Années d'expérience</p>
                   </div>
                </div>
             </div>
             
             <div className="lg:w-1/2 space-y-6">
                <div className="flex items-center gap-2 text-brand-beige font-bold uppercase tracking-widest text-sm">
                   <Heart size={16} fill="currentColor"/> Notre Passion
                </div>
                <h4 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                   Plus qu'une pâtisserie, <br/> un héritage.
                </h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                   "Chez Délices d'Afrique, nous croyons que chaque gâteau a une âme. 
                   Nés de la rencontre entre les techniques françaises rigoureuses et les fruits ensoleillés de notre terroir, 
                   nos desserts ne sont pas seulement mangés, ils sont vécus."
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                   <div>
                      <h4 className="font-bold text-xl text-brand-beige mb-1">100% Naturel</h4>
                      <p className="text-sm text-gray-400">Aucun conservateur, que du vrai.</p>
                   </div>
                   <div>
                      <h4 className="font-bold text-xl text-brand-beige mb-1">Support Local</h4>
                      <p className="text-sm text-gray-400">Nous soutenons nos fermiers locaux.</p>
                   </div>
                </div>
                <div className="pt-6">
                   <Link to="/about" className="bg-white text-brand-brown px-8 py-3 rounded-xl font-bold hover:bg-brand-beige transition">
                      Découvrir notre histoire
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </section>
      {/* 5. ÉTAPES DE COMMANDE SIMPLIFIÉES */}
      <section className="py-20 bg-gray-50">
         <div className="container mx-auto px-4">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-serif font-bold text-gray-800">Comment ça marche ?</h2>
               <p className="text-gray-500 mt-2">Votre bonheur en 4 étapes simples</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                 { step: "01", title: "Choisissez", desc: "Parcourez notre menu gourmand." },
                 { step: "02", title: "Commandez", desc: "Remplissez votre panier en un clic." },
                 { step: "03", title: "Validation", desc: "Nous confirmons la commande." },
                 { step: "04", title: "Dégustez", desc: "Livré chez vous ou à emporter." }
               ].map((item, idx) => (
                  <div key={idx} className="relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group">
                     <span className="text-6xl font-bold text-gray-100 absolute top-4 right-4 group-hover:text-brand-brown/10 transition-colors">{item.step}</span>
                     <h3 className="text-xl font-bold text-brand-brown mb-2 relative z-10">{item.title}</h3>
                     <p className="text-gray-500 relative z-10">{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;