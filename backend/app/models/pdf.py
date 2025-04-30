from pydantic import BaseModel
from typing import Optional

class PDFMetadata(BaseModel):
    """Modèle Pydantic pour les métadonnées d'un fichier PDF."""
    filename: str
    page_count: int
    size: int
    preview_url: Optional[str] = None 