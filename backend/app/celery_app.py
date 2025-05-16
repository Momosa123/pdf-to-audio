import os

from celery import Celery

# Utiliser la variable d'environnement REDIS_URL, avec une valeur par défaut
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery(
    "pdf_to_audio",
    broker=redis_url,
    backend=redis_url,
    include=["app.services.tts_task"],
)
