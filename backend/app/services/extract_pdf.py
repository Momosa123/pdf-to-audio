import fitz

class PDFService:
    def extract_first_page_text(self, contents: bytes) -> str:
        """Extracts the text from the first page of a PDF (from bytes)."""
        doc = fitz.open(stream=contents, filetype="pdf")
        if len(doc) == 0:
            return ""
        page = doc[0]
        text = page.get_text()
        doc.close()
        return text.strip()

    def extract_all_pages_text(self, contents: bytes) -> str:
        """Extracts the text from all pages of a PDF (from bytes)."""
        doc = fitz.open(stream=contents, filetype="pdf")
        if len(doc) == 0:
            return ""
        all_text = []
        for page in doc:
            all_text.append(page.get_text())
        doc.close()
        return "\n".join(all_text).strip()

    def extract_first_five_pages_text(self, contents: bytes) -> str:
        """Extracts the text from the first 5 pages of a PDF (from bytes)."""
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
    Chunks the text based on a given separator.
    By default, uses two newlines as a separator.
    """
    chunks = [chunk for chunk in text.split(separator) if chunk.strip()]
    if not chunks:  # If the split doesn't give anything, use the whole text (for short PDFs)
        chunks = [text]
    return chunks
