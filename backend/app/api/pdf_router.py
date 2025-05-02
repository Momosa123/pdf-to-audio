from fastapi import APIRouter, Depends, File, UploadFile
from pathlib import Path
from fastapi.responses import JSONResponse
from app.services.pdf import PDFService
from app.services.tts import generate_audio_coqui
import numpy as np
import soundfile as sf
import os
import re


# Créer le routeur
router = APIRouter(prefix="/pdf", tags=["pdf"])

def clean_text(text):
    # Supprime SEULEMENT les espaces SIMPLES entre les lettres majuscules consécutives
    # Note: on remplace \s+ par un espace simple ' ' dans la regex
    cleaned_text = re.sub(r'(?<=[A-Z]) (?=[A-Z])', '', text)
    # Supprime les espaces multiples restants (qui pourraient être des séparateurs de mots)
    # et les remplace par un seul espace standard.
    cleaned_text = re.sub(r'\s{2,}', ' ', cleaned_text)
    print(f"Texte original : '{text}'")
    print(f"Texte nettoyé  : '{cleaned_text.strip()}'")
    return cleaned_text.strip()

@router.post("/pdf-to-audio")
async def pdf_to_audio(file: UploadFile = File(...)):
    """
    Convertit un fichier PDF en audio.
    """
    # Lire le contenu du PDF uploadé
    contents = await file.read()
    pdf_service = PDFService()
    text = pdf_service.extract_first_page_text(contents)
    text = clean_text(text)  # Nettoie le texte
    
    if not text:
        return JSONResponse(content={"error": "Aucun texte trouvé dans le PDF."}, status_code=400)

    # Générer l'audio à partir du texte
    audio_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio')
    os.makedirs(audio_dir, exist_ok=True)
    audio_filename = f"{os.path.splitext(file.filename)[0]}_first_page.wav"
    audio_path = os.path.join(audio_dir, audio_filename)
    generate_audio_coqui(text, audio_path)

    # Construire l'URL d'accès au fichier audio
    audio_url = f"/static/audio/{audio_filename}"
    return JSONResponse(content={"audio_url": audio_url})
