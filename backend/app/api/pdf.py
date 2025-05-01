from fastapi import APIRouter, Depends, File, UploadFile
from pathlib import Path

from app.services.pdf import PDFService
from app.models.pdf import PDFMetadata

# Créer le routeur
router = APIRouter(prefix="/pdf", tags=["pdf"])

# Dépendance pour obtenir le service PDF
def get_pdf_service():
    preview_dir = Path("uploads/previews")
    return PDFService(preview_dir)

@router.post("/upload", response_model=PDFMetadata)
async def upload_pdf(
    file: UploadFile = File(...),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """
    Upload et traite un fichier PDF.
    Retourne les métadonnées du PDF et génère une prévisualisation.
    """
    return await pdf_service.process_pdf(file) 