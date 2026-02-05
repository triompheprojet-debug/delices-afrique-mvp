import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { MapPin, Phone, Mail, Clock, Send, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const { config } = useConfig();
  
  // Encodage de l'adresse pour l'URL Google Maps
  // Si l'adresse est vide, on pointe vers une localisation par défaut pour éviter une carte vide
  const encodedAddress = encodeURIComponent(config.address || "Pointe-Noire, Congo");
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Variantes pour l'animation séquentielle des cartes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      
      {/* --- EN-TÊTE --- */}
      <div className="bg-brand-brown text-white py-16 text-center relative overflow-hidden">
        {/* Cercles décoratifs animés */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-0 w-48 h-48 bg-brand-beige/10 rounded-full translate-x-1/3 translate-y-1/3"
        ></motion.div>
        
        {/* --- CORRECTION ICI : Ajout de 'text-white' --- */}
        <motion.h4 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-sans-serif font-bold relative z-10 text-white"
        >
          Contactez-nous
        </motion.h4>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-brand-beige text-lg max-w-2xl mx-auto px-4 relative z-10"
        >
          Une envie particulière ? Une commande spéciale ? 
          Nous sommes à votre écoute pour rendre vos moments gourmands inoubliables.
        </motion.p>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        
        {/* --- CARTES D'INFO (GRID) --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          
          {/* Carte Téléphone */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-brand-beige/20 text-brand-brown rounded-full flex items-center justify-center mb-4">
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Par Téléphone</h3>
            <p className="text-gray-600 mb-2">Discutons de vive voix</p>
            <a href={`tel:${config.phoneNumber}`} className="text-xl font-bold text-brand-brown hover:underline">
              {config.phoneNumber}
            </a>
            <span className="text-xs text-green-600 font-semibold mt-1 bg-green-50 px-2 py-1 rounded-full">
              WhatsApp disponible
            </span>
          </motion.div>

          {/* Carte Adresse */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-brand-beige/20 text-brand-brown rounded-full flex items-center justify-center mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Notre Boutique</h3>
            <p className="text-gray-600 mb-2">Venez retirer vos commandes</p>
            <p className="font-medium text-gray-800 px-4">
              {config.address}
            </p>
          </motion.div>

          {/* Carte Horaires */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-brand-beige/20 text-brand-brown rounded-full flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Horaires d'ouverture</h3>
            <p className="text-gray-600 mb-2">Ouvert 7j/7</p>
            <div className="text-brand-brown font-bold text-lg border-2 border-brand-beige/30 px-4 py-1 rounded-lg">
              {config.openingTime} - {config.closingTime}
            </div>
          </motion.div>
        </motion.div>

        {/* --- SECTION CARTE & FORMULAIRE --- */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* Formulaire de contact */}
          {/* AJUSTEMENT 1 : p-6 pour mobile, md:p-8 pour ordis pour gagner de la place */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm order-2 lg:order-1"
          >
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Envoyez-nous un message</h2>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              
              {/* AJUSTEMENT 2 : grid-cols-1 (mobile) -> md:grid-cols-2 (ordi) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-brown/50 focus:border-brand-brown transition" 
                    placeholder="Votre nom" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-brown/50 focus:border-brand-brown transition" 
                    placeholder="Votre numéro" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-brown/50 focus:border-brand-brown transition" 
                  placeholder="votre@email.com" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-brown/50 focus:border-brand-brown transition" 
                  placeholder="Bonjour, je voudrais commander pour un anniversaire..."
                ></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 group"
              >
                <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                Envoyer le message
              </motion.button>
            </form>
          </motion.div>

          {/* Google Maps Embed */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-2 rounded-2xl shadow-sm h-[500px] lg:h-auto order-1 lg:order-2 flex flex-col"
          >
            <div className="flex-grow w-full h-full rounded-xl overflow-hidden relative">
               {/* L'iframe Google Maps */}
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
            </div>
            <div className="p-4 flex justify-between items-center text-sm text-gray-500">
               <span className="flex items-center gap-1"><MapPin size={14}/> {config.address}</span>
               <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-brand-brown font-bold flex items-center gap-1 hover:underline"
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