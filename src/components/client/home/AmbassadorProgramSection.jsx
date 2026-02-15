import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gift, ChevronLeft, ChevronRight, DollarSign, Users, 
  Target, Award, ArrowRight, CheckCircle 
} from 'lucide-react';

const AmbassadorProgramSection = () => {
  const levels = [
    { 
      icon: DollarSign,
      benefitTitle: 'Revenus récurrents',
      benefitDesc: 'Gagnez automatiquement par vente',
      benefitColor: 'from-green-500 to-emerald-600',
      name: 'Standard', 
      commission: '150 FCFA',
      earnings: '4,500 FCFA/mois',
      sales: 'Dès la 1ère vente',
      color: 'from-green-600 to-slate-700',
      highlight: false
    },
    { 
      icon: Users,
      benefitTitle: 'Système clé en main',
      benefitDesc: 'Code unique + tracking temps réel',
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
      benefitDesc: 'Montez en grade facilement',
      benefitColor: 'from-amber-500 to-orange-600',
      name: 'Premium', 
      commission: '300 FCFA',
      earnings: '9,000 FCFA/mois',
      sales: 'Dès 150 ventes',
      color: 'from-amber-500 to-amber-600',
      highlight: false
    }
  ];

  return (
    <section className="py-10 sm:py-14 lg:py-20 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto relative z-10 px-4 max-w-7xl">
        
        {/* Titre centré */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-5 text-purple-400"
          >
            <Gift size={14} className="sm:w-4 sm:h-4" />
            <span>Programme Ambassadeurs</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-3 sm:mb-4 px-4">
            Transformez votre influence
            <br className="hidden sm:block"/>
            <span className="text-purple-400"> en revenus passifs</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Rejoignez nos ambassadeurs et percevez des commissions automatiques
          </p>
        </div>

        {/* Niveaux ambassadeurs - Grid sur desktop, scroll sur mobile */}
        <div className="mb-10 sm:mb-12 lg:mb-14">
          
          {/* Indicateur scroll mobile uniquement */}
          <div className="lg:hidden text-center mb-4">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <ChevronLeft size={12} />
              <span>Glissez pour voir les niveaux</span>
              <ChevronRight size={12} />
            </p>
          </div>

          {/* Container - scroll mobile / grid desktop */}
          <div className="overflow-x-auto lg:overflow-visible pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
            <div className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 lg:max-w-6xl lg:mx-auto min-w-max lg:min-w-0">
              {levels.map((level, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[280px] xs:w-[300px] sm:w-[320px] lg:w-auto snap-center"
                >
                  {/* Bloc avantage */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-5 sm:p-6 hover:border-purple-500/30 transition-all mb-4"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${level.benefitColor} flex items-center justify-center mb-4 shadow-lg`}>
                      <level.icon size={22} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-100 mb-2">{level.benefitTitle}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{level.benefitDesc}</p>
                  </motion.div>

                  {/* Bloc niveau */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className={`relative bg-slate-800/40 rounded-xl p-5 sm:p-6 border ${
                      level.highlight ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-slate-700/40'
                    }`}
                  >
                    {level.highlight && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Populaire
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}>
                      <Award size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-center mb-3 text-slate-100">{level.name}</h3>
                    
                    <div className="text-center mb-4">
                      <p className="text-2xl sm:text-3xl font-bold text-purple-400">{level.commission}</p>
                      <p className="text-xs text-slate-500">par vente</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-slate-700/30">
                      <p className="text-xs text-slate-400 text-center mb-1">Potentiel mensuel</p>
                      <p className="text-base sm:text-lg font-bold text-green-400 text-center">{level.earnings}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 text-center">avec 30 ventes/mois</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 sm:px-10 lg:px-12 py-3.5 sm:py-4 lg:py-5 rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-xl shadow-lg hover:shadow-purple-500/30 inline-flex items-center justify-center gap-2 sm:gap-3 transition-all"
            >
              Commencer à gagner maintenant
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
          </Link>
          
          <p className="text-slate-500 text-xs sm:text-sm mt-4">
            Gratuit • Sans engagement • Retraits instantanés
          </p>
        </div>
      </div>
    </section>
  );
};

export default AmbassadorProgramSection;
