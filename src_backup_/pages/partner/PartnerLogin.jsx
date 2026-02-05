import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Chercher l'utilisateur par téléphone (Clé unique)
      const q = query(collection(db, "partners"), where("phone", "==", formData.phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Ce numéro n'est associé à aucun compte partenaire.");
      }

      // 2. Vérification Mot de passe
      const partnerDoc = querySnapshot.docs[0];
      const partnerData = partnerDoc.data();

      // Vérification basique (Hachage à prévoir en prod)
      if (partnerData.password !== formData.password) {
        throw new Error("Mot de passe incorrect.");
      }

      // Vérification si compte banni/suspendu (Section 5.2 de l'admin)
      if (partnerData.isActive === false) {
          throw new Error("Votre compte a été suspendu. Contactez l'administration.");
      }

      // 3. Création Session
      const sessionData = { 
        id: partnerDoc.id, 
        fullName: partnerData.fullName,
        phone: partnerData.phone, 
        level: partnerData.level
      };
      localStorage.setItem('partnerSession', JSON.stringify(sessionData));

      // 4. Redirection vers le Dashboard
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
    <div className="max-w-md mx-auto mt-16 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-brand-brown mb-2">Espace Partenaire</h1>
          <p className="text-gray-500 text-sm">Connectez-vous pour suivre vos gains.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center justify-center gap-2">
            <AlertCircle size={16}/> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Téléphone</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 text-gray-400" size={20}/>
              <input 
                required type="tel" placeholder="06 123 4567"
                className="w-full border border-gray-300 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50 transition"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20}/>
              <input 
                required type="password" placeholder="••••••••"
                className="w-full border border-gray-300 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50 transition"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            {/* Lien Mot de passe oublié (Section 2.3) */}
            <div className="text-right mt-2">
                <button type="button" onClick={handleForgotPassword} className="text-xs text-gray-400 hover:text-brand-brown transition">
                    Mot de passe oublié ?
                </button>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin"/> : <><LogIn size={18}/> Se connecter</>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm mb-4">Pas encore de compte ?</p>
          <Link to="/partner/register" className="block w-full py-3 rounded-xl border-2 border-brand-brown text-brand-brown font-bold hover:bg-brand-brown/5 transition">
            Créer un compte Partenaire
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PartnerLogin;