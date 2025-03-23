
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-subtle", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {(description || trend) && (
            <div className="flex items-center">
              {trend && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-5 mr-2 font-normal text-xs",
                    trend === 'up' && "text-green-600 bg-green-50 border-green-200",
                    trend === 'down' && "text-red-600 bg-red-50 border-red-200",
                    trend === 'neutral' && "text-orange-600 bg-orange-50 border-orange-200"
                  )}
                >
                  {trendValue}
                </Badge>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
