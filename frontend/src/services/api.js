import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const routingService = {
  /**
   * Get available transport modes
   */
  async getModes() {
    const response = await apiClient.get('/modes/');
    return response.data;
  },

  /**
   * Calculate route between two points
   */
  async calculateRoute(origin, destination, mode) {
    const response = await apiClient.post('/routing/calculate/', {
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      mode,
    });
    return response.data;
  },

  /**
   * Generate isochrone from a point
   */
  async generateIsochrone(origin, mode, minutes) {
    const response = await apiClient.post('/isochrones/generate/', {
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      mode,
      minutes,
    });
    return response.data;
  },
};

export const poisService = {
  /**
   * Get all POIs with optional filters
   */
  async getPOIs(filters = {}) {
    const response = await apiClient.get('/pois/', { params: filters });
    return response.data;
  },

  /**
   * Get POI categories
   */
  async getCategories() {
    const response = await apiClient.get('/pois/categories/');
    return response.data;
  },
};

export const isochroneService = {
  /**
   * Get precomputed walking isochrones
   */
  async getWalkingIsochrones() {
    const response = await apiClient.get('/isochrones/walk/');
    return response.data;
  },

  /**
   * Get precomputed cycling isochrones
   */
  async getCyclingIsochrones() {
    const response = await apiClient.get('/isochrones/bike/');
    return response.data;
  },

  /**
   * Get precomputed car isochrones
   */
  async getCarIsochrones() {
    const response = await apiClient.get('/isochrones/car/');
    return response.data;
  },
};

export const amenitiesService = {
  /**
   * Get amenities from CSV-backed endpoint
   */
  async getAmenities(params = {}) {
    const response = await apiClient.get('/amenities/', { params });
    return response.data;
  },
};

export default apiClient;
