
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Server, WifiOff } from 'lucide-react';
import axios from 'axios';
import { serverConfig } from '@/config/firebase-config';
import { useToast } from '@/hooks/use-toast';

interface ServerStatusProps {
  className?: string;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const serverUrl = serverConfig.url;

  const checkServerStatus = async () => {
    try {
      console.log(`Vérification du serveur à l'adresse: ${serverUrl}${serverConfig.apiPath}/status`);
      const response = await axios.get(`${serverUrl}${serverConfig.apiPath}/status`, { 
        timeout: serverConfig.timeout,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Réponse du serveur:', response.data);
      
      if (response.data && response.data.status === 'online') {
        setStatus('online');
        setMessage(response.data.message || 'Serveur disponible');
        
        if (status === 'offline') {
          toast({
            title: 'Serveur connecté',
            description: 'Le serveur de candidature est maintenant disponible',
          });
        }
      } else {
        setStatus('offline');
        setMessage('Réponse du serveur invalide');
      }
    } catch (error) {
      console.error('Le serveur bot n\'est pas disponible', error);
      setStatus('offline');
      setMessage('Serveur inaccessible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(() => {
      checkServerStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          {status === 'online' ? (
            <>
              <Server className="h-4 w-4 text-green-500" />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                    Serveur
                  </Badge>
                  <span className="text-sm font-medium text-green-700">En ligne</span>
                </div>
                {message && <p className="text-xs text-muted-foreground">{message}</p>}
              </div>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-2">
                    Serveur
                  </Badge>
                  <span className="text-sm font-medium text-red-700">Hors ligne</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lancez le serveur avec: <code className="px-1 bg-slate-100 rounded text-[10px]">node src/server/startup.cjs</code>
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
