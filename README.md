
# Bot de Candidature Automatisé

Application web avec un bot backend qui postule automatiquement aux offres d'emploi.

## Fonctionnalités

- Téléchargement de CV
- Bot qui scrape LinkedIn, Indeed et Hellowork
- Candidature automatisée aux offres d'emploi
- Suivi des candidatures
- Calcul du temps de trajet

## Installation

1. Cloner le repository
2. Installer les dépendances avec `npm install`
3. Démarrer l'application frontend avec `npm run dev`
4. Démarrer le serveur bot backend avec `node src/server-bot/startup.js`

## Configuration requise

Pour que le bot fonctionne complètement, vous aurez besoin de:

1. Créer un compte de service Firebase et configurer les identifiants dans l'un de ces emplacements:
   - Variable d'environnement `FIREBASE_SERVICE_ACCOUNT` (JSON sous forme de chaîne)
   - Ou utiliser les identifiants par défaut (mode démo)

2. Démarrer le serveur backend Node.js sur le port 5000
3. Avoir un CV au format PDF à télécharger

## Utilisation

1. Accédez à la page "CV" et téléchargez votre CV
2. Retournez au tableau de bord et démarrez le bot
3. Suivez les candidatures dans la section "Candidatures"

## Structure du serveur bot

Le serveur backend est composé de plusieurs modules:

- `bot-server.js` - Serveur Express avec les routes API
- `firebase-admin.js` - Configuration de Firebase Admin SDK
- `job-scraper.js` - Scraping des sites d'emploi
- `job-applicator.js` - Automatisation des candidatures
- `startup.js` - Point d'entrée simplifié pour démarrer le serveur

## Résolution des problèmes

Si vous rencontrez des erreurs:

### Problème de clé privée Firebase
Si vous obtenez une erreur liée à la clé privée:
1. Assurez-vous que la clé privée est correctement formatée avec les délimiteurs `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`
2. Si vous utilisez une variable d'environnement, vérifiez que les sauts de ligne sont correctement gérés (`\n`)

### Port déjà utilisé (EADDRINUSE)
Si le port 5000 est déjà occupé:
1. Identifiez le processus avec `lsof -i :5000`
2. Terminez le processus avec `kill -9 <PID>`
3. Ou spécifiez un port alternatif: `SERVER_PORT=5001 node src/server-bot/startup.js`

### Autres problèmes
1. Vérifiez que le chemin vers `startup.js` est correct
2. Assurez-vous que toutes les dépendances sont installées
3. Vérifiez la console pour les messages d'erreur spécifiques
4. Le serveur doit être démarré avec `node src/server-bot/startup.js`

## Notes importantes

- Ce bot utilise Puppeteer pour automatiser les navigateurs web
- Pour des performances optimales, lancez le bot sur un serveur avec suffisamment de RAM (minimum 4 Go)
- Certains sites peuvent bloquer les robots, soyez prudent avec la fréquence des candidatures
