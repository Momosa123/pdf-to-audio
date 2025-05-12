import os

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..celery_app import celery_app  # Import de l'instance Celery
from ..services.tts_task import pdf_to_audio_task  # Import de la tâche Celery

# Créer le router
router = APIRouter(prefix="/api", tags=["pdf"])

# Définir le répertoire de sortie pour les fichiers audio
# Ce chemin est relatif à la racine du projet si le worker est lancé depuis là,
# ou à l'endroit d'où le worker est lancé.
# Assurons-nous qu'il correspond à ce qui sera servi statiquement par FastAPI.
AUDIO_OUTPUT_DIR = os.path.join("app", "static", "audio")


@router.post("/submit_pdf_to_audio_task")
async def submit_pdf_to_audio_task(file: UploadFile = File(...)):
    """
    Soumet un fichier PDF pour conversion en audio.
    La conversion est effectuée en arrière-plan via Celery.
    Retourne un ID de tâche pour suivre la progression.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Le fichier PDF est vide.")

    # Lancer la tâche Celery
    # La tâche `pdf_to_audio_task` prend (pdf_bytes, output_dir)
    task = pdf_to_audio_task.delay(contents, AUDIO_OUTPUT_DIR)

    return {
        "task_id": task.id,
        "message": "La conversion du PDF en audio a été démarrée.",
    }


@router.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    """
    Récupère le statut et le résultat d'une tâche Celery.
    """
    task_result = celery_app.AsyncResult(task_id)

    response = {
        "task_id": task_id,
        "status": task_result.status,
        "result": None,
        "error_info": None,
    }

    if task_result.successful():
        # Le résultat de la tâche est le chemin du fichier audio
        # ex: "app/static/audio/nom_fichier.wav"
        # Nous le transformons en URL relative que le client peut utiliser
        # en supposant que "app/static" est monté à "/static"
        raw_path = task_result.result
        if isinstance(raw_path, str) and raw_path.startswith("app/static/"):
            response["result"] = raw_path.replace("app/static/", "/static/", 1)
        else:
            response["result"] = (
                raw_path  # Retourne le chemin brut si le format est inattendu
            )

    elif task_result.failed():
        response["error_info"] = str(
            task_result.info
        )  # task_result.info contient l'exception

    return response
