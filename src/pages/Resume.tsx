
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
      title: "Resume Updated",
      description: "Your resume has been updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-semibold mb-6">Resume Manager</h1>
          <p className="text-muted-foreground mb-8">
            Update and manage your resume for automated job applications.
          </p>
          
          <div className="grid gap-6">
            <ResumeUploader 
              onFileSelected={handleFileSelected}
              currentResume={null}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Resume Guidelines</CardTitle>
                <CardDescription>
                  Recommendations to improve your application success rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">PDF Format Only</h3>
                    <p className="text-sm text-muted-foreground">
                      Your resume must be in PDF format for compatibility with all job platforms.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Clear Contact Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure your name, phone number, and email are clearly visible at the top of your resume.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Avoid Complex Layouts</h3>
                    <p className="text-sm text-muted-foreground">
                      Complex layouts or tables may not be properly parsed by application systems.
                      Keep your layout simple and straightforward.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Keyword Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Include relevant keywords from the job descriptions you're targeting to improve 
                      your chances of passing automated screening.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-secondary flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">Resume Status</h3>
                      {resumeFile ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Missing</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resumeFile 
                        ? `Your current resume "${resumeFile.name}" is ready for job applications.` 
                        : "Please upload your resume to activate the application bot."}
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
