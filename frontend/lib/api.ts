const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function convertPdfToAudio(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/pdf-to-audio`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Erreur lors de l'upload de ${file.name}`);
  }
  return response.blob();
}
