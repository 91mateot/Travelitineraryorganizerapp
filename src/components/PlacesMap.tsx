import { useEffect, useRef } from 'react';
import { Place, Activity } from '../App';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader';

interface PlacesMapProps {
  places: Place[];
  activities?: Activity[];
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

    const placesWithCoords = places.filter(p => p.coordinates);
    const activitiesWithCoords = activities.filter(a => a.coordinates);
    const allCoords = [...placesWithCoords, ...activitiesWithCoords];
    
    if (!allCoords.length) return;

    const coords = allCoords.map(item => {
      const [lat, lng] = item.coordinates!.split(',').map(Number);
      return { lat, lng };
    });

    const center = {
      lat: coords.reduce((sum, c) => sum + c.lat, 0) / coords.length,
      lng: coords.reduce((sum, c) => sum + c.lng, 0) / coords.length,
    };

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

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const placesWithCoords = places.filter(p => p.coordinates);
    const activitiesWithCoords = activities.filter(a => a.coordinates);

    const bounds = new window.google.maps.LatLngBounds();

    const categoryEmojis: Record<Place['category'], string> = {
      restaurant: '🍽️',
      cafe: '☕',
      fastfood: '🍕',
      bakery: '🍰',
      bar: '🍺',
      hotel: '🏨',
      attraction: '🎭',
      museum: '🏛️',
      gallery: '🎨',
      park: '🌳',
      beach: '🏖️',
      entertainment: '🎬',
      venue: '🎪',
      shopping: '🛍️',
      transport: '🚇',
      school: '🏫',
      spa: '💆',
      gym: '💪',
      pharmacy: '💊',
      bank: '🏦',
      gas: '⛽',
      parking: '🅿️',
      other: '📍',
    };

    placesWithCoords.forEach((place) => {
      const [lat, lng] = place.coordinates!.split(',').map(Number);
      const position = { lat, lng };

      const emoji = categoryEmojis[place.category];
      const isActivityPlace = place.id.startsWith('activity-place-');

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: place.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <text x="20" y="30" font-size="32" text-anchor="middle">${emoji}</text>
              ${isActivityPlace ? '<text x="32" y="12" font-size="14">⭐</text>' : ''}
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${emoji}</span>
              <span style="background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${place.category}</span>
              ${isActivityPlace ? '<span style="font-size: 14px;">⭐</span>' : ''}
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

    activitiesWithCoords.forEach((activity) => {
      const activityPlaceId = `activity-place-${activity.id}`;
      if (placesWithCoords.some(p => p.id === activityPlaceId)) {
        return;
      }

      const [lat, lng] = activity.coordinates!.split(',').map(Number);
      const position = { lat, lng };

      const dayLabel = activity.day ? new Date(activity.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unscheduled';

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: activity.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <text x="20" y="30" font-size="32" text-anchor="middle">⭐</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="font-size: 20px;">⭐</span>
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
