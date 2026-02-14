import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Wallet, Clock, Lock, AlertCircle, CheckCircle2, 
  ChevronRight, Truck, TrendingUp, Info, Package, 
  DollarSign, Ban, RefreshCw, FileText, ArrowRight,
  Sparkles, Award, Target, BarChart3, Zap, User, Store,
  XCircle, PlayCircle, PauseCircle, CheckCircle,Scale,
} from 'lucide-react';

/**
 * 🏪 PAGE D'INFORMATION FOURNISSEUR - DÉLICES D'AFRIQUE
 * 
 * Cette page explique TOUT le fonctionnement de l'espace fournisseur.
 * Design séquentiel et direct - toutes les infos visibles d'un coup.
 */

const SupplierInfos = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-slate-950 min-h-screen">
      
      {/* ========================================
          🏆 HERO SECTION
          ======================================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto relative z-10 px-4 py-20 max-w-6xl">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 px-6 py-3 rounded-full backdrop-blur-md">
              <Sparkles className="text-purple-400" size={20} />
              <span className="text-slate-200 font-bold text-sm">Espace Fournisseur Premium</span>
              <Award className="text-yellow-400" size={20} />
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
              Guide du Partenaire{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Délices d'Afrique
              </span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              L'excellence opérationnelle pour une collaboration durable. 
              Maîtrisez les <span className="text-purple-400 font-bold">4 piliers de notre écosystème</span> pour maximiser votre succès.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { icon: Package, label: 'Gestion Produits', color: 'text-blue-400' },
              { icon: Truck, label: 'Commandes Séquentielles', color: 'text-green-400' },
              { icon: DollarSign, label: 'Paiements Automatisés', color: 'text-yellow-400' },
              { icon: ShieldCheck, label: 'Sécurité Garantie', color: 'text-purple-400' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all"
              >
                <item.icon className={`${item.color} mx-auto mb-3`} size={32} strokeWidth={2} />
                <p className="text-slate-300 text-sm font-medium">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================
          📋 SECTION 1: PRINCIPES FONDAMENTAUX
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full mb-4">
              <ShieldCheck className="text-purple-400" size={18} />
              <span className="text-purple-300 font-bold text-sm">Principes Fondamentaux</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              La Philosophie du Partenariat
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Notre collaboration repose sur une <strong className="text-purple-400">distinction claire des rôles</strong> pour garantir la qualité de service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Votre Rôle */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/20 to-slate-900/80 border border-purple-500/30 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <User className="text-purple-400" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Votre Rôle</h3>
              </div>
              <p className="text-purple-300 font-bold mb-4">L'Artisan - Expert du Produit</p>
              <ul className="space-y-3">
                {[
                  "Vous garantissez la qualité des produits",
                  "Vous assurez la préparation des commandes",
                  "Vous gérez la disponibilité du stock",
                  "Vous définissez vos prix fournisseur"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-purple-400 shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Notre Rôle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-pink-900/20 to-slate-900/80 border border-pink-500/30 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-500/20 p-3 rounded-xl">
                  <Store className="text-pink-400" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Notre Rôle</h3>
              </div>
              <p className="text-pink-300 font-bold mb-4">La Plateforme - Orchestrateur</p>
              <ul className="space-y-3">
                {[
                  "Nous gérons la technologie et le site",
                  "Nous validons les prix publics finaux",
                  "Nous assurons le marketing et la visibilité",
                  "Nous définissons la stratégie commerciale"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-pink-400 shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Règle importante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-orange-500/10 border-2 border-orange-500/30 p-6 rounded-2xl flex items-start gap-4"
          >
            <AlertCircle className="text-orange-400 shrink-0 mt-1" size={32} />
            <div>
              <h4 className="text-orange-300 font-bold text-xl mb-2">Point Crucial</h4>
              <p className="text-slate-200 text-lg leading-relaxed">
                Vous n'avez <strong className="text-white">jamais le contrôle total</strong> de la plateforme. 
                L'Admin reste <strong className="text-orange-400">l'autorité finale</strong> sur toutes les décisions stratégiques, 
                les validations de produits et les prix publics.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          💰 SECTION 2: MODÈLE FINANCIER
          ======================================== */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-4">
              <Wallet className="text-emerald-400" size={18} />
              <span className="text-emerald-300 font-bold text-sm">Modèle Économique</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Comment Fonctionnent les Paiements
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Un système transparent où vous encaissez directement mais reversez la part plateforme
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Ce que vous GAGNEZ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/50 border-2 border-emerald-500/30 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <TrendingUp className="text-emerald-400" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-300">Ce que vous GAGNEZ</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-medium">Votre Prix Fournisseur</span>
                    <span className="text-emerald-400 font-bold text-2xl font-mono">100%</span>
                  </div>
                  <p className="text-emerald-400/70 text-xs mt-2">Vous gardez l'intégralité</p>
                </div>
                
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-medium">Frais de Livraison</span>
                    <span className="text-emerald-400 font-bold text-2xl font-mono">90%</span>
                  </div>
                  <p className="text-emerald-400/70 text-xs mt-2">La majorité des frais de livraison</p>
                </div>
              </div>

              <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-500/20">
                <p className="text-sm text-emerald-200">
                  ✓ Vous encaissez <strong>directement du client</strong> le montant total de la commande
                </p>
              </div>
            </motion.div>
            
            {/* Ce que vous REVERSEZ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-orange-900/20 to-orange-950/50 border-2 border-orange-500/30 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-500/20 p-3 rounded-xl">
                  <DollarSign className="text-orange-400" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-orange-300">Ce que vous REVERSEZ</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-medium">Marge Plateforme</span>
                    <span className="text-orange-400 font-bold text-xl font-mono">Variable</span>
                  </div>
                  <p className="text-orange-400/70 text-xs mt-2">Définie par l'Admin lors de la validation</p>
                </div>
                
                <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-medium">Commission Service</span>
                    <span className="text-orange-400 font-bold text-xl font-mono">10%</span>
                  </div>
                  <p className="text-orange-400/70 text-xs mt-2">Sur les frais de livraison uniquement</p>
                </div>
              </div>

              <div className="bg-orange-950/50 p-4 rounded-xl border border-orange-500/20">
                <p className="text-sm text-orange-200">
                  ⚠️ À reverser <strong>quotidiennement</strong> via Mobile Money
                </p>
              </div>
            </motion.div>
          </div>

          {/* Le Cycle de Trésorerie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/20 to-slate-900 border-2 border-purple-500/40 p-8 rounded-2xl mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Info className="text-purple-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white">Le Cycle de Trésorerie - CRUCIAL</h3>
            </div>
            
            <div className="space-y-4 text-slate-200 text-lg leading-relaxed">
              <p>
                Contrairement aux plateformes classiques, <strong className="text-white">vous encaissez directement l'argent du client</strong> (totalité de la commande). 
              </p>
              <p>
                Cela signifie que vous détenez <strong className="text-orange-400">temporairement la part de la plateforme</strong>. 
                Cette dette doit être réglée <strong className="text-purple-400">quotidiennement via Mobile Money</strong> pour maintenir votre compte actif.
              </p>
            </div>

            <div className="mt-6 bg-orange-500/10 border border-orange-500/30 p-5 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-400 shrink-0 mt-1" size={24} />
                <div>
                  <h5 className="text-orange-300 font-bold text-lg mb-2">Attention Importante</h5>
                  <p className="text-orange-100">
                    Le non-paiement entraîne le <strong>blocage automatique</strong> de votre compte chaque soir. 
                    Vos produits seront retirés du site jusqu'à régularisation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Exemple de calcul */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/80 border border-slate-700 p-8 rounded-2xl"
          >
            <h4 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
              <BarChart3 className="text-purple-400" size={28} />
              Exemple Concret de Calcul
            </h4>
            
            <div className="bg-slate-800/50 p-6 rounded-xl space-y-3">
              <h5 className="text-purple-300 font-bold text-lg mb-4">Commande de 12,000 FCFA</h5>
              
              <div className="space-y-2 text-base">
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-300">Prix fournisseur (vos produits)</span>
                  <span className="text-slate-100 font-mono font-bold">8,000 FCFA</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-300">Marge plateforme</span>
                  <span className="text-slate-100 font-mono font-bold">3,000 FCFA</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-300">Frais de livraison</span>
                  <span className="text-slate-100 font-mono font-bold">1,000 FCFA</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-white/20 font-bold">
                  <span className="text-white text-lg">Total client paie</span>
                  <span className="text-white font-mono text-xl">12,000 FCFA</span>
                </div>
                
                <div className="mt-6 pt-4 space-y-3">
                  <div className="bg-emerald-500/10 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-emerald-300 font-bold">Vous gardez (produits + 90% livraison)</span>
                    <span className="text-emerald-400 font-mono font-bold text-2xl">8,900 FCFA</span>
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-orange-300 font-bold">Vous reversez (marge + 10% livraison)</span>
                    <span className="text-orange-400 font-mono font-bold text-2xl">3,100 FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          🔄 SECTION 3: WORKFLOW DES COMMANDES
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full mb-4">
              <Clock className="text-blue-400" size={18} />
              <span className="text-blue-300 font-bold text-sm">Gestion des Commandes</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Le Système Séquentiel
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Une commande à la fois pour garantir la qualité et éviter les erreurs
            </p>
          </div>

          {/* Règle d'Or */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-2 border-orange-500/40 p-8 rounded-2xl mb-12 flex items-start gap-4"
          >
            <div className="bg-orange-500/20 p-4 rounded-xl shrink-0">
              <AlertCircle className="text-orange-400" size={36} />
            </div>
            <div>
              <h3 className="text-orange-300 font-bold text-2xl mb-3">Règle d'Or Absolue</h3>
              <p className="text-white text-xl leading-relaxed">
                Vous ne voyez qu'<strong className="text-orange-400">UNE commande à la fois</strong>. 
                Les autres restent en file d'attente invisible. Vous recevez une notification de leur présence, 
                mais vous ne pouvez les traiter qu'après avoir passé la commande actuelle en "En Livraison".
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="bg-orange-950/50 px-4 py-2 rounded-lg border border-orange-500/30">
                  <p className="text-orange-200 text-sm">✓ Empêche l'accumulation</p>
                </div>
                <div className="bg-orange-950/50 px-4 py-2 rounded-lg border border-orange-500/30">
                  <p className="text-orange-200 text-sm">✓ Garantit la qualité</p>
                </div>
                <div className="bg-orange-950/50 px-4 py-2 rounded-lg border border-orange-500/30">
                  <p className="text-orange-200 text-sm">✓ Évite les abus</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline des 5 états */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/80 border border-slate-700 p-10 rounded-2xl"
          >
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
              <Truck className="text-purple-400" size={28} />
              Les 5 États d'une Commande
            </h3>
            
            <div className="space-y-8">
              {[
                { 
                  number: "1",
                  title: "Réception", 
                  desc: "Vous recevez UNE commande visible. Les autres sont masquées mais vous êtes notifié.",
                  icon: Package,
                  color: "blue",
                  badge: "Vous contrôlez"
                },
                { 
                  number: "2",
                  title: "En Préparation", 
                  desc: "Vous validez que vous préparez. ⚠️ ATTENTION : Impossible d'annuler après cette étape !",
                  icon: PlayCircle,
                  color: "yellow",
                  badge: "Vous contrôlez"
                },
                { 
                  number: "3",
                  title: "En Livraison", 
                  desc: "Le livreur est parti. À ce moment, la commande suivante devient visible pour vous.",
                  icon: Truck,
                  color: "purple",
                  badge: "Vous contrôlez"
                },
                { 
                  number: "4",
                  title: "Livrée", 
                  desc: "Commande livrée au client. Passe automatiquement à cet état après 2h max.",
                  icon: CheckCircle,
                  color: "green",
                  badge: "Auto / Vous"
                },
                { 
                  number: "5",
                  title: "Terminée", 
                  desc: "L'Admin valide définitivement. C'est le SEUL statut qui déclenche les paiements !",
                  icon: Award,
                  color: "pink",
                  badge: "Admin uniquement"
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Numéro et icône */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`bg-${step.color}-500/20 border-2 border-${step.color}-500/40 w-16 h-16 rounded-2xl flex items-center justify-center`}>
                      <step.icon className={`text-${step.color}-400`} size={32} />
                    </div>
                    <span className={`text-${step.color}-400 font-bold text-sm`}>#{step.number}</span>
                  </div>

                  {/* Connecteur */}
                  {idx < 4 && (
                    <div className="absolute left-8 top-20 w-0.5 h-12 bg-slate-700"></div>
                  )}

                  {/* Contenu */}
                  <div className="flex-1 bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold text-xl">{step.title}</h4>
                      <span className={`bg-${step.color}-500/10 text-${step.color}-300 px-3 py-1 rounded-full text-xs font-bold border border-${step.color}-500/30`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Annulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 bg-red-500/5 border-2 border-red-500/30 p-8 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <Ban className="text-red-400" size={28} />
              </div>
              <h3 className="text-red-400 font-bold text-2xl">Annulation de Commande</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-red-950/30 p-5 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="text-red-400" size={18} />
                  <h5 className="text-red-300 font-bold">Quand ?</h5>
                </div>
                <p className="text-slate-300 text-sm">
                  Uniquement <strong className="text-white">avant "En livraison"</strong>
                </p>
              </div>
              
              <div className="bg-red-950/30 p-5 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="text-red-400" size={18} />
                  <h5 className="text-red-300 font-bold">Comment ?</h5>
                </div>
                <p className="text-slate-300 text-sm">
                  Confirmation + <strong className="text-white">motif obligatoire</strong>
                </p>
              </div>
              
              <div className="bg-red-950/30 p-5 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="text-red-400" size={18} />
                  <h5 className="text-red-300 font-bold">Traçabilité</h5>
                </div>
                <p className="text-slate-300 text-sm">
                  Motif <strong className="text-white">transmis à l'Admin</strong>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          🔒 SECTION 4: SÉCURITÉ & BLOCAGE
          ======================================== */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-full mb-4">
              <Lock className="text-orange-400" size={18} />
              <span className="text-orange-300 font-bold text-sm">Sécurité Financière</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Clôture Journalière & Blocage
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Un système automatisé pour garantir la santé financière de l'écosystème
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Blocage */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-900/20 to-slate-900 border-2 border-red-500/40 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-500/20 p-4 rounded-xl">
                  <Lock className="text-red-400" size={32} />
                </div>
                <div>
                  <h3 className="text-red-400 font-bold text-2xl">Blocage Automatique</h3>
                  <p className="text-red-400/70 text-sm">Chaque soir à la fermeture</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  "Tous les comptes avec dette sont verrouillés",
                  "Accès restreint jusqu'au paiement complet",
                  "Produits retirés temporairement du site",
                  "Impossible de recevoir de nouvelles commandes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-red-950/30 p-3 rounded-lg border border-red-500/20">
                    <XCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-red-950/50 p-4 rounded-xl border border-red-500/30">
                <p className="text-red-200 text-sm">
                  <strong>Déclenchement :</strong> Automatique si montant à reverser {'>'} 0
                </p>
              </div>
            </motion.div>
            
            {/* Déblocage */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border-2 border-emerald-500/40 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-4 rounded-xl">
                  <RefreshCw className="text-emerald-400" size={32} />
                </div>
                <div>
                  <h3 className="text-emerald-400 font-bold text-2xl">Remise à Zéro</h3>
                  <p className="text-emerald-400/70 text-sm">Après paiement validé par l'Admin</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  "L'Admin débloque manuellement votre compte",
                  "Tous les compteurs repartent à ZÉRO",
                  "Historique financier réinitialisé",
                  "Nouveau cycle propre sans dette résiduelle"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-500/30">
                <p className="text-emerald-200 text-sm">
                  <strong>Avantage :</strong> Évite les cumuls flous et les conflits
                </p>
              </div>
            </motion.div>
          </div>

          {/* Processus de paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/20 to-slate-900/80 border border-purple-500/30 p-8 rounded-2xl mb-10"
          >
            <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
              <DollarSign className="text-purple-400" size={28} />
              Comment Effectuer votre Paiement Quotidien
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  num: "1",
                  title: "Consultez",
                  desc: "Vérifiez le montant exact à reverser dans \"Finances\""
                },
                {
                  num: "2",
                  title: "Payez",
                  desc: "Effectuez le transfert Mobile Money au numéro indiqué"
                },
                {
                  num: "3",
                  title: "Justifiez",
                  desc: "Saisissez l'ID de transaction dans votre espace"
                },
                {
                  num: "4",
                  title: "Validez",
                  desc: "Cliquez sur \"J'ai payé\" - L'Admin débloque votre compte"
                }
              ].map((step, i) => (
                <div key={i} className="bg-purple-950/30 border border-purple-500/30 p-6 rounded-xl">
                  <div className="bg-purple-500/20 text-purple-300 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl mb-4">
                    {step.num}
                  </div>
                  <h5 className="text-purple-300 font-bold mb-2">{step.title}</h5>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sanctions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-500/5 border border-red-500/30 p-8 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-red-400" size={32} />
              <h3 className="text-red-400 font-bold text-2xl">Sanctions en Cas de Non-Paiement</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Ban, text: "Produits retirés immédiatement" },
                { icon: Lock, text: "Compte suspendu" },
                { icon: XCircle, text: "Accès bloqué à toutes les fonctionnalités" },
                { icon: Scale, text: "Poursuite judiciaire"},
              ].map((item, i) => (
                <div key={i} className="bg-red-950/30 p-5 rounded-xl border border-red-500/20 flex items-center gap-3">
                  <item.icon className="text-red-400 shrink-0" size={24} />
                  <span className="text-slate-200 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          📦 SECTION 5: GESTION DES PRODUITS
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full mb-4">
              <Package className="text-green-400" size={18} />
              <span className="text-green-300 font-bold text-sm">Gestion Produits</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Comment Ajouter vos Produits
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Un processus en 4 étapes avec validation Admin obligatoire
            </p>
          </div>

          {/* Processus en 4 étapes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/80 border border-slate-700 p-10 rounded-2xl mb-10"
          >
            <div className="space-y-6">
              {[
                {
                  num: "1",
                  title: "Création du Produit",
                  desc: "Vous remplissez : nom, image, description, état (stock/rupture), et VOTRE prix fournisseur",
                  color: "blue"
                },
                {
                  num: "2",
                  title: "Soumission à l'Admin",
                  desc: "Le produit est envoyé pour validation. Vous ne pouvez PAS le publier directement",
                  color: "yellow"
                },
                {
                  num: "3",
                  title: "Validation Admin",
                  desc: "L'Admin vérifie et définit le prix public (toujours > votre prix + min 1000 FCFA de marge)",
                  color: "purple"
                },
                {
                  num: "4",
                  title: "Publication",
                  desc: "Une fois validé, le produit apparaît sur le site avec le prix défini par l'Admin",
                  color: "green"
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-6"
                >
                  <div className={`bg-${step.color}-500/20 border-2 border-${step.color}-500/40 min-w-[60px] h-[60px] rounded-2xl flex items-center justify-center`}>
                    <span className={`text-${step.color}-400 font-bold text-2xl`}>{step.num}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-xl mb-2">{step.title}</h4>
                    <p className="text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Vous contrôlez VS Admin contrôle */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border-2 border-emerald-500/30 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-emerald-400" size={32} />
                <h3 className="text-emerald-400 font-bold text-2xl">Vous CONTRÔLEZ</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Nom du produit",
                  "Image & description",
                  "État (en stock / rupture)",
                  "Votre prix fournisseur"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-900/20 to-slate-900 border-2 border-red-500/30 p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Ban className="text-red-400" size={32} />
                <h3 className="text-red-400 font-bold text-2xl">Admin CONTRÔLE</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Prix de vente public",
                  "Marge plateforme",
                  "Validation finale",
                  "Rejet avec motif"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 bg-red-950/30 p-3 rounded-lg border border-red-500/20">
                    <Ban className="text-red-400 shrink-0" size={18} />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Règle de protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-purple-500/10 border-2 border-purple-500/30 p-8 rounded-2xl flex items-start gap-4"
          >
            <ShieldCheck className="text-purple-400 shrink-0 mt-1" size={36} />
            <div>
              <h4 className="text-purple-300 font-bold text-xl mb-3">Règle de Protection Automatique</h4>
              <p className="text-slate-200 text-lg leading-relaxed">
                Le système vérifie automatiquement que le prix public est toujours supérieur à votre prix fournisseur + minimum 1000 FCFA de marge. 
                <strong className="text-white"> Vous ne pouvez jamais être perdant.</strong> Si l'Admin tente de définir un prix trop bas, le système le rejette automatiquement.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          ❓ FAQ COMPLÈTE
          ======================================== */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-slate-400 text-lg">
              Tout ce que vous devez savoir sur le fonctionnement
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Pourquoi je ne vois qu\'une seule commande à la fois ?',
                a: 'C\'est une règle de qualité. Traiter une commande à la fois garantit un service impeccable et évite les confusions. Une fois que vous passez la commande "En livraison", la suivante s\'affiche automatiquement. Vous recevez toutefois une notification quand de nouvelles commandes arrivent.'
              },
              {
                q: 'Que se passe-t-il si je ne paie pas ma dette le soir ?',
                a: 'À l\'heure de fermeture, tous les comptes avec une dette plateforme sont automatiquement bloqués. Vos produits sont retirés du site et vous ne pouvez plus recevoir de commandes. Dès que vous payez et fournissez l\'ID de transaction, l\'Admin débloque votre compte et tous les compteurs repartent à zéro.'
              },
              {
                q: 'Puis-je définir moi-même le prix de vente au public ?',
                a: 'Non. Vous définissez uniquement votre prix fournisseur (ce que vous voulez gagner). L\'Admin définit ensuite le prix public en ajoutant la marge plateforme. Cette séparation garantit une stratégie commerciale cohérente pour tous les produits.'
              },
              {
                q: 'Comment sont calculés mes gains sur les livraisons ?',
                a: 'Vous recevez 90% des frais de livraison encaissés auprès du client. Les 10% restants reviennent à la plateforme pour couvrir les frais de service. Par exemple, sur 1000 FCFA de livraison, vous gardez 900 FCFA et reversez 100 FCFA.'
              },
              {
                q: 'Puis-je annuler une commande après l\'avoir mise "En préparation" ?',
                a: 'Oui. Tant que le statut n\'est pas encore passe "En livraison", il est  possible de retourner en arrière. Cette regle vous permet de corriger une erreur de préparation ou un imprévu. Cependant, une confirmation avec motif est obligatoire pour assurer la traçabilité et éviter les abus.'
              },
              {
                q: 'Quand est-ce que je reçois mon paiement pour une commande ?',
                a: 'Le paiement des partenaires (vous, les livreurs) est déclenché uniquement quand l\'Admin passe la commande à l\'état "Terminé". L\'état "Livrée" ne déclenche aucun paiement. L\'Admin vérifie d\'abord que tout s\'est bien passé avant de valider.'
              },
              {
                q: 'Que signifie "remise à zéro" après déblocage ?',
                a: 'Quand l\'Admin débloque votre compte après paiement, tous les historiques et compteurs financiers repartent à zéro. Vous commencez un nouveau cycle propre, sans dette résiduelle. Cela évite les cumuls flous et les conflits.'
              },
              {
                q: 'Puis-je avoir plusieurs produits en validation en même temps ?',
                a: 'Oui, vous pouvez soumettre plusieurs produits à l\'Admin. Chacun sera traité individuellement. L\'Admin peut valider certains et rejeter d\'autres avec un motif expliquant la raison du rejet.'
              },
              {
                q: 'Comment savoir combien je dois reverser à la plateforme ?',
                a: 'Dans votre section "Finances", vous voyez en temps réel : le total encaissé, votre gain fournisseur, la marge plateforme, vos gains de livraison, et le montant exact à reverser. C\'est calculé automatiquement sur toutes vos commandes livrées.'
              },
              {
                q: 'L\'Admin peut-il modifier mes prix fournisseur ?',
                a: 'Non, jamais. Vos prix fournisseur sont sous votre contrôle exclusif. L\'Admin peut uniquement valider ou rejeter un produit, et définir le prix public qui sera affiché aux clients. La marge entre les deux est calculée automatiquement.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
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
          🎯 RÈGLES NON NÉGOCIABLES
          ======================================== */}
      <section className="py-20 bg-gradient-to-br from-purple-900/10 via-slate-950 to-pink-900/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 mb-4">
              Les 6 Règles d'Or
            </h2>
            <p className="text-slate-400 text-lg">
              Principes fondamentaux non négociables
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, text: "Fournisseur = exécutant, Admin = décisionnaire" },
              { icon: Lock, text: "Le statut Terminé garantie la fin de la commande" },
              { icon: Ban, text: "Aucun retour arrière sur les états de commande" },
              { icon: Truck, text: "Commandes strictement séquentielles (une par une)" },
              { icon: DollarSign, text: "Dette plateforme = blocage automatique chaque soir" },
              { icon: CheckCircle2, text: "Protection garantie : vous ne pouvez jamais être perdant" }
            ].map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/80 border border-purple-500/30 p-6 rounded-2xl flex items-start gap-4 hover:bg-slate-900 transition-all"
              >
                <div className="bg-purple-500/20 p-3 rounded-xl shrink-0">
                  <rule.icon className="text-purple-400" size={24} />
                </div>
                <p className="text-slate-200 font-medium pt-2">{rule.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          🚀 CONTACT SUPPORT
          ======================================== */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-8">
              <FileText className="text-purple-400 mx-auto mb-4" size={48} />
              <h3 className="text-white font-bold text-2xl mb-3">Besoin d'assistance ?</h3>
              <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                L'équipe administrative est disponible pour vous accompagner dans votre réussite. 
                N'hésitez pas à nous contacter en cas de question.
              </p>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 hover:scale-105">
                <Zap size={20} />
                Contacter le Support Admin
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SupplierInfos;