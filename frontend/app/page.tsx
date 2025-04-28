"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.warn("Speech Synthesis not supported by this browser.");
      return;
    }

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoiceName) {
        const defaultVoice =
          availableVoices.find((v) => v.lang.startsWith("fr")) ||
          availableVoices[0];
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };

    loadVoices();

    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
      synth.cancel();
    };
  }, [selectedVoiceName]);

  const handleClick = () => {
    const synth = window.speechSynthesis;
    if (!text.trim() || !synth) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice = voices.find((v) => v.name === selectedVoiceName);
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`Voice "${selectedVoiceName}" not found. Using default.`);
    }

    synth.speak(utterance);
  };

  return (
    <div className="flex pt-16 gap-16 flex-col items-center justify-start min-h-screen px-4">
      <h1 className="text-4xl font-bold text-center">
        Entrez votre texte, il sera lu à voix haute
      </h1>

      <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4">
        {voices.length > 0 ? (
          <select
            className="border-2 border-gray-300 rounded-md p-2 w-full"
            name="voiceSelect"
            id="voiceSelect"
            value={selectedVoiceName}
            onChange={(e) => setSelectedVoiceName(e.target.value)}
            aria-label="Select voice"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        ) : (
          <p>Chargement des voix...</p>
        )}
        <Textarea
          className="w-full h-48"
          placeholder="Entrez votre texte ici..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Text input for speech"
        />
        <Button
          className="bg-blue-500 text-white cursor-pointer px-6 py-2 rounded-md"
          aria-label="Lire à voix haute"
          disabled={!text.trim() || voices.length === 0}
          onClick={handleClick}
        >
          Lire à voix haute
        </Button>
      </div>
    </div>
  );
}
