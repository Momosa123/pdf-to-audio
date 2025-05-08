"use client";
import { useState } from "react";
import { pdfjs } from "react-pdf";

import PDFPreview from "@/components/PDFPreview";
import PDFThumbnailCard from "@/components/PDFThumbnailCard";
import UploadInput from "@/components/UploadInput";

// configure the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [audioUrls, setAudioUrls] = useState<{ [filename: string]: string }>({});

  // Takes the file to cancel as an argument
  const handleCancel = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  // Takes the file to confirm/upload as an argument
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
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrls((prev) => ({
        ...prev,
        [fileToUpload.name]: url,
      }));
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors de l'upload de ${fileToUpload.name}. Veuillez réessayer.`);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to open the preview
  const handleThumbnailClick = (file: File) => {
    setPreviewFile(file);
  };

  // Function to close the preview
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return (
    <div className="flex pt-16 gap-8 flex-col items-center justify-start min-h-screen px-4">
      <h1 className="text-4xl font-bold text-center">
        Upload a PDF file to get a voiceover
      </h1>
      <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4">
        <UploadInput
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files); // Updates the complete list
          }}
        />
      </div>

      {/* Section to display the thumbnails */}
      {selectedFiles.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedFiles.map((file) => (
            <PDFThumbnailCard
              key={file.name + file.size}
              file={file}
              audioUrl={audioUrls[file.name] || null}
              onConfirm={() => handleConfirm(file)}
              onCancel={() => handleCancel(file)}
              onThumbnailClick={() => handleThumbnailClick(file)}
              isUploading={isUploading}
            />
          ))}
        </div>
      )}

      {/* PDF preview */}
      {previewFile && (
        <PDFPreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={handleClosePreview}
        />
      )}

      {isUploading && <p>Uploading...</p>}
    </div>
  );
}
