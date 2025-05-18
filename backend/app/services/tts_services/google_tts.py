from google.cloud import texttospeech


def generate_audio_google(text, output_filename="output.wav"):
    """Synthesizes speech from the input string of text.

    Raises:
        FileNotFoundError: If the Google Cloud credentials file is not found.
        google.api_core.exceptions.GoogleAPICallError: For any API-related errors.
    """

    client = texttospeech.TextToSpeechClient()

    try:
        input_text = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Wavenet-D",  # Or another suitable voice
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16  # WAV requires LINEAR16
        )

        response = client.synthesize_speech(
            request=texttospeech.SynthesizeSpeechRequest(
                input=input_text, voice=voice, audio_config=audio_config
            )
        )

        # The response's audio_content is binary.
        with open(output_filename, "wb") as out:
            out.write(response.audio_content)
            print(f'Audio content written to file "{output_filename}"')

        return output_filename

    except Exception as e:
        print(f"An error occurred during speech synthesis: {e}")
        raise  # Re-raise so calling functions know something went wrong
