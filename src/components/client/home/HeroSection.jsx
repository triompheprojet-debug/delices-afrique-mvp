import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShoppingBag, Award,
  Zap, MapPin, CheckCircle, Shield, Sparkles
} from 'lucide-react';

const HeroSection = () => {
  return (
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
  );
};

export default HeroSection;