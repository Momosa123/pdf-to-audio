"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import UploadInput from "@/components/UploadInput";
import PDFPreview from "@/components/PDFPreview";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);

  // Ajout pour la prévisualisation PDF
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCancel = () => {
    setShowPreview(false);
    setSelectedFile(null);
  };

  const handleConfirm = async () => {
    setShowPreview(false);
    if (selectedFile) {
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("http://localhost:8000/api/upload-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload du PDF");
        }

        const metadata = await response.json();
        console.log("PDF uploadé avec succès:", metadata);
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de l'upload du PDF. Veuillez réessayer.");
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    }
  };

  return (
    <div className="flex pt-16 gap-16 flex-col items-center justify-start min-h-screen px-4">
      <h1 className="text-4xl font-bold text-center">
        Entrez votre texte, il sera lu à voix haute
      </h1>

      <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4">
        <UploadInput
          onFileChange={(file) => {
            setSelectedFile(file);
            setShowPreview(true);
          }}
        />

        {/* Modale de prévisualisation et boutons Annuler/Confirmer */}
        {selectedFile && (
          <>
            <PDFPreview
              file={selectedFile}
              isOpen={showPreview}
              onClose={handleCancel}
            />
            {showPreview && (
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button onClick={handleConfirm}>
                  Confirmer et générer l&apos;audio
                </Button>
              </div>
            )}
          </>
        )}

        {isUploading && <p>Upload en cours...</p>}
      </div>
    </div>
  );
}
