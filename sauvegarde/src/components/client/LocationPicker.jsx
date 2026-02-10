import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import { Search, Check } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuration Icônes Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Composant interne pour déplacer la vue
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
};

// Composant interne Marqueur Interactif
const LocationMarker = ({ setPosition, bakeryLoc, onLocationFound }) => {
  const [markerPos, setMarkerPos] = useState(null);
  
  // Formule Haversine pour la distance
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
    async click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPos(e.latlng);
      setPosition(e.latlng);
      
      // 1. Calcul Distance
      let dist = 0;
      if (bakeryLoc) {
        dist = calculateDistance(bakeryLoc.lat, bakeryLoc.lng, lat, lng);
      }

      // 2. Reverse Geocoding (Trouver nom rue)
      let addressName = "Position Carte";
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (response.data && response.data.display_name) {
          addressName = response.data.display_name.split(',').slice(0, 3).join(',');
        }
      } catch (error) {
        console.error("Erreur geocoding", error);
      }

      // 3. Remonter l'info au parent
      onLocationFound({ lat, lng, distance: dist, addressName });
    },
  });

  return markerPos ? <Marker position={markerPos}><Popup>Lieu de livraison</Popup></Marker> : null;
};

// --- COMPOSANT PRINCIPAL EXPORTÉ ---
const LocationPicker = ({ bakeryLocation, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([bakeryLocation.lat, bakeryLocation.lng]);
  const [foundLocation, setFoundLocation] = useState(null); // Pour afficher le feedback visuel

  // Gestion Recherche Texte
  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}, Pointe-Noire, Congo&limit=1`);
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Simuler un clic pour déclencher le calcul de distance
        const R = 6371; 
        const dLat = (lat - bakeryLocation.lat) * (Math.PI/180);
        const dLon = (lng - bakeryLocation.lng) * (Math.PI/180);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(bakeryLocation.lat * (Math.PI/180)) * Math.cos(lat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

        setMapCenter([lat, lng]);
        
        // Mise à jour locale et remontée parent
        const locData = { lat, lng, distance: dist, addressName: searchQuery };
        setFoundLocation(locData);
        onLocationSelect(locData);

      } else {
        alert("Adresse introuvable.");
      }
    } catch (error) {
      console.error("Erreur recherche", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClickResult = (data) => {
      setFoundLocation(data);
      setSearchQuery(data.addressName); // On remplit l'input avec l'adresse trouvée au clic
      onLocationSelect(data);
  };

  return (
    <div className="space-y-4">
        {/* Barre de Recherche */}
        <div className="w-full">
            <label className="text-sm font-bold text-gray-600 mb-2 block">Rechercher votre quartier ou cliquer sur la carte</label>
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
                <button 
                type="button" 
                onClick={handleSearch} 
                disabled={isSearching} 
                className={`py-3 px-6 rounded-xl font-bold transition flex items-center justify-center sm:w-auto w-full text-white shadow-md ${foundLocation ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                {isSearching ? '...' : foundLocation ? <><Check size={18} className="mr-2"/> Validé</> : 'Chercher'}
                </button>
            </div>
        </div>

        {/* Carte */}
        <div className="h-64 rounded-xl overflow-hidden border-2 border-gray-200 relative z-0">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                <MapUpdater center={mapCenter} />
                <Marker position={[bakeryLocation.lat, bakeryLocation.lng]}><Popup>La Pâtisserie</Popup></Marker>
                <LocationMarker 
                    setPosition={() => {}} // Géré en interne par LocationMarker pour l'affichage
                    bakeryLoc={bakeryLocation}
                    onLocationFound={handleMapClickResult}
                />
            </MapContainer>
        </div>

        {/* Feedback sous la carte */}
        <div className={`flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${foundLocation ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-blue-50 text-blue-800'}`}>
            <span>{foundLocation ? "Position validée" : "Indiquez votre position pour calculer les frais."}</span>
            {foundLocation && <span className="font-bold">{foundLocation.distance.toFixed(2)} km</span>}
        </div>
    </div>
  );
};

export default LocationPicker;