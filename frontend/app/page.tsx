"use client";

import { useState } from "react";
import UploadInput from "@/components/UploadInput";
import PDFThumbnailCard from "@/components/PDFThumbnailCard";
import PDFPreview from "@/components/PDFPreview";
import { pdfjs } from "react-pdf";

// Configure le worker pour react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Prend le fichier à annuler en argument
  const handleCancel = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  // Prend le fichier à confirmer/uploader en argument
  const handleConfirm = async (fileToUpload: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const response = await fetch("http://127.0.0.1:8000/api/pdf-to-audio", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Erreur lors de l'upload de ${fileToUpload.name}`);
      }
      const metadata = await response.json();
      console.log(`PDF ${fileToUpload.name} uploadé avec succès:`, metadata);
      // Optionnel : Retire le fichier de la liste après succès
      handleCancel(fileToUpload);
    } catch (error) {
      console.error("Erreur:", error);
      alert(
        `Erreur lors de l'upload de ${fileToUpload.name}. Veuillez réessayer.`
      );
    } finally {
      setIsUploading(false);
      // On ne reset plus selectedFile ici
    }
  };

  // Fonction pour ouvrir la prévisualisation
  const handleThumbnailClick = (file: File) => {
    setPreviewFile(file);
  };

  // Fonction pour fermer la prévisualisation
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return (
    <div className="flex pt-16 gap-8 flex-col items-center justify-start min-h-screen px-4">
      <h1 className="text-4xl font-bold text-center">
        Entrez votre texte, il sera lu à voix haute
      </h1>
      <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4">
        <UploadInput
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files); // Met à jour la liste complète
          }}
        />
      </div>

      {/* Section pour afficher les miniatures */}
      {selectedFiles.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedFiles.map((file) => (
            <PDFThumbnailCard
              key={file.name + file.size} // Clé unique pour chaque carte
              file={file}
              // Passe des fonctions qui appellent les handlers avec le bon fichier
              onConfirm={() => handleConfirm(file)}
              onCancel={() => handleCancel(file)}
              onThumbnailClick={() => handleThumbnailClick(file)}
              // Désactive les boutons si *une* upload est en cours
              isUploading={isUploading}
            />
          ))}
        </div>
      )}

      {/* Prévisualisation du PDF */}
      {previewFile && (
        <PDFPreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={handleClosePreview}
        />
      )}

      {isUploading && <p>Upload en cours...</p>}
    </div>
  );
}
