"use client";
import { useState } from "react";
import { pdfjs } from "react-pdf";

import PDFPreview from "@/components/PDFPreview";
import PDFThumbnailCard from "@/components/PDFThumbnailCard";
import UploadInput from "@/components/UploadInput";
import usePdfTasks from "@/hooks/usePdfTasks";

// configure the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const { fileStates, cancelFile, uploadFile } = usePdfTasks();

  const handleCancel = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== fileToRemove));
    cancelFile(fileToRemove);
  };

  const handleConfirm = (fileToUpload: File) => {
    uploadFile(fileToUpload);
  };

  const handleThumbnailClick = (file: File) => {
    setPreviewFile(file);
  };

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
          onFilesChange={(newFiles) => {
            setSelectedFiles(newFiles);
          }}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedFiles.map((file) => {
            const currentFileState = fileStates[file.name] || { status: "idle" };
            return (
              <PDFThumbnailCard
                key={file.name + file.size + (currentFileState.taskId || "")}
                file={file}
                audioUrl={
                  currentFileState.status === "success"
                    ? currentFileState.audioUrl || null
                    : null
                }
                processingStatus={currentFileState.status}
                errorMessage={currentFileState.errorMessage}
                onConfirm={() => handleConfirm(file)}
                onCancel={() => handleCancel(file)}
                onThumbnailClick={() => handleThumbnailClick(file)}
              />
            );
          })}
        </div>
      )}

      {previewFile && (
        <PDFPreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
