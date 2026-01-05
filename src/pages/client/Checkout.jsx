import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  User, 
  Truck, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Search, 
  CheckCircle,
  Clock
} from 'lucide-react';

// --- IMPORTS LEAFLET (Carte) ---
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction icône Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour déplacer la vue de la carte
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
};

// Composant Marqueur Interactif
const LocationMarker = ({ setPosition, setDistance, bakeryLoc }) => {
  const [markerPos, setMarkerPos] = useState(null);
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  useMapEvents({
    click(e) {
      setMarkerPos(e.latlng);
      setPosition(e.latlng);
      if (bakeryLoc) {
        const dist = calculateDistance(bakeryLoc.lat, bakeryLoc.lng, e.latlng.lat, e.latlng.lng);
        setDistance(dist);
      }
    },
  });

  return markerPos ? <Marker position={markerPos}><Popup>Lieu de livraison</Popup></Marker> : null;
};

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { config, isOpenNow } = useConfig();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Données GPS
  const [gpsLocation, setGpsLocation] = useState(null);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [mapCenter, setMapCenter] = useState([config.bakeryLocation.lat, config.bakeryLocation.lng]);

  // Formulaire complet
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    method: 'Livraison', 
    payment: 'Espèces', 
    addressDetails: '', 
    notes: ''
  });

  // Calcul Frais
  const deliveryCost = formData.method === 'Livraison' 
    ? Math.max(500, Math.round(deliveryDistance * config.deliveryRatePerKm)) 
    : 0;

  const finalTotal = cartTotal + deliveryCost;

  // Sécurité Fermeture
  if (!isOpenNow && !config.maintenanceMode) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">La boutique est fermée</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Nous ne pouvons pas prendre votre commande pour le moment.
          Nos horaires sont de <span className="font-bold">{config.openingTime}</span> à <span className="font-bold">{config.closingTime}</span>.
        </p>
        <button onClick={() => navigate('/menu')} className="bg-brand-brown text-white px-8 py-3 rounded-xl font-bold">
          Retour au menu
        </button>
      </div>
    );
  }

  // --- RECHERCHE ADRESSE ---
  const handleAddressSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}, Pointe-Noire, Congo&limit=1`);
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        const newPos = { lat, lng };
        setGpsLocation(newPos);
        setMapCenter([lat, lng]); 
        
        const R = 6371; 
        const dLat = (lat - config.bakeryLocation.lat) * (Math.PI/180);
        const dLon = (lng - config.bakeryLocation.lng) * (Math.PI/180);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(config.bakeryLocation.lat * (Math.PI/180)) * Math.cos(lat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setDeliveryDistance(R * c);

      } else {
        alert("Adresse introuvable. Essayez de déplacer le marqueur manuellement sur la carte.");
      }
    } catch (error) {
      console.error("Erreur recherche", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.method === 'Livraison' && !gpsLocation) {
        alert("Veuillez indiquer votre position sur la carte (Recherche ou Clic).");
        return;
    }

    setLoading(true);

    try {
      // Construction de l'adresse texte pour l'Admin
      let finalAddressString = "Retrait Boutique";
      if (formData.method === 'Livraison') {
        // On combine la recherche texte et les détails
        finalAddressString = searchQuery 
          ? `${searchQuery} ${formData.addressDetails ? '(' + formData.addressDetails + ')' : ''}`
          : `Position GPS Carte ${formData.addressDetails ? '(' + formData.addressDetails + ')' : ''}`;
      }

      const orderData = {
        code: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
        customer: {
          name: formData.name,
          phone: formData.phone,
          location: formData.method === 'Livraison' ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : null,
          address: finalAddressString // CORRECTION : On utilise 'address' pour que l'admin le voie
        },
        items: cartItems,
        details: {
          subTotal: cartTotal,
          deliveryFee: deliveryCost,
          deliveryDistance: formData.method === 'Livraison' ? deliveryDistance.toFixed(2) : 0,
          finalTotal: finalTotal,
          method: formData.method,
          paymentMethod: formData.payment,
          scheduledDate: formData.method === 'Retrait' ? formData.date : null, // Date seulement si retrait
          scheduledTime: formData.method === 'Retrait' ? formData.time : null, // Heure seulement si retrait
          notes: formData.notes
        },
        status: 'En attente',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      navigate('/confirmation', { state: { order: orderData } });

    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) return <div className="min-h-screen flex items-center justify-center">Votre panier est vide.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-32">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8 flex items-center gap-2">
          <CheckCircle className="text-brand-brown"/> Finaliser la commande
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLONNE GAUCHE --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Infos Perso */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-brand-brown"/> Vos Coordonnées
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-bold text-gray-600">Nom complet</label>
                   <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-lg mt-1"/>
                 </div>
                 <div>
                   <label className="text-sm font-bold text-gray-600">Téléphone</label>
                   <input required type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border p-3 rounded-lg mt-1"/>
                 </div>
              </div>
            </div>

            {/* 2. Livraison / Retrait */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck size={20} className="text-brand-brown"/> Mode de réception
              </h2>
              
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <button type="button" onClick={() => setFormData({...formData, method: 'Livraison'})} className={`w-full sm:flex-1 py-3 px-4 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base ${formData.method === 'Livraison' ? 'border-brand-brown bg-brand-brown/10 text-brand-brown' : 'border-gray-100 text-gray-500'}`}>
                    <Truck size={18} className="shrink-0"/> Livraison
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, method: 'Retrait'})} className={`w-full sm:flex-1 py-3 px-4 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base ${formData.method === 'Retrait' ? 'border-brand-brown bg-brand-brown/10 text-brand-brown' : 'border-gray-100 text-gray-500'}`}>
                    <ShoppingBag size={18} className="shrink-0"/> Retrait Boutique
                  </button>
                </div>

              {/* CARTE (Seulement si Livraison) */}
              {formData.method === 'Livraison' && (
                <div className="animate-fade-in space-y-4">
                  <div className="w-full">
                    <label className="text-sm font-bold text-gray-600 mb-2 block">Rechercher votre quartier / rue</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="Ex: Marché Tié-Tié, Pointe-Noire..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full border border-gray-300 p-3 rounded-xl pl-10 focus:ring-2 focus:ring-brand-brown outline-none transition"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18}/>
                      </div>
                      <button type="button" onClick={handleAddressSearch} disabled={isSearching} className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-bold transition flex items-center justify-center sm:w-auto w-full">
                        {isSearching ? '...' : 'Chercher'}
                      </button>
                    </div>
                  </div>

                  <div className="h-64 rounded-xl overflow-hidden border-2 border-gray-200 relative z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                      <MapUpdater center={mapCenter} />
                      <Marker position={[config.bakeryLocation.lat, config.bakeryLocation.lng]}><Popup>La Pâtisserie</Popup></Marker>
                      <LocationMarker setPosition={setGpsLocation} setDistance={setDeliveryDistance} bakeryLoc={config.bakeryLocation} />
                    </MapContainer>
                  </div>

                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
                    <span>{gpsLocation ? "Position validée" : "Cliquez sur la carte pour préciser"}</span>
                    {gpsLocation && <span className="font-bold">{deliveryDistance.toFixed(2)} km (+{deliveryCost} FCFA)</span>}
                  </div>

                  <input type="text" placeholder="Précisions (Numéro de porte, couleur maison...)" value={formData.addressDetails} onChange={e=>setFormData({...formData, addressDetails: e.target.value})} className="w-full border p-3 rounded-lg"/>
                </div>
              )}
            </div>

            {/* 3. Date & Heure (SEULEMENT SI RETRAIT) */}
            {formData.method === 'Retrait' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={18}/> Quand souhaitez-vous passer ?</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-gray-500 mb-1 block">Date</label>
                     <input required type="date" className="w-full border p-3 rounded-lg" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})}/>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-500 mb-1 block">Heure</label>
                     <input required type="time" className="w-full border p-3 rounded-lg" value={formData.time} onChange={e=>setFormData({...formData, time: e.target.value})}/>
                   </div>
                </div>
              </div>
            )}
            
            {/* 4. Paiement & Notes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="mb-4">
                 <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={18}/> Paiement</h3>
                 <select className="w-full border p-3 rounded-lg bg-white" value={formData.payment} onChange={e=>setFormData({...formData, payment: e.target.value})}>
                   <option value="Espèces">Espèces à la livraison/réception</option>
                   <option value="Mobile Money">Airtel Money / MTN MoMo</option>
                 </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Message pour la pâtisserie (Optionnel)</label>
                  <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-brown/20" placeholder="Ex: Anniversaire, Allergies..."/>
               </div>
            </div>
          </div>

          {/* --- COLONNE DROITE : RÉSUMÉ --- */}
          <div className="h-fit space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 pb-4 border-b">Résumé de commande</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-bold text-gray-700">{item.quantity}x</span> {item.name}
                    </div>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Récap Adresse / Mode */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs space-y-2">
                 <div className="flex justify-between">
                    <span className="text-gray-500">Mode :</span>
                    <span className="font-bold text-gray-800">{formData.method}</span>
                 </div>
                 {formData.method === 'Livraison' && (
                   <div>
                      <span className="text-gray-500 block mb-1">Adresse :</span>
                      <span className="font-medium text-gray-800 block truncate">
                        {searchQuery || "Position sur carte"}
                      </span>
                   </div>
                 )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                {formData.method === 'Livraison' ? (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center gap-1"><Truck size={14}/> Livraison ({deliveryDistance.toFixed(1)} km)</span>
                    <span>+{deliveryCost.toLocaleString()} FCFA</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-gray-400 italic">
                    <span>Retrait en boutique</span>
                    <span>0 FCFA</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total à payer</span>
                  <span className="text-2xl font-serif font-bold text-brand-brown">{finalTotal.toLocaleString()} <span className="text-sm text-gray-500">FCFA</span></span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-8 bg-brand-red text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validation en cours...' : 'Confirmer la commande'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;