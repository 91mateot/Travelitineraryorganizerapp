import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from './ui/input';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';
import { toast } from 'sonner@2.0.3';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Text search fallback function using Geocoding API
  const performTextSearch = useCallback(async (query: string) => {
    if (!query.trim() || !scriptLoaded) return;

    console.log('🔍 Performing text search for:', query);
    setIsLoading(true);

    try {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: query }, (results, status) => {
        setIsLoading(false);
        
        if (status === 'OK' && results && results.length > 0) {
          const place = results[0];
          console.log('✅ Geocoding search found:', place);
          
          if (place.geometry?.location) {
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
              name: place.address_components?.[0]?.long_name || query,
              address: place.formatted_address || '',
              coordinates: `${lat},${lng}`,
              placeType: suggestedType
            };

            onPlaceSelected(placeResult);
            toast.success('Place found!', {
              description: `${place.formatted_address?.substring(0, 50)}...`
            });
          }
        } else {
          console.log('⚠️ Geocoding search found no results:', status);
          toast.info('No exact match found', {
            description: 'Try selecting from the dropdown suggestions or enter details manually'
          });
        }
      });
    } catch (error) {
      console.error('❌ Search error:', error);
      setIsLoading(false);
      toast.error('Search failed', {
        description: 'Please try selecting from the dropdown suggestions'
      });
    }
  }, [scriptLoaded, onPlaceSelected]);

  // Initialize Place Autocomplete Element when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || disabled) return;

    try {
      console.log('🔧 Initializing Google Places Autocomplete Element...');
      
      // Create the new PlaceAutocompleteElement
      const autocompleteElement = document.createElement('gmp-place-autocomplete') as any;
      
      // Set attributes
      autocompleteElement.setAttribute('placeholder', placeholder);
      
      // Style the element
      autocompleteElement.style.width = '100%';
      autocompleteElement.style.height = '40px';
      
      // Clear container and add element
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(autocompleteElement);

      // Listen for place selection
      autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
        const place = event.place;
        
        console.log('📍 Place selected:', place);

        if (!place) {
          console.log('⚠️ No place details available');
          return;
        }

        setIsLoading(true);

        try {
          // Fetch full place details using the new Place API
          const placeObj = new google.maps.places.Place({
            id: place.id,
            requestedLanguage: 'en',
          });

          await placeObj.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location', 'types'],
          });

          if (placeObj.location) {
            const lat = placeObj.location.lat();
            const lng = placeObj.location.lng();

            // Determine suggested category based on place types
            let suggestedType: string | undefined;
            if (placeObj.types) {
              if (placeObj.types.includes('restaurant') || placeObj.types.includes('cafe') || placeObj.types.includes('food')) {
                suggestedType = 'restaurant';
              } else if (placeObj.types.includes('lodging') || placeObj.types.includes('hotel')) {
                suggestedType = 'hotel';
              } else if (placeObj.types.includes('tourist_attraction') || placeObj.types.includes('museum') || placeObj.types.includes('stadium')) {
                suggestedType = 'attraction';
              } else if (placeObj.types.includes('shopping_mall') || placeObj.types.includes('store')) {
                suggestedType = 'shopping';
              } else if (placeObj.types.includes('transit_station') || placeObj.types.includes('airport')) {
                suggestedType = 'transport';
              }
            }

            const placeResult: PlaceResult = {
              name: placeObj.displayName || place.displayName || '',
              address: placeObj.formattedAddress || '',
              coordinates: `${lat},${lng}`,
              placeType: suggestedType
            };

            console.log('✅ Place result:', placeResult);

            // Update the input value
            onChange(placeResult.name);
            
            // Call the callback with place details
            onPlaceSelected(placeResult);
            
            toast.success('Place found!', {
              description: placeResult.address?.substring(0, 50)
            });
          }
        } catch (error) {
          console.error('❌ Error fetching place details:', error);
          toast.error('Failed to get place details');
        } finally {
          setIsLoading(false);
        }
      });

      console.log('✅ Place Autocomplete Element initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Place Autocomplete Element:', error);
      
      // Fall back to custom input if the new element is not available
      if (inputRef.current) {
        inputRef.current.style.display = 'block';
      }
      setScriptError(true);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [scriptLoaded, disabled, onPlaceSelected, onChange, placeholder, performTextSearch]);

  // Handle manual input changes (fallback)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Handle Enter key - perform text search if no autocomplete item selected
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentValue = (e.target as HTMLInputElement).value.trim();
      if (currentValue) {
        console.log('🔍 Enter pressed - performing text search');
        performTextSearch(currentValue);
      }
    }
  };

  return (
    <div className="relative">
      {/* Container for the new PlaceAutocompleteElement */}
      <div ref={containerRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      </div>
      
      {/* Fallback input (hidden by default, shown if new element fails) */}
      <div className="relative" style={{ display: scriptError ? 'block' : 'none' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <Input
          ref={inputRef}
          defaultValue={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={scriptLoaded ? placeholder : "Loading search..."}
          disabled={disabled || !scriptLoaded}
          className="pl-10 pr-10"
          autoComplete="off"
          type="text"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500 pointer-events-none z-10" />
        )}
      </div>

      {!scriptLoaded && !isLoading && !scriptError && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400 pointer-events-none z-10" />
      )}
      {scriptError && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 pointer-events-none z-10" />
      )}
      
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
          <div className="space-y-1">
            <div>🔍 <strong>Enhanced Google Maps Search:</strong></div>
            <ul className="ml-4 space-y-0.5 text-blue-800">
              <li>• Type specific business names (e.g., "Starbucks Tokyo")</li>
              <li>• Search landmarks, restaurants, hotels worldwide</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">Enter</kbd> to search if dropdown doesn't show results</li>
              <li>• Select from dropdown suggestions for instant fill</li>
            </ul>
          </div>
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
