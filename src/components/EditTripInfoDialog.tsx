import { useState, useEffect } from 'react';
import { Trip, TripCity } from '../App';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { toast } from 'sonner@2.0.3';

interface EditTripInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
  onUpdateInfo: (tripId: string, updates: { name?: string; cities: TripCity[]; description: string }) => void;
}

export function EditTripInfoDialog({ open, onOpenChange, trip, onUpdateInfo }: EditTripInfoDialogProps) {
  const [tripName, setTripName] = useState('');
  const [selectedCities, setSelectedCities] = useState<TripCity[]>([]);
  const [description, setDescription] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');

  // Initialize form with trip data when dialog opens
  useEffect(() => {
    if (trip) {
      setTripName(trip.name || '');
      setSelectedCities(trip.cities || []);
      setDescription(trip.description || '');
    }
  }, [trip]);

  const handlePlaceSelected = (place: { name: string; address: string; coordinates: string }) => {
    const addressParts = place.address.split(',').map(s => s.trim());
    let cityName = place.name;
    let country = 'Unknown';
    
    if (addressParts.length > 0) {
      country = addressParts[addressParts.length - 1];
      if (addressParts.length > 1 && !place.name.includes(',')) {
        const nameInAddress = addressParts.some(part => part.toLowerCase().includes(place.name.toLowerCase()));
        if (!nameInAddress && addressParts[0].length > 2) {
          cityName = addressParts[0];
        }
      }
    }

    const alreadyAdded = selectedCities.some(
      c => c.name.toLowerCase() === cityName.toLowerCase() && c.country.toLowerCase() === country.toLowerCase()
    );
    
    if (alreadyAdded) {
      toast.info('Destination already added', {
        description: `${cityName} is already in your trip`
      });
      setCitySearchQuery('');
      return;
    }

    const newCity: TripCity = {
      name: cityName,
      country: country,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
    };
    
    requestAnimationFrame(() => {
      setSelectedCities([...selectedCities, newCity]);
      setCitySearchQuery('');
    });
    
    toast.success('✨ Destination added!', {
      description: `${cityName}, ${country}`
    });
  };

  const handleRemoveCity = (index: number) => {
    setSelectedCities(selectedCities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip || selectedCities.length === 0) return;
    
    onUpdateInfo(trip.id, {
      name: tripName.trim() || undefined,
      cities: selectedCities,
      description: description.trim()
    });
    
    onOpenChange(false);
  };

  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-[550px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Allow interactions with Google Places autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Trip Information</DialogTitle>
          <DialogDescription>
            Update the details of your trip
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name (Optional)</Label>
              <Input
                id="tripName"
                placeholder="e.g., Summer Europe Adventure, Family Vacation..."
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave empty to use city names as the trip name
              </p>
            </div>

            <div className="space-y-2">
              <Label>Destinations</Label>
              <p className="text-sm text-gray-500">
                Search and add any cities, regions, or locations worldwide
              </p>
              
              {/* PlaceAutocomplete for worldwide search */}
              <PlaceAutocomplete
                key={`edit-trip-${trip?.id}`}
                value={citySearchQuery}
                onChange={setCitySearchQuery}
                onPlaceSelected={handlePlaceSelected}
                placeholder="Search: Lake Como, Woodbridge VA, Paris, Tokyo..."
              />

              {/* Selected Cities */}
              {selectedCities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-lg border">
                  {selectedCities.map((city, index) => (
                    <Badge
                      key={`${city.name}-${index}`}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      <span className="mr-2">{city.name}, {city.country}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(index)}
                        className="ml-1 rounded-full hover:bg-blue-300 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What are you planning to do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={selectedCities.length === 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
