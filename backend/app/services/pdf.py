import os
from pathlib import Path
import fitz
from fastapi import UploadFile, HTTPException

from app.models.pdf import PDFMetadata

class PDFService:
    def __init__(self, preview_dir: Path):
        self.preview_dir = preview_dir
        self.preview_dir.mkdir(parents=True, exist_ok=True)

    async def process_pdf(self, file: UploadFile) -> PDFMetadata:
        """Traite un fichier PDF uploadé et retourne ses métadonnées."""
        # Vérifier que le fichier est un PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Le fichier doit être un PDF")
        
        try:
            # Lire le contenu du fichier
            contents = await file.read()
            
            # Ouvrir le PDF avec PyMuPDF
            doc = fitz.open(stream=contents, filetype="pdf")
            
            # Générer un nom unique pour la prévisualisation
            preview_filename = f"preview_{os.urandom(8).hex()}.png"
            preview_path = self.preview_dir / preview_filename
            
            # Extraire la première page en PNG
            preview_url = None
            if len(doc) > 0:
                page = doc[0]
                pix = page.get_pixmap()
                pix.save(preview_path)
                preview_url = f"/previews/{preview_filename}"
            
            # Créer l'objet métadonnées
            metadata = PDFMetadata(
                filename=file.filename,
                page_count=len(doc),
                size=len(contents),
                preview_url=preview_url
            )
            
            # Fermer le document
            doc.close()
            
            return metadata
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Erreur lors du traitement du PDF: {str(e)}"
            ) 