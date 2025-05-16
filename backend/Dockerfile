# Utilise une image Python complète
FROM python:3.11

# Définir le répertoire de travail
WORKDIR /app

# Variables d'environnement pour le frontend (si nécessaire, sinon à supprimer)
# ENV NEXT_PUBLIC_API_URL=http://localhost:8000/

# Installer les dépendances système nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        make \
        python3-dev \
        libffi-dev \
        libsndfile1 \
        libsndfile1-dev \
        git \
        curl \
        espeak-ng && \
    rm -rf /var/lib/apt/lists/* # Clean up apt-get cache

# Installer Rust (si toujours nécessaire, sinon commenter/supprimer)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"


COPY requirements.txt .

# Mettre à jour pip et installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip
# Installer llvmlite séparément, peut aider pour certaines dépendances de Coqui TTS
RUN pip install --no-cache-dir llvmlite
RUN pip install --no-cache-dir numpy # Optionnel si déjà dans requirements.txt, mais peut aider pour les versions
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste de l'application
COPY . .

# Créer le répertoire pour le cache du modèle si nécessaire
RUN mkdir -p /app/model_cache
ENV XDG_CACHE_HOME="/app/model_cache"

# Variables d'environnement spécifiques à l'application si besoin
# ENV PYTHONUNBUFFERED=1

# Exposer le port (si ce Dockerfile est aussi pour le backend directement)
# EXPOSE 8000

# Commande par défaut (si ce Dockerfile est aussi pour le backend directement)
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 