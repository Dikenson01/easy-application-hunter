
// Import Firebase Admin SDK
import admin from 'firebase/admin';
import { createRequire } from 'module';

// Utilisé pour charger les fichiers JSON en mode ES modules
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
let db;

try {
  // Tentative d'initialisation avec les identifiants par défaut
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  
  // Si un serviceAccount est défini, on l'utilise
  if (serviceAccount) {
    // Correction des sauts de ligne dans la clé privée si nécessaire
    if (serviceAccount.private_key && !serviceAccount.private_key.includes("\n")) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } else {
    // Sinon, tentative avec les identifiants par défaut
    if (!admin.apps.length) {
      admin.initializeApp();
    }
  }
  
  db = admin.firestore();
  console.log('Firebase Admin SDK initialisé avec succès');
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Firebase Admin SDK:', error);
  
  // Création d'un mock de Firestore pour le mode démo
  console.log('Utilisation du mode démo (sans Firebase)');
  db = {
    collection: (name) => ({
      doc: (id) => ({
        get: async () => ({ exists: true, data: () => ({ id, name: 'Utilisateur test' }) }),
        set: async (data) => console.log(`Mock: document ${id} écrit dans ${name}`, data)
      }),
      where: () => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ forEach: () => {} }) }) }) }),
      orderBy: () => ({ limit: () => ({ get: async () => ({ forEach: () => {} }) }) }),
      add: async (data) => console.log(`Mock: document ajouté à ${name}`, data)
    })
  };
}

export { db, admin };
