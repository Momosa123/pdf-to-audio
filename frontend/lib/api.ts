const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Ancienne fonction, mise en commentaire car le flux a changé avec Celery
/*
export async function convertPdfToAudio(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/api/pdf-to-audio`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Erreur lors de l'upload de ${file.name}`);
  }
  return response.blob();
}
*/

// Nouvelles fonctions et types pour le flux Celery
export interface SubmitTaskResponse {
  task_id: string;
  message: string;
}

export async function submitPdfTask(file: File): Promise<SubmitTaskResponse> {
  const formData = new FormData();
  formData.append("file", file);
  // Note: l'endpoint a été changé par l'utilisateur dans pdf_router.py vers /submit_pdf_to_audio_task
  const response = await fetch(`${API_BASE_URL}/api/submit_pdf_to_audio_task`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Erreur lors de la soumission de la tâche." }));
    throw new Error(
      errorData.detail || `Erreur lors de la soumission: ${response.statusText}`,
    );
  }
  return response.json();
}

export interface TaskStatusResponse {
  task_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "RETRY" | "REVOKED";
  result?: string | null; // Chemin de l'URL de l'audio si SUCCESS
  error_info?: string | null; // Info sur l'erreur si FAILURE
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/task-status/${taskId}`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Erreur lors de la récupération du statut." }));
    throw new Error(
      errorData.detail ||
        `Erreur lors de la récupération du statut: ${response.statusText}`,
    );
  }
  return response.json();
}
