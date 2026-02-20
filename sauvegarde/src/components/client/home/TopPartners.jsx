/**
 * ========================================
 * Délices d'Afrique - TopPartners
 * Podium des meilleurs partenaires du mois
 * ========================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Award, Crown } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { formatCurrency } from '../../../utils/formatters';

const TopPartners = () => {
  const navigate = useNavigate();
  const [topPartners, setTopPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPartners = async () => {
      try {
        const q = query(
          collection(db, 'partners'),
          where('isActive', '==', true),
          orderBy('totalSales', 'desc'),
          limit(3)
        );

        const snapshot = await getDocs(q);
        const partnersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTopPartners(partnersData);
      } catch (error) {
        console.error('Erreur chargement top partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPartners();
  }, []);

  if (loading || topPartners.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-cream-50 to-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div 
            className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-5 py-2.5 rounded-full mb-4"
            style={{ animation: 'fadeInDown 0.6s ease-out' }}
          >
            <Trophy size={18} />
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Top Partenaires
            </span>
          </div>

          <h2 
            className="font-display text-4xl md:text-5xl font-bold text-chocolate-900 mb-4"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
          >
            Nos Ambassadeurs{' '}
            <span className="text-gradient-gold">d'Excellence</span>
          </h2>

          <p 
            className="font-body text-lg text-chocolate-600 leading-relaxed"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
          >
            Découvrez les partenaires qui font rayonner Délices d'Afrique.
            Rejoignez-les et commencez à générer vos revenus dès aujourd'hui.
          </p>
        </div>

        {/* Podium */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            {/* 2ème place */}
            {topPartners[1] && (
              <PodiumCard partner={topPartners[1]} rank={2} delay={0.3} />
            )}

            {/* 1ère place */}
            {topPartners[0] && (
              <PodiumCard partner={topPartners[0]} rank={1} delay={0.4} winner />
            )}

            {/* 3ème place */}
            {topPartners[2] && (
              <PodiumCard partner={topPartners[2]} rank={3} delay={0.5} />
            )}
          </div>
        </div>

        {/* CTA */}
        <div 
          className="text-center"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.6s both' }}
        >
          <button
            onClick={() => navigate('/partner/register')}
            className="
              group inline-flex items-center gap-3
              bg-gradient-to-r from-gold-500 to-gold-600
              hover:from-gold-600 hover:to-gold-700
              text-white font-heading font-bold
              px-8 py-4 rounded-xl
              shadow-gold-lg hover:shadow-gold
              transition-all duration-300
              transform hover:scale-105
            "
          >
            <TrendingUp size={24} />
            Rejoindre le classement
            <span className="text-sm opacity-80">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const PodiumCard = ({ partner, rank, winner, delay }) => {
  const medals = {
    1: { icon: <Crown size={32} />, color: 'from-yellow-400 to-yellow-600', bg: 'bg-gradient-to-br from-yellow-50 to-gold-100', border: 'border-gold-400' },
    2: { icon: <Award size={28} />, color: 'from-gray-300 to-gray-500', bg: 'bg-gradient-to-br from-gray-50 to-gray-100', border: 'border-gray-300' },
    3: { icon: <Award size={24} />, color: 'from-orange-400 to-orange-600', bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-300' }
  };

  const medal = medals[rank];

  return (
    <div 
      className={`
        relative rounded-2xl p-6 border-2 shadow-lg
        ${medal.bg} ${medal.border}
        ${winner ? 'transform md:-translate-y-8 scale-105' : ''}
        hover:shadow-xl transition-all
      `}
      style={{ animation: `fadeInUp 0.8s ease-out ${delay}s both` }}
    >
      <div className={`
        absolute -top-6 left-1/2 -translate-x-1/2
        w-14 h-14 rounded-full
        bg-gradient-to-br ${medal.color}
        text-white flex items-center justify-center shadow-lg
        ${winner ? 'animate-pulse' : ''}
      `}>
        {medal.icon}
      </div>

      <div className="text-center mt-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/80 flex items-center justify-center shadow-md border-2 border-chocolate-200">
          <span className="font-heading text-2xl font-bold text-chocolate-800">
            {partner.fullName?.charAt(0) || '?'}
          </span>
        </div>

        <h4 className="font-heading text-lg font-bold text-chocolate-900 mb-1">
          {partner.fullName || 'Partenaire'}
        </h4>

        <div className="space-y-2 bg-white/60 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-chocolate-600 font-body">Ventes</span>
            <span className="font-accent text-lg font-bold text-chocolate-900">
              {partner.totalSales || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-chocolate-600 font-body">Gains</span>
            <span className="font-accent text-lg font-bold text-gold-600">
              {formatCurrency(partner.totalEarnings || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPartners;