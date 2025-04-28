# 🛠️ Plan de développement de l'application TTS sur PDF (Version corrigée)

## 1. Prototype simple en Frontend : TTS sur texte brut

**Objectif :** Créer une application qui prend un texte court et le lit à voix haute dans le navigateur.

**À faire :**

- [x] Créer une app React (Next.js 15, TypeScript)
- [x] Interface minimale :
  - [x] Textarea pour entrer du texte
  - [x] Bouton "Lire à voix haute"
- [x] Utiliser l'API native `SpeechSynthesis` pour la lecture

✅ À ce stade, **pas besoin de backend**.

---

## 2. Gestion de petits fichiers PDF (5–10 pages)

**Objectif :** Permettre d'uploader un PDF, d'extraire son texte, et de lire ce texte à voix haute page par page.

**À faire :**

- [ ] Upload d'un fichier PDF (`pdf.js` en frontend)
- [ ] Extraction du texte **page par page**
- [ ] Affichage page par page avec navigation
- [ ] Bouton "Lire cette page" pour lire le texte extrait
- [ ] Lecture avec `SpeechSynthesis`

✅ Toujours sans backend pour l'instant.

---

## 3. Passage à de gros fichiers PDF (livres > 50 pages)

**Objectif :** Gérer des fichiers PDF volumineux sans faire planter le navigateur.

**Limites identifiées :**

- Extraction d'un énorme fichier d'un coup = risque de plantage (mémoire/CPU)
- Lecture complète du texte trop lourde pour `SpeechSynthesis` sans découpage

**Solutions :**

- [ ] Découper le PDF en morceaux (ex: 10 pages max à la fois)
- [ ] Proposer à l'utilisateur de choisir les pages à lire
- [ ] Lecture par "chunks" de texte (500–1000 mots max)
- [ ] Chargement progressif du texte (lazy loading)

---

## 4. Création d'un Backend TTS (FastAPI)

**Objectif :** Utiliser un modèle TTS lourd pour lire des textes plus longs de manière naturelle.

**Backend à construire :**

- [ ] API REST (FastAPI)
  - [ ] Endpoint `POST /generate-audio` recevant du texte ➔ renvoyant un fichier audio (MP3/WAV)
- [ ] Modèles TTS backend :
  - [ ] Tortoise TTS, Coqui TTS, Bark ou OpenVoice
- [ ] Stockage temporaire des fichiers audio (par exemple S3, disque local)

---

## 5. Améliorations futures

**Idées d'améliorations :**

- [ ] Sélection de la voix (homme / femme / accents)
- [ ] Téléchargement de l'audio complet du PDF
- [ ] Ajout de marque-pages dans la lecture
- [ ] Résumer automatiquement le PDF avant de lire (modèle de résumé)
- [ ] Support PWA complet (manifest.json, service worker pour usage offline)
