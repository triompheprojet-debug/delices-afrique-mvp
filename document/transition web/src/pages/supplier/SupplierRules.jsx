import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const SupplierRules = () => {
  return (
    <div className="max-w-4xl mx-auto pb-24">
       <h1 className="text-3xl font-serif font-bold text-gray-800 mb-6">Aides & Règles</h1>
       
       <div className="space-y-6">
          
          {/* RÈGLES NON NÉGOCIABLES [cite: 263] */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
             <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                <Shield/> Règles NON NÉGOCIABLES
             </h2>
             <ul className="space-y-2 text-red-900 font-medium">
                <li className="flex gap-2"><CheckCircle size={20}/> Le Fournisseur est un exécutant, l'Admin est décisionnaire.</li>
                <li className="flex gap-2"><CheckCircle size={20}/> Aucun paiement de la plateforme sans validation Admin.</li>
                <li className="flex gap-2"><CheckCircle size={20}/> Le traitement des commandes est séquentiel (une par une).</li>
                <li className="flex gap-2"><CheckCircle size={20}/> Tout impayé entraîne un blocage immédiat du compte.</li>
             </ul>
          </div>

          {/* FONCTIONNEMENT FINANCIER [cite: 177] */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="text-blue-600"/> Comment sont calculés vos gains ?
             </h2>
             <div className="space-y-4 text-gray-600">
                <p>
                   <strong>1. Prix Fournisseur :</strong> C'est le montant que VOUS fixez pour vos produits. C'est ce que vous gagnez sur chaque vente de produit.
                </p>
                <p>
                   <strong>2. Livraison :</strong> Si vous effectuez la livraison, vous touchez <strong>90%</strong> des frais de livraison payés par le client. La plateforme garde 10% pour les frais de service.
                </p>
                <p>
                   <strong>3. Dette Plateforme :</strong> Comme vous encaissez directement l'argent du client (Totalité), vous détenez la part de la plateforme (Marge + 10% livraison). Vous devez reverser cette somme régulièrement pour continuer à vendre.
                </p>
             </div>
          </div>

          {/* PROCESSUS DE COMMANDE [cite: 125] */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-600"/> Gestion des Commandes
             </h2>
             <p className="text-gray-600 mb-4">
                Pour éviter les erreurs, vous ne recevez qu'une commande à la fois.
             </p>
             <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Une commande arrive en statut <strong>En attente</strong>.</li>
                <li>Vous passez en <strong>En préparation</strong> quand vous commencez.</li>
                <li>Vous passez en <strong>En livraison</strong> quand le livreur part.</li>
                <li>Ce n'est qu'à ce moment-là qu'une nouvelle commande peut apparaître.</li>
             </ol>
             <p className="mt-4 text-sm bg-orange-50 p-3 rounded text-orange-800">
                <strong>Attention :</strong> Une fois le statut changé, impossible de revenir en arrière.
             </p>
          </div>

       </div>
    </div>
  );
};

export default SupplierRules;