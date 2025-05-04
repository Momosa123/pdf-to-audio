from fastapi import APIRouter, File, UploadFile

from fastapi.responses import JSONResponse
from app.services.extract_pdf import PDFService, chunk_text
from app.services.tts_pdf import generate_audio_coqui
import numpy as np
import soundfile as sf
import os
import re
import uuid # Importer uuid pour les noms de fichiers temporaires


# Créer le routeur
router = APIRouter(prefix="/api", tags=["pdf"])

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
    Convertit les 5 premières pages d'un fichier PDF en audio.
    """
    # Lire le contenu du PDF uploadé
    contents = await file.read()
    pdf_service = PDFService()
    # Utiliser la nouvelle méthode pour les 5 premières pages
    text = pdf_service.extract_first_five_pages_text(contents)
    cleaned_text = clean_text(text)  # Nettoie le texte

    if not cleaned_text:
        return JSONResponse(content={"error": "Aucun texte trouvé dans les 5 premières pages du PDF."}, status_code=400)

    # Créer le dossier audio s'il n'existe pas
    base_dir = os.path.dirname(__file__)
    audio_dir = os.path.join(base_dir, '..', 'static', 'audio')
    temp_dir = os.path.join(audio_dir, 'temp') # Dossier pour les fichiers temporaires
    os.makedirs(temp_dir, exist_ok=True)

    temp_files = []
    all_audio_data = []

    try:
        for i, chunk in enumerate(chunk_text(cleaned_text)):
            if not chunk.strip(): # Ignorer les morceaux vides
                continue
            print(f"Processing chunk {i+1}/{len(chunk_text(cleaned_text))}")
            temp_filename = f"{uuid.uuid4()}.wav"
            temp_filepath = os.path.join(temp_dir, temp_filename)
            try:
                generate_audio_coqui(chunk.strip(), temp_filepath)
                # Lire les données audio du fichier temporaire
                audio_data, samplerate = sf.read(temp_filepath)
                all_audio_data.append(audio_data)
                temp_files.append(temp_filepath)
            except Exception as e:
                print(f"Erreur lors de la génération de l'audio pour le morceau {i+1}: {e}")
                # Optionnel : on pourrait décider de continuer ou d'arrêter ici
                # return JSONResponse(content={"error": f"Erreur TTS sur le morceau {i+1}: {e}"}, status_code=500)
                continue # On continue avec les autres morceaux pour l'instant

        if not all_audio_data:
             return JSONResponse(content={"error": "Aucun morceau audio n'a pu être généré."}, status_code=500)

        # Concaténer les données audio
        final_audio_data = np.concatenate(all_audio_data)

        # Sauvegarder le fichier audio final
        # Utiliser une partie du nom original mais s'assurer qu'il est unique si nécessaire
        output_filename = f"{os.path.splitext(file.filename)[0]}_first_5_pages.wav"
        output_path = os.path.join(audio_dir, output_filename)
        sf.write(output_path, final_audio_data, samplerate) # Utiliser le samplerate du dernier chunk (devrait être le même)

        # Construire l'URL d'accès au fichier audio
        audio_url = f"/static/audio/{output_filename}"
        return JSONResponse(content={"audio_url": audio_url})

    finally:
        # Nettoyer les fichiers temporaires
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
                print(f"Removed temp file: {temp_file}")
            except OSError as e:
                print(f"Error removing temp file {temp_file}: {e}")
        # Optionnel: supprimer le dossier temp s'il est vide
        try:
            if not os.listdir(temp_dir):
                os.rmdir(temp_dir)
        except OSError as e:
            print(f"Error removing temp directory {temp_dir}: {e}")
