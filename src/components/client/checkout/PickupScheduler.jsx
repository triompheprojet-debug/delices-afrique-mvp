import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
// ASSUREZ-VOUS QUE LE CHEMIN D'IMPORT EST CORRECT SELON VOTRE STRUCTURE
import { useConfig } from '../../../context/ConfigContext'; 

const PickupScheduler = ({ 
  scheduledDate, 
  scheduledTime, 
  errors, 
  onDateChange, 
  onTimeChange,
  shopAddress,
  isMobile = false 
}) => {
  // 1. Récupération des horaires depuis le contexte global
  const { config } = useConfig();
  const openTime = config?.openingTime || '08:00';
  const closeTime = config?.closingTime || '18:00';

  // 2. Générer les dates disponibles (aujourd'hui + 7 jours)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Format local YYYY-MM-DD sécurisé contre les décalages de fuseau horaire
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Format d'affichage convivial
      const isToday = i === 0;
      const isTomorrow = i === 1;
      
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayNumber = date.toLocaleDateString('fr-FR', { day: 'numeric' });
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });

      dates.push({
        value: dateString,
        labelDay: isToday ? "Auj." : isTomorrow ? "Dem." : dayName.charAt(0).toUpperCase() + dayName.slice(1),
        labelNumber: dayNumber,
        labelMonth: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    }
    return dates;
  }, []);

  // 3. Générer les créneaux horaires basés sur les Settings
  const timeSlots = useMemo(() => {
    if (!scheduledDate) return [];

    const slots = [];
    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    // Arrondir l'heure d'ouverture au créneau de 30 min le plus proche pour commencer
    let currentMins = Math.ceil((openH * 60 + openM) / 30) * 30; 
    const endMins = closeH * 60 + closeM;

    while (currentMins <= endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      currentMins += 30; // Incrément de 30 minutes
    }

    // 4. Filtrer les heures passées si la date choisie est aujourd'hui
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${currentYear}-${currentMonth}-${currentDay}`;

    if (scheduledDate === todayString) {
      const nowMins = today.getHours() * 60 + today.getMinutes();
      // On ajoute 30 mins de battement (impossible de commander pour dans 5 minutes)
      return slots.filter(slot => {
        const [sh, sm] = slot.split(':').map(Number);
        const slotMins = sh * 60 + sm;
        return slotMins > (nowMins + 30);
      });
    }

    return slots;
  }, [scheduledDate, openTime, closeTime]);

  // Si la date change, on réinitialise l'heure pour éviter une heure invalide
  const handleDateSelection = (dateValue) => {
    onDateChange(dateValue);
    onTimeChange(""); 
  };

  return (
    <div className="space-y-6">
      {/* En-tête (masqué sur mobile si besoin) */}
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Calendar size={18} className="text-purple-400" />
          Planifier le retrait
        </h3>
      )}

      {/* Adresse de la boutique */}
      {shopAddress && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-start gap-3">
          <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-300">Lieu de retrait</p>
            <p className="text-sm text-slate-400 mt-1">{shopAddress}</p>
          </div>
        </div>
      )}

      {/* --- SÉLECTION DE LA DATE --- */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          Jour de retrait *
        </label>
        
        {/* Scroll horizontal pour les dates */}
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar-mobile">
          {availableDates.map((date) => {
            const isSelected = scheduledDate === date.value;
            return (
              <button
                key={date.value}
                type="button"
                onClick={() => handleDateSelection(date.value)}
                className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all ${
                  isSelected 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                } ${errors.scheduledDate && !scheduledDate ? 'border-red-500 bg-red-950/20' : ''}`}
              >
                <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-purple-200' : ''}`}>
                  {date.labelDay}
                </span>
                <span className="text-xl font-bold">
                  {date.labelNumber}
                </span>
                <span className={`text-xs mt-1 ${isSelected ? 'text-purple-200' : ''}`}>
                  {date.labelMonth}
                </span>
              </button>
            );
          })}
        </div>
        {errors.scheduledDate && (
          <p className="text-red-400 text-sm mt-1">{errors.scheduledDate}</p>
        )}
      </div>

      {/* --- SÉLECTION DE L'HEURE --- */}
      {scheduledDate && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Heure de retrait *
          </label>
          
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isSelected = scheduledTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onTimeChange(time)}
                    className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    } ${errors.scheduledTime && !scheduledTime ? 'border-red-500 bg-red-950/20' : ''}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-500/30 text-center">
              <p className="text-sm text-orange-400">
                Aucun créneau disponible pour aujourd'hui. Veuillez choisir un autre jour.
              </p>
            </div>
          )}
          {errors.scheduledTime && (
            <p className="text-red-400 text-sm mt-1">{errors.scheduledTime}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PickupScheduler;