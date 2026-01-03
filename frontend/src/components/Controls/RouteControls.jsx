import { useState } from 'react';

export default function RouteControls({
  selectedMode,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute,
  isLoading,
  routeDistance,
  routeDuration,
}) {
  const [showOriginInput, setShowOriginInput] = useState(false);
  const [showDestInput, setShowDestInput] = useState(false);

  const clearRoute = () => {
    onOriginChange(null);
    onDestinationChange(null);
  };

  return (
    <div className="absolute top-48 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-bold text-gray-800 mb-3">Route Planner</h3>
      
      <div className="space-y-2">
        {/* Origin */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Starting Point
          </label>
          {origin ? (
            <div className="flex items-center justify-between gap-2 bg-green-50 p-2 rounded border border-green-200">
              <span className="text-xs text-gray-700">
                📍 {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
              </span>
              <button
                onClick={() => onOriginChange(null)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded">
              Click on map to set origin
            </p>
          )}
        </div>

        {/* Destination */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Destination
          </label>
          {destination ? (
            <div className="flex items-center justify-between gap-2 bg-blue-50 p-2 rounded border border-blue-200">
              <span className="text-xs text-gray-700">
                📍 {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
              </span>
              <button
                onClick={() => onDestinationChange(null)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded">
              Click on map to set destination
            </p>
          )}
        </div>

        {/* Calculate Button */}
        {origin && destination && (
          <button
            onClick={onCalculateRoute}
            disabled={isLoading}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold py-2 px-3 rounded transition"
          >
            {isLoading ? 'Calculating...' : 'Calculate Route'}
          </button>
        )}

        {/* Route Results */}
        {(routeDistance !== null && routeDistance !== undefined) && 
         (routeDuration !== null && routeDuration !== undefined) && (
          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <p className="text-xs text-gray-700">
              <strong>Distance:</strong> {routeDistance.toFixed(2)} km
            </p>
            <p className="text-xs text-gray-700">
              <strong>Duration:</strong> {
                routeDuration < 1 
                  ? `${Math.round(routeDuration * 60)} sec` 
                  : `${routeDuration.toFixed(1)} min`
              } ({selectedMode})
            </p>
          </div>
        )}

        {/* Clear Button */}
        {(origin || destination) && (
          <button
            onClick={clearRoute}
            className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold py-1 px-3 rounded transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
