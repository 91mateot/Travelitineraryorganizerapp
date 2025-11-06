import { useState, useEffect } from 'react';
import { Activity, SocialMediaLink } from '../App';
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
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Plane, Hotel, Utensils, Activity as ActivityIcon, Car, MoreHorizontal, Plus, X, Instagram, Music, Youtube, Twitter, Link as LinkIcon, MapPin } from 'lucide-react';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { toast } from 'sonner@2.0.3';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  tripDays: string[];
}

const activityTypes: { value: Activity['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'flight', label: 'Flight', icon: <Plane className="w-4 h-4" /> },
  { value: 'hotel', label: 'Hotel', icon: <Hotel className="w-4 h-4" /> },
  { value: 'restaurant', label: 'Restaurant', icon: <Utensils className="w-4 h-4" /> },
  { value: 'activity', label: 'Activity', icon: <ActivityIcon className="w-4 h-4" /> },
  { value: 'transport', label: 'Transport', icon: <Car className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="w-4 h-4" /> },
];

export function AddActivityDialog({ open, onOpenChange, onAddActivity, tripDays }: AddActivityDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    description: '',
    location: '',
    address: '',
    city: '',
    placeCategory: 'other' as Activity['placeCategory'],
    coordinates: '',
    type: 'activity' as Activity['type'],
    day: tripDays[0] || '',
    isUnscheduled: false
  });
  const [useLocationSearch, setUseLocationSearch] = useState(true);

  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkPlatform, setNewLinkPlatform] = useState<SocialMediaLink['platform']>('instagram');

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        time: '',
        description: '',
        location: '',
        address: '',
        city: '',
        placeCategory: 'other',
        coordinates: '',
        type: 'activity',
        day: tripDays[0] || '',
        isUnscheduled: false
      });
      setSocialMediaLinks([]);
      setNewLinkUrl('');
      setNewLinkPlatform('instagram');
      setUseLocationSearch(true);
    }
  }, [open, tripDays]);

  const detectPlatform = (url: string): SocialMediaLink['platform'] => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    return 'other';
  };

  const addSocialMediaLink = () => {
    if (!newLinkUrl.trim()) return;
    
    const detectedPlatform = detectPlatform(newLinkUrl);
    const newLink: SocialMediaLink = {
      id: Date.now().toString(),
      platform: detectedPlatform !== 'other' ? detectedPlatform : newLinkPlatform,
      url: newLinkUrl.trim()
    };
    
    setSocialMediaLinks([...socialMediaLinks, newLink]);
    setNewLinkUrl('');
    setNewLinkPlatform('instagram');
  };

  const handleLocationSelected = (place: { name: string; address: string; coordinates: string; placeType?: string }) => {
    console.log('🎯 Location selected for activity:', place);
    
    const addressParts = place.address.split(',').map(p => p.trim());
    let city = '';
    if (addressParts.length >= 3) {
      city = addressParts[addressParts.length - 3];
    } else if (addressParts.length === 2) {
      city = addressParts[0];
    }
    
    let category: Activity['placeCategory'] = 'other';
    if (place.placeType) {
      if (place.placeType.includes('bakery')) category = 'bakery';
      else if (place.placeType.includes('meal_takeaway') || place.placeType.includes('fast_food')) category = 'fastfood';
      else if (place.placeType.includes('cafe')) category = 'cafe';
      else if (place.placeType.includes('bar') || place.placeType.includes('night_club')) category = 'bar';
      else if (place.placeType.includes('restaurant')) category = 'restaurant';
      else if (place.placeType.includes('art_gallery')) category = 'gallery';
      else if (place.placeType.includes('museum')) category = 'museum';
      else if (place.placeType.includes('stadium') || place.placeType.includes('event_venue')) category = 'venue';
      else if (place.placeType.includes('movie_theater') || place.placeType.includes('bowling_alley') || place.placeType.includes('amusement_park')) category = 'entertainment';
      else if (place.placeType.includes('beach')) category = 'beach';
      else if (place.placeType.includes('park')) category = 'park';
      else if (place.placeType.includes('tourist_attraction')) category = 'attraction';
      else if (place.placeType.includes('lodging')) category = 'hotel';
      else if (place.placeType.includes('shopping_mall') || place.placeType.includes('store')) category = 'shopping';
      else if (place.placeType.includes('transit_station') || place.placeType.includes('airport')) category = 'transport';
      else if (place.placeType.includes('school') || place.placeType.includes('university')) category = 'school';
      else if (place.placeType.includes('spa') || place.placeType.includes('beauty_salon')) category = 'spa';
      else if (place.placeType.includes('gym')) category = 'gym';
      else if (place.placeType.includes('pharmacy')) category = 'pharmacy';
      else if (place.placeType.includes('bank') || place.placeType.includes('atm')) category = 'bank';
      else if (place.placeType.includes('gas_station')) category = 'gas';
      else if (place.placeType.includes('parking')) category = 'parking';
    }
    
    requestAnimationFrame(() => {
      setFormData({
        ...formData,
        location: place.name,
        address: place.address,
        city: city,
        placeCategory: category,
        coordinates: place.coordinates
      });
      
      toast.success('📍 Location added!', {
        description: `${place.name} will appear on the map`
      });
    });
  };

  const removeSocialMediaLink = (id: string) => {
    setSocialMediaLinks(socialMediaLinks.filter(link => link.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { isUnscheduled, ...activityFields } = formData;
    const activityData = {
      ...activityFields,
      location: formData.location,
      address: formData.address || undefined,
      city: formData.city || undefined,
      placeCategory: formData.placeCategory || undefined,
      day: isUnscheduled ? undefined : activityFields.day,
      coordinates: formData.coordinates || undefined,
      socialMedia: socialMediaLinks.length > 0 ? socialMediaLinks : undefined
    };
    
    onAddActivity(activityData);
    
    // Reset form
    setFormData({
      title: '',
      time: '',
      description: '',
      location: '',
      address: '',
      city: '',
      placeCategory: 'other',
      coordinates: '',
      type: 'activity',
      day: tripDays[0] || '',
      isUnscheduled: false
    });
    setSocialMediaLinks([]);
    setNewLinkUrl('');
    setUseLocationSearch(true);
    
    onOpenChange(false);
  };

  const formatDayLabel = (day: string, index: number) => {
    const date = new Date(day);
    return `Day ${index + 1} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Allow interactions with Google Places autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>Add Activity</DialogTitle>
              <DialogDescription>
                Add a new activity to your itinerary
              </DialogDescription>
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
              <Label htmlFor="title">Activity Title</Label>
              <Input
                id="title"
                placeholder="e.g., Visit Eiffel Tower"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Activity['type']) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time (optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unscheduled"
                  checked={formData.isUnscheduled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isUnscheduled: checked as boolean })
                  }
                />
                <Label 
                  htmlFor="unscheduled" 
                  className="text-sm cursor-pointer"
                >
                  Save as optional activity (not scheduled yet)
                </Label>
              </div>
              
              {!formData.isUnscheduled && (
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) => setFormData({ ...formData, day: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tripDays.map((day, index) => (
                        <SelectItem key={day} value={day}>
                          {formatDayLabel(day, index)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                  {formData.coordinates && (
                    <span className="text-xs text-green-600 font-normal">✓ Will show on map</span>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseLocationSearch(!useLocationSearch)}
                  className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {useLocationSearch ? '✏️ Manual' : '🔍 Search'}
                </Button>
              </div>
              
              {useLocationSearch ? (
                <PlaceAutocomplete
                  key="activity-location"
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                  onPlaceSelected={handleLocationSelected}
                  placeholder="e.g., Eiffel Tower, Starbucks Tokyo, Champ de Mars..."
                />
              ) : (
                <Input
                  id="location"
                  placeholder="e.g., Buckingham Palace"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City/Destination (optional)</Label>
                <Input
                  id="city"
                  placeholder="e.g., Paris, Tokyo"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="placeCategory">Map Label (optional)</Label>
                <Select
                  value={formData.placeCategory}
                  onValueChange={(value: Activity['placeCategory']) => setFormData({ ...formData, placeCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                    <SelectItem value="cafe">☕ Cafe</SelectItem>
                    <SelectItem value="fastfood">🍕 Fast Food</SelectItem>
                    <SelectItem value="bakery">🍰 Bakery</SelectItem>
                    <SelectItem value="bar">🍺 Bar</SelectItem>
                    <SelectItem value="hotel">🏨 Hotel</SelectItem>
                    <SelectItem value="attraction">🎭 Attraction</SelectItem>
                    <SelectItem value="museum">🏛️ Museum</SelectItem>
                    <SelectItem value="gallery">🎨 Art Gallery</SelectItem>
                    <SelectItem value="park">🌳 Park</SelectItem>
                    <SelectItem value="beach">🏖️ Beach</SelectItem>
                    <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                    <SelectItem value="venue">🎪 Event Venue</SelectItem>
                    <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                    <SelectItem value="transport">🚇 Transport</SelectItem>
                    <SelectItem value="school">🏫 School</SelectItem>
                    <SelectItem value="spa">💆 Spa</SelectItem>
                    <SelectItem value="gym">💪 Gym</SelectItem>
                    <SelectItem value="pharmacy">💊 Pharmacy</SelectItem>
                    <SelectItem value="bank">🏦 Bank</SelectItem>
                    <SelectItem value="gas">⛽ Gas</SelectItem>
                    <SelectItem value="parking">🅿️ Parking</SelectItem>
                    <SelectItem value="other">📍 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address
                {formData.address && formData.coordinates && (
                  <span className="text-xs text-green-600 ml-2">✓ Auto-filled</span>
                )}
              </Label>
              {useLocationSearch ? (
                <Input
                  id="address"
                  placeholder="Auto-filled from search"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={formData.address ? 'bg-green-50 border-green-300' : ''}
                />
              ) : (
                <>
                  <Input
                    id="address"
                    placeholder="e.g., Westminster, London SW1A 1AA"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-900">
                      💡 <strong>Tip:</strong> Use search mode (click "🔍 Search" above) to automatically get GPS coordinates and show this activity on the trip map!
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add notes or details about this activity"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Social Media Links Section */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Social Media Links (Optional)</Label>
                <Badge variant="outline" className="text-xs">
                  {socialMediaLinks.length} added
                </Badge>
              </div>

              {/* Added Links */}
              {socialMediaLinks.length > 0 && (
                <div className="space-y-2">
                  {socialMediaLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {link.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />}
                        {link.platform === 'tiktok' && <Music className="w-4 h-4 flex-shrink-0" />}
                        {link.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        {link.platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        {link.platform === 'other' && <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm truncate">{link.url}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialMediaLink(link.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Link */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={newLinkPlatform} onValueChange={(value: SocialMediaLink['platform']) => setNewLinkPlatform(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="tiktok">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          TikTok
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4" />
                          YouTube
                        </div>
                      </SelectItem>
                      <SelectItem value="twitter">
                        <div className="flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          Twitter/X
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Paste social media link..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSocialMediaLink();
                      }
                    }}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSocialMediaLink}
                    disabled={!newLinkUrl.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Paste Instagram, TikTok, YouTube, or Twitter links to attach them to this activity
                </p>
              </div>
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
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
