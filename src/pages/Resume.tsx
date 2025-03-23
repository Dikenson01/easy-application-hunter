
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useFirebase } from '@/hooks/use-firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Resume = () => {
  const { toast } = useToast();
  const { uploadCV, isUploading, uploadProgress, uploadError, checkCVStatus } = useFirebase();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [cvStatus, setCvStatus] = useState({
    isUploaded: false,
    fileName: null as string | null,
    fileUrl: null as string | null
  });
  
  useEffect(() => {
    // Vérifier si un CV a déjà été téléchargé
    const status = checkCVStatus();
    setCvStatus(status);
  }, []);
  
  const handleFileSelected = async (file: File) => {
    setResumeFile(file);
    
    try {
      await uploadCV(file);
      
      // Mettre à jour le statut du CV
      setCvStatus({
        isUploaded: true,
        fileName: file.name,
        fileUrl: localStorage.getItem('cvUrl')
      });
      
      toast({
        title: "CV Mis à Jour",
        description: "Votre CV a été téléchargé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger votre CV. Veuillez réessayer.",
        variant: "destructive"
      });
    }
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Télécharger votre CV</CardTitle>
                <CardDescription>
                  Téléchargez votre CV au format PDF pour que le bot puisse postuler automatiquement pour vous
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResumeUploader 
                  onFileSelected={handleFileSelected}
                  currentResume={cvStatus.fileName}
                />
                
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Téléchargement en cours...</span>
                      <span className="text-sm font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {uploadError && (
                  <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {uploadError}
                  </div>
                )}
                
                {cvStatus.isUploaded && cvStatus.fileName && (
                  <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-green-800">CV téléchargé avec succès</h3>
                      <p className="text-sm text-green-700">
                        Votre CV <strong>"{cvStatus.fileName}"</strong> est prêt pour les candidatures automatiques.
                      </p>
                      {cvStatus.fileUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => window.open(cvStatus.fileUrl!, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Voir votre CV
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
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
                      {cvStatus.isUploaded ? (
                        <Badge className="bg-green-500">Actif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Manquant</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cvStatus.isUploaded && cvStatus.fileName
                        ? `Votre CV actuel "${cvStatus.fileName}" est prêt pour les candidatures.` 
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
