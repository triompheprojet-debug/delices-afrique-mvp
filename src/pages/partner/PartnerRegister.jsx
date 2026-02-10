import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Phone, Lock, CheckCircle, Smartphone, ShieldCheck, 
  ArrowRight, Loader2, Eye, EyeOff, Sparkles, Trophy,
  DollarSign, Target, Zap, Gift, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Recap, 3: Success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
    firstName: '',
    lastName: '',
    phone: '', 
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [generatedPromoCode, setGeneratedPromoCode] = useState('');

  // Générateur de Code Promo Unique
  const generatePromoCode = (lastName) => {
    const prefix = lastName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `DA-${prefix}-${randomNum}`; 
  };

  // Étape 1 → 2 : Validation formulaire
  const handleContinue = () => {
    setError('');

    // Validations
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions du partenariat");
      return;
    }

    // Génération du code promo
    const promoCode = generatePromoCode(formData.lastName);
    setGeneratedPromoCode(promoCode);

    // Passage à l'étape 2 (récapitulatif)
    setCurrentStep(2);
  };

  // Étape 2 → 3 : Création du compte
  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      // Vérification unicité du téléphone
      const q = query(collection(db, "partners"), where("phone", "==", formData.phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Ce numéro de téléphone est déjà associé à un compte partenaire.");
      }

      const fullName = `${formData.firstName} ${formData.lastName}`;

      // Création du partenaire
      const newPartner = {
        fullName: fullName,
        phone: formData.phone,
        password: formData.password,
        promoCode: generatedPromoCode,
        
        level: 'Standard',
        walletBalance: 0,
        totalSales: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        
        termsAcceptedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        isActive: true
      };

      await addDoc(collection(db, "partners"), newPartner);

      // Passage à l'étape succès
      setCurrentStep(3);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Progress indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                  currentStep >= step 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {currentStep > step ? <CheckCircle size={20} /> : step}
                </div>
                {step < 3 && (
                  <div className={`h-1 w-16 rounded-full transition-all ${
                    currentStep > step ? 'bg-purple-600' : 'bg-slate-800'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2 px-4">
            <span className={currentStep >= 1 ? 'text-purple-400' : ''}>Inscription</span>
            <span className={currentStep >= 2 ? 'text-purple-400' : ''}>Récapitulatif</span>
            <span className={currentStep >= 3 ? 'text-purple-400' : ''}>Confirmation</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ========================================
              ÉTAPE 1 : FORMULAIRE D'INSCRIPTION
              ======================================== */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto"
            >
              
              {/* Colonne gauche - Avantages */}
              <div className="hidden lg:block space-y-6">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8">
                  <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                    <Sparkles className="text-purple-400" size={16} />
                    <span className="text-purple-300 text-sm font-bold">Devenez Ambassadeur</span>
                  </div>

                  <h2 className="text-3xl font-serif font-bold text-slate-100 mb-6 leading-tight">
                    Rejoignez l'élite de la pâtisserie africaine
                  </h2>

                  <div className="space-y-4">
                    {[
                      { 
                        icon: DollarSign, 
                        title: 'Gains illimités',
                        desc: 'Commissions automatiques sur chaque vente. Pas de plafond.',
                        color: 'text-green-400',
                        bg: 'bg-green-400/10'
                      },
                      { 
                        icon: Target, 
                        title: 'Évolution garantie',
                        desc: '3 niveaux progressifs. Plus vous vendez, plus vous gagnez.',
                        color: 'text-blue-400',
                        bg: 'bg-blue-400/10'
                      },
                      { 
                        icon: Zap, 
                        title: 'Retraits instantanés',
                        desc: 'Encaissez vos gains via Mobile Money quand vous voulez.',
                        color: 'text-purple-400',
                        bg: 'bg-purple-400/10'
                      },
                      { 
                        icon: Gift, 
                        title: 'Zéro investissement',
                        desc: 'Pas de stock, pas de frais, 100% gratuit à vie.',
                        color: 'text-pink-400',
                        bg: 'bg-pink-400/10'
                      }
                    ].map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <div className={`${benefit.bg} p-3 rounded-xl flex-shrink-0`}>
                          <benefit.icon className={benefit.color} size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 mb-1">{benefit.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne droite - Formulaire */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Créez votre compte</h2>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                    <ShieldCheck size={18}/>
                    {error}
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="space-y-4">
                  
                  {/* Nom & Prénom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Prénom</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Jean"
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={formData.firstName} 
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Nom</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Kouassi"
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={formData.lastName} 
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Téléphone (Mobile Money)</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                      <input 
                        required 
                        type="tel" 
                        placeholder="06 000 0000"
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                      <input 
                        required 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Confirmation</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                      <input 
                        required 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={formData.confirmPassword} 
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Acceptation conditions */}
                  <div className="flex items-start gap-3 pt-2">
                    <input 
                      required 
                      type="checkbox" 
                      id="terms"
                      className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-700 focus:ring-purple-500"
                      checked={formData.acceptTerms} 
                      onChange={e => setFormData({...formData, acceptTerms: e.target.checked})}
                    />
                    <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                      J'accepte les{' '}
                      <Link to="/partner/program" className="text-purple-400 hover:underline">
                        conditions générales du programme partenaire
                      </Link>
                      {' '}et je confirme que le numéro fourni est valide pour les paiements Mobile Money.
                    </label>
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 mt-6"
                  >
                    Continuer
                    <ArrowRight size={20}/>
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  Déjà un compte ?{' '}
                  <Link to="/partner/login" className="text-purple-400 hover:underline font-medium">
                    Se connecter
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================
              ÉTAPE 2 : RÉCAPITULATIF & RÈGLES
              ======================================== */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12">
                
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="text-white" size={36} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-slate-100 mb-3">
                    Bienvenue dans l'élite ! 🎉
                  </h2>
                  <p className="text-slate-400 text-lg">
                    Voici votre récapitulatif et les règles du jeu
                  </p>
                </div>

                {/* Votre code promo */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-2xl p-6 mb-8 text-center">
                  <p className="text-purple-300 text-sm font-bold uppercase mb-2">Votre code promo unique</p>
                  <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                    {generatedPromoCode}
                  </h3>
                  <p className="text-slate-400 text-sm">Partagez-le pour commencer à gagner</p>
                </div>

                {/* Règles du programme */}
                <div className="space-y-6 mb-10">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Star className="text-yellow-400" size={24} />
                    Règles du programme
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        title: '1. Comment ça marche',
                        content: 'Partagez votre code promo unique. Quand un client l\'utilise et finalise sa commande, vous touchez une commission automatiquement. Simple, transparent, rentable.'
                      },
                      {
                        title: '2. Système de niveaux',
                        content: 'Standard (0-29 ventes) = 150F/vente · Actif (30-149 ventes) = 250F/vente · Premium (150+ ventes) = 300F/vente. Votre niveau évolue automatiquement.'
                      },
                      {
                        title: '3. Bonus sur produits premium',
                        content: 'Sur certains produits à forte marge, vous pouvez gagner jusqu\'à 500 FCFA/vente grâce au système de redistribution 50/30/20. Plus la marge est élevée, plus votre commission augmente.'
                      },
                      {
                        title: '4. Validation & paiement',
                        content: 'Vos commissions sont créditées dès que la commande est livrée. Demandez un retrait à tout moment (minimum 1000 FCFA). Paiement sous 24-48h via Mobile Money.'
                      },
                      {
                        title: '5. Transparence totale',
                        content: 'Vous avez accès à un tableau de bord en temps réel : ventes, commissions, niveau, projections. Tout est visible et vérifiable.'
                      },
                      {
                        title: '6. Zéro contrainte',
                        content: 'Aucun stock à gérer, aucun investissement, aucun quota. Vous travaillez à votre rythme. C\'est un revenu complémentaire 100% flexible.'
                      }
                    ].map((rule, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-950/50 border border-slate-800 rounded-xl p-5"
                      >
                        <h4 className="font-bold text-slate-100 mb-2">{rule.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{rule.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Important note */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mb-8">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <strong className="font-bold">💡 Conseil de pro :</strong> Les meilleurs ambassadeurs gagnent 150K-300K FCFA/mois en partageant activement leur code (WhatsApp, réseaux sociaux, collègues, famille). Le succès dépend de votre engagement !
                  </p>
                </div>

                {/* Actions */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                    <ShieldCheck size={18}/>
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-xl transition-all"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20}/>
                        Création...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20}/>
                        Créer mon compte
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================
              ÉTAPE 3 : SUCCÈS
              ======================================== */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-12">
                
                {/* Icône succès */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="text-white" size={48} />
                </motion.div>

                <h2 className="text-4xl font-serif font-bold text-slate-100 mb-4">
                  Compte créé avec succès ! 🎉
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                  Votre code promo <span className="font-bold text-purple-400">{generatedPromoCode}</span> est prêt à être utilisé. Commencez à gagner dès maintenant !
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    { label: 'Niveau', value: 'Standard', icon: Star },
                    { label: 'Commission', value: '150 F', icon: DollarSign },
                    { label: 'Ventes', value: '0', icon: Target }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                      <stat.icon className="text-purple-400 mx-auto mb-2" size={24} />
                      <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
                      <p className="text-slate-100 font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <Link to="/partner/dashboard">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                      Accéder à mon tableau de bord
                      <ArrowRight size={20}/>
                    </button>
                  </Link>
                  
                  <a 
                    href={`https://wa.me/?text=Salut ! J'ai rejoint Délices d'Afrique en tant qu'ambassadeur ! Utilise mon code *${generatedPromoCode}* pour avoir une réduction sur tes commandes 🎂✨`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                      Partager mon code sur WhatsApp
                      <ArrowRight size={20}/>
                    </button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerRegister;