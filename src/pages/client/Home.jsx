import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChefHat, Clock, Truck, CheckCircle, ShoppingBag } from 'lucide-react';
import ProductList from '../../components/client/ProductList';


const Home = () => {
  return (
    <div className="font-sans">
      
      {/* 1. HERO SECTION : L'Effet "Waouh" */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Image de fond avec overlay sombre */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1528591922185-a0eb2f8f50b6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Pâtisserie Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Contenu Central */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          <span className="text-brand-beige text-lg font-bold tracking-[0.2em] uppercase">
            Artisan Pâtissier depuis 2010
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
            L'excellence du goût, <br/>
            <span className="text-brand-beige">la touche africaine.</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Découvrez nos créations uniques, préparées chaque matin avec passion. 
            Commandez en ligne, payez à la livraison.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
            <Link 
              to="/menu" 
              className="bg-brand-red hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Commander maintenant
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-brand-brown text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BANNIÈRE DE CONFIANCE (Valeurs) */}
      <section className="bg-brand-brown text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-white/10 p-4 rounded-full group-hover:bg-brand-beige group-hover:text-brand-brown transition duration-300">
              <ChefHat size={32} />
            </div>
            <h4 className="text-xl font-bold font-serif">Fait Maison</h4>
            <p className="text-gray-300 text-sm px-8">Nos chefs préparent tout sur place, sans produits industriels.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-white/10 p-4 rounded-full group-hover:bg-brand-beige group-hover:text-brand-brown transition duration-300">
              <Clock size={32} />
            </div>
            <h4 className="text-xl font-bold font-serif">Fraîcheur Garantie</h4>
            <p className="text-gray-300 text-sm px-8">Préparé le matin même pour une expérience gustative optimale.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="bg-white/10 p-4 rounded-full group-hover:bg-brand-beige group-hover:text-brand-brown transition duration-300">
              <Truck size={32} />
            </div>
            <h4 className="text-xl font-bold font-serif">Livraison Locale</h4>
            <p className="text-gray-300 text-sm px-8">Nous livrons rapidement dans toute la ville de Pointe-Noire.</p>
          </div>
        </div>
      </section>

      {/* 3. SECTION À PROPOS (Storytelling) */}
      <section className="py-20 bg-brand-beige/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Image (Grid de 2 images pour effet design) */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1615690055356-14dc400892d6?q=80&w=1114&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Chef en action" 
                className="rounded-2xl shadow-xl mt-12 transform -rotate-2 hover:rotate-0 transition duration-500"
              />
              <img 
                src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=1050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Nos gâteaux" 
                className="rounded-2xl shadow-xl mb-12 transform rotate-2 hover:rotate-0 transition duration-500"
              />
            </div>
            
            {/* Texte */}
            <div className="w-full md:w-1/2 space-y-6">
              <h4 className="text-brand-red font-bold uppercase tracking-wider">Notre Histoire</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-brown">
                Plus qu'une pâtisserie, <br/> un art de vivre.
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Fondée avec l'idée simple que chaque bouchée doit être un souvenir, 
                Délices d'Afrique mélange le savoir-faire de la pâtisserie française 
                avec les saveurs authentiques de notre terroir.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Que ce soit pour un mariage, un anniversaire ou un simple plaisir 
                coupable, nous mettons tout notre cœur dans nos créations.
              </p>
              <div className="pt-4">
                <Link to="/contact" className="text-brand-brown font-bold border-b-2 border-brand-brown hover:text-brand-red hover:border-brand-red transition">
                  En savoir plus sur nous
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NOS PRODUITS PHARES (Appel dynamique) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-brand-brown mb-3">Nos Coups de Cœur</h2>
            <p className="text-gray-500">Les préférés de nos clients cette semaine</p>
          </div>
          
          {/* On affiche une sélection limitée (ex: Gâteaux uniquement) */}
          <ProductList limit={4} /> 
          
          
          
          
          <div className="text-center mt-12">
            <Link 
              to="/menu" 
              className="inline-flex items-center gap-2 bg-white border-2 border-brand-brown text-brand-brown px-8 py-3 rounded-full font-bold hover:bg-brand-brown hover:text-white transition shadow-sm"
            >
              Voir tout le menu <ArrowRight size={20}/>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. COMMENT ÇA MARCHE (Rassurance) */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-brand-brown mb-12">Commander n'a jamais été aussi simple</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Ligne de connexion (Desktop uniquement) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

            {[
              { icon: ShoppingBag, title: "1. Choisissez", desc: "Ajoutez vos envies au panier." },
              { icon: CheckCircle, title: "2. Validez", desc: "Remplissez le formulaire simple." },
              { icon: Clock, title: "3. On prépare", desc: "Nous vous confirmons la commande." },
              { icon: Truck, title: "4. Dégustez", desc: "Paiement à la livraison/retrait." },
            ].map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center">
                <div className="w-24 h-24 bg-brand-beige/20 rounded-full flex items-center justify-center text-brand-brown mb-6 mb-4">
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TÉMOIGNAGES (Preuve Sociale) */}
      <section className="py-20 bg-brand-brown text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Ils se sont régalés</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", note: 5, txt: "Le gâteau Forêt Noire était incroyable. Pas trop sucré, parfait !" },
              { name: "Marc A.", note: 5, txt: "Livraison à l'heure pour l'anniversaire de ma fille. Merci pour le service." },
              { name: "Julie K.", note: 4, txt: "Les macarons sont délicieux, je recommande vivement." },
            ].map((avis, i) => (
              <div key={i} className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} size={16} fill={starI < avis.note ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="italic text-lg mb-6">"{avis.txt}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-beige rounded-full flex items-center justify-center text-brand-brown font-bold">
                    {avis.name.charAt(0)}
                  </div>
                  <span className="font-bold">{avis.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;