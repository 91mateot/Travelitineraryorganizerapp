// Singleton loader for Google Maps API with Places library
const GOOGLE_MAPS_API_KEY = 'AIzaSyAuzCLElzpyp40RAzWLi0cUDdjKSlt7Jt0';

let loadPromise: Promise<void> | null = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

export function loadGoogleMapsAPI(): Promise<void> {
  // Return existing promise if already loading
  if (loadPromise) {
    console.log('♻️ Returning existing Google Maps load promise');
    return loadPromise;
  }

  // Check if already loaded - check for the new Place API
  if (
    window.google &&
    window.google.maps &&
    window.google.maps.places &&
    window.google.maps.places.Place
  ) {
    console.log('✅ Google Maps API already fully loaded');
    return Promise.resolve();
  }

  // Check if script tag already exists
  const existingScript = document.querySelector(
    'script[src*="maps.googleapis.com"]'
  ) as HTMLScriptElement;

  if (existingScript) {
    console.log('📦 Found existing Google Maps script tag:', existingScript.src.substring(0, 100));
    
    // Check if it has the places library
    const hasPlacesLibrary = existingScript.src.includes('libraries=places') || 
                            existingScript.src.includes('libraries%3Dplaces');
    
    if (!hasPlacesLibrary) {
      // Prevent infinite loops
      if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
        console.error('❌ Max reload attempts reached. Cannot fix Google Maps script.');
        return Promise.reject(new Error('Failed to load Google Maps with Places library after multiple attempts'));
      }
      
      loadAttempts++;
      console.log(`🔄 Auto-fixing Google Maps script (attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS})`);
      console.log('   Detected script without Places library - reloading with correct configuration...');
      
      // Remove the incomplete script
      existingScript.remove();
      
      // Clear any partially loaded Google objects
      if (window.google) {
        try {
          delete (window as any).google;
        } catch (e) {
          (window as any).google = undefined;
        }
      }
      
      // Wait a moment for cleanup, then reload
      return new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        loadPromise = null;
        return loadGoogleMapsAPI();
      });
    }

    // Script has Places library, wait for it to initialize
    console.log('✓ Existing script includes Places library, waiting for init...');
    loadPromise = new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 200; // 20 seconds with backoff
      let delay = 50;

      const checkReady = () => {
        attempts++;

        if (
          window.google &&
          window.google.maps &&
          window.google.maps.places &&
          window.google.maps.places.Place
        ) {
          console.log('✅ Google Maps Places library ready');
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          const error = new Error('Google Maps API loading timeout');
          console.error('❌ Google Maps API timeout. Debug info:', {
            hasGoogle: !!window.google,
            hasMaps: !!(window.google && window.google.maps),
            hasPlaces: !!(window.google && window.google.maps && window.google.maps.places),
            hasPlace: !!(
              window.google &&
              window.google.maps &&
              window.google.maps.places &&
              window.google.maps.places.Place
            ),
          });
          reject(error);
          return;
        }

        // Exponential backoff
        if (attempts % 10 === 0 && delay < 500) {
          delay = Math.min(delay * 1.5, 500);
        }

        setTimeout(checkReady, delay);
      };

      checkReady();
    });

    return loadPromise;
  }

  // Load the script
  console.log('🚀 Loading Google Maps API with Places library...');
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Include both places and geometry libraries for enhanced search capabilities
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('📦 Google Maps script loaded, waiting for initialization...');
      
      // Wait for the API to be fully initialized
      let attempts = 0;
      const maxAttempts = 100;

      const checkReady = () => {
        attempts++;

        if (
          window.google &&
          window.google.maps &&
          window.google.maps.places &&
          window.google.maps.places.Place
        ) {
          console.log('✅ Google Maps API fully initialized with Places library');
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          const error = new Error('Google Maps API initialization timeout');
          console.error('❌ Timeout after', attempts, 'attempts');
          console.error('Debug state:', {
            hasGoogle: !!window.google,
            hasMaps: !!(window.google && window.google.maps),
            hasPlaces: !!(window.google && window.google.maps && window.google.maps.places),
            hasPlace: !!(window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Place),
          });
          reject(error);
          return;
        }

        setTimeout(checkReady, 50);
      };

      checkReady();
    };

    script.onerror = (event) => {
      const error = new Error('Failed to load Google Maps script - network error or invalid API key');
      console.error('❌', error.message, event);
      loadPromise = null; // Reset so it can be retried
      reject(error);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

// Reset function for debugging/recovery
export function resetGoogleMapsLoader() {
  console.log('🔄 Resetting Google Maps loader...');
  loadPromise = null;
  loadAttempts = 0;
  
  // Remove any existing scripts
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  scripts.forEach(script => {
    console.log('Removing script:', script.getAttribute('src')?.substring(0, 100));
    script.remove();
  });
  
  // Clear Google object
  if (window.google) {
    try {
      delete (window as any).google;
    } catch (e) {
      (window as any).google = undefined;
    }
  }
  
  console.log('✅ Google Maps loader reset complete');
}

// Type declarations
declare global {
  interface Window {
    google: typeof google;
  }
}
