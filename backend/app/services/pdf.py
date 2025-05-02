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
