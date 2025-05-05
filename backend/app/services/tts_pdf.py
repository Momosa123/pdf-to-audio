from TTS.api import TTS

# Load the multilingual XTTS v2 model
model_name = "tts_models/en/ljspeech/vits"
tts = TTS(model_name=model_name)

def generate_audio_coqui(text: str, output_path: str):
    """
    Generates an audio file from the given text and saves it to the specified location.
    """
    tts.tts_to_file(text=text, file_path=output_path)
    return output_path
