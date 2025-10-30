import { geocodeAddress } from './geocodingService';
import { categorizePlaceFromName } from './mapsListParser';

export interface CSVPlace {
  name: string;
  address: string;
  category?: string;
  notes?: string;
}

export interface ParsedCSVPlace extends CSVPlace {
  coordinates?: string;
  error?: string;
}

// Parse CSV content
export function parseCSV(content: string): CSVPlace[] {
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find column indices
  const nameIndex = headers.findIndex(h => h === 'name' || h === 'place name' || h === 'place');
  const addressIndex = headers.findIndex(h => h === 'address' || h === 'location');
  const categoryIndex = headers.findIndex(h => h === 'category' || h === 'type');
  const notesIndex = headers.findIndex(h => h === 'notes' || h === 'description');
  
  if (nameIndex === -1) {
    throw new Error('CSV must contain a "name" or "place name" column');
  }
  
  if (addressIndex === -1) {
    throw new Error('CSV must contain an "address" or "location" column');
  }
  
  // Parse data rows
  const places: CSVPlace[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    if (values.length > nameIndex && values.length > addressIndex) {
      const name = values[nameIndex].trim();
      const address = values[addressIndex].trim();
      
      if (name && address) {
        places.push({
          name,
          address,
          category: categoryIndex !== -1 ? values[categoryIndex]?.trim() : undefined,
          notes: notesIndex !== -1 ? values[notesIndex]?.trim() : undefined,
        });
      }
    }
  }
  
  if (places.length === 0) {
    throw new Error('No valid places found in CSV file');
  }
  
  return places;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current); // Add last value
  
  return values;
}

// Geocode all places from CSV
export async function geocodeCSVPlaces(places: CSVPlace[]): Promise<ParsedCSVPlace[]> {
  const results: ParsedCSVPlace[] = [];
  
  for (const place of places) {
    try {
      const geocodeResult = await geocodeAddress(place.address);
      
      if (geocodeResult) {
        results.push({
          ...place,
          coordinates: `${geocodeResult.lat},${geocodeResult.lng}`,
          address: geocodeResult.formattedAddress || place.address,
        });
      } else {
        results.push({
          ...place,
          error: 'Could not geocode address',
        });
      }
    } catch (error) {
      console.error(`Error geocoding ${place.name}:`, error);
      results.push({
        ...place,
        error: 'Geocoding failed',
      });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

// Validate CSV format
export function validateCSVHeaders(content: string): { valid: boolean; error?: string } {
  const lines = content.trim().split('\n');
  
  if (lines.length < 1) {
    return { valid: false, error: 'CSV file is empty' };
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const hasName = headers.some(h => h === 'name' || h === 'place name' || h === 'place');
  const hasAddress = headers.some(h => h === 'address' || h === 'location');
  
  if (!hasName) {
    return { valid: false, error: 'CSV must have a "name" column' };
  }
  
  if (!hasAddress) {
    return { valid: false, error: 'CSV must have an "address" column' };
  }
  
  return { valid: true };
}

// Generate example CSV
export function generateExampleCSV(): string {
  return `name,address,category,notes
Eiffel Tower,"Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",attraction,Iconic iron tower
Le Jules Verne,"Eiffel Tower, Av. Gustave Eiffel, 75007 Paris, France",restaurant,Michelin-starred restaurant
Louvre Museum,"Rue de Rivoli, 75001 Paris, France",attraction,World's largest art museum
Hotel Ritz Paris,"15 Pl. Vendôme, 75001 Paris, France",hotel,Luxury 5-star hotel`;
}
