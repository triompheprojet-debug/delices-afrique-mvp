import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Target, Award, Users, Zap, 
  Shield, Gift, CheckCircle, ChevronRight, Sparkles,
  BarChart3, Clock, Share2, Smartphone, ArrowRight,
  Trophy, Rocket, Star, Lock, Eye, EyeOff
} from 'lucide-react';
import PartnerPublicHeader from '../../components/partner/PartnerPublicHeader';

const PartnerProgramInfo = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [calculatorSales, setCalculatorSales] = useState(50);

  // 💰 CALCUL DES GAINS (basé sur ConfigContext)
  const calculateEarnings = (sales) => {
    let level = 'Standard';
    let commission = 150;
    let discount = 150;

    if (sales >= 150) {
      level = 'Premium';
      commission = 300;
      discount = 200;
    } else if (sales >= 30) {
      level = 'Actif';
      commission = 250;
      discount = 200;
    }

    // Simulation : prix moyen produit 5000 FCFA
    const avgProductPrice = 5000;
    const totalRevenue = sales * commission;
    const monthlyEstimate = (sales / 30) * commission * 30; // Si on continue ce rythme

    return { level, commission, discount, totalRevenue, monthlyEstimate };
  };

  const earnings = calculateEarnings(calculatorSales);

  return (
    <div className="bg-slate-950 min-h-screen">
      <PartnerPublicHeader />
      {/* ========================================
          🏆 HERO SECTION - VISION MILLIONNAIRE
          ======================================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto relative z-10 px-4 py-20 max-w-6xl">
          
          {/* Badge exclusif */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 px-6 py-3 rounded-full backdrop-blur-md">
              <Sparkles className="text-purple-400" size={20} />
              <span className="text-slate-200 font-bold text-sm">Programme Ambassadeur Premium</span>
              <Trophy className="text-yellow-400" size={20} />
            </div>
          </motion.div>

          {/* Titre principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-slate-100 mb-6 leading-tight">
              Transformez votre réseau en{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                revenus passifs
              </span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Rejoignez l'élite des ambassadeurs Délices d'Afrique. 
              Recommandez nos produits premium, encaissez des commissions automatiquement. 
              <span className="text-purple-400 font-bold"> Sans stock, sans investissement, sans limites.</span>
            </p>
          </motion.div>

          {/* Stats impressionnantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
          >
            {[
              { value: '500K+', label: 'FCFA en commissions versées', icon: DollarSign, color: 'text-green-400' },
              { value: '1200+', label: 'Ventes générées', icon: TrendingUp, color: 'text-purple-400' },
              { value: '89', label: 'Ambassadeurs actifs', icon: Users, color: 'text-blue-400' },
              { value: '300K', label: 'Plus haut revenu mensuel', icon: Trophy, color: 'text-yellow-400' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all"
              >
                <stat.icon className={`${stat.color} mx-auto mb-3`} size={32} strokeWidth={2} />
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">{stat.value}</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link to="/partner/register">
              <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center gap-3 hover:scale-105">
                <Rocket size={24} />
                Commencer à gagner maintenant
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-slate-500 text-sm mt-4">
              Inscription gratuite · Sans engagement · Retraits instantanés
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          📋 COMMENT ÇA MARCHE - PROCESSUS SIMPLE
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-slate-400 text-lg">
              4 étapes ultra-simples pour commencer à gagner
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Inscrivez-vous',
                desc: 'Créez votre compte en 2 minutes. Obtenez votre code promo unique.',
                color: 'from-blue-600 to-blue-700'
              },
              {
                step: '02',
                icon: Share2,
                title: 'Partagez votre code',
                desc: 'Recommandez nos produits à vos contacts via WhatsApp, réseaux sociaux, etc.',
                color: 'from-purple-600 to-purple-700'
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Vos contacts commandent',
                desc: 'Ils utilisent votre code et bénéficient d\'une réduction. Vous encaissez une commission.',
                color: 'from-pink-600 to-pink-700'
              },
              {
                step: '04',
                icon: DollarSign,
                title: 'Encaissez vos gains',
                desc: 'Retirez vos commissions à tout moment via Mobile Money (MTN, Airtel).',
                color: 'from-green-600 to-green-700'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Numéro de l'étape */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-800 border-2 border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-400 text-sm z-10">
                  {step.step}
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 pt-8 h-full hover:border-purple-500/30 transition-all">
                  <div className={`bg-gradient-to-br ${step.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-xl`}>
                    <step.icon className="text-white" size={28} strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-100 mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          🎯 SYSTÈME DE NIVEAUX & GAINS
          ======================================== */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Système de niveaux progressifs
            </h2>
            <p className="text-slate-400 text-lg">
              Plus vous vendez, plus vous gagnez. Le succès appelle le succès.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Standard',
                icon: Star,
                gradient: 'from-amber-900 to-amber-700',
                minSales: '0-29 ventes',
                commission: '150 FCFA',
                discount: '150 FCFA',
                features: [
                  'Code promo personnel',
                  'Dashboard de suivi',
                  'Support 24/7',
                  'Retraits illimités'
                ]
              },
              {
                name: 'Actif',
                icon: Award,
                gradient: 'from-slate-400 to-slate-600',
                minSales: '30-149 ventes',
                commission: '250 FCFA',
                discount: '200 FCFA',
                badge: 'Populaire',
                features: [
                  'Tout du niveau Standard',
                  'Commission +67%',
                  'Badge "Ambassadeur Actif"',
                  'Bonus mensuels'
                ]
              },
              {
                name: 'Premium',
                icon: Trophy,
                gradient: 'from-yellow-600 to-amber-600',
                minSales: '150+ ventes',
                commission: '300 FCFA',
                discount: '200 FCFA',
                badge: 'Elite',
                features: [
                  'Tout du niveau Actif',
                  'Commission maximale',
                  'Badge "Elite"',
                  'Cadeaux exclusifs',
                  'Priorité support VIP'
                ]
              }
            ].map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative bg-slate-900/80 backdrop-blur-md border-2 rounded-3xl p-8 
                  ${i === 1 ? 'border-purple-500 scale-105 shadow-2xl shadow-purple-500/20' : 'border-slate-800'}
                  hover:border-purple-500/50 transition-all`}
              >
                {/* Badge */}
                {level.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full text-white text-sm font-bold">
                    {level.badge}
                  </div>
                )}

                {/* Icône niveau */}
                <div className={`bg-gradient-to-br ${level.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                  <level.icon className="text-white" size={36} strokeWidth={2} />
                </div>

                {/* Nom du niveau */}
                <h3 className="text-2xl font-serif font-bold text-slate-100 text-center mb-2">{level.name}</h3>
                <p className="text-slate-500 text-sm text-center mb-6">{level.minSales}</p>

                {/* Gains */}
                <div className="bg-slate-950/50 rounded-2xl p-4 mb-6 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Commission / vente</span>
                    <span className="text-green-400 font-bold text-lg">{level.commission}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Réduction client</span>
                    <span className="text-purple-400 font-bold text-lg">{level.discount}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {level.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Note importante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 text-center"
          >
            <Zap className="text-purple-400 mx-auto mb-3" size={32} />
            <p className="text-slate-300 text-lg">
              <span className="font-bold text-purple-400">Bonus surprise :</span> Sur les produits à forte marge, 
              vous pouvez gagner jusqu'à <span className="font-bold text-green-400">500 FCFA / vente</span> grâce au système de redistribution 50/30/20 !
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          🧮 CALCULATEUR DE GAINS INTERACTIF
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Calculez vos revenus potentiels
            </h2>
            <p className="text-slate-400 text-lg">
              Simulez vos gains selon votre volume de ventes
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-12"
          >
            {/* Slider */}
            <div className="mb-8">
              <label className="text-slate-300 font-bold mb-4 block text-center text-lg">
                Nombre de ventes par mois
              </label>
              <input 
                type="range" 
                min="1" 
                max="200" 
                value={calculatorSales}
                onChange={(e) => setCalculatorSales(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-slate-500 text-sm mt-2">
                <span>1</span>
                <span className="text-purple-400 font-bold text-2xl">{calculatorSales} ventes</span>
                <span>200</span>
              </div>
            </div>

            {/* Résultats */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-center">
                <p className="text-slate-400 text-sm mb-2">Votre niveau</p>
                <p className={`text-3xl font-bold mb-1 ${
                  earnings.level === 'Premium' ? 'text-yellow-400' : 
                  earnings.level === 'Actif' ? 'text-slate-400' : 'text-amber-700'
                }`}>
                  {earnings.level}
                </p>
                <p className="text-slate-500 text-xs">Commission : {earnings.commission} FCFA/vente</p>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-2xl p-6 text-center">
                <p className="text-green-400 text-sm mb-2">Revenus mensuels estimés</p>
                <p className="text-3xl font-bold text-green-400 mb-1">
                  {earnings.totalRevenue.toLocaleString()} F
                </p>
                <p className="text-green-300/70 text-xs">Soit ~{Math.round(earnings.totalRevenue / 30).toLocaleString()} F/jour</p>
              </div>
            </div>

            {/* Projection annuelle */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 text-center">
              <TrendingUp className="text-purple-400 mx-auto mb-3" size={32} />
              <p className="text-slate-300 text-lg">
                À ce rythme, vous pourriez gagner{' '}
                <span className="font-bold text-purple-400 text-2xl">
                  {(earnings.totalRevenue * 12).toLocaleString()} FCFA
                </span>
                {' '}par an
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Sans stock, sans capital, sans contrainte.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          💡 TRANSPARENCE CALCUL DES COMMISSIONS
          ======================================== */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Transparence totale sur les calculs
            </h2>
            <p className="text-slate-400 text-lg">
              Comprenez exactement comment vos commissions sont calculées
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-12">
            
            {/* Règle 1 */}
            <div className="mb-8 pb-8 border-b border-slate-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-100 mb-2">Marge de base protégée</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Chaque produit a une <span className="text-purple-400 font-bold">marge minimale de 1000 FCFA</span> réservée au créateur. 
                    Cette base est intouchable et garantit la pérennité de notre réseau de fournisseurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Règle 2 */}
            <div className="mb-8 pb-8 border-b border-slate-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-100 mb-2">Commission de base selon niveau</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Vous recevez une commission fixe par vente, qui augmente avec votre niveau :
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-amber-700 font-bold mb-1">Standard</p>
                      <p className="text-2xl font-bold text-slate-100">150 F</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-slate-400 font-bold mb-1">Actif</p>
                      <p className="text-2xl font-bold text-slate-100">250 F</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-yellow-400 font-bold mb-1">Premium</p>
                      <p className="text-2xl font-bold text-slate-100">300 F</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Règle 3 */}
            <div className="mb-8 pb-8 border-b border-slate-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-100 mb-2">Bonus sur produits à forte marge</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Si la marge réelle dépasse 1000 FCFA, le surplus est redistribué selon la règle <span className="text-purple-400 font-bold">50/30/20</span> :
                  </p>
                  <div className="bg-slate-950/50 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-300">🏢 Plateforme</span>
                      <span className="text-blue-400 font-bold">50%</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-300">🤝 Vous (Ambassadeur)</span>
                      <span className="text-green-400 font-bold">30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🎁 Client (réduction)</span>
                      <span className="text-purple-400 font-bold">20%</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Exemple : Produit avec 2000 FCFA de marge → Surplus de 1000 FCFA → Vous gagnez <span className="text-green-400 font-bold">300 FCFA bonus</span> en plus de votre commission de base !
                  </p>
                </div>
              </div>
            </div>

            {/* Règle 4 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-100 mb-2">Validation & paiement</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Vos commissions sont créditées <span className="text-green-400 font-bold">dès que la commande est livrée</span>. 
                    Retirez vos gains à tout moment via Mobile Money, sans minimum ni frais cachés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          ❓ FAQ COMPLÈTE
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-slate-400 text-lg">
              Tout ce que vous devez savoir avant de commencer
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Dois-je investir de l\'argent pour devenir ambassadeur ?',
                a: 'Non, absolument pas. L\'inscription est 100% gratuite et sans engagement. Vous ne gérez pas de stock, vous ne payez aucun produit. Vous recommandez simplement nos produits et encaissez des commissions.'
              },
              {
                q: 'Comment mes clients utilisent mon code promo ?',
                a: 'Vous partagez votre code unique (ex: DA-KOU-789). Vos contacts l\'entrent au moment de la commande. Ils reçoivent une réduction immédiate, et vous encaissez automatiquement votre commission dès livraison.'
              },
              {
                q: 'Puis-je voir mes ventes en temps réel ?',
                a: 'Oui ! Vous avez accès à un tableau de bord complet 24/7. Vous voyez chaque vente, le statut des commandes, vos gains du jour/mois, votre niveau actuel et vos projections.'
              },
              {
                q: 'Comment retirer mes gains ?',
                a: 'Demandez un retrait depuis votre portefeuille. Vous recevez l\'argent via Mobile Money (MTN ou Airtel) sous 24-48h maximum. Aucun minimum imposé, aucun frais caché.'
              },
              {
                q: 'Combien de temps pour atteindre le niveau Premium ?',
                a: 'Il faut 150 ventes validées. Si vous partagez activement (famille, collègues, réseaux sociaux), certains y arrivent en 3-6 mois. Tout dépend de votre engagement.'
              },
              {
                q: 'Puis-je perdre mon niveau ?',
                a: 'Non. Une fois un niveau atteint, il est acquis définitivement. Vos ventes passées sont comptabilisées à vie.'
              },
              {
                q: 'Y a-t-il une limite de gains ?',
                a: 'Absolument aucune. Plus vous recommandez, plus vous gagnez. Nos meilleurs ambassadeurs encaissent 150K-300K FCFA/mois.'
              },
              {
                q: 'Que se passe-t-il si le client annule ?',
                a: 'Si la commande est annulée avant livraison, la commission n\'est pas versée. Seules les commandes livrées comptent.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-all"
                >
                  <span className="font-bold text-slate-100 pr-4">{faq.q}</span>
                  <ChevronRight 
                    className={`text-purple-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} 
                    size={20} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          🚀 CTA FINAL - INSCRIPTION
          ======================================== */}
      <section className="py-20 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10 px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Rocket className="text-purple-400 mx-auto mb-6" size={64} />
            <h2 className="text-4xl sm:text-6xl font-serif font-bold text-slate-100 mb-6 leading-tight">
              Prêt à changer votre vie financière ?
            </h2>
            <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
              Rejoignez dès maintenant la communauté des ambassadeurs qui génèrent des revenus passifs tous les jours.
            </p>

            <Link to="/partner/register">
              <button className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center gap-3 hover:scale-105 mb-6">
                S'inscrire gratuitement
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <p className="text-slate-500 text-sm">
              Aucune carte bancaire requise · Aucun engagement · Retraits instantanés
            </p>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-slate-400 text-sm">+500K versés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-slate-400 text-sm">89 ambassadeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-slate-400 text-sm">Note 4.9/5</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Style pour le slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default PartnerProgramInfo;