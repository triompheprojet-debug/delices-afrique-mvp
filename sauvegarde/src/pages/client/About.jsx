import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Leaf, Users, Award, ArrowRight, ChefHat } from 'lucide-react';

const About = () => {
  // Variantes d'animation pour réutilisation
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* 1. HERO HEADER */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            src="https://media.istockphoto.com/id/1299566263/fr/photo/un-boulanger-saupoudrant-la-farine-sur-une-p%C3%A2te-pour-faire-le-pain.webp?a=1&b=1&s=612x612&w=0&k=20&c=cxjEH_Pu77dYUPci0RXdxJ1G-blTrnchKDWkKnuD3H8=" 
            alt="Pétrissage pâte" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 text-center px-4 max-w-4xl"
        >
          <span className="text-brand-beige font-bold tracking-widest uppercase text-sm mb-4 block">
            Depuis 2011
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Notre Histoire,<br/> Votre Gourmandise
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Découvrez comment une passion pour la pâtisserie est devenue le cœur battant de notre quartier.
          </p>
        </motion.div>
      </section>

      {/* 2. L'HISTOIRE (Texte + Image) */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <div className="relative mb-12 lg:mb-0">
            {/* Image principale - Hauteur ajustée pour mobile */}
            <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src="https://media.istockphoto.com/id/1487845790/fr/photo/table-d%C3%AElot-en-marbre-blanc-propre-et-vide-dans-la-cuisine-commerciale-et-professionnelle.webp?a=1&b=1&s=612x612&w=0&k=20&c=3_Pv9PzZHuYylrvvTmytx6IW7AdLpVZNQm8bVZkYm1c=" 
                alt="Notre cuisine" 
                className="rounded-3xl shadow-2xl w-full object-cover h-[350px] md:h-[500px]"
            />

            {/* Petite image flottante - Maintenant visible sur mobile avec ajustements */}
            <motion.img 
                initial={{ y: 40, opacity: 0, rotate: -5 }}
                whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                src="https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=500&auto=format&fit=crop" 
                alt="Détail farine"
                className="absolute 
                /* Position et taille sur mobile */
                -bottom-6 -right-2 w-32 h-32 
                /* Position et taille sur tablette/ordi */
                md:-bottom-10 md:-right-10 md:w-48 md:h-48 
                rounded-2xl border-4 border-white shadow-2xl object-cover z-10"
            />

            {/* Badge décoratif optionnel pour ajouter du cachet sur mobile */}
            <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute -top-4 -left-4 bg-brand-red text-white p-4 rounded-full shadow-lg z-20 hidden sm:block"
            >
                <div className="text-center leading-none">
                <span className="block font-bold text-xl">15+</span>
                <span className="text-[10px] uppercase">ans d'expertise</span>
                </div>
            </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 space-y-6"
          >
            <h2 className="text-brand-red font-bold text-sm tracking-widest uppercase">Les Origines</h2>
            <h3 className="text-4xl font-serif font-bold text-brand-brown">La Rencontre de Deux Mondes</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Tout a commencé par un rêve simple : apporter la rigueur de la haute pâtisserie française au cœur de Pointe-Noire, tout en sublimant nos trésors locaux.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Nos recettes ne sont pas simplement suivies, elles sont <strong>réinventées</strong>. Nous marions la crème pâtissière onctueuse avec la vanille de Madagascar, le chocolat belge avec le cacao local, et les fruits rouges avec la douceur de la mangue fraîche.
            </p>
            <div className="pt-4">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-brown/10 rounded-full flex items-center justify-center text-brand-brown">
                    <ChefHat size={24}/>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Savoir-faire Artisanal</h4>
                    <p className="text-sm text-gray-500">Pétrissage et cuisson sur place, chaque matin.</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. NOS VALEURS (Grid) */}
      <section className="py-24 bg-brand-brown text-white relative overflow-hidden">
        {/* Décoration d'arrière-plan */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Nos Engagements</h2>
            <div className="w-24 h-1 bg-brand-red mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Valeur 1 */}
            <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition duration-300">
              <Leaf className="text-brand-beige mb-6" size={40} />
              <h3 className="text-xl font-bold mb-3 text-brand-beige">100% Naturel</h3>
              <p className="text-gray-300 leading-relaxed">
                Aucun mélange industriel. Nous cassons de vrais œufs, utilisons du vrai beurre et de la farine de qualité supérieure.
              </p>
            </motion.div>

            {/* Valeur 2 */}
            <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition duration-300">
              <Heart className="text-brand-red mb-6" size={40} />
              <h3 className="text-xl font-bold mb-3 text-brand-beige">Passion & Amour</h3>
              <p className="text-gray-300 leading-relaxed">
                Un gâteau fait sans amour n'a pas de goût. Notre équipe met tout son cœur dans chaque finition, chaque glaçage.
              </p>
            </motion.div>

            {/* Valeur 3 */}
            <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition duration-300">
              <Users className="text-brand-beige mb-6" size={40} />
              <h3 className="text-xl font-bold mb-3 text-brand-beige">Communauté</h3>
              <p className="text-gray-300 leading-relaxed">
                Nous sommes fiers de soutenir les producteurs locaux pour nos fruits et nos ingrédients de base dès que c'est possible.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. SECTION LE CHEF / L'ÉQUIPE */}
      <section className="py-20 container mx-auto px-4">
         <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
           <div className="flex flex-col md:flex-row">
             <div className="md:w-1/2 relative h-[400px] md:h-auto">
               <img 
                 src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1000&auto=format&fit=crop" 
                 alt="Chef Pâtissier" 
                 className="w-full h-full object-cover absolute inset-0"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/50"></div>
             </div>
             
             <motion.div 
               initial="hidden"
               whileInView="visible"
               variants={staggerContainer}
               viewport={{ once: true }}
               className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center"
             >
               <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                 <Award className="text-brand-red" size={24}/>
                 <span className="font-bold text-gray-500 uppercase tracking-wider text-sm">Le mot du Chef</span>
               </motion.div>
               
               <motion.h3 variants={fadeInUp} className="text-3xl font-serif font-bold text-brand-brown mb-6">
                 "La qualité n'est pas une option, c'est une promesse."
               </motion.h3>
               
               <motion.p variants={fadeInUp} className="text-gray-600 mb-6 italic border-l-4 border-brand-beige pl-4">
                 Après 15 ans passés dans les cuisines, j'ai compris qu'un dessert réussi est celui qui crée un souvenir. Je veux que chaque bouchée vous rappelle un moment heureux.
               </motion.p>
               
               <motion.div variants={scaleIn}>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_sample.svg" alt="Signature" className="h-12 opacity-50"/>
               </motion.div>
             </motion.div>
           </div>
         </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="pb-20 pt-8 container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-beige/20 rounded-3xl p-12 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-serif font-bold text-brand-brown mb-4">Envie de goûter à notre histoire ?</h2>
          <p className="text-gray-600 mb-8">
            Nos vitrines sont pleines de douceurs préparées ce matin même. N'attendez plus.
          </p>
          <Link 
            to="/menu" 
            className="inline-flex items-center gap-2 bg-brand-red text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-red-700 hover:scale-105 transition-all duration-300"
          >
            Voir la Carte <ArrowRight size={20}/>
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default About;