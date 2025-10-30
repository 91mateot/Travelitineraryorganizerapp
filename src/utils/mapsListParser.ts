import { geocodeAddress } from './geocodingService';

export interface ParsedPlace {
  name: string;
  address: string;
  coordinates?: string;
  placeId?: string;
  types?: string[];
}

// Extract place name from Google Maps URL
export function extractPlaceNameFromUrl(url: string): string | null {
  // Pattern 1: /place/Place+Name/
  const placeMatch = url.match(/\/place\/([^\/\?]+)/);
  if (placeMatch && placeMatch[1]) {
    // Decode URL encoding and replace + with spaces
    return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
  }
  
  // Pattern 2: search query in URL
  const searchMatch = url.match(/[?&]q=([^&]+)/);
  if (searchMatch && searchMatch[1]) {
    return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
  }
  
  return null;
}

// Extract coordinates from Google Maps URL
export function extractCoordinatesFromUrl(url: string): string | null {
  // Pattern 1: @lat,lng format
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    return `${coordMatch[1]},${coordMatch[2]}`;
  }
  
  // Pattern 2: ll= parameter
  const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch && llMatch[1] && llMatch[2]) {
    return `${llMatch[1]},${llMatch[2]}`;
  }
  
  return null;
}

// Determine category from place name (simple heuristic)
export function categorizePlaceFromName(name: string): 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport' | 'other' {
  const lowerName = name.toLowerCase();
  
  const restaurantKeywords = ['restaurant', 'cafe', 'coffee', 'bar', 'bistro', 'grill', 'kitchen', 'pizza', 'burger', 'sushi', 'diner'];
  const hotelKeywords = ['hotel', 'inn', 'resort', 'hostel', 'lodge', 'motel'];
  const shoppingKeywords = ['shop', 'store', 'market', 'mall', 'boutique', 'outlet'];
  const transportKeywords = ['station', 'airport', 'terminal', 'metro', 'subway', 'bus', 'train'];
  const attractionKeywords = ['museum', 'park', 'tower', 'cathedral', 'church', 'temple', 'palace', 'castle', 'gallery', 'monument', 'memorial', 'square', 'garden'];
  
  if (restaurantKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'restaurant';
  }
  if (hotelKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'hotel';
  }
  if (shoppingKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'shopping';
  }
  if (transportKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'transport';
  }
  if (attractionKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'attraction';
  }
  
  return 'other';
}

export function categorizePlaceFromTypes(types: string[]): 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport' | 'other' {
  const typeString = types.join(' ').toLowerCase();
  
  if (typeString.includes('restaurant') || typeString.includes('cafe') || typeString.includes('food') || typeString.includes('bar')) {
    return 'restaurant';
  }
  if (typeString.includes('lodging') || typeString.includes('hotel')) {
    return 'hotel';
  }
  if (typeString.includes('store') || typeString.includes('shop') || typeString.includes('shopping')) {
    return 'shopping';
  }
  if (typeString.includes('transit') || typeString.includes('station') || typeString.includes('airport')) {
    return 'transport';
  }
  if (typeString.includes('museum') || typeString.includes('park') || typeString.includes('tourist') || typeString.includes('landmark')) {
    return 'attraction';
  }
  
  return 'other';
}

// Main function to import places from a Google Maps URL
export async function importPlacesFromUrl(url: string): Promise<ParsedPlace[]> {
  const places: ParsedPlace[] = [];
  
  // Extract place name from URL
  const placeName = extractPlaceNameFromUrl(url);
  if (!placeName) {
    return places;
  }
  
  // Extract coordinates if available
  let coordinates = extractCoordinatesFromUrl(url);
  
  // If no coordinates in URL, try to geocode the place name
  if (!coordinates) {
    try {
      const geocodeResult = await geocodeAddress(placeName);
      if (geocodeResult) {
        coordinates = `${geocodeResult.lat},${geocodeResult.lng}`;
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  }
  
  // Create the place object
  places.push({
    name: placeName,
    address: placeName, // Will be updated with proper address if geocoded
    coordinates,
    types: [],
  });
  
  return places;
}
