/**
 * Point in Polygon test using ray casting algorithm
 * Works for both Polygon and MultiPolygon geometries
 */
export function isPointInPolygon(point, geometry) {
  const [lng, lat] = point;

  // Handle Polygon
  if (geometry.type === 'Polygon') {
    return isPointInPolygonRing(lat, lng, geometry.coordinates[0]);
  }

  // Handle MultiPolygon
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) =>
      isPointInPolygonRing(lat, lng, polygon[0])
    );
  }

  return false;
}

/**
 * Ray casting algorithm to check if point is in polygon ring
 */
function isPointInPolygonRing(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}
