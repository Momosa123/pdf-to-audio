from fastapi import APIRouter, File, UploadFile
from fastapi.responses import StreamingResponse, JSONResponse
from app.services.extract_pdf import PDFService, chunk_text
from app.services.tts_pdf import generate_audio_coqui
import numpy as np
import soundfile as sf
import os
import re
import uuid
import io


# Create the router
router = APIRouter(prefix="/api", tags=["pdf"])


def clean_text(text):
    # Removes ONLY SINGLE spaces between consecutive uppercase letters
    # Note: we replace \s+ by a single space ' ' in the regex
    cleaned_text = re.sub(r"(?<=[A-Z]) (?=[A-Z])", "", text)
    # Removes remaining multiple spaces (which could be word separators)
    # and replaces them with a standard single space.
    cleaned_text = re.sub(r"\s{2,}", " ", cleaned_text)
    print(f"Original text: '{text}'")
    print(f"Cleaned text  : '{cleaned_text.strip()}'")
    return cleaned_text.strip()


@router.post("/pdf-to-audio")
async def pdf_to_audio(file: UploadFile = File(...)):
    """
    Converts the first 5 pages of a PDF file to audio and returns the audio directly.
    """
    contents = await file.read()
    pdf_service = PDFService()
    text = pdf_service.extract_first_five_pages_text(contents)
    cleaned_text = clean_text(text)

    if not cleaned_text:
        return JSONResponse(
            content={"error": "No text found in the first 5 pages of the PDF."},
            status_code=400,
        )

    temp_files = []
    all_audio_data = []
    samplerate = 22050  # default value, will be overwritten by the first reading

    try:
        for i, chunk in enumerate(chunk_text(cleaned_text)):
            if not chunk.strip():
                continue
            temp_filename = f"{uuid.uuid4()}.wav"
            temp_filepath = f"/tmp/{temp_filename}"
            try:
                generate_audio_coqui(chunk.strip(), temp_filepath)
                audio_data, samplerate = sf.read(temp_filepath)
                all_audio_data.append(audio_data)
                temp_files.append(temp_filepath)
            except Exception as e:
                print(f"Error generating audio for chunk {i+1}: {e}")
                continue

        if not all_audio_data:
            return JSONResponse(
                content={"error": "No audio piece could be generated."}, status_code=500
            )

        final_audio_data = np.concatenate(all_audio_data)
        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, final_audio_data, samplerate, format="WAV")
        audio_buffer.seek(0)
        return StreamingResponse(audio_buffer, media_type="audio/wav")

    finally:
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
                print(f"Removed temp file: {temp_file}")
            except OSError as e:
                print(f"Error removing temp file {temp_file}: {e}")
