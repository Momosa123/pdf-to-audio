from TTS.api import TTS

# Charger le modèle XTTS v2 multilingue
model_name = "tts_models/en/ljspeech/vits"
tts = TTS(model_name=model_name)

def generate_audio_coqui(text: str, output_path: str):
    """
    Génère un fichier audio à partir du texte donné et le sauvegarde à l'emplacement spécifié.
    """
    tts.tts_to_file(text=text, file_path=output_path)
    return output_path
