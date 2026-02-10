import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, CheckCircle, Smartphone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États du formulaire conformes à la section 2.2 de l'architecture
  const [formData, setFormData] = useState({ 
    firstName: '',
    lastName: '',
    phone: '', 
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Générateur de Code Promo Unique (Format: DA-NOM-123)
  const generatePromoCode = (lastName) => {
    const prefix = lastName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `DA-${prefix}-${randomNum}`; 
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validations Front-End strictes
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions du partenariat.");
      return;
    }
    if (formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
    }

    setLoading(true);

    try {
      // 2. Vérifier l'unicité du téléphone (Clé principale)
      const q = query(collection(db, "partners"), where("phone", "==", formData.phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Ce numéro de téléphone est déjà associé à un compte partenaire.");
      }

      // 3. Génération des données automatiques
      const promoCode = generatePromoCode(formData.lastName);
      const fullName = `${formData.firstName} ${formData.lastName}`;

      // 4. Création de l'objet Partenaire (Architecture Section 2.2)
      const newPartner = {
        fullName: fullName,
        phone: formData.phone,
        password: formData.password, // Note: En prod, hachage recommandé
        promoCode: promoCode,
        
        // Initialisation Niveau & Gains
        level: 'Standard',       // Niveau initial 
        walletBalance: 0,        // Gains disponibles
        totalSales: 0,           // Ventes cumulées (0-29 pour Standard)
        totalEarnings: 0,        // Historique total
        
        termsAcceptedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        isActive: true
      };

      await addDoc(collection(db, "partners"), newPartner);

      // 5. Succès
      alert(`Compte créé avec succès ! Votre code est ${promoCode}.`);
      navigate('/partner/login');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 grid md:grid-cols-2 gap-10 items-center">
      
      {/* COLONNE GAUCHE : Présentation Programme (Section 2.1) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="hidden md:block space-y-6"
      >
        <h1 className="text-4xl font-serif font-bold text-gray-800">
          Rejoignez <span className="text-brand-brown">l'Élite</span> de la Pâtisserie.
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Devenez apporteur d'affaires pour Délices d'Afrique. Recommandez nos produits de luxe et encaissez des commissions automatiquement.
        </p>
        
        <div className="space-y-4 pt-4">
            <div className="flex gap-4">
                <div className="bg-green-100 p-3 rounded-xl h-fit text-green-700"><CheckCircle size={24}/></div>
                <div>
                    <h3 className="font-bold text-gray-800">Gains Illimités</h3>
                    <p className="text-sm text-gray-500">Touchez une commission sur chaque commande validée avec votre code.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-blue-100 p-3 rounded-xl h-fit text-blue-700"><ShieldCheck size={24}/></div>
                <div>
                    <h3 className="font-bold text-gray-800">Suivi Transparent</h3>
                    <p className="text-sm text-gray-500">Un tableau de bord pour suivre vos ventes et demander vos retraits.</p>
                </div>
            </div>
        </div>
      </motion.div>

      {/* COLONNE DROITE : Formulaire (Section 2.2) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif">Créer un compte Partenaire</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <ShieldCheck size={16}/> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Prénom</label>
                <input required type="text" placeholder="Jean" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50"
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nom</label>
                <input required type="text" placeholder="Kouassi" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50"
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Téléphone (Mobile Money)</label>
            <div className="relative">
                <Smartphone className="absolute left-3 top-3 text-gray-400" size={20}/>
                <input required type="tel" placeholder="06 000 0000" className="w-full border pl-10 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mot de passe</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20}/>
                <input required type="password" placeholder="••••••••" className="w-full border pl-10 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirmation</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20}/>
                <input required type="password" placeholder="••••••••" className="w-full border pl-10 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none bg-gray-50"
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input required type="checkbox" id="terms" className="mt-1 w-4 h-4 text-brand-brown rounded border-gray-300 focus:ring-brand-brown"
               checked={formData.acceptTerms} onChange={e => setFormData({...formData, acceptTerms: e.target.checked})} />
            <label htmlFor="terms" className="text-xs text-gray-500">
              J'accepte les <span className="underline cursor-pointer hover:text-brand-brown">conditions générales du programme partenaire</span> et je confirme que le numéro fourni est valide pour les paiements.
            </label>
          </div>

          <button disabled={loading} className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            {loading ? <Loader2 className="animate-spin"/> : <>Créer mon compte <ArrowRight size={18}/></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Déjà un compte ? <Link to="/partner/login" className="text-brand-brown font-bold hover:underline">Se connecter</Link>
        </div>

      </motion.div>
    </div>
  );
};

export default PartnerRegister;