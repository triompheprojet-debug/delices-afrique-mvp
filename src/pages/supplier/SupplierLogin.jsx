import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

const SupplierLogin = () => {
  const { supplier } = useOutletContext(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ code: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulation d'un petit délai pour l'UX (éviter les clics spam)
    setTimeout(() => {
      // 1. Vérification stricte des identifiants (Sensible à la casse pour le mdp, pas pour le code)
      if (
        formData.code.toUpperCase().trim() === supplier.supplierCode && 
        formData.password === supplier.tempPassword
      ) {
        // 2. Création Session
        sessionStorage.setItem('supplierAuthenticated', supplier.id);
        navigate('dashboard');
      } else {
        setError('Identifiants incorrects. Vérifiez votre code vendeur.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Fond décoratif avec effet de grille */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse-soft"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 rounded-3xl shadow-elegant-lg overflow-hidden border border-slate-700">
          
          {/* En-tête */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30">
                <Store size={36} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-1">Espace Fournisseur</h2>
              <p className="text-purple-100 text-sm opacity-90 font-medium">
                Partenaire : <span className="font-bold">{supplier.name}</span>
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-shake">
                  <ShieldCheck size={20} className="shrink-0"/>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Code Vendeur
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock size={18}/>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-slate-600 outline-none transition font-mono text-lg uppercase placeholder:normal-case text-slate-200 placeholder-slate-500"
                    placeholder="Ex: SUP-A12B"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock size={18}/>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-4 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-slate-600 outline-none transition text-lg text-slate-200 placeholder-slate-500"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <>
                    <span>Accéder à mon stand</span>
                    <ArrowRight size={20}/>
                  </>
                )}
              </button>
            </form>

            {/* Footer sécurité */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5"/>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L'accès à cet espace est strictement réservé au personnel autorisé. 
                  Toute tentative d'intrusion est enregistrée.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Délices d'Afrique • Espace Sécurisé
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierLogin;