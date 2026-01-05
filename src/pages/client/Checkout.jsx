import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Pour la recherche d'adresse
import { 
  MapPin, 
  User, 
  Truck, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  CreditCard, 
  Search, 
  CheckCircle 
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

// Composant pour déplacer la vue de la carte quand on fait une recherche
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
};

// Composant Marqueur qui gère le clic
const LocationMarker = ({ setPosition, setDistance, bakeryLoc }) => {
  const [markerPos, setMarkerPos] = useState(null);
  
  // Formule Haversine pour distance
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
    method: 'Livraison', // 'Livraison' ou 'Retrait'
    payment: 'Espèces', // 'Espèces' ou 'Mobile Money'
    addressDetails: '', // Complément d'adresse
    notes: ''
  });

  // Calcul Frais
  const deliveryCost = formData.method === 'Livraison' 
    ? Math.max(500, Math.round(deliveryDistance * config.deliveryRatePerKm)) 
    : 0;

  const finalTotal = cartTotal + deliveryCost;

  // Redirection si fermé (Sécurité supplémentaire)
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

  // --- FONCTION RECHERCHE ADRESSE (Nominatim) ---
  const handleAddressSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      // On ajoute "Pointe-Noire" pour affiner la recherche
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}, Pointe-Noire, Congo&limit=1`);
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        const newPos = { lat, lng };
        setGpsLocation(newPos);
        setMapCenter([lat, lng]); // Bouge la carte
        
        // Calcul distance immédiat
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
      // Création de l'objet commande
      const orderData = {
        code: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
        customer: {
          name: formData.name,
          phone: formData.phone,
          location: formData.method === 'Livraison' ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : null,
          // IMPORTANT : On concatène pour avoir une adresse lisible
          addressText: formData.method === 'Livraison' 
             ? (searchQuery + (formData.addressDetails ? ', ' + formData.addressDetails : '')) 
             : "Retrait Boutique"
        },
        items: cartItems,
        details: {
          subTotal: cartTotal,
          deliveryFee: deliveryCost,
          deliveryDistance: formData.method === 'Livraison' ? deliveryDistance.toFixed(2) : 0,
          finalTotal: finalTotal,
          method: formData.method,
          paymentMethod: formData.payment,
          scheduledDate: formData.date,
          scheduledTime: formData.time,
          notes: formData.notes
        },
        status: 'En attente',
        createdAt: serverTimestamp(),
      };

      // 1. Envoi à Firebase
      await addDoc(collection(db, "orders"), orderData);
      
      // 2. Vider le panier
      clearCart();
      
      // 3. REDIRECTION VERS LA CONFIRMATION (Au lieu de l'alert)
      // On passe "orderData" via le state pour l'afficher sur la page suivante
      navigate('/confirmation', { state: { order: orderData } });

    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Vérifiez votre connexion.");
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
          
          {/* --- COLONNE GAUCHE : FORMULAIRE --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Informations Personnelles */}
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

            {/* 2. Mode de Réception (Livraison / Retrait) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck size={20} className="text-brand-brown"/> Mode de réception
              </h2>
              
              <div className="flex gap-4 mb-6">
                <button type="button" onClick={() => setFormData({...formData, method: 'Livraison'})} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 ${formData.method === 'Livraison' ? 'border-brand-brown bg-brand-brown/10 text-brand-brown' : 'border-gray-100 text-gray-500'}`}>
                  <Truck size={18}/> Livraison
                </button>
                <button type="button" onClick={() => setFormData({...formData, method: 'Retrait'})} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 ${formData.method === 'Retrait' ? 'border-brand-brown bg-brand-brown/10 text-brand-brown' : 'border-gray-100 text-gray-500'}`}>
                  <ShoppingBag size={18}/> Retrait Boutique
                </button>
              </div>

              {/* --- IF LIVRAISON : RECHERCHE + CARTE --- */}
              {formData.method === 'Livraison' && (
                <div className="animate-fade-in space-y-4">
                  
                  {/* Barre de Recherche */}
                  <div className="relative">
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Rechercher votre quartier / rue</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ex: Marché Tié-Tié, Pointe-Noire..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border p-3 rounded-lg pl-10"
                      />
                      <Search className="absolute left-3 top-9 text-gray-400" size={18}/>
                      <button 
                        type="button"
                        onClick={handleAddressSearch}
                        className="bg-gray-800 text-white px-4 rounded-lg font-bold"
                        disabled={isSearching}
                      >
                        {isSearching ? '...' : 'Chercher'}
                      </button>
                    </div>
                  </div>

                  {/* Carte */}
                  <div className="h-64 rounded-xl overflow-hidden border-2 border-gray-200 relative z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                      <MapUpdater center={mapCenter} />
                      
                      {/* Marqueur Boutique */}
                      <Marker position={[config.bakeryLocation.lat, config.bakeryLocation.lng]}>
                        <Popup>La Pâtisserie</Popup>
                      </Marker>
                      
                      {/* Marqueur Client (Interactif) */}
                      <LocationMarker 
                        setPosition={setGpsLocation} 
                        setDistance={setDeliveryDistance} 
                        bakeryLoc={config.bakeryLocation} 
                      />
                    </MapContainer>
                  </div>

                  {/* Résultat Distance */}
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
                    <span>{gpsLocation ? "Position validée" : "Cliquez sur la carte pour préciser"}</span>
                    {gpsLocation && <span className="font-bold">{deliveryDistance.toFixed(2)} km (+{deliveryCost} FCFA)</span>}
                  </div>

                  <input 
                    type="text" 
                    placeholder="Précisions (Numéro de porte, couleur maison...)" 
                    value={formData.addressDetails}
                    onChange={e=>setFormData({...formData, addressDetails: e.target.value})}
                    className="w-full border p-3 rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* 3. Date & Paiement */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={18}/> Quand ?</h3>
                <input type="date" className="w-full border p-3 rounded-lg mb-2" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})}/>
                <input type="time" className="w-full border p-3 rounded-lg" value={formData.time} onChange={e=>setFormData({...formData, time: e.target.value})}/>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={18}/> Paiement</h3>
                <select className="w-full border p-3 rounded-lg bg-white" value={formData.payment} onChange={e=>setFormData({...formData, payment: e.target.value})}>
                  <option value="Espèces">Espèces à la livraison</option>
                  <option value="Mobile Money">Airtel Money / MTN MoMo</option>
                </select>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <label className="block text-sm font-bold text-gray-700 mb-1">Message pour la pâtisserie (Optionnel)</label>
               <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-brown/20" placeholder="Ex: Anniversaire, Allergies..."/>
            </div>
          </div>

          {/* --- COLONNE DROITE : RÉSUMÉ --- */}
          <div className="h-fit space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 pb-4 border-b">Résumé de commande</h2>
              
              {/* Liste des articles (Restauration demandée) */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-bold text-gray-700">{item.quantity}x</span> {item.name}
                      {item.variant && <div className="text-xs text-gray-400">{item.variant}</div>}
                    </div>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Calculs */}
              <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                
                {/* Condition d'affichage livraison */}
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

              {/* Total Final */}
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
              
              <p className="text-xs text-center text-gray-400 mt-4">
                En confirmant, vous acceptez de payer à la réception.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;