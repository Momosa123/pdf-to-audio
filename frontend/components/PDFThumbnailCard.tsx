import { Check, Eye, Loader2, X } from "lucide-react";
import React from "react";
import { Document, Page } from "react-pdf";

import { Button } from "@/components/ui/Button";

// Ensure the worker is configured (maybe in a global or layout file)
// pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`; // Or according to your config

interface PDFThumbnailCardProps {
  file: File;
  audioUrl: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onThumbnailClick: () => void;
  isUploading: boolean;
}

const PDFThumbnailCard = ({
  file,
  audioUrl,
  onConfirm,
  onCancel,
  onThumbnailClick,
  isUploading,
}: PDFThumbnailCardProps) => {
  const [thumbLoading, setThumbLoading] = React.useState(true);
  const [showPlayer, setShowPlayer] = React.useState(false);

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-md flex flex-col items-center gap-4">
      {/* Miniature cliquable avec bouton X en haut à droite */}
      <div className="relative w-32 h-40 border rounded overflow-hidden">
        <button
          className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
          onClick={onCancel}
          disabled={isUploading}
          aria-label="Supprimer"
        >
          <X className="cursor-pointer w-4 h-4 text-gray-600" />
        </button>
        <div
          className={`w-full h-full ${
            audioUrl ? "" : "cursor-pointer hover:opacity-80 transition-opacity"
          }`}
          onClick={audioUrl ? undefined : onThumbnailClick}
          title={audioUrl ? undefined : "Cliquez pour agrandir"}
        >
          {thumbLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
          <Document
            file={file}
            onLoadSuccess={() => setThumbLoading(false)}
            loading="" // Disable default loader
            error={<div className="p-2 text-xs text-red-500">Erreur chargement</div>}
          >
            <Page
              pageNumber={1}
              width={128}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-opacity opacity-0 hover:opacity-100">
            <Eye className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* File name */}
      <p className="text-sm font-medium text-gray-700 truncate w-full text-center">
        {file.name}
      </p>

      {/* Audio player or generation/listen button */}
      {audioUrl ? (
        showPlayer ? (
          <audio src={audioUrl} controls autoPlay className="w-36" />
        ) : (
          <Button
            size="sm"
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white flex items-center gap-1"
            onClick={() => setShowPlayer(true)}
          >
            ▶️ Listen
          </Button>
        )
      ) : (
        <Button
          size="sm"
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white flex items-center gap-1"
          onClick={onConfirm}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isUploading ? "Generating..." : "Generate audio"}
        </Button>
      )}
    </div>
  );
};

export default PDFThumbnailCard;
