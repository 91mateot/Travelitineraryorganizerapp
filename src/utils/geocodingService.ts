const GOOGLE_MAPS_API_KEY = 'AIzaSyAuzCLElzpyp40RAzWLi0cUDdjKSlt7Jt0';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export function getStaticMapUrl(places: Array<{ coordinates?: string; name: string }>, width: number = 800, height: number = 400): string {
  if (!places.length || !places.some(p => p.coordinates)) {
    return '';
  }

  // Get center point (first place with coordinates)
  const centerPlace = places.find(p => p.coordinates);
  if (!centerPlace?.coordinates) return '';

  const markers = places
    .filter(p => p.coordinates)
    .map((p, index) => {
      // Use different colors for markers (cycle through colors)
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
      const color = colors[index % colors.length];
      const label = String.fromCharCode(65 + (index % 26)); // A, B, C, etc.
      return `markers=color:${color}%7Clabel:${label}%7C${p.coordinates}`;
    })
    .join('&');

  return `https://maps.googleapis.com/maps/api/staticmap?center=${centerPlace.coordinates}&zoom=13&size=${width}x${height}&${markers}&key=${GOOGLE_MAPS_API_KEY}`;
}

export function getEmbedMapUrl(places: Array<{ coordinates?: string; name: string }>): string {
  if (!places.length || !places.some(p => p.coordinates)) {
    return '';
  }

  // Get center point (average of all coordinates)
  const placesWithCoords = places.filter(p => p.coordinates);
  if (!placesWithCoords.length) return '';

  const coords = placesWithCoords.map(p => {
    const [lat, lng] = p.coordinates!.split(',').map(Number);
    return { lat, lng };
  });

  const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
  const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

  // Build markers query string
  const markers = placesWithCoords
    .map(p => p.coordinates)
    .join('|');

  return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${centerLat},${centerLng}&zoom=13`;
}

export const GOOGLE_MAPS_API_KEY_VALUE = GOOGLE_MAPS_API_KEY;
