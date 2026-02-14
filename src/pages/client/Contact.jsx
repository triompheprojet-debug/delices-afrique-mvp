import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { MapPin, Phone, Clock, Send, ExternalLink, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const { config } = useConfig();
  
  // Encodage de l'adresse pour l'URL Google Maps
  const encodedAddress = encodeURIComponent(config.address || "Pointe-Noire, Congo");
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Animation variants (alignés sur Home.jsx)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-slate-950 min-h-screen relative overflow-hidden">
      
      {/* --- BACKGROUND DECORATIF (GLOWS) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* --- EN-TÊTE HERO --- */}
      <div className="relative z-10 pt-24 pb-12 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-3 py-1.5 rounded-full text-xs font-bold mb-4 text-purple-400">
            <MessageSquare size={14} />
            <span>À votre écoute</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-100 mb-4">
            Contactez-<span className="gradient-text">nous</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Une envie particulière ? Une commande spéciale ? <br className="hidden sm:block"/>
            Nous sommes là pour rendre vos moments gourmands inoubliables.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-20 relative z-20 max-w-7xl">
        
        {/* --- CARTES D'INFO (GRID) --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          
          {/* Carte Téléphone */}
          <motion.div 
            variants={itemVariants} 
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl hover:border-purple-500/30 transition-all hover:-translate-y-1 group flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-slate-100 text-lg mb-2">Par Téléphone</h3>
            <p className="text-slate-400 text-sm mb-3">Discutons de vive voix</p>
            <a href={`tel:${config.phoneNumber}`} className="text-xl font-bold text-slate-200 hover:text-purple-400 transition-colors">
              {config.phoneNumber}
            </a>
            <span className="text-xs text-green-400 font-semibold mt-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              WhatsApp disponible
            </span>
          </motion.div>

          {/* Carte Adresse */}
          <motion.div 
            variants={itemVariants} 
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl hover:border-purple-500/30 transition-all hover:-translate-y-1 group flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-slate-100 text-lg mb-2">Notre Boutique</h3>
            <p className="text-slate-400 text-sm mb-3">Venez retirer vos commandes</p>
            <p className="font-medium text-slate-200 px-4">
              {config.address}
            </p>
          </motion.div>

          {/* Carte Horaires */}
          <motion.div 
            variants={itemVariants} 
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl hover:border-purple-500/30 transition-all hover:-translate-y-1 group flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-slate-100 text-lg mb-2">Horaires d'ouverture</h3>
            <p className="text-slate-400 text-sm mb-3">Ouvert 7j/7</p>
            <div className="text-slate-200 font-bold text-lg border border-slate-700 bg-slate-900/50 px-4 py-2 rounded-lg">
              {config.openingTime} - {config.closingTime}
            </div>
          </motion.div>
        </motion.div>

        {/* --- SECTION CARTE & FORMULAIRE --- */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* Formulaire de contact */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-xl order-2 lg:order-1"
          >
            <h2 className="text-2xl font-serif font-bold text-slate-100 mb-6 flex items-center gap-3">
              <Mail className="text-purple-400" />
              Envoyez-nous un message
            </h2>
            
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" 
                    placeholder="Votre nom" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" 
                    placeholder="Votre numéro" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email (optionnel)</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" 
                  placeholder="votre@email.com" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none" 
                  placeholder="Bonjour, je voudrais commander pour un anniversaire..."
                ></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group border border-purple-500/50"
              >
                <span>Envoyer le message</span>
                <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>
          </motion.div>

          {/* Google Maps Embed */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-2 rounded-2xl shadow-xl h-[400px] lg:h-auto order-1 lg:order-2 flex flex-col"
          >
            <div className="flex-grow w-full h-full rounded-xl overflow-hidden relative grayscale-[50%] hover:grayscale-0 transition-all duration-500">
               <iframe 
                  width="100%" 
                  height="100%" 
                  id="gmap_canvas" 
                  src={mapSrc}
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0"
                  className="absolute inset-0"
                  title="Localisation Boutique"
               ></iframe>
               
               {/* Overlay pour assombrir un peu la map par défaut */}
               <div className="absolute inset-0 bg-slate-900/10 pointer-events-none mix-blend-multiply"></div>
            </div>
            
            <div className="p-4 flex justify-between items-center text-sm border-t border-slate-700/50 mt-1">
               <span className="flex items-center gap-2 text-slate-300 font-medium">
                 <MapPin size={14} className="text-purple-400"/> {config.address}
               </span>
               <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-purple-400 font-bold flex items-center gap-1 hover:text-purple-300 transition-colors"
               >
                 Ouvrir GPS <ExternalLink size={14}/>
               </a>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default Contact;