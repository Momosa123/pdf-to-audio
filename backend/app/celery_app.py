from celery import Celery

celery_app = Celery(
    "pdf_to_audio",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.services.tts_task"],
)
