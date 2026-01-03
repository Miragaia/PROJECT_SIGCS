import { Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

export default function RouteLayer({ route, origin, destination }) {
  // Always show markers if they exist, even without route
  if (!origin && !destination && (!route || !route.features || route.features.length === 0)) {
    return null;
  }

  // Get the route line if available
  const routeFeature = route?.features?.find(f => f.geometry?.type === 'LineString');
  const coordinates = routeFeature?.geometry?.coordinates || [];
  
  // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
  const pathCoords = coordinates.map(([lng, lat]) => [lat, lng]);

  return (
    <>
      {/* Route polyline */}
      {pathCoords.length > 0 && (
        <Polyline
          positions={pathCoords}
          color="#3b82f6"
          weight={3}
          opacity={0.8}
          dashArray="0"
        />
      )}
      
      {/* Origin marker */}
      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={8}
          fillColor="#10b981"
          fillOpacity={0.8}
          color="#059669"
          weight={2}
        >
          <div title="Start Point" />
        </CircleMarker>
      )}
      
      {/* Destination marker */}
      {destination && (
        <CircleMarker
          center={[destination.lat, destination.lng]}
          radius={8}
          fillColor="#ef4444"
          fillOpacity={0.8}
          color="#dc2626"
          weight={2}
        >
          <div title="End Point" />
        </CircleMarker>
      )}
    </>
  );
}
