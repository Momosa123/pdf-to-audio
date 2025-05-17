import { useCallback, useEffect, useState } from "react";

import { PDF_POLLING_INTERVAL } from "@/constants/pdf";
import { getTaskStatus, submitPdfTask } from "@/lib/api";
import { FileProcessingState } from "@/types/pdf";

export default function usePdfTasks() {
  const [fileStates, setFileStates] = useState<Record<string, FileProcessingState>>({});
  const [taskPollIntervals, setTaskPollIntervals] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  // Nettoyage des intervalles
  useEffect(() => {
    return () => {
      Object.values(taskPollIntervals).forEach(clearInterval);
    };
  }, [taskPollIntervals]);

  // Mise à jour de l'état d'un fichier
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
    [],
  );

  // Polling function to get the state of an audio processing
  const pollTaskStatus = useCallback(
    async (taskId: string, fileName: string) => {
      // Helper to clear interval using functional update
      const stopAndRemoveInterval = () => {
        setTaskPollIntervals((prevIntervals) => {
          const intervalIdToClear = prevIntervals[taskId];
          if (intervalIdToClear) {
            clearInterval(intervalIdToClear);
            console.log(
              `Polling definitely stopped for task ${taskId} (via function update)`,
            );

            // Create a new object for the state update
            const newIntervals = { ...prevIntervals };
            delete newIntervals[taskId];
            return newIntervals;
          }
          //If the intervalId was not found, return the previous state unchanged
          return prevIntervals;
        });
      };
      const currentFileLocalState = fileStates[fileName];
      if (
        currentFileLocalState &&
        (currentFileLocalState.status === "success" ||
          currentFileLocalState.status === "error")
      ) {
        console.log(
          `Task ${taskId} for file ${fileName} already completed locally with status: ${currentFileLocalState.status}`,
        );
        stopAndRemoveInterval();
        return;
      }
      try {
        const statusResponse = await getTaskStatus(taskId);
        if (statusResponse.status === "SUCCESS") {
          console.log(`Task ${taskId} SUCCESS from API. Stop poll`);
          stopAndRemoveInterval();
          const audioPath = statusResponse.result;
          const NEXT_PUBLIC_API_URL_LOCAL =
            process.env.NEXT_PUBLIC_API_URL || "http://127.00.1.8000";
          const finalAudioUrl =
            audioPath && !audioPath.startsWith("http")
              ? `${NEXT_PUBLIC_API_URL_LOCAL}${audioPath}`
              : audioPath;
          updateFileState(fileName, {
            status: "success",
            audioUrl: finalAudioUrl || undefined,
            taskId: statusResponse.task_id,
          });
        } else if (statusResponse.status === "FAILURE") {
          stopAndRemoveInterval();
          updateFileState(fileName, {
            status: "error",
            errorMessage: statusResponse.error_info || "la tâche a échoué",
            taskId: statusResponse.task_id,
          });
        } else if (
          statusResponse.status === "PENDING" ||
          statusResponse.status === "STARTED" ||
          statusResponse.status === "RETRY"
        ) {
          //Task is still processing, update state but continue polling
          updateFileState(fileName, {
            status: "processing",
            taskId: statusResponse.task_id,
          });
        } else {
          console.log(
            `Task ${taskId} UNEXPECTED status from API (${statusResponse.status})`,
          );
          stopAndRemoveInterval();
          updateFileState(fileName, {
            status: "error",
            errorMessage: `État de tâche innatendu: ${statusResponse.status}`,
            taskId: statusResponse.task_id,
          });
        }
      } catch (error) {
        console.error(`Polling error for task ${taskId} on file ${fileName}`);
        stopAndRemoveInterval();
        const existingState = fileStates[fileName];
        updateFileState(fileName, {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Error when polling",
          taskId: existingState?.taskId || taskId,
        });
      }
    },

    [fileStates, updateFileState],
  );

  // Fonction pour annuler un fichier
  const cancelFile = useCallback(
    (fileToRemove: File) => {
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
    },
    [fileStates, taskPollIntervals],
  );

  // Fonction pour uploader un fichier
  const uploadFile = useCallback(
    async (fileToUpload: File) => {
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
        }, PDF_POLLING_INTERVAL);
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
    },
    [updateFileState, pollTaskStatus],
  );

  return {
    fileStates,
    cancelFile,
    uploadFile,
  };
}
