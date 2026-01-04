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
        
        if (geomType === 'LineString' && coords && coords.length > 0) {
          // LineString: array of [lng, lat] points
          let segmentCoords = [...coords];
          
          // Check if this segment should be reversed to connect with previous segments
          if (allCoords.length > 0) {
            const lastCoord = allCoords[allCoords.length - 1];
            const firstCoordOfSegment = segmentCoords[0];
            const lastCoordOfSegment = segmentCoords[segmentCoords.length - 1];
            
            // Calculate distances to determine if segment needs reversing
            const distToFirst = Math.hypot(
              lastCoord[0] - firstCoordOfSegment[0],
              lastCoord[1] - firstCoordOfSegment[1]
            );
            const distToLast = Math.hypot(
              lastCoord[0] - lastCoordOfSegment[0],
              lastCoord[1] - lastCoordOfSegment[1]
            );
            
            // If closer to last point, reverse the segment
            if (distToLast < distToFirst) {
              segmentCoords = segmentCoords.reverse();
              console.log(`    -> Reversed segment ${seq} to maintain continuity`);
            }
          }
          
          // Remove duplicate first point if it matches the last point of previous segment
          if (allCoords.length > 0) {
            const lastCoord = allCoords[allCoords.length - 1];
            if (segmentCoords[0][0] === lastCoord[0] && segmentCoords[0][1] === lastCoord[1]) {
              segmentCoords = segmentCoords.slice(1);
              console.log(`    -> Removed duplicate point at junction for segment ${seq}`);
            }
          }
          
          allCoords.push(...segmentCoords);
          console.log(`    -> Added ${segmentCoords.length} coordinates (seq=${seq})`);
        } else if (geomType === 'MultiLineString' && coords) {
          // MultiLineString: array of arrays of [lng, lat] points
          coords.forEach((lineString, lineIdx) => {
            if (lineString && lineString.length > 0) {
              let segmentCoords = [...lineString];
              
              // Check if this segment should be reversed
              if (allCoords.length > 0) {
                const lastCoord = allCoords[allCoords.length - 1];
                const firstCoordOfSegment = segmentCoords[0];
                const lastCoordOfSegment = segmentCoords[segmentCoords.length - 1];
                
                const distToFirst = Math.hypot(
                  lastCoord[0] - firstCoordOfSegment[0],
                  lastCoord[1] - firstCoordOfSegment[1]
                );
                const distToLast = Math.hypot(
                  lastCoord[0] - lastCoordOfSegment[0],
                  lastCoord[1] - lastCoordOfSegment[1]
                );
                
                if (distToLast < distToFirst) {
                  segmentCoords = segmentCoords.reverse();
                }
              }
              
              // Remove duplicate first point
              if (allCoords.length > 0) {
                const lastCoord = allCoords[allCoords.length - 1];
                if (segmentCoords[0][0] === lastCoord[0] && segmentCoords[0][1] === lastCoord[1]) {
                  segmentCoords = segmentCoords.slice(1);
                }
              }
              
              allCoords.push(...segmentCoords);
            }
          });
        }
      }
    });
  }
  
  // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
  const pathCoords = allCoords.map(coord => [coord[1], coord[0]]);
  console.log('RouteLayer: Total coordinates:', pathCoords.length);
  if (pathCoords.length > 0) {
    console.log('RouteLayer: Route from', pathCoords[0], 'to', pathCoords[pathCoords.length - 1]);
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
