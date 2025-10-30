import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Loader2 } from 'lucide-react';
import { Place } from '../App';
import { geocodeAddress } from '../utils/geocodingService';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { toast } from 'sonner@2.0.3';

interface AddPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (place: Omit<Place, 'id'>) => void;
}

export function AddPlaceDialog({ open, onOpenChange, onAdd }: AddPlaceDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<Place['category']>('attraction');
  const [notes, setNotes] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [useAutocomplete, setUseAutocomplete] = useState(true);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('');
      setAddress('');
      setCategory('attraction');
      setNotes('');
      setCoordinates('');
      setUseAutocomplete(true);
    }
  }, [open]);

  const handlePlaceSelected = (place: { name: string; address: string; coordinates: string; placeType?: string }) => {
    console.log('🎯 Place selected in dialog:', place);
    setName(place.name);
    setAddress(place.address);
    setCoordinates(place.coordinates);
    
    // Auto-suggest category based on place type
    if (place.placeType && ['restaurant', 'hotel', 'attraction', 'shopping', 'transport'].includes(place.placeType)) {
      setCategory(place.placeType as Place['category']);
      console.log('✅ Category auto-set to:', place.placeType);
    }
    
    toast.success('✨ Place details auto-filled!', {
      description: `${place.name} - All details ready to save`
    });
  };

  const handleGeocode = async () => {
    if (!address.trim()) return;
    
    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(address.trim());
      if (result) {
        setCoordinates(`${result.lat},${result.lng}`);
        // Optionally update address with formatted version
        setAddress(result.formattedAddress);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && address.trim()) {
      // Auto-geocode if no coordinates provided
      let finalCoordinates = coordinates.trim();
      if (!finalCoordinates && address.trim()) {
        setIsGeocoding(true);
        const result = await geocodeAddress(address.trim());
        if (result) {
          finalCoordinates = `${result.lat},${result.lng}`;
        }
        setIsGeocoding(false);
      }

      onAdd({
        name: name.trim(),
        address: address.trim(),
        category,
        notes: notes.trim() || undefined,
        coordinates: finalCoordinates || undefined,
      });
      
      // Reset form
      setName('');
      setAddress('');
      setCategory('attraction');
      setNotes('');
      setCoordinates('');
      setUseAutocomplete(true);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Add Place
          </DialogTitle>
          <DialogDescription>
            Search for a place using smart search or enter details manually.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Search Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-900">
                  {useAutocomplete ? '🔍 Smart Search Enabled' : '✏️ Manual Entry Mode'}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseAutocomplete(!useAutocomplete)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-xs h-7"
              >
                Switch to {useAutocomplete ? 'Manual' : 'Search'}
              </Button>
            </div>

            {useAutocomplete ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search">Search for Place *</Label>
                  <PlaceAutocomplete
                    key={open ? 'autocomplete-open' : 'autocomplete-closed'}
                    value={name}
                    onChange={setName}
                    onPlaceSelected={handlePlaceSelected}
                    placeholder="Search for Yankee Stadium, restaurants, hotels..."
                  />
                  {!name && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-900 mb-1">
                        <strong>✨ Smart Search will auto-fill:</strong>
                      </p>
                      <ul className="text-xs text-green-800 ml-4 space-y-0.5">
                        <li>• Place name (official name)</li>
                        <li>• Full address with postal code</li>
                        <li>• Exact GPS coordinates</li>
                        <li>• Suggested category (restaurant, hotel, etc.)</li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="name">Place Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Eiffel Tower, Cafe de Flore..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                Address *
                {address && coordinates && (
                  <span className="text-xs text-green-600">✓ Auto-filled</span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  placeholder="Street address or general location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="flex-1"
                />
                {!useAutocomplete && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeocode}
                    disabled={!address.trim() || isGeocoding}
                  >
                    {isGeocoding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              {!useAutocomplete && (
                <p className="text-xs text-gray-500">
                  Click the pin button to find coordinates automatically
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                Category
                {useAutocomplete && (
                  <span className="text-xs text-gray-500">(auto-suggested)</span>
                )}
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Place['category'])}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                  <SelectItem value="hotel">🏨 Hotel</SelectItem>
                  <SelectItem value="attraction">🎭 Attraction</SelectItem>
                  <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="transport">🚇 Transport</SelectItem>
                  <SelectItem value="other">📍 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinates" className="flex items-center gap-2">
                Coordinates
                {coordinates && (
                  <span className="text-xs text-green-600">✓ Set</span>
                )}
              </Label>
              <Input
                id="coordinates"
                placeholder="Auto-filled from search or address"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                readOnly={isGeocoding}
                className={coordinates ? 'bg-green-50 border-green-300' : ''}
              />
              {coordinates ? (
                <p className="text-xs text-green-600">
                  ✓ Coordinates set - place will appear on the map
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Auto-filled when you search or add an address
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this place..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !address.trim() || isGeocoding}>
              {isGeocoding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding location...
                </>
              ) : (
                'Add Place'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
