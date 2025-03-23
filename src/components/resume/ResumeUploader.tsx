
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploaderProps {
  onFileSelected: (file: File) => void;
  currentResume?: string | null;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  onFileSelected, 
  currentResume 
}) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if resume exists in localStorage for demo purposes
    const storedCv = localStorage.getItem('cvUploaded');
    if (storedCv === 'true' && !selectedFile) {
      // Simulate that we already have a file
      setUploadStatus('success');
    }
  }, [selectedFile]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        handleFileSelect(file);
      } else {
        toast({
          title: "Format non supporté",
          description: "Veuillez télécharger uniquement des fichiers PDF.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      localStorage.setItem('cvUploaded', 'true');
      onFileSelected(file);
      
      toast({
        title: "CV téléchargé avec succès",
        description: "Votre CV a été téléchargé et sera utilisé pour vos candidatures automatiques.",
      });
    }, 1000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        handleFileSelect(file);
      } else {
        toast({
          title: "Format non supporté",
          description: "Veuillez télécharger uniquement des fichiers PDF.",
          variant: "destructive"
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    localStorage.removeItem('cvUploaded');
    toast({
      title: "CV supprimé",
      description: "Votre CV a été supprimé. Veuillez en télécharger un nouveau pour continuer.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">CV</CardTitle>
        <CardDescription>
          Téléchargez votre CV au format PDF. Il sera utilisé pour toutes les candidatures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
            uploadStatus === 'success' && "border-green-500 bg-green-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileInputChange}
          />
          
          {selectedFile || (uploadStatus === 'success') ? (
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedFile?.name || "Votre CV"}</p>
                <p className="text-sm text-muted-foreground">
                  {uploadStatus === 'success' && (
                    <span className="flex items-center justify-center gap-1 text-green-600">
                      <Check className="h-4 w-4" /> Téléchargé avec succès
                    </span>
                  )}
                  {uploadStatus === 'uploading' && (
                    <span className="text-amber-600">Téléchargement en cours...</span>
                  )}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={triggerFileInput}
              >
                Remplacer le PDF
              </Button>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Téléchargez votre CV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={triggerFileInput}
              >
                Sélectionner un fichier PDF
              </Button>
            </>
          )}
        </div>
      </CardContent>
      {(selectedFile || uploadStatus === 'success') && (
        <CardFooter className="border-t bg-muted/30 justify-between px-6 py-3">
          <div className="text-sm text-muted-foreground">
            <span>Dernière mise à jour : {new Date().toLocaleDateString()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4 mr-1" /> Supprimer
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
