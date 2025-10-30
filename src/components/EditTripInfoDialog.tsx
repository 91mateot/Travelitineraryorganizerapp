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
import { worldCities, getCityDisplay, City } from '../utils/cityDatabase';
import { X, MapPin, Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

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
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Initialize form with trip data when dialog opens
  useEffect(() => {
    if (trip) {
      setTripName(trip.name || '');
      setSelectedCities(trip.cities || []);
      setDescription(trip.description || '');
    }
  }, [trip]);

  const handleAddCity = (city: City) => {
    // Check if city already added
    const alreadyAdded = selectedCities.some(
      c => c.name === city.name && c.country === city.country
    );
    
    if (!alreadyAdded) {
      setSelectedCities([...selectedCities, city]);
    }
    
    setCitySearchQuery('');
    setShowCityDropdown(false);
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

  const filteredCities = worldCities.filter(city => {
    if (!citySearchQuery) return true;
    const query = citySearchQuery.toLowerCase();
    return (
      city.name.toLowerCase().includes(query) ||
      city.country.toLowerCase().includes(query)
    );
  });

  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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
                Search and add cities you'll be visiting
              </p>
              
              {/* City Search Input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search cities worldwide..."
                    value={citySearchQuery}
                    onChange={(e) => {
                      setCitySearchQuery(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className="pl-9"
                  />
                </div>

                {/* City Dropdown */}
                {showCityDropdown && citySearchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    <ScrollArea className="h-[200px]">
                      <div className="p-1">
                        {filteredCities.length > 0 ? (
                          filteredCities.slice(0, 50).map((city, index) => {
                            const isSelected = selectedCities.some(
                              c => c.name === city.name && c.country === city.country
                            );
                            return (
                              <button
                                key={`${city.name}-${city.country}-${index}`}
                                type="button"
                                onClick={() => handleAddCity(city)}
                                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 ${
                                  isSelected ? 'bg-blue-50' : ''
                                }`}
                              >
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm">{getCityDisplay(city)}</span>
                                {isSelected && (
                                  <span className="ml-auto text-xs text-blue-600">✓ Added</span>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-6 text-center text-sm text-gray-500">
                            No cities found
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Click outside to close dropdown */}
              {showCityDropdown && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCityDropdown(false)}
                />
              )}

              {/* Selected Cities */}
              {selectedCities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-lg border">
                  {selectedCities.map((city, index) => (
                    <Badge
                      key={`${city.name}-${index}`}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      <span className="mr-2">{getCityDisplay(city)}</span>
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
