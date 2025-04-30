import { Upload } from "lucide-react";
import React, { useRef } from "react";

const UploadInput = ({
  onFileChange,
}: {
  onFileChange: (file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <label
        htmlFor="pdf-upload"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-3 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Cliquez pour télécharger</span> ou
            glissez-déposez
          </p>
          <p className="text-xs text-gray-500">PDF uniquement</p>
        </div>
        <input
          ref={inputRef}
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileChange(file);
              if (inputRef.current) inputRef.current.value = "";
            }
          }}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default UploadInput;
