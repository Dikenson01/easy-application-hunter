
import React, { useState } from 'react';
import { Header } from '@/components/ui/header';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

const Resume = () => {
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const handleFileSelected = (file: File) => {
    setResumeFile(file);
    toast({
      title: "CV Mis à Jour",
      description: "Votre CV a été mis à jour avec succès",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-semibold mb-6">Gestionnaire de CV</h1>
          <p className="text-muted-foreground mb-8">
            Mettez à jour et gérez votre CV pour les candidatures automatisées.
          </p>
          
          <div className="grid gap-6">
            <ResumeUploader 
              onFileSelected={handleFileSelected}
              currentResume={null}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Conseils pour votre CV</CardTitle>
                <CardDescription>
                  Recommandations pour améliorer votre taux de réussite aux candidatures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Format PDF Uniquement</h3>
                    <p className="text-sm text-muted-foreground">
                      Votre CV doit être au format PDF pour assurer sa compatibilité avec toutes les plateformes d'emploi.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Coordonnées Claires</h3>
                    <p className="text-sm text-muted-foreground">
                      Assurez-vous que votre nom, numéro de téléphone et email sont clairement visibles en haut de votre CV.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Évitez les Mises en Page Complexes</h3>
                    <p className="text-sm text-muted-foreground">
                      Les mises en page ou tableaux complexes peuvent ne pas être correctement analysés par les systèmes de candidature.
                      Gardez votre mise en page simple et directe.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Optimisation des Mots-Clés</h3>
                    <p className="text-sm text-muted-foreground">
                      Incluez des mots-clés pertinents issus des descriptions de poste que vous ciblez pour améliorer
                      vos chances de passer les filtres automatisés.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-secondary flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">Statut du CV</h3>
                      {resumeFile ? (
                        <Badge className="bg-green-500">Actif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Manquant</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resumeFile 
                        ? `Votre CV actuel "${resumeFile.name}" est prêt pour les candidatures.` 
                        : "Veuillez télécharger votre CV pour activer le bot de candidature."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resume;
