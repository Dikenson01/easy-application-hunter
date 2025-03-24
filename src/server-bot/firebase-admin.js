
// Import Firebase Admin SDK
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let db;

try {
  // Tentative d'initialisation avec les identifiants par défaut
  if (!admin.apps.length) {
    admin.initializeApp();
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
