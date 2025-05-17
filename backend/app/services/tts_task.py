import os
import uuid

import numpy as np
import soundfile as sf

from app.libs.utils import clean_text

from ..celery_app import celery_app
from .extract_pdf import PDFService, chunk_text
from .tts_services.openai_tts import generate_audio_openai


@celery_app.task
def pdf_to_audio_task(pdf_bytes: bytes, output_dir: str):
    """
    Extract text from PDF and generate audio using OpenAI TTS.
    Saves the audio file to output_dir and returns its path.

    Args:
        pdf_bytes: bytes of the PDF file
        output_dir: directory to save the audio file
    """
    pdf_service = PDFService()
    text = pdf_service.extract_first_five_pages_text(pdf_bytes)
    cleaned_text = clean_text(text)

    if not cleaned_text:
        raise ValueError("No text found in the first 5 pages of the PDF.")

    temp_files = []
    all_audio_data = []
    samplerate = 22050  # default value, will be overwritten by the first reading

    try:
        for i, chunk in enumerate(chunk_text(cleaned_text)):
            if not chunk.strip():
                continue
            temp_filename = f"{uuid.uuid4()}.wav"
            temp_filepath = os.path.join("/tmp", temp_filename)
            try:
                generate_audio_openai(chunk.strip(), temp_filepath)
                audio_data, samplerate_read = sf.read(temp_filepath)
                if audio_data.size > 0:
                    all_audio_data.append(audio_data)
                    samplerate = samplerate_read
                temp_files.append(temp_filepath)
            except Exception as e:
                print(f"Error generating audio for chunk {i + 1}: {e}")
                continue

        if not all_audio_data:
            raise RuntimeError("No audio piece could be generated.")

        final_audio_data = np.concatenate(all_audio_data)

        os.makedirs(output_dir, exist_ok=True)

        final_audio_filename = f"{uuid.uuid4()}_final.wav"
        final_audio_filepath = os.path.join(output_dir, final_audio_filename)

        sf.write(final_audio_filepath, final_audio_data, samplerate, format="WAV")

        return final_audio_filepath

    finally:
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    print(f"Removed temp file: {temp_file}")
            except OSError as e:
                print(f"Error removing temp file {temp_file}: {e}")
