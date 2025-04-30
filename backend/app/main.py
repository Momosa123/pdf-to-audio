from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.pdf import router as pdf_router

# Créer l'application FastAPI
app = FastAPI(title="PDF to Audio API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À configurer en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monter le dossier des prévisualisations
preview_dir = Path("uploads/previews")
preview_dir.mkdir(parents=True, exist_ok=True)
app.mount("/previews", StaticFiles(directory=str(preview_dir)), name="previews")

# Inclure les routes PDF
app.include_router(pdf_router)

# Route de test
@app.get("/")
async def root():
    return {"message": "PDF to Audio API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 