# PDF to Audio Web App

Convert pages of any PDF document into an audio file using a modern web interface and advanced text-to-speech technology.

## Features

- **Upload PDF files** via a simple web interface.
- **Preview** your PDF before conversion.
- **Automatic voiceover**: the backend extracts text from the pages and generates an audio file using neural TTS.
- **Listen to or download** the generated audio file directly in your browser.

---

## Tech Stack

- **Frontend**: Next.js (React, Tailwind CSS, Radix UI, react-pdf)
- **Backend**: FastAPI (Python), Coqui TTS, PyMuPDF, SoundFile, NumPy

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (v3.8+ recommended)
- **pip** (for Python dependencies)
- **pnpm** (or npm/yarn/bun for the frontend)

---

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### 2. Frontend Setup

```bash
cd frontend
pnpm install  # or npm install / yarn install / bun install
pnpm dev      # or npm run dev / yarn dev / bun dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

1. **Open the frontend** in your browser.
2. **Click "Select PDF files"** and choose one or more PDF documents (less than 3 pages for faster processing).
3. **Preview** your PDF(s) in the interface.
4. **Click the confirm/upload button** to convert a PDF to audio.
5. **Listen to or download** the generated audio file.

> **Note:** Only the first five pages of each PDF are processed for audio conversion.

---

## Project Structure

```
backend/
  main.py              # FastAPI entry point
  requirements.txt     # Python dependencies
  app/
    api/pdf_router.py  # PDF to audio API endpoint
    services/          # PDF extraction and TTS logic

frontend/
  app/page.tsx         # Main Next.js page
  components/          # React components (upload, preview, etc.)
  package.json         # Frontend dependencies
```

---

## Dependencies

### Backend

- fastapi
- uvicorn
- python-multipart
- python-dotenv
- PyMuPDF
- soundfile
- numpy
- TTS (Coqui)
- torch

### Frontend

- next
- react
- react-dom
- tailwindcss
- react-pdf
- @radix-ui/react-dialog

---

## Main libraries

- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [PyMuPDF](https://github.com/pymupdf/PyMuPDF)
- [Next.js](https://nextjs.org/)
- [react-pdf](https://github.com/wojtekmaj/react-pdf)
- [FastAPI](https://fastapi.tiangolo.com/)
- [SoundFile](https://github.com/bastibe/SoundFile)
