export const PDF_POLLING_INTERVAL = 3000;

// API URL fallback
export const API_URL_FALLBACK = "http://127.00.1.8000";

// Task status constants
export const TASK_STATUS = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  PENDING: "PENDING",
  STARTED: "STARTED",
  RETRY: "RETRY",
} as const;

// File processing status constants
export const FILE_STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR: "error",
} as const;
