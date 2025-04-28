# Plan de développement de l'application TTS sur PDF

## 1. Prototype simple en Frontend seulement : TTS sur texte brut

**Objectif :** Créer une petite PWA qui prend un texte court (écrit ou copié-collé) et le lit à voix haute dans le navigateur.

**À faire :**

- [x] Créer une app React (Next JS)
- [ ] Interface minimale :
  - [ ] Un textarea pour entrer du texte
  - [ ] Un bouton "Lire à voix haute"
- [ ] Utiliser l'API native SpeechSynthesis du navigateur au départ (parfait pour les démos rapides)
- [ ] Ajouter PWA support (manifest.json, service worker)

✅ À ce stade, pas besoin de backend.

## 2. Ajout du TTS avancé avec transformers.js

**Objectif :** Remplacer ou compléter l'API native par un modèle plus naturel avec transformers.js.

**À faire :**

- [ ] Utiliser transformers.js pour charger un modèle TTS léger dans le navigateur (ex : FastSpeech2 ou un équivalent petit modèle)
- [ ] Générer l'audio blob et jouer via AudioContext
- [ ] Ajouter fallback : utiliser SpeechSynthesis si device trop faible

⚠️ **Attention :** Vérifier le temps de chargement ➔ précharger le modèle au démarrage si possible.

## 3. Gestion d'un petit PDF (5–10 pages)

**Objectif :** Permettre d'uploader un PDF, d'extraire le texte, et de lire ce texte à voix haute page par page.

**À faire :**

- [ ] Upload d'un fichier PDF avec pdf.js (lib très robuste pour lire des PDF en frontend)
- [ ] Extraction du texte par page
- [ ] Affichage page par page + bouton "Lire cette page"

✅ Toujours sans backend pour l'instant.

## 4. Passage à des fichiers PDF lourds (livres)

**Objectif :** Gérer de très gros fichiers PDF (livres > 50 pages), de façon fluide.

**Limites identifiées :**

- [ ] Extraction d'un énorme fichier tout d'un coup peut faire planter le navigateur (mémoire / CPU)
- [ ] Modèle TTS en JS est trop lourd pour traiter tout le livre en une fois

**Solutions :**

- [ ] Découper le PDF en morceaux (ex: 10 pages maximum à la fois)
- [ ] Proposer à l'utilisateur de choisir les pages à lire
- [ ] Lecture par "chunk" de texte (ex: 500–1000 mots max par audio)
- [ ] Charger le texte au fur et à mesure (lazy loading)

## 5. Création d'un Backend TTS

**Objectif :** Déporter le traitement lourd (modèle TTS) côté serveur pour mieux gérer les longs textes et accélérer.

**Backend à construire :**

- [ ] API REST avec FastAPI ou Flask :
  - [ ] POST /generate-audio avec du texte ➔ réponse : fichier audio (mp3 ou wav)
- [ ] Utiliser un vrai modèle TTS server-side :
  - [ ] Par exemple : Tortoise TTS, Coqui TTS, ou un modèle Hugging Face plus lourd
- [ ] Stocker temporairement les fichiers audio pour les envoyer au frontend

## 6. Améliorations futures

- [ ] Sélection de la voix (homme / femme / accent)
- [ ] Possibilité de télécharger l'audio du PDF entier
- [ ] Ajout de marque-pages dans la lecture
- [ ] Résumer automatiquement le PDF avant de lire (avec un modèle de résumé)
