# Mon Village Maison & Jardin 🏘️

Application web légère, dans l'esprit d'un jeu mobile de construction de village, pour visualiser les pièces de la maison et le jardin en 3D, y placer du mobilier ou des plantes, et suivre le budget des travaux.

Tout est stocké localement dans le navigateur (IndexedDB) — aucun compte, aucun serveur, à l'exception d'un petit relais optionnel pour la rénovation par IA (voir plus bas).

## Fonctionnalités

- **Ajout de parcelles** : chaque pièce ou zone de jardin est créée une par une avec son nom, ses dimensions (largeur, longueur, hauteur) et des photos (murs, sol) qui sont projetées comme textures sur un volume 3D à l'échelle. Elles peuvent être corrigées à tout moment (✏️ Modifier).
- **Carte du village** : les parcelles s'assemblent sur une grille façon jeu de construction ; on peut les glisser-déposer pour organiser son village, et cliquer dessus pour entrer en vue 3D.
- **Catalogue de mobilier/plantes** : on ajoute des objets repérés en boutique en ligne (photo, dimensions réelles, prix), puis on les place dans une pièce avec un facteur d'agrandissement/rétrécissement, une position et une rotation ajustables.
- **Rénovation par IA** : dans une pièce, l'onglet ✨ Rénover permet de choisir une photo (un mur, le sol...) et de décrire une amélioration en langage naturel ("repeindre en blanc, poser un parquet chêne...") ; l'IA (Google Gemini) génère une projection avant/après, réutilisable comme nouvelle photo de la pièce. Nécessite de déployer le petit relais du dossier [`worker/`](./worker) (gratuit, 5 minutes) et de coller son URL dans les réglages ⚙️.
- **Budget & séquencement** : pour chaque parcelle et pour le village entier, une liste d'étapes ordonnées (séquencement des travaux) avec un coût par étape, un import de devis au format CSV, et une jauge de "récolte" façon jeu mobile comparant le budget total aux coûts prévisionnels.

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production
```

Stack : React + TypeScript + Vite, Tailwind CSS, react-three-fiber / three.js pour la 3D, Dexie (IndexedDB) pour la persistance locale.
