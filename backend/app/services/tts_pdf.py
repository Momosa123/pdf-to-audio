import logging
import time

from TTS.api import TTS

# Configuration du logger pour cette fonction
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Load the multilingual XTTS v2 model
model_name = "tts_models/en/ljspeech/vits"
tts = TTS(model_name=model_name)


def generate_audio_coqui(text: str, output_path: str):
    """
    Generates an audio file from the given text and saves it to the specified location.
    """
    logger.info(
        f"[generate_audio_coqui] Attempting to generate audio for text: "
        f"'{text[:30]}...' to path: {output_path}"
    )
    start_time = time.time()
    try:
        tts.tts_to_file(text=text, file_path=output_path)
        end_time = time.time()
        logger.info(
            f"[generate_audio_coqui] Successfully generated audio to {output_path} "
            f"in {end_time - start_time:.2f} seconds."
        )
        return output_path
    except Exception as e:
        end_time = time.time()
        logger.error(
            f"[generate_audio_coqui] Error during TTS generation to {output_path} "
            f"after {end_time - start_time:.2f} seconds: {e}",
            exc_info=True,
        )
        # Propager l'exception pour que la tâche Celery puisse la voir aussi
        raise
