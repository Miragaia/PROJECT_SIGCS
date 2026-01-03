import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const DEFAULT_CENTER = [40.6412, -8.6540]; // Aveiro, Portugal
const DEFAULT_ZOOM = 13;

function MapController({ center, zoom, onCenterChange, onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  // Track map center when user pans
  useEffect(() => {
    if (!onCenterChange) return;
    
    const handleMoveEnd = () => {
      const newCenter = map.getCenter();
      onCenterChange([newCenter.lat, newCenter.lng]);
    };
    
    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map, onCenterChange]);

  // Handle map clicks
  useEffect(() => {
    if (!onMapClick) return;
    
    map.on('click', onMapClick);
    return () => map.off('click', onMapClick);
  }, [map, onMapClick]);
  
  return null;
}

export default function BaseMap({ center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM, onCenterChange, onMapClick, children }) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} onCenterChange={onCenterChange} onMapClick={onMapClick} />
        {children}
      </MapContainer>
    </div>
  );
}
