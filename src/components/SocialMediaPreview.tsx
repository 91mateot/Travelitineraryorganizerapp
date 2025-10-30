import { useState } from 'react';
import { SocialMediaLink } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ExternalLink, Instagram, Music, Youtube, Twitter, Link as LinkIcon, Play } from 'lucide-react';

interface SocialMediaPreviewProps {
  links: SocialMediaLink[];
}

export function SocialMediaPreview({ links }: SocialMediaPreviewProps) {
  const [selectedLink, setSelectedLink] = useState<SocialMediaLink | null>(null);

  if (links.length === 0) return null;

  const getPlatformIcon = (platform: SocialMediaLink['platform']) => {
    const iconClass = "w-4 h-4";
    switch (platform) {
      case 'instagram':
        return <Instagram className={iconClass} />;
      case 'tiktok':
        return <Music className={iconClass} />;
      case 'youtube':
        return <Youtube className={iconClass} />;
      case 'twitter':
        return <Twitter className={iconClass} />;
      default:
        return <LinkIcon className={iconClass} />;
    }
  };

  const getPlatformColor = (platform: SocialMediaLink['platform']) => {
    switch (platform) {
      case 'instagram':
        return 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90';
      case 'tiktok':
        return 'bg-black text-white hover:bg-gray-900';
      case 'youtube':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'twitter':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  };

  const getPlatformName = (platform: SocialMediaLink['platform']) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Button
            key={link.id}
            variant="outline"
            size="sm"
            onClick={() => setSelectedLink(link)}
            className="gap-2"
          >
            {getPlatformIcon(link.platform)}
            <span className="text-xs">{getPlatformName(link.platform)}</span>
            <Play className="w-3 h-3" />
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedLink} onOpenChange={() => setSelectedLink(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLink && (
                <>
                  <span className={`p-1.5 rounded ${getPlatformColor(selectedLink.platform)}`}>
                    {getPlatformIcon(selectedLink.platform)}
                  </span>
                  {getPlatformName(selectedLink.platform)} Preview
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLink && (
            <div className="space-y-4">
              <SocialMediaEmbed link={selectedLink} />
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedLink.url, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in {getPlatformName(selectedLink.platform)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SocialMediaEmbed({ link }: { link: SocialMediaLink }) {
  const getEmbedUrl = (link: SocialMediaLink): string | null => {
    switch (link.platform) {
      case 'youtube': {
        // Extract video ID from various YouTube URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = link.url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      case 'tiktok': {
        // TikTok embed format
        const videoIdMatch = link.url.match(/\/video\/(\d+)/);
        if (videoIdMatch) {
          return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
        }
        return null;
      }
      case 'instagram': {
        // Instagram embed - we'll show a placeholder with link
        return null;
      }
      case 'twitter': {
        // Twitter/X embed would need their widget script
        return null;
      }
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl(link);

  // For Instagram and Twitter, show a card with preview info
  if (link.platform === 'instagram' || link.platform === 'twitter') {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          {link.platform === 'instagram' ? (
            <Instagram className="w-16 h-16 mx-auto text-pink-500" />
          ) : (
            <Twitter className="w-16 h-16 mx-auto text-blue-500" />
          )}
          <div>
            <h4 className="text-gray-900 mb-2">
              {link.platform === 'instagram' ? 'Instagram' : 'Twitter/X'} Post
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Click "Open in {link.platform === 'instagram' ? 'Instagram' : 'Twitter/X'}" to view this post
            </p>
            <div className="bg-gray-100 rounded p-3 text-sm text-gray-700 break-all">
              {link.url}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!embedUrl) {
    return (
      <Card className="p-6 text-center">
        <LinkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-3">Preview not available</p>
        <div className="bg-gray-100 rounded p-3 text-sm text-gray-700 break-all">
          {link.url}
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ border: 'none' }}
      />
    </div>
  );
}
