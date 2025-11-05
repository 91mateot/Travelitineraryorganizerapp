import { useEffect, useRef } from 'react';
import { Place, Activity } from '../App';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';

interface PlacesMapProps {
  places: Place[];
  activities?: Activity[]; // Optional: activities with coordinates to show on map
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function PlacesMap({ places, activities = [] }: PlacesMapProps) {
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
  }, [places, activities]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Get places and activities with coordinates
    const placesWithCoords = places.filter(p => p.coordinates);
    const activitiesWithCoords = activities.filter(a => a.coordinates);
    const allCoords = [...placesWithCoords, ...activitiesWithCoords];
    
    if (!allCoords.length) return;

    // Calculate center
    const coords = allCoords.map(item => {
      const [lat, lng] = item.coordinates!.split(',').map(Number);
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

    // Get places and activities with coordinates
    const placesWithCoords = places.filter(p => p.coordinates);
    const activitiesWithCoords = activities.filter(a => a.coordinates);

    // Add new markers
    const bounds = new window.google.maps.LatLngBounds();
    let markerIndex = 0;

    // Category/Type colors
    const placeColors: Record<Place['category'], string> = {
      restaurant: '#ea580c',
      hotel: '#2563eb',
      attraction: '#9333ea',
      shopping: '#ec4899',
      transport: '#16a34a',
      other: '#6b7280',
    };

    const activityColors: Record<Activity['type'], string> = {
      flight: '#0ea5e9',
      hotel: '#2563eb',
      restaurant: '#ea580c',
      activity: '#9333ea',
      transport: '#16a34a',
      other: '#6b7280',
    };

    // Add place markers
    placesWithCoords.forEach((place) => {
      const [lat, lng] = place.coordinates!.split(',').map(Number);
      const position = { lat, lng };

      const color = placeColors[place.category];
      const label = String.fromCharCode(65 + (markerIndex % 26)); // A, B, C, etc.
      markerIndex++;

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
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-weight: 600;">Place</span>
              <span style="background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${place.category}</span>
            </div>
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

    // Add activity markers
    activitiesWithCoords.forEach((activity) => {
      const [lat, lng] = activity.coordinates!.split(',').map(Number);
      const position = { lat, lng };

      const color = activityColors[activity.type];
      const label = String.fromCharCode(65 + (markerIndex % 26)); // Continue labeling
      markerIndex++;

      // Create marker with different style (star shape for activities)
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: activity.title,
        label: {
          text: label,
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        icon: {
          path: 'M 0,-24 L 6,-8 L 24,-8 L 10,2 L 16,18 L 0,8 L -16,18 L -10,2 L -24,-8 L -6,-8 Z', // Star shape
          scale: 0.8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
      });

      // Format day for display
      const dayLabel = activity.day ? new Date(activity.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unscheduled';

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-weight: 600;">Activity</span>
              <span style="background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${activity.type}</span>
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${activity.title}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📍 ${activity.location}</p>
            ${activity.time ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">🕐 ${activity.time}</p>` : ''}
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">📅 ${dayLabel}</p>
            ${activity.description ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px;">${activity.description}</p>` : ''}
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
    const totalMarkers = placesWithCoords.length + activitiesWithCoords.length;
    if (totalMarkers > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const placesWithCoords = places.filter(p => p.coordinates);
  const activitiesWithCoords = activities.filter(a => a.coordinates);
  const totalItems = placesWithCoords.length + activitiesWithCoords.length;

  if (!totalItems) {
    return (
      <div className="w-full h-[500px] rounded-lg border bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-2">No locations with coordinates yet</p>
          <p className="text-sm">Add places or activities with location search to see them on the map</p>
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
