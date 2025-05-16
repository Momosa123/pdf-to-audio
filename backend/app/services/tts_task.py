import os
import time
import uuid

import numpy as np
import soundfile as sf

from app.libs.utils import clean_text

from ..celery_app import celery_app
from .extract_pdf import PDFService, chunk_text
from .tts_pdf import generate_audio_coqui


@celery_app.task
def pdf_to_audio_task(pdf_bytes: bytes, output_dir: str):
    """
    Extract text from PDF and generate audio using Coqui TTS.
    Saves the audio file to output_dir and returns its path.

    Args:
        pdf_bytes: bytes of the PDF file
        output_dir: directory to save the audio file
    """
    task_start_time = time.time()
    print("[TTS_TASK] Task started.")

    pdf_service = PDFService()
    extraction_start_time = time.time()
    text = pdf_service.extract_first_five_pages_text(pdf_bytes)
    print(
        f"[TTS_TASK] Text extraction took "
        f"{time.time() - extraction_start_time:.2f} seconds."
    )

    cleaning_start_time = time.time()
    cleaned_text = clean_text(text)
    print(
        f"[TTS_TASK] Text cleaning took "
        f"{time.time() - cleaning_start_time:.2f} seconds."
    )

    if not cleaned_text:
        print("[TTS_TASK] No text found after cleaning.")
        raise ValueError("No text found in the first 5 pages of the PDF.")

    temp_files = []
    all_audio_data = []
    samplerate = 22050  # default value, will be overwritten by the first reading

    try:
        chunking_start_time = time.time()
        text_chunks = list(chunk_text(cleaned_text))
        print(
            f"[TTS_TASK] Text chunking took "
            f"{time.time() - chunking_start_time:.2f} seconds. "
            f"Found {len(text_chunks)} chunks."
        )

        for i, chunk in enumerate(text_chunks):
            chunk_process_start_time = time.time()
            print(f"[TTS_TASK] Processing chunk {i + 1}/{len(text_chunks)}.")
            if not chunk.strip():
                print(f"[TTS_TASK] Chunk {i + 1} is empty, skipping.")
                continue
            temp_filename = f"{uuid.uuid4()}.wav"
            temp_filepath = os.path.join("/tmp", temp_filename)
            try:
                print(
                    f"[TTS_TASK] Generating audio for chunk {i + 1} into "
                    f"{temp_filepath}..."
                )
                audio_gen_start_time = time.time()
                generate_audio_coqui(chunk.strip(), temp_filepath)
                print(
                    f"[TTS_TASK] Audio generation for chunk {i + 1} took "
                    f"{time.time() - audio_gen_start_time:.2f} seconds."
                )

                audio_data, samplerate_read = sf.read(temp_filepath)
                if audio_data.size > 0:
                    all_audio_data.append(audio_data)
                    samplerate = samplerate_read
                temp_files.append(temp_filepath)
            except Exception as e:
                print(f"[TTS_TASK] Error generating audio for chunk {i + 1}: {e}")
                continue
            print(
                f"[TTS_TASK] Chunk {i + 1} processing took "
                f"{time.time() - chunk_process_start_time:.2f} seconds."
            )

        if not all_audio_data:
            print("[TTS_TASK] No audio pieces could be generated.")
            raise RuntimeError("No audio piece could be generated.")

        concatenation_start_time = time.time()
        final_audio_data = np.concatenate(all_audio_data)
        print(
            f"[TTS_TASK] Audio concatenation took "
            f"{time.time() - concatenation_start_time:.2f} seconds."
        )

        os.makedirs(output_dir, exist_ok=True)

        final_audio_filename = f"{uuid.uuid4()}_final.wav"
        final_audio_filepath = os.path.join(output_dir, final_audio_filename)

        save_start_time = time.time()
        sf.write(final_audio_filepath, final_audio_data, samplerate, format="WAV")
        print(
            f"[TTS_TASK] Saving final audio took "
            f"{time.time() - save_start_time:.2f} seconds. "
            f"Path: {final_audio_filepath}"
        )

        print(
            f"[TTS_TASK] Task completed in "
            f"{time.time() - task_start_time:.2f} seconds."
        )
        return final_audio_filepath

    finally:
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    print(f"Removed temp file: {temp_file}")
            except OSError as e:
                print(f"Error removing temp file {temp_file}: {e}")
