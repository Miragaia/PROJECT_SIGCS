import { useState } from 'react';

export default function IsochroneControls({
  selectedMode,
  selectedMinutes,
  onMinutesChange,
  isLoading,
}) {
  const timeOptions = [10, 20, 30];

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-bold text-gray-800 mb-3">Isochrone (Reachability)</h3>
      
      <p className="text-xs text-gray-600 mb-2">
        Show areas reachable by {selectedMode} in:
      </p>
      
      <div className="space-y-2">
        {timeOptions.map((minutes) => (
          <label key={minutes} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedMinutes.includes(minutes)}
              onChange={(e) => {
                if (e.target.checked) {
                  onMinutesChange([...selectedMinutes, minutes].sort((a, b) => a - b));
                } else {
                  onMinutesChange(selectedMinutes.filter(m => m !== minutes));
                }
              }}
              disabled={isLoading}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">{minutes} min</span>
          </label>
        ))}
      </div>

      {isLoading && (
        <p className="text-xs text-blue-600 mt-3">Generating isochrones...</p>
      )}
      
      {selectedMinutes.length === 0 && (
        <p className="text-xs text-gray-500 mt-3 italic">
          Select time range to visualize
        </p>
      )}
    </div>
  );
}
