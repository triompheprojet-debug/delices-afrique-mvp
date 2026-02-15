import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShoppingBag, Award,
  Zap, Sparkles, Shield, CheckCircle, MapPin, Star
} from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative max-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image avec overlay */}
      <div className="absolute inset-0 z-0">
        {/* Image de fond - Remplacez par votre image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://media.istockphoto.com/id/2227088536/fr/photo/serveur-jeune-adulte-caucasien-prenant-commande-dun-couple-multiethnique-dans-un-restaurant.jpg?s=612x612&w=0&k=20&c=KTPfWWxJGAfLa-FSWu0U0B0rFKjjfUejMXvMEt8aqXg=')`,
          }}
        >
          {/* Overlay gradient pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-purple-900/90"></div>
          
          {/* Effet de grain subtil */}
          <div className="absolute inset-0 grain-texture opacity-40"></div>
        </div>

        {/* Effets lumineux subtils */}
        <div className="absolute top-10 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto relative z-30 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge localisation */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-full mb-6 text-sm"
          >
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-slate-200">Pointe-Noire, Congo</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </motion.div>

          {/* Titre principal */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold mb-5 sm:mb-6 leading-tight"
          >
            <span className="text-white">L'Excellence de la</span><br/>
            <span className="gradient-text">Pâtisserie Africaine</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light px-4"
          >
            Commandez en ligne, savourez chez vous.
            <span className="hidden sm:inline"> Des créateurs passionnés, des créations uniques.</span>
          </motion.p>

          {/* Boutons CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10 px-4"
          >
            <Link to="/menu" className="w-full sm:w-auto">
              <button className="group w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="w-5 h-5" />
                <span>Commander</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <Link to="/about" className="w-full sm:w-auto">
              <button className="w-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-slate-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-slate-800 transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Découvrir</span>
              </button>
            </Link>
          </motion.div>

          {/* Mini badges avantages */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto"
          >
            {[
              { icon: Zap, text: 'Livraison 2h' },
              { icon: Shield, text: 'Paiement sécurisé' },
              { icon: Award, text: 'Qualité premium' },
              { icon: CheckCircle, text: '100% artisanal' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-slate-700/50">
                <item.icon className="w-4 h-4 text-purple-400" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;