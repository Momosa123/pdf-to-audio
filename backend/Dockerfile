# Utilise une image Python légère
FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer gcc, g++, make, les headers Python/numpy, et Rust
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        python3-dev \
        libffi-dev \
        libsndfile1 \
        git \
        curl \
        && rm -rf /var/lib/apt/lists/* && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    export PATH="$PATH:/root/.cargo/bin"

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir numpy
# Ajoute le chemin Rust au PATH pour pip
ENV PATH="/root/.cargo/bin:${PATH}"
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY . .

# Exposer le port de l'API
EXPOSE 8000

# Set environment variables for model caching
ENV TRANSFORMERS_CACHE="/app/model_cache"
ENV TORCH_HOME="/app/model_cache"

# Create model cache directory
RUN mkdir -p /app/model_cache

# Commande de lancement
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 