import React, { useState } from 'react';
import { auth } from '../../firebase'; // Import auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Lock, ChefHat } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard'); // Redirection vers le tableau de bord si succès
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-brown flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-brand-beige/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-brown">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Gérant</h1>
          <p className="text-gray-500 text-sm">Veuillez vous identifier</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-brown outline-none"
              placeholder="admin@delices.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-brown outline-none"
              placeholder="••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Lock size={18} />
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;