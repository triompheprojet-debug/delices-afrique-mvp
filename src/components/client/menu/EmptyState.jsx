import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const EmptyState = ({ onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 px-4"
    >
      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Filter size={28} className="text-slate-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-300 mb-2">Aucun produit trouvé</h3>
      <p className="text-slate-500 text-sm mb-6">Essayez une autre recherche</p>
      <button
        onClick={onReset}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors text-sm"
      >
        Voir tous les produits
      </button>
    </motion.div>
  );
};

export default EmptyState;
