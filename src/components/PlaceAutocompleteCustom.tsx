import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from './ui/input';
import { Loader2, Search, AlertCircle, MapPin } from 'lucide-react';
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

interface Suggestion {
  placePrediction: google.maps.places.PlacePrediction;
}

export function PlaceAutocomplete({ 
  value, 
  onChange, 
  onPlaceSelected,
  placeholder = "Search for a place...",
  disabled = false
}: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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

  // Fetch suggestions when user types
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || !scriptLoaded) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    console.log('🔍 Fetching suggestions for:', input);
    setIsLoading(true);

    try {
      // Use the new AutocompleteSuggestion API
      const request = {
        input: input.trim(),
        includedPrimaryTypes: [], // Empty array means search all types
      };

      const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      setIsLoading(false);
      
      console.log('Suggestions:', results);

      if (results && results.length > 0) {
        setSuggestions(results);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('❌ Failed to fetch suggestions:', error);
      setIsLoading(false);
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [scriptLoaded]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce suggestions
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Fetch place details using the new Place API
  const fetchPlaceDetails = useCallback(async (placeId: string, displayName: string) => {
    if (!scriptLoaded) return;

    console.log('📍 Fetching place details for:', placeId);
    setIsLoading(true);

    try {
      // Use the new Place API
      const place = new google.maps.places.Place({
        id: placeId,
        requestedLanguage: 'en',
      });

      // Fetch the place details
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'types'],
      });

      setIsLoading(false);

      if (place.location) {
        const lat = place.location.lat();
        const lng = place.location.lng();

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
          name: place.displayName || displayName,
          address: place.formattedAddress || '',
          coordinates: `${lat},${lng}`,
          placeType: suggestedType
        };

        onPlaceSelected(placeResult);
        onChange(place.displayName || displayName);
        setShowDropdown(false);
        setSuggestions([]);

        toast.success('Place found!', {
          description: place.formattedAddress?.substring(0, 50)
        });
      }
    } catch (error) {
      console.error('❌ Failed to get place details:', error);
      setIsLoading(false);
      toast.error('Failed to get place details');
    }
  }, [onPlaceSelected, onChange, scriptLoaded]);

  // Handle suggestion selection
  const handleSelect = (suggestion: Suggestion) => {
    console.log('🎯 Selected suggestion:', suggestion);
    const placeId = suggestion.placePrediction.placeId;
    const displayName = suggestion.placePrediction.text.text;
    fetchPlaceDetails(placeId, displayName);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Perform geocoding search
        const currentValue = (e.target as HTMLInputElement).value.trim();
        if (currentValue) {
          performTextSearch(currentValue);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Geocoding fallback for manual text search
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
        description: 'Please try again'
      });
    }
  }, [scriptLoaded, onPlaceSelected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={scriptLoaded ? placeholder : "Loading search..."}
          disabled={disabled || !scriptLoaded}
          className="pl-10 pr-10"
          autoComplete="off"
          type="text"
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
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

      {/* Custom Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const mainText = suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text.text;
            const secondaryText = suggestion.placePrediction.structuredFormat?.secondaryText?.text || '';
            
            return (
              <div
                key={suggestion.placePrediction.placeId}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">
                      {mainText}
                    </div>
                    {secondaryText && (
                      <div className="text-xs text-gray-500 truncate">
                        {secondaryText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
