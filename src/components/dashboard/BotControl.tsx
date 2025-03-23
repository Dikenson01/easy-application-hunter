
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, PauseCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotControlProps {
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  initialStatus?: 'idle' | 'running' | 'paused' | 'error';
}

export const BotControl: React.FC<BotControlProps> = ({ 
  onStart, 
  onStop, 
  onReset,
  initialStatus = 'idle'
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [nextRun, setNextRun] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    if (status === 'running') {
      setLastRun(new Date());
      // Set next run to be in 24 hours (or based on preferences)
      const next = new Date();
      next.setHours(next.getHours() + 24);
      setNextRun(next);
    }
  }, [status]);
  
  useEffect(() => {
    if (!nextRun || status !== 'running') return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextRun.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [nextRun, status]);
  
  const handleStart = () => {
    setStatus('running');
    onStart();
  };
  
  const handleStop = () => {
    setStatus('paused');
    onStop();
  };
  
  const handleReset = () => {
    setStatus('idle');
    setLastRun(null);
    setNextRun(null);
    setTimeRemaining('');
    onReset();
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">En cours</Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">En pause</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="outline">Inactif</Badge>;
    }
  };

  return (
    <Card className={cn(
      "transition-all border",
      status === 'running' && "border-green-200 shadow-[0_0_15px_rgba(34,197,94,0.2)]",
      status === 'paused' && "border-amber-200",
      status === 'error' && "border-red-200"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Statut du Bot</CardTitle>
            <CardDescription>Contrôlez le bot de candidature</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="text-sm text-muted-foreground">Dernière exécution :</div>
            <div className="font-medium">
              {lastRun ? lastRun.toLocaleString() : 'Jamais exécuté'}
            </div>
          </div>
          
          {status === 'running' && nextRun && (
            <>
              <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">Prochaine exécution :</div>
                <div className="font-medium">{nextRun.toLocaleString()}</div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">Temps restant :</div>
                <div className="text-2xl font-bold font-mono text-primary">{timeRemaining}</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 justify-between px-6 py-4">
        {status === 'running' ? (
          <Button onClick={handleStop} variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
            <PauseCircle className="h-4 w-4 mr-2" />
            Mettre en Pause
          </Button>
        ) : (
          <Button onClick={handleStart} variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
            <PlayCircle className="h-4 w-4 mr-2" />
            Démarrer le Bot
          </Button>
        )}
        
        <Button onClick={handleReset} variant="ghost" size="icon">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Réinitialiser</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
