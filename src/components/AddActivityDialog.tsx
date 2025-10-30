import { useState } from 'react';
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
import { Plane, Hotel, Utensils, Activity as ActivityIcon, Car, MoreHorizontal, Plus, X, Instagram, Music, Youtube, Twitter, Link as LinkIcon } from 'lucide-react';

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
    type: 'activity' as Activity['type'],
    day: tripDays[0] || '',
    isUnscheduled: false
  });

  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkPlatform, setNewLinkPlatform] = useState<SocialMediaLink['platform']>('instagram');

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

  const removeSocialMediaLink = (id: string) => {
    setSocialMediaLinks(socialMediaLinks.filter(link => link.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include day if not unscheduled
    const activityData = {
      ...(formData.isUnscheduled ? { ...formData, day: undefined } : formData),
      socialMedia: socialMediaLinks.length > 0 ? socialMediaLinks : undefined
    };
    
    onAddActivity(activityData);
    
    // Reset form
    setFormData({
      title: '',
      time: '',
      description: '',
      location: '',
      type: 'activity',
      day: tripDays[0] || '',
      isUnscheduled: false
    });
    setSocialMediaLinks([]);
    setNewLinkUrl('');
    
    onOpenChange(false);
  };

  const formatDayLabel = (day: string, index: number) => {
    const date = new Date(day);
    return `Day ${index + 1} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogDescription>
            Add a new activity to your itinerary
          </DialogDescription>
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
                <Label htmlFor="time">Time {formData.isUnscheduled && '(optional)'}</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required={!formData.isUnscheduled}
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Champ de Mars"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
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
