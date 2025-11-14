// TypeScript definitions for Google Maps API
export interface GoogleMapsLatLng {
  lat: number;
  lng: number;
}

export interface GoogleMapsSize {
  width: number;
  height: number;
}

export interface GoogleMapsPoint {
  x: number;
  y: number;
}

export interface GoogleMapsMarkerIcon {
  url: string;
  scaledSize: GoogleMapsSize;
  anchor: GoogleMapsPoint;
}

export interface GoogleMapsMarker {
  position: GoogleMapsLatLng;
  map: GoogleMap | null;
  title: string;
  icon: GoogleMapsMarkerIcon;
  addListener: (event: string, handler: () => void) => void;
  setMap: (map: GoogleMap | null) => void;
}

export interface GoogleMapsInfoWindow {
  content: string;
  open: (map: GoogleMap, marker: GoogleMapsMarker) => void;
  close: () => void;
}

export interface GoogleMapsLatLngBounds {
  extend: (point: GoogleMapsLatLng) => void;
}

export interface GoogleMapsMapStyles {
  featureType?: string;
  elementType?: string;
  stylers?: Array<{ visibility?: string; [key: string]: unknown }>;
}

export interface GoogleMapsMapOptions {
  center: GoogleMapsLatLng;
  zoom: number;
  styles?: GoogleMapsMapStyles[];
}

export interface GoogleMap {
  fitBounds: (bounds: GoogleMapsLatLngBounds) => void;
}

export interface GoogleMapsAPI {
  maps: {
    Map: new (element: HTMLElement, options: GoogleMapsMapOptions) => GoogleMap;
    Marker: new (options: {
      position: GoogleMapsLatLng;
      map: GoogleMap;
      title: string;
      icon?: GoogleMapsMarkerIcon;
    }) => GoogleMapsMarker;
    InfoWindow: new (options: { content: string }) => GoogleMapsInfoWindow;
    LatLngBounds: new () => GoogleMapsLatLngBounds;
    Size: new (width: number, height: number) => GoogleMapsSize;
    Point: new (x: number, y: number) => GoogleMapsPoint;
  };
}

declare global {
  interface Window {
    google?: GoogleMapsAPI;
    initMap?: () => void;
  }
}

export {};
