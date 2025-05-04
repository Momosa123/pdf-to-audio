import fitz

class PDFService:
    def extract_first_page_text(self, contents: bytes) -> str:
        """Extrait le texte de la première page d'un PDF (depuis des bytes)."""
        doc = fitz.open(stream=contents, filetype="pdf")
        if len(doc) == 0:
            return ""
        page = doc[0]
        text = page.get_text()
        doc.close()
        return text.strip()

    def extract_all_pages_text(self, contents: bytes) -> str:
        """
        Extrait le texte de toutes les pages d'un PDF (depuis des bytes).
        """
        doc = fitz.open(stream=contents, filetype="pdf")
        if len(doc) == 0:
            return ""
        all_text = []
        for page in doc:
            all_text.append(page.get_text())
        doc.close()
        return "\n".join(all_text).strip()

    def extract_first_five_pages_text(self, contents: bytes) -> str:
        """
        Extrait le texte des 5 premières pages d'un PDF (depuis des bytes).
        """
        doc = fitz.open(stream=contents, filetype="pdf")
        if len(doc) == 0:
            return ""
        all_text = []
        for page_number in range(min(5, len(doc))):
            page = doc[page_number]
            all_text.append(page.get_text())
        doc.close()
        return "\n".join(all_text).strip()

def chunk_text(text, separator='\n\n'):
    """
    Découpe le texte en morceaux basés sur un séparateur donné.
    Par défaut, utilise deux sauts de ligne comme séparateur.
    """
    chunks = [chunk for chunk in text.split(separator) if chunk.strip()]
    if not chunks:  # Si le split ne donne rien, on utilise le texte entier (pour les PDF courts)
        chunks = [text]
    return chunks
