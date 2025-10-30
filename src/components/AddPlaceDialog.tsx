import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Loader2 } from 'lucide-react';
import { Place } from '../App';
import { geocodeAddress } from '../utils/geocodingService';

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
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  placeholder="Street address or general location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="flex-1"
                />
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
              </div>
              <p className="text-xs text-gray-500">
                Click the pin button to find coordinates automatically
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="coordinates">
                Coordinates {coordinates && '✓'}
              </Label>
              <Input
                id="coordinates"
                placeholder="Auto-filled from address or enter manually"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                readOnly={isGeocoding}
              />
              <p className="text-xs text-gray-500">
                {coordinates ? '✓ Coordinates set - place will appear on map' : 'Will be auto-filled from address when you save'}
              </p>
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
