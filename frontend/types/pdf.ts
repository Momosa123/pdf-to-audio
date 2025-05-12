import { FILE_STATUS, TASK_STATUS } from "@/constants/pdf";

export interface FileProcessingState {
  status:
    | typeof FILE_STATUS.IDLE
    | typeof FILE_STATUS.UPLOADING
    | typeof FILE_STATUS.PROCESSING
    | typeof FILE_STATUS.SUCCESS
    | typeof FILE_STATUS.ERROR;
  taskId?: string;
  audioUrl?: string;
  errorMessage?: string;
}
export interface TaskStatusResponse {
  task_id: string;
  status:
    | typeof TASK_STATUS.PENDING
    | typeof TASK_STATUS.STARTED
    | typeof TASK_STATUS.SUCCESS
    | typeof TASK_STATUS.FAILURE
    | typeof TASK_STATUS.RETRY;
  result?: string | null; // Chemin de l'URL de l'audio si SUCCESS
  error_info?: string | null; // Info sur l'erreur si FAILURE
}
export interface SubmitTaskResponse {
  task_id: string;
  message: string;
}
