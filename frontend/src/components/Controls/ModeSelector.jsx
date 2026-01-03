import { useState } from 'react';

const TRANSPORT_MODES = [
  { id: 'walk', name: 'Walking', icon: '🚶', color: 'bg-green-500' },
  { id: 'bike', name: 'Cycling', icon: '🚲', color: 'bg-blue-500' },
  { id: 'car', name: 'Driving', icon: '🚗', color: 'bg-orange-500' },
];

export default function ModeSelector({ selectedMode, onModeChange }) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Transport Mode</h3>
      <div className="space-y-2">
        {TRANSPORT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
              selectedMode === mode.id
                ? `${mode.color} text-white shadow-md`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">{mode.icon}</span>
            <span className="font-medium">{mode.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
