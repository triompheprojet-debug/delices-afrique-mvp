import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const PickupScheduler = ({ 
  scheduledDate, 
  scheduledTime, 
  errors, 
  onDateChange, 
  onTimeChange,
  shopAddress,
  isMobile = false 
}) => {
  // Générer les dates disponibles (aujourd'hui + 7 jours)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Générer les créneaux horaires
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  return (
    <div className="space-y-4">
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-purple-400" />
          Planifier le retrait
        </h3>
      )}

      {shopAddress && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-300">Lieu de retrait</p>
              <p className="text-sm text-slate-400 mt-1">{shopAddress}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Date de retrait *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <select
            value={scheduledDate}
            onChange={(e) => onDateChange(e.target.value)}
            className={`w-full bg-slate-800/50 border ${
              errors.scheduledDate ? 'border-red-500' : 'border-slate-700'
            } rounded-lg py-3 px-10 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer`}
          >
            <option value="">Sélectionner une date</option>
            {getAvailableDates().map((date) => {
              const dateObj = new Date(date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const isToday = dateObj.getTime() === today.getTime();
              const isTomorrow = dateObj.getTime() === today.getTime() + 86400000;
              
              let label = dateObj.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              });
              
              if (isToday) label = `Aujourd'hui - ${label}`;
              if (isTomorrow) label = `Demain - ${label}`;
              
              return (
                <option key={date} value={date}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
        {errors.scheduledDate && (
          <p className="text-red-400 text-sm mt-1">{errors.scheduledDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Heure de retrait *
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <select
            value={scheduledTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className={`w-full bg-slate-800/50 border ${
              errors.scheduledTime ? 'border-red-500' : 'border-slate-700'
            } rounded-lg py-3 px-10 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer`}
          >
            <option value="">Sélectionner une heure</option>
            {getTimeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        {errors.scheduledTime && (
          <p className="text-red-400 text-sm mt-1">{errors.scheduledTime}</p>
        )}
      </div>
    </div>
  );
};

export default PickupScheduler;