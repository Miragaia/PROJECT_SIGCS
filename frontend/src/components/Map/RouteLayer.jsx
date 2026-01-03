import { Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

export default function RouteLayer({ route, origin, destination }) {
  // Always show markers if they exist, even without route
  if (!origin && !destination && (!route || !route.features || route.features.length === 0)) {
    return null;
  }

  // Get all route segments and combine their coordinates
  // Backend returns each edge as a separate feature with LineString geometry
  // We need to combine them in order to create a continuous route
  const allCoords = [];
  
  if (route && route.features) {
    console.log('RouteLayer: Processing route with', route.features.length, 'features');
    
    // Sort features by sequence number to ensure correct order
    const sortedFeatures = [...route.features].sort((a, b) => 
      (a.properties?.seq || 0) - (b.properties?.seq || 0)
    );
    
    sortedFeatures.forEach((feature, idx) => {
      if (feature.geometry) {
        const geomType = feature.geometry.type;
        const coords = feature.geometry.coordinates;
        const seq = feature.properties?.seq;
        
        console.log(`  Feature ${idx} (seq=${seq}): ${geomType}`, coords);
        
        if (geomType === 'LineString' && coords && coords.length > 0) {
          // LineString: array of [lng, lat] points
          console.log(`    -> Adding ${coords.length} coordinates from LineString`);
          allCoords.push(...coords);
        } else if (geomType === 'MultiLineString' && coords) {
          // MultiLineString: array of arrays of [lng, lat] points
          let totalCoords = 0;
          coords.forEach(lineString => {
            if (lineString && lineString.length > 0) {
              console.log(`    -> Adding ${lineString.length} coordinates from sub-LineString`);
              allCoords.push(...lineString);
              totalCoords += lineString.length;
            }
          });
          console.log(`    -> Total: ${totalCoords} coordinates`);
        }
      }
    });
  }
  
  // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
  const pathCoords = allCoords.map(coord => [coord[1], coord[0]]);
  console.log('RouteLayer: allCoords before conversion:', allCoords);
  console.log('RouteLayer: Total path coordinates after conversion:', pathCoords.length);
  if (pathCoords.length > 0) {
    console.log('RouteLayer: First coord (should be [lat, lng]):', pathCoords[0], 'Last coord:', pathCoords[pathCoords.length - 1]);
  }

  return (
    <>
      {/* Route polyline */}
      {pathCoords.length > 0 && (
        <Polyline
          positions={pathCoords}
          color="#3b82f6"
          weight={4}
          opacity={0.9}
          dashArray="0"
          lineCap="round"
          lineJoin="round"
        />
      )}
      
      {/* Origin marker */}
      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={10}
          fillColor="#10b981"
          fillOpacity={0.9}
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
          radius={10}
          fillColor="#ef4444"
          fillOpacity={0.9}
          color="#dc2626"
          weight={2}
        >
          <div title="End Point" />
        </CircleMarker>
      )}
    </>
  );
}
