import React, { useRef } from "react";

interface UploadInputProps {
  files: File[];
  onFilesChange?: (files: File[]) => void;
}

export default function UploadInput({
  files,
  onFilesChange,
}: UploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const allFiles = [...files, ...newFiles];
    const uniqueFiles = Array.from(
      new Map(allFiles.map((f) => [f.name + f.size, f])).values()
    );
    onFilesChange?.(uniqueFiles);
    e.target.value = "";
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleClick}
        className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Select PDF files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
