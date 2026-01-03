import { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';

const modeColors = {
  walk: '#10b981',    // emerald
  bike: '#3b82f6',    // blue
  car: '#f97316',     // orange
};

const getColorByMinutes = (minutes, mode) => {
  // Different shades for different time ranges
  const baseColor = modeColors[mode] || '#6b7280';
  
  // Adjust opacity based on minutes for visual hierarchy
  const opacityMap = {
    10: 0.6,
    20: 0.4,
    30: 0.2,
  };
  
  return baseColor;
};

export default function IsochroneLayer({ isochrones, selectedMode }) {
  const styleFunction = useMemo(() => {
    return (feature) => {
      const { minutes, mode } = feature.properties || {};
      const color = getColorByMinutes(minutes, mode);
      
      // Convert hex to rgba with opacity
      const opacity = (31 - minutes) / 30; // Inverse: 30min = 0.03, 10min = 0.7
      
      return {
        color: color,
        weight: 2,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: Math.max(0.15, opacity * 0.3),
        dashArray: minutes === 10 ? '0' : '5,5', // Dashed lines for 20, 30 min
      };
    };
  }, []);

  const onEachFeature = useMemo(() => {
    return (feature, layer) => {
      const { minutes, mode } = feature.properties || {};
      layer.bindPopup(`
        <div style="min-width: 140px">
          <strong>${minutes} min ${mode}</strong><br/>
          <span style="font-size: 0.85em; color: #666;">Reachable area</span>
        </div>
      `);
    };
  }, []);

  return (
    <>
      {isochrones.map((isochrone, idx) => (
        <GeoJSON
          key={`iso-${idx}`}
          data={isochrone}
          style={styleFunction}
          onEachFeature={onEachFeature}
        />
      ))}
    </>
  );
}
