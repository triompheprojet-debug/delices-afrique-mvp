import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck } from 'lucide-react';

const SupplierLogin = () => {
  const { supplier } = useOutletContext(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ code: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Fond décoratif subtil */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-100 to-transparent -z-10"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* En-tête */}
        <div className="bg-orange-600 p-8 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Store size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Espace Fournisseur</h2>
          <p className="text-orange-100 text-sm mt-1 opacity-90">Partenaire : {supplier.name}</p>
        </div>

        {/* Formulaire */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
                <ShieldCheck size={18}/> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Code Vendeur</label>
              <input
                type="text"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition font-mono text-lg uppercase placeholder:normal-case"
                placeholder="Ex: SUP-A12B"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mot de passe</label>
              <input
                type="password"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-lg"
                placeholder="••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>Accéder à mon stand <ArrowRight size={20}/></>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-8 leading-relaxed">
            L'accès à cet espace est strictement réservé au personnel autorisé. Toute tentative d'intrusion est enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierLogin;