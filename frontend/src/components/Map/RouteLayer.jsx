import { Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

export default function RouteLayer({ route, origin, destination }) {
  // Always show markers if they exist, even without route
  if (!origin && !destination && (!route || !route.features || route.features.length === 0)) {
    return null;
  }

  // Get all route segments and combine their coordinates
  // Backend returns MultiLineString geometries
  const allCoords = [];
  
  if (route && route.features) {
    route.features.forEach(feature => {
      if (feature.geometry) {
        const geomType = feature.geometry.type;
        const coords = feature.geometry.coordinates;
        
        if (geomType === 'LineString') {
          // LineString: array of [lng, lat] points
          allCoords.push(...coords);
        } else if (geomType === 'MultiLineString') {
          // MultiLineString: array of arrays of [lng, lat] points
          coords.forEach(lineString => {
            allCoords.push(...lineString);
          });
        }
      }
    });
  }
  
  // Convert GeoJSON coordinates [lng, lat, elevation?] to Leaflet [lat, lng]
  const pathCoords = allCoords.map(coord => [coord[1], coord[0]]);

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
