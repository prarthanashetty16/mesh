import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapPicker({ onLocationSelect, initialLat, initialLng }) {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    // Initialize map
    const defaultLat = initialLat || 20.5937;
    const defaultLng = initialLng || 78.9629;
    
    const mapInstance = L.map('map-container').setView([defaultLat, defaultLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Add initial marker if coordinates provided
    if (initialLat && initialLng) {
      const initialMarker = L.marker([initialLat, initialLng])
        .bindPopup(`<b>Selected Location</b><br/>Lat: ${initialLat.toFixed(6)}<br/>Lng: ${initialLng.toFixed(6)}`)
        .addTo(mapInstance)
        .openPopup();
      setMarker(initialMarker);
      setSelectedLocation({ latitude: initialLat, longitude: initialLng });
    }

    // Handle map clicks
    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      
      // Remove old marker
      if (marker) {
        mapInstance.removeLayer(marker);
      }

      // Add new marker
      const newMarker = L.marker([lat, lng])
        .bindPopup(`<b>Selected Location</b><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
        .addTo(mapInstance)
        .openPopup();

      setMarker(newMarker);
      setSelectedLocation({ latitude: lat, longitude: lng });
      
      // Notify parent component
      onLocationSelect({ latitude: lat, longitude: lng });
    };

    mapInstance.on('click', handleMapClick);

    return () => {
      mapInstance.off('click', handleMapClick);
      mapInstance.remove();
    };
  }, []);

  return (
    <div className="form-group">
      <label className="form-label">📍 Select Location on Map</label>
      <div
        id="map-container"
        style={{
          height: '300px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          marginBottom: '12px',
        }}
      />
      {selectedLocation && (
        <div
          style={{
            padding: '12px',
            background: 'rgba(34,197,94,0.06)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(34,197,94,0.2)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <p>
            <strong>Selected:</strong> Lat {selectedLocation.latitude.toFixed(6)}, Lng{' '}
            {selectedLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
