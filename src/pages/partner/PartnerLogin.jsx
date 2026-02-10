import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff, Sparkles, TrendingUp, Users, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Vérification session existante
  useEffect(() => {
    const existingSession = sessionStorage.getItem('partnerSession');
    if (existingSession) {
      navigate('/partner/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(collection(db, "partners"), where("phone", "==", formData.phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Ce numéro n'est associé à aucun compte partenaire.");
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerData = partnerDoc.data();

      if (partnerData.password !== formData.password) {
        throw new Error("Mot de passe incorrect.");
      }

      if (partnerData.isActive === false) {
        throw new Error("Votre compte a été suspendu. Contactez l'administration.");
      }

      const sessionData = { 
        id: partnerDoc.id, 
        fullName: partnerData.fullName,
        phone: partnerData.phone, 
        level: partnerData.level
      };

      sessionStorage.setItem('partnerSession', JSON.stringify(sessionData));
      navigate('/partner/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Veuillez contacter l'administration sur WhatsApp pour réinitialiser votre mot de passe.");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* ========================================
            COLONNE GAUCHE - Présentation
            ======================================== */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full backdrop-blur-md">
            <Sparkles className="text-purple-400" size={16} />
            <span className="text-purple-300 text-sm font-bold">Espace Ambassadeur Premium</span>
          </div>

          {/* Titre */}
          <div>
            <h1 className="text-5xl font-serif font-bold text-slate-100 mb-4 leading-tight">
              Bienvenue dans votre{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                empire digital
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Accédez à votre tableau de bord, suivez vos performances en temps réel et encaissez vos commissions.
            </p>
          </div>

          {/* Stats motivantes */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, value: '500K+', label: 'Commissions versées', color: 'text-green-400' },
              { icon: Users, value: '89', label: 'Ambassadeurs actifs', color: 'text-blue-400' },
              { icon: Gift, value: '1200+', label: 'Ventes générées', color: 'text-purple-400' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-center"
              >
                <stat.icon className={`${stat.color} mx-auto mb-2`} size={24} />
                <h3 className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</h3>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Témoignage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6"
          >
            <p className="text-slate-300 italic mb-4 leading-relaxed">
              "J'ai gagné plus de 150 000 FCFA en 3 mois juste en partageant mon code à mes proches. C'est devenu mon revenu complémentaire !"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                JK
              </div>
              <div>
                <p className="text-slate-200 font-bold text-sm">Jean Kouassi</p>
                <p className="text-slate-500 text-xs">Ambassadeur Premium</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ========================================
            COLONNE DROITE - Formulaire Login
            ======================================== */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl"
        >
          {/* Header formulaire */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-100 mb-2">
              Connexion Ambassadeur
            </h2>
            <p className="text-slate-400 text-sm">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Téléphone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                <input 
                  required 
                  type="tel" 
                  placeholder="06 123 4567"
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                <input 
                  required 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-12 py-4 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
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
              
              {/* Mot de passe oublié */}
              <div className="text-right mt-2">
                <button 
                  type="button" 
                  onClick={handleForgotPassword} 
                  className="text-xs text-slate-500 hover:text-purple-400 transition-all"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            {/* Bouton submit */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20}/>
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={20}/>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-4 text-slate-500 font-medium">Pas encore membre ?</span>
            </div>
          </div>

          {/* Lien inscription */}
          <Link to="/partner/register">
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-xl transition-all border border-slate-700 hover:border-purple-500/50">
              Créer un compte Ambassadeur
            </button>
          </Link>

          {/* Note de sécurité */}
          <p className="text-center text-slate-600 text-xs mt-6">
            Vos données sont sécurisées et confidentielles
          </p>
        </motion.div>

        {/* Version mobile - Stats en bas */}
        <div className="lg:hidden col-span-2 grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: TrendingUp, value: '500K+', label: 'Versés', color: 'text-green-400' },
            { icon: Users, value: '89', label: 'Actifs', color: 'text-blue-400' },
            { icon: Gift, value: '1200+', label: 'Ventes', color: 'text-purple-400' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-center"
            >
              <stat.icon className={`${stat.color} mx-auto mb-1`} size={20} />
              <h3 className="text-lg font-bold text-slate-100 mb-0.5">{stat.value}</h3>
              <p className="text-slate-500 text-[10px]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;