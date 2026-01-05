import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useConfig();
  
  // On récupère les données envoyées depuis Checkout
  const order = location.state?.order;

  // Sécurité : Si quelqu'un accède à cette page sans passer par une commande
  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Décoration Haut */}
        <div className="h-2 bg-brand-brown w-full"></div>
        
        <div className="p-8 text-center">
          {/* Icône Succès */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle size={40} className="text-green-600" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Commande Reçue !</h1>
          <p className="text-gray-500 text-sm mb-6">
            Merci {order.customer.name.split(' ')[0]}, nous préparons votre délice.
          </p>

          {/* --- LE TICKET / RÉCAPITULATIF --- */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-left relative">
            {/* Trous de ticket (Déco) */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r border-gray-200"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-l border-gray-200"></div>

            <div className="flex justify-between items-center mb-4 border-b border-dashed border-gray-300 pb-4">
              <span className="text-gray-400 text-xs uppercase tracking-widest">Code Commande</span>
              <span className="font-mono font-bold text-xl text-brand-brown">{order.code}</span>
            </div>

            {/* Infos Livraison/Retrait */}
            <div className="space-y-3 mb-6">
              
              {/* ADRESSE (Toujours affichée) */}
              <div className="flex items-start gap-3">
                <div className="mt-1 text-brand-brown"><MapPin size={16}/></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    {order.details.method === 'Livraison' ? 'Livraison à' : 'Retrait boutique'}
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {order.details.method === 'Livraison' 
                      ? order.customer.address // Modifié ici pour correspondre à Checkout.jsx
                      : "À notre boutique principale"}
                  </p>
                </div>
              </div>

              {/* DATE ET HEURE (Affiché UNIQUEMENT si Retrait) */}
              {order.details.method === 'Retrait' && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-brand-brown"><Calendar size={16}/></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Date de retrait
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {order.details.scheduledDate} 
                      <span className="font-normal text-gray-500"> à </span> 
                      {order.details.scheduledTime}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Liste Articles (Résumé) */}
            <div className="bg-white rounded-lg p-3 border border-gray-100 mb-4">
              <ul className="space-y-2">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600"><span className="font-bold text-black">{item.quantity}x</span> {item.name}</span>
                    <span className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              {/* Frais Livraison */}
              {order.details.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  <span>Livraison</span>
                  <span>{order.details.deliveryFee.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t-2 border-dashed border-gray-300">
              <span className="font-bold text-gray-800">Total à payer</span>
              <span className="text-2xl font-serif font-bold text-brand-brown">
                {order.details.finalTotal.toLocaleString()} <span className="text-xs">FCFA</span>
              </span>
            </div>
          </div>
          
          <p className="text-xs text-center text-gray-400 mt-6 italic leading-relaxed px-4">
            Un récapitulatif a été envoyé à notre équipe. <br className="hidden sm:block" />
            Contactez-nous au{" "}
            <a 
              href={`tel:${config.phoneNumber}`}
              className="text-brand-brown font-bold underline decoration-brand-brown/30 underline-offset-4"
            >
              {config.phoneNumber}
            </a>{" "}
            si besoin.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="bg-gray-50 p-6 flex flex-col gap-3">
          <button 
            onClick={() => window.print()} 
            className="print:hidden w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition active:scale-[0.98]"
          >
            <Printer size={18} className="shrink-0 text-gray-500"/>
            <span className="text-sm sm:text-base text-center leading-tight">
              Imprimer / Sauvegarder le reçu
            </span>
          </button>
                    
          <Link 
            to="/" 
            className="w-full bg-brand-brown text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
          >
            Retourner à l'accueil <ArrowRight size={18}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;