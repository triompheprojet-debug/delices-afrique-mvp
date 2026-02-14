import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Gift, ArrowRight } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 relative overflow-hidden">
      
      {/* Background effects subtils */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10 px-4 max-w-7xl">
        
        {/* Grid 1 colonne sur mobile, 2 colonnes sur desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* CTA Commander */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <ShoppingBag size={32} className="mb-4 sm:mb-5 lg:mb-6 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
              
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold mb-2 sm:mb-3 lg:mb-4">
                Commandez dès maintenant
              </h3>
              
              <p className="text-purple-100 mb-5 sm:mb-6 lg:mb-8 text-sm sm:text-base leading-relaxed">
                Découvrez notre catalogue de pâtisseries africaines d'exception
              </p>
              
              <Link to="/menu">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full bg-white text-purple-700 px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-lg lg:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Voir le menu
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* CTA Ambassadeur */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-slate-800/40 backdrop-blur-sm text-slate-100 rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden border border-slate-700/40 group hover:border-purple-500/30 transition-all"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <Gift size={32} className="mb-4 sm:mb-5 lg:mb-6 text-purple-400 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
              
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold mb-2 sm:mb-3 lg:mb-4">
                Rejoignez notre réseau
              </h3>
              
              <p className="text-slate-400 mb-5 sm:mb-6 lg:mb-8 text-sm sm:text-base leading-relaxed">
                Gagnez des commissions en recommandant nos produits
              </p>
              
              <Link to="/partner/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-lg lg:rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Devenir ambassadeur
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
