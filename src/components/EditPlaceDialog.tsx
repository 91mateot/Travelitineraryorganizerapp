import { useState, useEffect } from 'react';
import { Place } from '../App';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { MapPin } from 'lucide-react';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { toast } from 'sonner@2.0.3';

interface EditPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (placeId: string, updates: Omit<Place, 'id'>) => void;
  place: Place | null;
}

export function EditPlaceDialog({ open, onOpenChange, onUpdate, place }: EditPlaceDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: 'other' as Place['category'],
    notes: '',
    coordinates: ''
  });
  const [useSearch, setUseSearch] = useState(false);

  useEffect(() => {
    if (open && place) {
      setFormData({
        name: place.name,
        address: place.address,
        category: place.category,
        notes: place.notes || '',
        coordinates: place.coordinates || ''
      });
      setUseSearch(false);
    }
  }, [open, place]);

  const handlePlaceSelected = (selectedPlace: { name: string; address: string; coordinates: string }) => {
    requestAnimationFrame(() => {
      setFormData({
        ...formData,
        name: selectedPlace.name,
        address: selectedPlace.address,
        coordinates: selectedPlace.coordinates
      });
      toast.success('📍 Location updated!');
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!place) return;

    onUpdate(place.id, {
      name: formData.name,
      address: formData.address,
      category: formData.category,
      notes: formData.notes || undefined,
      coordinates: formData.coordinates || undefined
    });

    onOpenChange(false);
    toast.success('Place updated successfully!');
  };

  if (!place) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>Edit Place</DialogTitle>
              <DialogDescription>Update the details of this place</DialogDescription>
            </div>
            {formData.coordinates && (
              <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                On Map
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="name">Place Name</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseSearch(!useSearch)}
                  className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {useSearch ? '✏️ Manual' : '🔍 Search'}
                </Button>
              </div>
              {useSearch ? (
                <PlaceAutocomplete
                  key={`edit-place-${place?.id}`}
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  onPlaceSelected={handlePlaceSelected}
                  placeholder="Search for a place..."
                />
              ) : (
                <Input
                  id="name"
                  placeholder="e.g., Eiffel Tower"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="e.g., Champ de Mars, Paris"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Place['category']) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                  <SelectItem value="cafe">☕ Cafe</SelectItem>
                  <SelectItem value="fastfood">🍕 Fast Food</SelectItem>
                  <SelectItem value="bakery">🍰 Bakery</SelectItem>
                  <SelectItem value="bar">🍺 Bar/Nightlife</SelectItem>
                  <SelectItem value="hotel">🏨 Hotel</SelectItem>
                  <SelectItem value="attraction">🎭 Attraction</SelectItem>
                  <SelectItem value="museum">🏛️ Museum</SelectItem>
                  <SelectItem value="gallery">🎨 Art Gallery</SelectItem>
                  <SelectItem value="park">🌳 Park/Nature</SelectItem>
                  <SelectItem value="beach">🏖️ Beach</SelectItem>
                  <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                  <SelectItem value="venue">🎪 Event Venue</SelectItem>
                  <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="transport">🚇 Transport</SelectItem>
                  <SelectItem value="school">🏫 School</SelectItem>
                  <SelectItem value="spa">💆 Spa/Wellness</SelectItem>
                  <SelectItem value="gym">💪 Gym/Fitness</SelectItem>
                  <SelectItem value="pharmacy">💊 Pharmacy</SelectItem>
                  <SelectItem value="bank">🏦 Bank/ATM</SelectItem>
                  <SelectItem value="gas">⛽ Gas Station</SelectItem>
                  <SelectItem value="parking">🅿️ Parking</SelectItem>
                  <SelectItem value="other">📍 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this place..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
