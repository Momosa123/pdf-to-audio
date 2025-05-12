import { SubmitTaskResponse, TaskStatusResponse } from "@/types/pdf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
