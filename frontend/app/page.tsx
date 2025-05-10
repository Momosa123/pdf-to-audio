"use client";
import { useCallback, useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

import PDFPreview from "@/components/PDFPreview";
import PDFThumbnailCard from "@/components/PDFThumbnailCard";
import UploadInput from "@/components/UploadInput";
import { getTaskStatus, submitPdfTask } from "@/lib/api";

// configure the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface FileProcessingState {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  taskId?: string;
  audioUrl?: string;
  errorMessage?: string;
}

export default function Home() {
  const [fileStates, setFileStates] = useState<Record<string, FileProcessingState>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [taskPollIntervals, setTaskPollIntervals] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  const updateFileState = (
    fileName: string,
    newState: Partial<FileProcessingState>,
  ) => {
    setFileStates((prev) => ({
      ...prev,
      [fileName]: {
        ...(prev[fileName] || { status: "idle" }),
        ...newState,
      },
    }));
  };

  const pollTaskStatus = useCallback(
    async (taskId: string, fileName: string) => {
      try {
        const statusResponse = await getTaskStatus(taskId);
        // updateFileState(fileName, {
        //   status: "processing", // Cette ligne est redondante si la tâche est déjà terminale
        //   taskId: statusResponse.task_id, // taskId est déjà connu
        // });

        if (statusResponse.status === "SUCCESS") {
          if (taskPollIntervals[taskId]) {
            clearInterval(taskPollIntervals[taskId]);
            setTaskPollIntervals((prev) => {
              const newIntervals = { ...prev };
              delete newIntervals[taskId];
              return newIntervals;
            });
          }
          const audioPath = statusResponse.result;
          // API_BASE_URL est maintenant géré dans api.ts, donc pas besoin de le référencer ici directement
          // si les URLs retournées par le backend sont complètes ou si api.ts les construit.
          // Pour l'instant, on suppose que statusResponse.result est soit une URL complète, soit une URL relative qui sera préfixée dans api.ts ou est déjà complète.
          // Si le backend retourne /static/audio/file.wav, il faut le préfixer. La logique actuelle dans api.ts ne préfixe pas.
          // La logique de préfixage était dans page.tsx, il faut s'assurer qu'elle est correcte.
          // Pour l'instant, je vais la garder ici, mais elle devrait idéalement être gérée de manière centralisée.
          const NEXT_PUBLIC_API_URL_LOCAL =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const finalAudioUrl =
            audioPath && !audioPath.startsWith("http")
              ? `${NEXT_PUBLIC_API_URL_LOCAL}${audioPath}` // Utilise la variable locale pour le préfixe
              : audioPath;

          updateFileState(fileName, {
            status: "success",
            audioUrl: finalAudioUrl || undefined,
            taskId: statusResponse.task_id,
          });
        } else if (statusResponse.status === "FAILURE") {
          if (taskPollIntervals[taskId]) {
            clearInterval(taskPollIntervals[taskId]);
            setTaskPollIntervals((prev) => {
              const newIntervals = { ...prev };
              delete newIntervals[taskId];
              return newIntervals;
            });
          }
          updateFileState(fileName, {
            status: "error",
            errorMessage: statusResponse.error_info || "La tâche a échoué.",
            taskId: statusResponse.task_id,
          });
        } else if (
          statusResponse.status === "PENDING" ||
          statusResponse.status === "STARTED" ||
          statusResponse.status === "RETRY"
        ) {
          updateFileState(fileName, {
            // Mettre à jour le statut en processing si la tâche n'est pas encore terminée
            status: "processing",
            taskId: statusResponse.task_id,
          });
        } else {
          if (taskPollIntervals[taskId]) {
            clearInterval(taskPollIntervals[taskId]);
            setTaskPollIntervals((prev) => {
              const newIntervals = { ...prev };
              delete newIntervals[taskId];
              return newIntervals;
            });
          }
          updateFileState(fileName, {
            status: "error",
            errorMessage: `État de tâche inattendu: ${statusResponse.status}`,
            taskId: statusResponse.task_id,
          });
        }
      } catch (error) {
        console.error("Erreur de polling:", error);
        if (taskPollIntervals[taskId]) {
          clearInterval(taskPollIntervals[taskId]);
          setTaskPollIntervals((prev) => {
            const newIntervals = { ...prev };
            delete newIntervals[taskId];
            return newIntervals;
          });
        }
        const existingState = fileStates[fileName];
        updateFileState(fileName, {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Erreur de polling.",
          taskId: existingState?.taskId || taskId,
        });
      }
    },
    [taskPollIntervals, fileStates],
  );

  useEffect(() => {
    return () => {
      Object.values(taskPollIntervals).forEach(clearInterval);
    };
  }, [taskPollIntervals]);

  const handleCancel = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== fileToRemove));
    const currentFileState = fileStates[fileToRemove.name];
    if (currentFileState?.taskId && taskPollIntervals[currentFileState.taskId]) {
      clearInterval(taskPollIntervals[currentFileState.taskId]);
      setTaskPollIntervals((prev) => {
        const newIntervals = { ...prev };
        delete newIntervals[currentFileState.taskId!];
        return newIntervals;
      });
    }
    setFileStates((prev) => {
      const newStates = { ...prev };
      delete newStates[fileToRemove.name];
      return newStates;
    });
  };

  const handleConfirm = async (fileToUpload: File) => {
    updateFileState(fileToUpload.name, {
      status: "uploading",
      taskId: undefined,
      audioUrl: undefined,
      errorMessage: undefined,
    });
    try {
      // submitPdfTask est maintenant importé
      const submitResponse = await submitPdfTask(fileToUpload);
      updateFileState(fileToUpload.name, {
        status: "processing",
        taskId: submitResponse.task_id, // Utilise task_id de la réponse
      });

      const intervalId = setInterval(() => {
        pollTaskStatus(submitResponse.task_id, fileToUpload.name);
      }, 3000);
      setTaskPollIntervals((prev) => ({
        ...prev,
        [submitResponse.task_id]: intervalId,
      }));
    } catch (error) {
      console.error("Erreur:", error);
      updateFileState(fileToUpload.name, {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Erreur d'upload.",
      });
    }
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
            const newFileStatesToAdd: Record<string, FileProcessingState> = {};
            newFiles.forEach((file) => {
              if (!fileStates[file.name]) {
                newFileStatesToAdd[file.name] = { status: "idle" };
              }
            });
            setFileStates((prev) => ({ ...prev, ...newFileStatesToAdd }));
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
                isUploading={
                  currentFileState.status === "uploading" ||
                  currentFileState.status === "processing"
                }
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
