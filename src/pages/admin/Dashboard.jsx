import React from 'react';
import { TrendingUp, ShoppingBag, Users, AlertCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mb-2">{value}</h3>
      <p className={`text-xs font-medium ${subtext.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
        {subtext}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      
      {/* 1. Les KPI (Indicateurs Clés) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chiffre d'Affaires (Mois)" 
          value="450.000 F" 
          subtext="+12% vs mois dernier" 
          icon={TrendingUp} 
          color="bg-brand-brown" 
        />
        <StatCard 
          title="Commandes Aujourd'hui" 
          value="14" 
          subtext="4 en attente de validation" 
          icon={ShoppingBag} 
          color="bg-brand-red" 
        />
        <StatCard 
          title="Clients Actifs" 
          value="89" 
          subtext="+5 nouveaux cette semaine" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Produits en Rupture" 
          value="2" 
          subtext="Action requise" 
          icon={AlertCircle} 
          color="bg-orange-500" 
        />
      </div>

      {/* 2. Dernières Commandes (Aperçu rapide) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Commandes Récentes</h3>
          <button className="text-sm text-brand-red font-bold hover:underline">Voir tout</button>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Montant</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono font-bold">#CMD-00{i}</td>
                <td className="px-6 py-4">Jean Dupont</td>
                <td className="px-6 py-4 font-bold">15 000 FCFA</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    i === 1 ? 'bg-yellow-100 text-yellow-800' : // En attente
                    i === 2 ? 'bg-blue-100 text-blue-800' :   // En préparation
                    'bg-green-100 text-green-800'             // Livrée
                  }`}>
                    {i === 1 ? 'En attente' : i === 2 ? 'En cuisine' : 'Livrée'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                  <Clock size={14}/> 14:30
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;