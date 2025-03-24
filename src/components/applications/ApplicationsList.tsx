
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ExternalLink, Filter } from 'lucide-react';

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  platform: 'LinkedIn' | 'Indeed' | 'Hellowork';
  status: 'applied' | 'error' | 'pending';
  location: string;
  date: string;
  travelTime?: string;
}

interface ApplicationsListProps {
  applications: Application[];
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({ applications }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || app.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-green-500">Candidature envoyée</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">En attente</Badge>;
      default:
        return null;
    }
  };

  const getPlatformBadge = (platform: Application['platform']) => {
    switch (platform) {
      case 'LinkedIn':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">LinkedIn</Badge>;
      case 'Indeed':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Indeed</Badge>;
      case 'Hellowork':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Hellowork</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl">Liste des candidatures</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8 h-9 w-full md:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[130px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="applied">Envoyées</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[130px]">
                  <SelectValue placeholder="Plateforme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Indeed">Indeed</SelectItem>
                  <SelectItem value="Hellowork">Hellowork</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredApplications.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poste</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{application.jobTitle}</TableCell>
                    <TableCell>{application.company}</TableCell>
                    <TableCell>{getPlatformBadge(application.platform)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{application.location}</span>
                        {application.travelTime && (
                          <span className="text-xs text-muted-foreground">{application.travelTime} depuis Vitry-sur-Seine</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{application.date}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Voir détails</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Filter className="h-10 w-10 mb-2 opacity-20" />
            <p>Aucune candidature trouvée</p>
            <p className="text-xs">Essayez d'ajuster vos filtres ou critères de recherche</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
