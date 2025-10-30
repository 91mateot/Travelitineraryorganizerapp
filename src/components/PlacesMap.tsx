import { useEffect, useRef } from 'react';
import { Place } from '../App';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';

interface PlacesMapProps {
  places: Place[];
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function PlacesMap({ places }: PlacesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        console.log('PlacesMap: Google Maps ready, initializing map');
        initializeMap();
      })
      .catch((error) => {
        console.error('PlacesMap: Failed to load Google Maps:', error);
      });
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [places]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Get places with coordinates
    const placesWithCoords = places.filter(p => p.coordinates);
    
    if (!placesWithCoords.length) return;

    // Calculate center
    const coords = placesWithCoords.map(p => {
      const [lat, lng] = p.coordinates!.split(',').map(Number);
      return { lat, lng };
    });

    const center = {
      lat: coords.reduce((sum, c) => sum + c.lat, 0) / coords.length,
      lng: coords.reduce((sum, c) => sum + c.lng, 0) / coords.length,
    };

    // Create map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Get places with coordinates
    const placesWithCoords = places.filter(p => p.coordinates);

    // Add new markers
    const bounds = new window.google.maps.LatLngBounds();

    placesWithCoords.forEach((place, index) => {
      const [lat, lng] = place.coordinates!.split(',').map(Number);
      const position = { lat, lng };

      // Category colors and icons
      const categoryColors: Record<Place['category'], string> = {
        restaurant: '#ea580c',
        hotel: '#2563eb',
        attraction: '#9333ea',
        shopping: '#ec4899',
        transport: '#16a34a',
        other: '#6b7280',
      };

      const color = categoryColors[place.category];
      const label = String.fromCharCode(65 + (index % 26)); // A, B, C, etc.

      // Create marker with custom color
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: place.name,
        label: {
          text: label,
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3,
        },
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${place.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${place.address}</p>
            ${place.notes ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px;">${place.notes}</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit bounds to show all markers
    if (placesWithCoords.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const placesWithCoords = places.filter(p => p.coordinates);

  if (!placesWithCoords.length) {
    return (
      <div className="w-full h-[500px] rounded-lg border bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-2">No places with coordinates yet</p>
          <p className="text-sm">Add coordinates to places to see them on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden border shadow-sm"
    />
  );
}
