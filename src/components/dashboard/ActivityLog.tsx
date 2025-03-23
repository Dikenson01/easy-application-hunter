
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  details?: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'info':
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getBadgeStyles = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return "bg-green-50 text-green-600 border-green-200";
      case 'error':
        return "bg-red-50 text-red-600 border-red-200";
      case 'warning':
        return "bg-amber-50 text-amber-600 border-amber-200";
      case 'info':
      default:
        return "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-md transition-colors hover:bg-secondary/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <Badge 
                        variant="outline"
                        className={`text-xs font-normal ${getBadgeStyles(activity.type)}`}
                      >
                        {activity.timestamp}
                      </Badge>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mb-2 opacity-20" />
                <p>No recent activity</p>
                <p className="text-xs">Activities will appear here once the bot starts working</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
