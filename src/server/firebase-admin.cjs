
// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db;
let storage;

try {
  // Tentative d'initialisation avec les identifiants de service
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : {
      "type": "service_account",
      "project_id": "cv-auto-1f01e",
      "private_key_id": "1e92e4b35b0a4a7d4f410fb5faf4600d94f611b2",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCJFGuE1fbAX5HA\nCMzxRHXk06XgRhb4L2ytBKNztGWHQ8iGSVZ1UTiy5kydAD6yjG+aX3pzQcuS7WBO\n3XPG75tFDaAZKSVKtDFC9GNVcLfMbRyj/rzZsr2foumM8brSRZvCfggj6LEUjOll\nN4vChsm2A3kttXV8J4IgcyY7JdK6qvJNuwNbGJeiKjwrcOaDUYkH+qt2xi5TXUn1\ng1bC1VW5j1KFjfkf39dgkOfsZYTIzSgt9A5wMxQxNzJbCLn+v7lOfqhQ6jV5AOzA\nEWH8HFaOHktOCQ1rlvAYOUZG8HrjuJrHlGbTCOGiqsB2k1q3gDEcCSjf4MSH//TP\nF68GkU11AgMBAAECggEAAw7MIt4v/yoSmFVJ7GQxz2KDln1nGURbjlTREu1rqgkH\nzIEPIeunfLbORN6ix2etEfqTwsWYCtrAis8opup6N5/eb06U6PXx4bO4ZzPuEawU\nbGRsENzKcJNugMj1Tn1O2cI8db/veqJ1uV7ev1PeOjEZJKfMgLIT68aNzC945CuQ\nLZGVQeaQ127YMkmPZkwIGLC1uFgj+tLTSmUCSSUmxyxgTli+ioojCE63FqzR5fk3\nEnFMOc5VobacfHGqMdu3dgtAB8ibrr/fqsx2kthdaifaQExbE5OL4wDREXspWyrx\ndN1TfYlaRsgt8dZqx4Q+url6e9aZJVTUxmxpVHFHUQKBgQDAvsmOt1Svs9+uRPtg\ni3+MN3+jZ3sgAQRMZRJZdFh9Ozm6ujXzfCMzYJeSnZEPD2B1fpKVWsmELZuQ4YnZ\nd+AlSCEJGzy4hC9+suxpnKZpzn3VUJHOh8SauilF/xmlY3PPCbRw4V8s9O62Diew\nOxrz3vB3s4wGKIa3JdR2NUBhJQKBgQC2EPoYhM0hRAyZo4zh+I/bgQ6jTVnptv+e\niq7jrxo6Gww1tPMly8b9JFbkB4CNsUqLBg4awLSnKhNX+dsbn5Cth/Sv8Q2WSPbj\nrqX6Qn2C466wxbeuCjkDp3UZ/BAQ4Sfdrj2GgkZn6Xhg2ia1obvkNr3NJnrGaUiv\n1XIjDmlSEQKBgAGpY2l0kSlWnqYM+DHT4gyead5JxRj4iUXzVR4qT5z8xrmiY1av\nCkqmGYhtDVQY6Nb6eV8KQlR+ZCnyl9KlIuyPW6GNd4+LrDEmb71VWWXuHs2Y/TjP\nmNVQp4xv75OqcNQnHEQg3UYw8mHla1gsmkXh9SbDCIEBFnA7xkIioWR1AoGAfi1X\n1iQ7MYHCpbumCHlF4Z8YcO5LkOClWM/OErcomvphxNrJ4/jMyGUl3tSgMBKdkam5\nnqrMyEktrLvZMNSt5MWjO0f43Z1llTdVihIIf+yhBZuRB4nIJ5MnYcHBtKEGCukV\ndKHWf29bYOvvBdO3rpqNgZ7YWadfm5R2jHsRXLECgYBLfqHEHfXLEKN6e8fPuNO9\nZekVcbMWsVHfdWHSpK9okwwgvanFS/tBuqP4FSSeZAXD2EWkIhGLHwzWj2k+NHiN\nEOFUIC07GTzjywQ1sBTU/XceqCmRxKfmceMY3noW07z/iZvMp5E9cH2FOHbCZ7vE\nr4puTOSh2BqAFPhEn/kIgA==\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-fbsvc@cv-auto-1f01e.iam.gserviceaccount.com",
      "client_id": "109796642503469018446",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40cv-auto-1f01e.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };
  
  // Si un serviceAccount est défini, on l'utilise
  if (serviceAccount) {
    // Correction des sauts de ligne dans la clé privée si nécessaire
    if (serviceAccount.private_key && !serviceAccount.private_key.includes("\n")) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "cv-auto-1f01e.appspot.com"
      });
    }
  } else {
    // Sinon, tentative avec les identifiants par défaut
    if (!admin.apps.length) {
      admin.initializeApp();
    }
  }
  
  db = admin.firestore();
  storage = admin.storage();
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
  
  storage = {
    bucket: () => ({
      file: () => ({
        download: async () => console.log('Mock: file download')
      })
    })
  };
}

module.exports = { db, admin, storage };
