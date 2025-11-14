import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 p-4 rounded-full">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          {action.label}
        </Button>
      )}
      {children}
    </Card>
  );
}
