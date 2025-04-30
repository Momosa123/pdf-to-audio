import React from "react";
import { Document, Page } from "react-pdf";
import { Button } from "@/components/ui/button";
import { X, Check, Loader2, Eye } from "lucide-react";

// Assure-toi que le worker est configuré (peut-être dans un fichier global ou layout)
// pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`; // Ou selon ta config

interface PDFThumbnailCardProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
  onThumbnailClick: () => void;
  isUploading: boolean;
}

const PDFThumbnailCard = ({
  file,
  onConfirm,
  onCancel,
  onThumbnailClick,
  isUploading,
}: PDFThumbnailCardProps) => {
  const [thumbLoading, setThumbLoading] = React.useState(true);

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-md flex flex-col items-center gap-4">
      {/* Miniature cliquable */}
      <div
        className="relative w-32 h-40 border rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onThumbnailClick}
        title="Cliquez pour agrandir"
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
          error={
            <div className="p-2 text-xs text-red-500">Erreur chargement</div>
          }
        >
          {/* Ajuste la largeur pour une bonne miniature */}
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

      {/* Nom du fichier */}
      <p className="text-sm font-medium text-gray-700 truncate w-full text-center">
        {file.name}
      </p>

      {/* Boutons d'action */}
      <div className="flex justify-center gap-3 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
          onClick={onCancel}
          disabled={isUploading}
        >
          <X className="w-4 h-4" /> Annuler
        </Button>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
          onClick={onConfirm}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isUploading ? "Génération..." : "Générer l'audio"}
        </Button>
      </div>
    </div>
  );
};

export default PDFThumbnailCard;
