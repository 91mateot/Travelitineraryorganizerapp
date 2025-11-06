import { useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsAPI();
        
        if (!mounted || !inputRef.current) return;

        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted || !inputRef.current) return;

        console.log('🔧 Initializing autocomplete...');

        if (listenerRef.current) {
          google.maps.event.removeListener(listenerRef.current);
        }

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['name', 'formatted_address', 'geometry', 'types']
        });

        console.log('✅ Autocomplete initialized');

        listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          console.log('📍 Place selected:', place);

          if (!place || !place.geometry || !place.geometry.location) {
            console.log('⚠️ No geometry in place');
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          const result = {
            name: place.name || '',
            address: place.formatted_address || '',
            coordinates: `${lat},${lng}`,
            placeType: place.types?.join(',') || ''
          };
          
          // Update input immediately
          if (inputRef.current) {
            inputRef.current.value = place.name || place.formatted_address || '';
          }
          
          onChange(place.name || place.formatted_address || '');
          onPlaceSelected(result);
        });

        setTimeout(() => {
          const pacContainers = document.querySelectorAll('.pac-container');
          pacContainers.forEach(container => {
            (container as HTMLElement).style.zIndex = '99999';
          });
        }, 100);

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Failed to load Google Maps:', error);
        if (mounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      initAutocomplete();
    }, 50);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
      }
    };
  }, [onPlaceSelected]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 pl-10 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        autoComplete="off"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
      )}
    </div>
  );
}
