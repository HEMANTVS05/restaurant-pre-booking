import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import './MapComponent.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Sub-component: re-centers + flies to new bounds whenever restaurants change
const MapController = ({ restaurants }) => {
  const map = useMap();

  useEffect(() => {
    if (!restaurants.length) return;

    if (restaurants.length === 1) {
      map.flyTo([restaurants[0].lat, restaurants[0].lng], 15, { duration: 1.4 });
    } else {
      const bounds = L.latLngBounds(restaurants.map(r => [r.lat, r.lng]));
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.4 });
    }
  }, [restaurants, map]);

  return null;
};

const MapComponent = ({ restaurants }) => {
  const defaultCenter = [13.0827, 80.2707]; // Centre of Chennai

  return (
    <motion.div
      className="map-wrapper"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="map-header">
        <h3 className="luxury-text">Location Map</h3>
        <p>
          {restaurants.length} culinary destination{restaurants.length !== 1 ? 's' : ''} in this area
        </p>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController restaurants={restaurants} />

        {restaurants.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup className="custom-popup">
              <strong>{r.name}</strong>
              <br />
              {r.cuisine}
              <br />
              ⭐ {r.rating} &nbsp;|&nbsp; Tables: {r.availableTables ?? r.available_tables}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
};

export default MapComponent;
