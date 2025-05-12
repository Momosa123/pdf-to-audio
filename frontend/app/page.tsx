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

  const updateFileState = useCallback(
    (fileName: string, newState: Partial<FileProcessingState>) => {
      setFileStates((prev) => ({
        ...prev,
        [fileName]: {
          ...(prev[fileName] || { status: "idle" }),
          ...newState,
        },
      }));
    },
    [], // setFileStates is stable
  );

  const pollTaskStatus = useCallback(
    async (taskId: string, fileName: string) => {
      // Helper to clear interval using functional update
      const stopAndRemoveInterval = () => {
        setTaskPollIntervals((prevIntervals) => {
          const intervalIdToClear = prevIntervals[taskId];
          if (intervalIdToClear) {
            clearInterval(intervalIdToClear);
            console.log(
              `Polling definitively stopped for task ${taskId} (via functional update)`,
            );
            // Create a new object for the state update
            const newIntervals = { ...prevIntervals };
            delete newIntervals[taskId];
            return newIntervals;
          }
          // If the intervalId was not found, return the previous state unchanged
          return prevIntervals;
        });
      };

      // Initial check using fileStates from closure.
      // This fileStates is as "fresh" as this instance of pollTaskStatus.
      // If file is already marked success/error locally, try to stop.
      const currentFileLocalState = fileStates[fileName];
      if (
        currentFileLocalState &&
        (currentFileLocalState.status === "success" ||
          currentFileLocalState.status === "error")
      ) {
        console.log(
          `Task ${taskId} for file ${fileName} already completed locally with status: ${currentFileLocalState.status}. Attempting to stop poll.`,
        );
        stopAndRemoveInterval();
        return;
      }

      try {
        const statusResponse = await getTaskStatus(taskId);
        console.log(
          "Status Response from backend:",
          statusResponse,
          "for file:",
          fileName,
          "Task ID:",
          taskId,
        );

        if (statusResponse.status === "SUCCESS") {
          console.log(`Task ${taskId} SUCCESS from API. Stopping poll.`);
          stopAndRemoveInterval();
          const audioPath = statusResponse.result;
          const NEXT_PUBLIC_API_URL_LOCAL =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const finalAudioUrl =
            audioPath && !audioPath.startsWith("http")
              ? `${NEXT_PUBLIC_API_URL_LOCAL}${audioPath}`
              : audioPath;
          console.log("Constructed finalAudioUrl:", finalAudioUrl);

          updateFileState(fileName, {
            status: "success",
            audioUrl: finalAudioUrl || undefined,
            taskId: statusResponse.task_id,
          });
          console.log(
            "File state updated to success for:",
            fileName,
            "with URL:",
            finalAudioUrl,
          );
        } else if (statusResponse.status === "FAILURE") {
          console.log(`Task ${taskId} FAILURE from API. Stopping poll.`);
          stopAndRemoveInterval();
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
          // Task is still processing, update state but continue polling
          updateFileState(fileName, {
            status: "processing",
            taskId: statusResponse.task_id,
          });
        } else {
          // Unexpected status
          console.log(
            `Task ${taskId} UNEXPECTED status from API (${statusResponse.status}). Stopping poll.`,
          );
          stopAndRemoveInterval();
          updateFileState(fileName, {
            status: "error",
            errorMessage: `État de tâche inattendu: ${statusResponse.status}`,
            taskId: statusResponse.task_id,
          });
        }
      } catch (error) {
        console.error(`Polling error for task ${taskId} on file ${fileName}:`, error);
        stopAndRemoveInterval(); // Stop polling on any error during API call
        const existingState = fileStates[fileName];
        updateFileState(fileName, {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Erreur de polling.",
          taskId: existingState?.taskId || taskId, // Preserve existing taskId if available
        });
      }
    },
    [fileStates, updateFileState], // updateFileState is a dependency
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
      const submitResponse = await submitPdfTask(fileToUpload);
      updateFileState(fileToUpload.name, {
        status: "processing",
        taskId: submitResponse.task_id,
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
