import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, MapPin, Calendar, ArrowRight, 
  Package, Truck, CreditCard, Phone, Store, Gift, Clock,
  Camera, Printer, User, FileText, Sparkles
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import html2canvas from 'html2canvas';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useConfig();
  const receiptRef = useRef(null);
  
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  const handleCapture = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `commande-${order.code}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Erreur capture:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'N/A';
    }
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-950 py-8 sm:py-12 px-4">
      
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Animation succès */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} className="text-green-400" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
            Commande confirmée !
          </h1>
          <p className="text-slate-400">
            Merci {order.customer?.name?.split(' ')[0] || 'cher client'} pour votre confiance
          </p>
        </motion.div>

        {/* Boutons actions - Avant le reçu */}
        <div className="flex gap-3 print:hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
          >
            <Printer size={18}/>
            Imprimer
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCapture}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all"
          >
            <Camera size={18}/>
            Capturer
          </motion.button>
        </div>

        {/* REÇU - Zone capturable/imprimable */}
        <div 
          ref={receiptRef}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-900/30 via-slate-900 to-slate-900 p-8 text-center border-b border-slate-800">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1">
              Délices d'Afrique
            </h2>
            <p className="text-sm text-slate-400">Pâtisserie Artisanale</p>
          </div>

          {/* Code commande - TRÈS VISIBLE */}
          <div className="bg-slate-800/50 border-y border-slate-700/50 p-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider text-center mb-2">
              Code de commande
            </p>
            <div className="bg-slate-950 border-2 border-purple-500 rounded-xl p-4">
              <p className="text-3xl sm:text-4xl font-mono font-bold text-purple-400 text-center tracking-wider">
                {order.code}
              </p>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">
              Présentez ce code lors de la récupération
            </p>
          </div>

          {/* Détails */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Client */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <User size={14} className="text-purple-400" />
                Informations client
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nom</span>
                  <span className="text-slate-100 font-medium">{order.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Téléphone</span>
                  <span className="text-slate-100 font-medium">{order.customer?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Récupération */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                {order.details?.method === 'Livraison' ? (
                  <Truck size={14} className="text-purple-400" />
                ) : (
                  <Package size={14} className="text-purple-400" />
                )}
                {order.details?.method || 'Mode non défini'}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Adresse</p>
                  <p className="text-slate-100 font-medium">
                    {order.details?.method === 'Livraison' 
                      ? (order.customer?.address || 'N/A')
                      : (config.address || "Boutique principale")}
                  </p>
                </div>

                {order.details?.method === 'Retrait' && order.details?.scheduledDate && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Date et heure</p>
                    <p className="text-slate-100 font-medium flex items-center gap-2">
                      <Calendar size={14} className="text-purple-400" />
                      {order.details.scheduledDate} à {order.details.scheduledTime}
                    </p>
                  </div>
                )}

                {order.details?.method === 'Livraison' && (
                  <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 p-2 rounded-lg">
                    <Clock size={14} />
                    <span className="text-xs font-bold">Livraison estimée: 2h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <CreditCard size={14} className="text-purple-400" />
                Paiement
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {order.details?.paymentMethod === 'Espèces' ? '💵' : '📱'}
                </div>
                <div>
                  <p className="text-slate-100 font-medium">{order.details?.paymentMethod || 'Non défini'}</p>
                  <p className="text-xs text-slate-400">
                    À la {order.details?.method === 'Livraison' ? 'livraison' : 'réception'}
                  </p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Votre commande
              </h3>
              <ul className="space-y-3 mb-4">
                {order.items?.map((item, idx) => (
                  <li 
                    key={idx} 
                    className="flex justify-between items-start text-sm pb-3 border-b border-slate-700/30 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="text-slate-100 font-medium">
                        <span className="text-purple-400 font-bold">{item.quantity}×</span> {item.name}
                      </p>
                      {item.category && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                      )}
                    </div>
                    <p className="font-bold text-slate-100 ml-4">
                      {(item.price * item.quantity).toLocaleString()} F
                    </p>
                  </li>
                ))}
              </ul>

              {/* Totaux */}
              <div className="space-y-2 pt-3 border-t border-slate-700/50">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Sous-total</span>
                  <span>{order.details?.subTotal?.toLocaleString() || 0} F</span>
                </div>

                {order.details?.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span className="flex items-center gap-1">
                      <Gift size={14} />
                      Réduction {order.promo?.code && `(${order.promo.code})`}
                    </span>
                    <span className="font-bold">-{order.details?.discount.toLocaleString()} F</span>
                  </div>
                )}

                {order.details?.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Livraison</span>
                    <span>{order.details?.deliveryFee.toLocaleString()} F</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                  <span className="font-bold text-lg text-slate-100">Total payé</span>
                  <span className="text-3xl font-bold text-purple-400">
                    {order.details?.finalTotal?.toLocaleString() || 0} 
                    <span className="text-sm text-slate-500 ml-1">F</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Créateur (si partenaire) */}
            {order.promo?.code && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
                <Sparkles size={20} className="text-purple-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-0.5">Code promo utilisé</p>
                  <p className="text-sm text-purple-400 font-bold font-mono">{order.promo.code}</p>
                  <p className="text-xs text-green-400 mt-1">
                    ✓ Réduction de {order.details?.discount?.toLocaleString() || 0} F appliquée
                  </p>
                </div>
              </div>
            )}

            {/* Fournisseur */}
            {order.supplierName && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                <Store size={20} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Préparé par</p>
                  <p className="text-sm text-blue-400 font-bold">{order.supplierName}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.details?.notes && (
              <div className="bg-slate-800/30 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <FileText size={14} />
                  Instructions
                </h3>
                <p className="text-sm text-slate-300 italic">"{order.details.notes}"</p>
              </div>
            )}

            {/* Contact */}
            <div className="text-center pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2">
                Besoin d'aide ? Contactez-nous
              </p>
              <a 
                href={`tel:${config.phoneNumber || ''}`}
                className="inline-flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors"
              >
                <Phone size={14} />
                {config.phoneNumber || 'Numéro non disponible'}
              </a>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Merci de votre confiance
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Délices d'Afrique • Pointe-Noire, Congo
              </p>
              {order.createdAt && (
                <p className="text-xs text-slate-700 mt-1">
                  Commandé le {formatDate(order.createdAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bouton retour */}
        <Link 
          to="/" 
          className="block w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-center hover:bg-purple-700 transition-colors shadow-lg print:hidden"
        >
          <span className="flex items-center justify-center gap-2">
            Retour à l'accueil
            <ArrowRight size={18}/>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;