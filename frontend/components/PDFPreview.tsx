import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";

// Configuration de pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PDFPreviewProps {
  file: File;
  isOpen: boolean;
  onClose: () => void;
}

const PDFPreview = ({ file, isOpen, onClose }: PDFPreviewProps) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prévisualisation du PDF</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {loading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement du PDF...</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              aria-label="Page précédente"
            >
              <ChevronLeft className="cursor-pointer" />
            </button>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-h-[70vh] overflow-auto"
            >
              <Page pageNumber={pageNumber} width={600} />
            </Document>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              aria-label="Page suivante"
            >
              <ChevronRight className="cursor-pointer" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Page {pageNumber} / {numPages}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-2 right-2 p-2 rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-400"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreview;
