from TTS.api import TTS

# Initialiser le modèle TTS
# Remplace "tts_models/en/ljspeech/tacotron2-DDC" par le modèle que tu souhaites utiliser
# Tu peux lister les modèles disponibles avec TTS().list_models()
tts = TTS(model_name="tts_models/en/ljspeech/vits")

def generate_audio_coqui(text: str, output_path: str):
    """
    Génère un fichier audio à partir du texte donné et le sauvegarde à l'emplacement spécifié.
    """
    # Générer et sauvegarder l'audio
    tts.tts_to_file(text=text, file_path=output_path)
    return output_path
