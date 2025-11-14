import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Activity } from '../App';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SocialMediaPreview } from './SocialMediaPreview';
import { MoreHorizontal, Edit, Trash2, MapPin } from 'lucide-react';

interface SortableActivityProps {
  activity: Activity;
  getActivityIcon: (type: Activity['type']) => JSX.Element;
  getActivityColor: (type: Activity['type']) => string;
  getCityColor: (city: string) => { bg: string; text: string; border: string };
  handleEditActivity: (activity: Activity) => void;
  deleteActivity: (activityId: string) => void;
}

export function SortableActivity({
  activity,
  getActivityIcon,
  getActivityColor,
  getCityColor,
  handleEditActivity,
  deleteActivity,
}: SortableActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-200 rounded transition-colors"
        title="Drag to reorder"
        aria-label="Drag to reorder activity"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>
      <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h4 className="text-gray-900">{activity.title}</h4>
            {activity.city && (() => {
              const cityColor = getCityColor(activity.city);
              return (
                <Badge
                  variant="outline"
                  className="text-xs flex-shrink-0"
                  style={{
                    backgroundColor: cityColor.bg,
                    color: cityColor.text,
                    borderColor: cityColor.border
                  }}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {activity.city}
                </Badge>
              );
            })()}
          </div>
          {activity.time && (
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {new Date(`2000-01-01T${activity.time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{activity.location}</span>
            {activity.coordinates && (
              <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                📍 On map
              </Badge>
            )}
          </div>
          {activity.address && (
            <div className="ml-5 text-xs text-gray-400 mt-1">
              {activity.address}
            </div>
          )}
        </div>
        {activity.socialMedia && activity.socialMedia.length > 0 && (
          <div className="mt-3">
            <SocialMediaPreview links={activity.socialMedia} />
          </div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditActivity(activity)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          aria-label={`Edit ${activity.title}`}
          title="Edit activity"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteActivity(activity.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label={`Delete ${activity.title}`}
          title="Delete activity"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
