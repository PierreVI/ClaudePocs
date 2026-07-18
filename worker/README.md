# Relais IA pour la rénovation de pièces

Petit Cloudflare Worker qui reçoit une photo + un prompt depuis l'app, appelle
Gemini (image `gemini-2.5-flash-image`, alias « Nano Banana ») avec une clé
API gardée côté serveur, et renvoie l'image générée. C'est le seul bout non
statique de l'application — tout le reste tourne dans le navigateur.

## Déploiement (5 minutes, gratuit)

1. Crée une clé API Gemini sur [Google AI Studio](https://aistudio.google.com/apikey).
2. Installe les dépendances et connecte-toi à Cloudflare (compte gratuit) :
   ```bash
   cd worker
   npm install
   npx wrangler login
   ```
3. Enregistre ta clé Gemini comme secret (elle n'est jamais écrite dans un fichier) :
   ```bash
   npm run secret:gemini
   ```
4. (Optionnel mais recommandé) Ouvre `wrangler.toml` et mets `ALLOWED_ORIGIN` sur
   l'URL exacte de ton site déployé, pour que seul ton app puisse appeler ce Worker.
5. Déploie :
   ```bash
   npm run deploy
   ```
   Note l'URL affichée (`https://village-ai-render.<ton-compte>.workers.dev`).
6. Colle cette URL dans l'app, onglet **⚙️ Réglages**.

## Mettre à jour

Après une modif de `src/index.js`, relance simplement `npm run deploy`.
