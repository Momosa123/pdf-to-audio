"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const utterance = new SpeechSynthesisUtterance();
  const voices = window.speechSynthesis.getVoices();

  const handleClick = () => {
    window.speechSynthesis.cancel();
    utterance.text = text;
    utterance.voice = voices.find((v) => v.name === voice) || null;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex pt-16 gap-32 flex-col items-center justify-start h-screen">
      <h1 className="text-4xl font-bold">
        Entrez votre texte il sera lu à voix haute
      </h1>

      <div className="flex w-1/3 h-1/3 flex-col items-center justify-center gap-4">
        <select
          className="border-2 border-gray-300 rounded-md p-2"
          name=""
          id=""
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        >
          {voices.map((voice) => (
            <option value={voice.name}>{voice.name}</option>
          ))}
        </select>
        <Textarea
          className="w-full h-full"
          placeholder="Entrez votre texte"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          className="bg-blue-500 text-white cursor-pointer"
          aria-label="Lire à voix haute"
          disabled={!text.trim()}
          onClick={handleClick}
        >
          Lire à voix haute
        </Button>
      </div>
    </div>
  );
}
