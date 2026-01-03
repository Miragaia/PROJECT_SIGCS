import { useState, useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import BaseMap from './components/Map/BaseMap';
import ModeSelector from './components/Controls/ModeSelector';
import IsochroneControls from './components/Controls/IsochroneControls';
import RouteControls from './components/Controls/RouteControls';
import IsochroneLayer from './components/Map/IsochroneLayer';
import RouteLayer from './components/Map/RouteLayer';
import { amenitiesService, routingService } from './services/api';
import { isPointInPolygon } from './utils/geom';
import './index.css';

function ClusteredGeoJSON({ data, pointToLayer, onEachFeature }) {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    // Clear old cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    // Create new cluster group
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 80,
      disableClusteringAtZoom: 17,
    });

    // Add all features as clustered markers
    data.features?.forEach((feature) => {
      const coords = feature.geometry?.coordinates;
      if (coords && coords.length === 2) {
        const latlng = L.latLng(coords[1], coords[0]);
        const marker = pointToLayer(feature, latlng);
        if (onEachFeature) {
          onEachFeature(feature, marker);
        }
        clusterGroup.addLayer(marker);
      }
    });

    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [data, map, pointToLayer, onEachFeature]);

  return null;
}

function App() {
  const [selectedMode, setSelectedMode] = useState('walk');
  const [amenities, setAmenities] = useState(null);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [amenitiesError, setAmenitiesError] = useState(null);
  
  const [selectedMinutes, setSelectedMinutes] = useState([]);
  const [isochrones, setIsochrones] = useState([]);
  const [loadingIsochrones, setLoadingIsochrones] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.6412, -8.6540]);

  // Fetch amenities on mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true);
        const data = await amenitiesService.getAmenities();
        setAmenities(data);
      } catch (err) {
        setAmenitiesError('Failed to load amenities');
      } finally {
        setLoadingAmenities(false);
      }
    };

    fetchAmenities();
  }, []);

  // Generate isochrones when selectedMinutes changes
  useEffect(() => {
    if (selectedMinutes.length === 0) {
      setIsochrones([]);
      return;
    }

    const generateIsochrones = async () => {
      try {
        setLoadingIsochrones(true);
        const response = await routingService.generateIsochrone(
          {
            lat: mapCenter[0],
            lng: mapCenter[1],
          },
          selectedMode,
          selectedMinutes
        );
        
        // Convert response to array of GeoJSON features if it's a FeatureCollection
        if (response.features) {
          setIsochrones(response.features);
        } else if (Array.isArray(response)) {
          setIsochrones(response);
        }
      } catch (err) {
        console.error('Failed to generate isochrones:', err);
      } finally {
        setLoadingIsochrones(false);
      }
    };

    generateIsochrones();
  }, [selectedMinutes, selectedMode, mapCenter]);

  // Route management state
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeStats, setRouteStats] = useState(null);

  // Create a map click handler
  const handleMapClick = (e) => {
    const coords = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };

    if (!origin) {
      setOrigin(coords);
    } else if (!destination) {
      setDestination(coords);
    }
  };

  // Calculate route when both origin and destination are set
  const calculateRoute = async () => {
    if (!origin || !destination) return;

    console.log('Calculating route:', {
      origin,
      destination,
      mode: selectedMode
    });

    try {
      setLoadingRoute(true);
      const response = await routingService.calculateRoute(origin, destination, selectedMode);
      console.log('Route response:', response);
      setRoute(response);
      
      // Extract distance and duration from response
      if (response.properties) {
        setRouteStats({
          distance: response.properties.distance,
          duration: response.properties.duration,
        });
      }
    } catch (err) {
      console.error('Failed to calculate route:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Show user-friendly error message
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       'Unable to calculate route. Please try different points.';
      alert(errorMsg);
      
      // Clear route on error
      setRoute(null);
      setRouteStats(null);
    } finally {
      setLoadingRoute(false);
    }
  };

  const typeToClass = (type) => {
    if (!type) return 'amenity-default';
    const t = type.toLowerCase();
    if (t.includes('fuel') || t.includes('gas')) return 'amenity-fuel';
    if (t.includes('cafe') || t.includes('coffee')) return 'amenity-cafe';
    if (t.includes('pharmacy') || t.includes('health')) return 'amenity-pharmacy';
    if (t.includes('school') || t.includes('university') || t.includes('education')) return 'amenity-education';
    if (t.includes('restaurant') || t.includes('food')) return 'amenity-restaurant';
    if (t.includes('shop') || t.includes('store') || t.includes('market')) return 'amenity-shop';
    return 'amenity-default';
  };

  const typeToIcon = (type) => {
    if (!type) return '📍';
    const t = type.toLowerCase();
    if (t.includes('fuel') || t.includes('gas')) return '⛽';
    if (t.includes('cafe') || t.includes('coffee')) return '☕';
    if (t.includes('pharmacy') || t.includes('health')) return '💊';
    if (t.includes('school') || t.includes('university') || t.includes('education')) return '🎓';
    if (t.includes('restaurant') || t.includes('food')) return '🍴';
    if (t.includes('shop') || t.includes('store') || t.includes('market')) return '🛍️';
    return '📍';
  };

  const pointToLayer = useMemo(() => {
    return (feature, latlng) => {
      const { type, name } = feature.properties || {};
      const className = `amenity-marker ${typeToClass(type || name || '')}`;
      const iconChar = typeToIcon(type || name || '');
      const icon = L.divIcon({
        className,
        iconSize: [26, 26],
        html: `<span>${iconChar}</span>`,
      });
      return L.marker(latlng, { icon });
    };
  }, []);

  const onEachAmenity = (feature, layer) => {
    const { name, type, rating } = feature.properties || {};
    const popupHtml = `
      <div style="min-width: 160px">
        <strong>${name || 'Amenity'}</strong><br/>
        ${type ? `<span>Type: ${type}</span><br/>` : ''}
        ${rating ? `<span>Rating: ${rating}</span>` : ''}
      </div>
    `;
    layer.bindPopup(popupHtml);
  };

  // Filter amenities to only show those within isochrones
  const filteredAmenities = useMemo(() => {
    if (!amenities || isochrones.length === 0) {
      return amenities;
    }

    const filtered = {
      ...amenities,
      features: amenities.features.filter((feature) => {
        const coords = feature.geometry?.coordinates;
        if (!coords || coords.length !== 2) return false;

        // Check if point is within any isochrone polygon
        return isochrones.some((isochrone) => {
          const geometry = isochrone.geometry;
          if (!geometry) return false;
          return isPointInPolygon(coords, geometry);
        });
      }),
    };

    return filtered;
  }, [amenities, isochrones]);

  return (
    <div className="relative h-screen w-screen">
      <BaseMap onCenterChange={setMapCenter} onMapClick={handleMapClick}>
        {/* Isochrone polygons */}
        {isochrones.length > 0 && (
          <IsochroneLayer 
            isochrones={isochrones}
            selectedMode={selectedMode}
          />
        )}
        
        {/* Route layer with origin/destination markers and route polyline */}
        {(origin || destination || route) && (
          <RouteLayer 
            route={route}
            origin={origin}
            destination={destination}
          />
        )}
        
        {/* Amenity markers with clustering */}
        {(filteredAmenities || amenities) && (
          <ClusteredGeoJSON
            data={filteredAmenities || amenities}
            pointToLayer={pointToLayer}
            onEachFeature={onEachAmenity}
          />
        )}
      </BaseMap>
      
      <ModeSelector 
        selectedMode={selectedMode}
        onModeChange={(mode) => {
          setSelectedMode(mode);
          // Reset isochrones when mode changes
          setSelectedMinutes([]);
        }}
      />
      
      <IsochroneControls
        selectedMode={selectedMode}
        selectedMinutes={selectedMinutes}
        onMinutesChange={setSelectedMinutes}
        isLoading={loadingIsochrones}
      />

      <RouteControls
        selectedMode={selectedMode}
        origin={origin}
        destination={destination}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onCalculateRoute={calculateRoute}
        isLoading={loadingRoute}
        routeDistance={routeStats?.distance}
        routeDuration={routeStats?.duration}
      />
      
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Aveiro Accessibility Platform
        </h2>
        <p className="text-sm text-gray-600">
          Explore multimodal accessibility in Aveiro. Select a transport mode and time range to see reachable areas.
        </p>
        {loadingAmenities && <p className="text-xs text-gray-500 mt-2">Loading amenities…</p>}
        {amenitiesError && <p className="text-xs text-red-600 mt-2">{amenitiesError}</p>}
        {amenities && !loadingAmenities && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredAmenities?.features?.length || amenities.features?.length || 0} amenities
            {isochrones.length > 0 && ` (filtered by ${selectedMinutes.join(', ')} min)`}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
