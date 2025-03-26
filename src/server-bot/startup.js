
// Ce fichier est un point d'entrée plus simple pour lancer le serveur bot
console.log("Démarrage du serveur de candidature automatique...");

try {
  // Importer et démarrer le serveur (using dynamic import for ES modules)
  import('./bot-server.js')
    .then(() => {
      console.log("Serveur démarré avec succès");
      console.log("Pour tester que le serveur fonctionne, ouvrez: http://localhost:" + (process.env.SERVER_PORT || 5000) + "/api/status");
      console.log("Laissez cette fenêtre ouverte pendant que l'application fonctionne");
    })
    .catch(error => {
      console.error("ERREUR DE DÉMARRAGE:", error);
      
      if (error.message && error.message.includes('private_key')) {
        console.log("\nErreur de clé privée Firebase détectée:");
        console.log("1. Vérifiez que votre clé privée est correctement formatée");
        console.log("2. Si la clé est dans une variable d'environnement, assurez-vous que les sauts de ligne sont préservés (\\n)");
        console.log("3. Vous pouvez aussi utiliser le mode démo sans configuration Firebase");
      } else {
        console.log("\nConseils de dépannage généraux:");
        console.log("1. Vérifiez que vous avez exécuté 'npm install' pour installer toutes les dépendances");
        console.log("2. Assurez-vous que les modules requis (puppeteer, express, etc.) sont installés");
        console.log("3. Vérifiez les permissions d'accès aux fichiers et dossiers");
      }
    });
} catch (error) {
  console.error("ERREUR DE DÉMARRAGE:", error);
  console.log("\nConseils de dépannage:");
  console.log("1. Vérifiez que vous avez exécuté 'npm install' pour installer toutes les dépendances");
  console.log("2. Assurez-vous que les modules requis (puppeteer, express, etc.) sont installés");
  console.log("3. Vérifiez les permissions d'accès aux fichiers et dossiers");
  console.log("\nPour plus d'aide, consultez le fichier README.md");
}
