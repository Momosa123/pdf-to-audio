import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# Get the OpenAI API key from environment variables
api_key = os.getenv("OPENAI_API_KEY")

# Pass the API key to the OpenAI client
client = OpenAI(api_key=api_key)


def generate_audio_openai(text: str, output_path: str):
    """
    Uses the OpenAI API to generate an audio file from the given text
    and saves it to the specified location.
    """
    output_path_obj = Path(output_path)

    try:
        with client.audio.speech.with_streaming_response.create(
            model="tts-1", voice="coral", input=text, response_format="wav"
        ) as response:
            response.stream_to_file(output_path_obj)
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        raise

    return str(output_path_obj)
