import { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';

interface PlaceResult {
  name: string;
  address: string;
  coordinates: string;
  placeType?: string;
}

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: PlaceResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PlaceAutocomplete({ 
  value, 
  onChange, 
  onPlaceSelected,
  placeholder = "Search for a place...",
  disabled = false
}: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Load Google Maps API script
  useEffect(() => {
    let mounted = true;

    loadGoogleMapsAPI()
      .then(() => {
        if (mounted) {
          console.log('✅ Google Maps loaded in PlaceAutocomplete');
          setScriptLoaded(true);
        }
      })
      .catch((error) => {
        console.error('❌ Failed to load Google Maps:', error);
        if (mounted) {
          setScriptError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !inputRef.current || disabled) return;

    // Clean up existing autocomplete
    if (listenerRef.current) {
      google.maps.event.removeListener(listenerRef.current);
      listenerRef.current = null;
    }
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      console.log('🔧 Initializing Google Places Autocomplete...');
      
      // Double-check that Places library is available
      if (!window.google?.maps?.places?.Autocomplete) {
        throw new Error('Google Places Autocomplete not available');
      }
      
      // Initialize the autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['name', 'formatted_address', 'geometry', 'types', 'place_id'],
        types: ['establishment', 'geocode']
      });

      // Add listener for place selection
      listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        console.log('📍 Place changed event fired:', place);

        if (!place || !place.geometry || !place.geometry.location) {
          console.log('⚠️ No place details available');
          return;
        }

        setIsLoading(true);

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Determine suggested category based on place types
        let suggestedType: string | undefined;
        if (place.types) {
          if (place.types.includes('restaurant') || place.types.includes('cafe') || place.types.includes('food')) {
            suggestedType = 'restaurant';
          } else if (place.types.includes('lodging') || place.types.includes('hotel')) {
            suggestedType = 'hotel';
          } else if (place.types.includes('tourist_attraction') || place.types.includes('museum') || place.types.includes('stadium')) {
            suggestedType = 'attraction';
          } else if (place.types.includes('shopping_mall') || place.types.includes('store')) {
            suggestedType = 'shopping';
          } else if (place.types.includes('transit_station') || place.types.includes('airport')) {
            suggestedType = 'transport';
          }
        }

        const placeResult: PlaceResult = {
          name: place.name || '',
          address: place.formatted_address || '',
          coordinates: `${lat},${lng}`,
          placeType: suggestedType
        };

        console.log('✅ Place result:', placeResult);

        // Update the input value to the place name
        if (inputRef.current) {
          inputRef.current.value = place.name || '';
        }
        
        // Call the callback with place details
        onPlaceSelected(placeResult);
        setIsLoading(false);
      });

      console.log('✅ Autocomplete initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing autocomplete:', error);
      setScriptError(true);
    }

    // Cleanup
    return () => {
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [scriptLoaded, disabled, onPlaceSelected]);

  // Handle manual input changes (not from autocomplete)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <Input
          ref={inputRef}
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={scriptLoaded ? placeholder : "Loading search..."}
          disabled={disabled || !scriptLoaded}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500 pointer-events-none z-10" />
        )}
        {!scriptLoaded && !isLoading && !scriptError && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400 pointer-events-none z-10" />
        )}
        {scriptError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 pointer-events-none z-10" />
        )}
      </div>
      {scriptError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-900">
          ⚠️ Search temporarily unavailable. You can still type the place name manually.
        </div>
      )}
      {!scriptLoaded && !scriptError && (
        <p className="text-xs text-gray-500 mt-1">
          Loading smart search...
        </p>
      )}
      {scriptLoaded && !scriptError && (
        <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded text-xs text-blue-900">
          🔍 <strong>Start typing to search:</strong> "Yankee Stadium", "Eiffel Tower", "Central Park", etc.
        </div>
      )}
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}
