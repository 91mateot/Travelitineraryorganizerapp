import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { X, MapPin } from 'lucide-react';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { toast } from 'sonner@2.0.3';

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrip: (trip: Omit<Trip, 'id' | 'activities'>) => void;
}

export function AddTripDialog({ open, onOpenChange, onAddTrip }: AddTripDialogProps) {
  const [selectedCities, setSelectedCities] = useState<TripCity[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'upcoming' as Trip['status']
  });

  const handlePlaceSelected = (place: { name: string; address: string; coordinates: string }) => {
    // Parse city and country from address
    const addressParts = place.address.split(',').map(s => s.trim());
    let cityName = place.name;
    let country = 'Unknown';
    
    // Try to extract country (usually last part of address)
    if (addressParts.length > 0) {
      country = addressParts[addressParts.length - 1];
      // If the name doesn't seem like a city, use the first address part
      if (addressParts.length > 1 && !place.name.includes(',')) {
        // Check if name is in the address - if so, keep it, otherwise use address part
        const nameInAddress = addressParts.some(part => part.toLowerCase().includes(place.name.toLowerCase()));
        if (!nameInAddress && addressParts[0].length > 2) {
          cityName = addressParts[0];
        }
      }
    }

    // Check if destination already added
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

    // Create new city with a default image
    const newCity: TripCity = {
      name: cityName,
      country: country,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800' // Default travel image
    };
    
    setSelectedCities([...selectedCities, newCity]);
    setCitySearchQuery('');
    
    toast.success('✨ Destination added!', {
      description: `${cityName}, ${country}`
    });
  };

  const handleRemoveCity = (index: number) => {
    setSelectedCities(selectedCities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCities.length === 0) return;
    
    // Use first city as primary destination
    const primaryCity = selectedCities[0];
    const destinationName = selectedCities.length > 1
      ? `${primaryCity.name} +${selectedCities.length - 1} more`
      : `${primaryCity.name}, ${primaryCity.country}`;
    
    onAddTrip({
      name: formData.name.trim() || undefined,
      destination: destinationName,
      cities: selectedCities,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      image: primaryCity.image,
      status: formData.status
    });
    
    // Reset form
    setSelectedCities([]);
    setCitySearchQuery('');
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'upcoming'
    });
    
    onOpenChange(false);
  };

  // Reset form when dialog closes
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedCities([]);
      setCitySearchQuery('');
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        status: 'upcoming'
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent 
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Allow interactions with Google Places autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Plan a New Trip</DialogTitle>
          <DialogDescription>
            Add destinations and details about your upcoming adventure
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name (Optional)</Label>
              <Input
                id="tripName"
                placeholder="e.g., Summer Europe Adventure, Family Vacation..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                key={`autocomplete-${open}`}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What are you planning to do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Trip['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={selectedCities.length === 0 || !formData.startDate || !formData.endDate}
            >
              Create Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
