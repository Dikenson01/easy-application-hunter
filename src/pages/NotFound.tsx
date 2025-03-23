
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Erreur 404: L'utilisateur a tenté d'accéder à une route inexistante:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Page Non Trouvée</h1>
          <p className="text-muted-foreground mb-8">
            Désolé, nous n'avons pas pu trouver la page que vous cherchez. Elle a peut-être été déplacée ou n'existe pas.
          </p>
          <Button asChild className="animate-pulse-subtle">
            <a href="/">Retour au Tableau de Bord</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
