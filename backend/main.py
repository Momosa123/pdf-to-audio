import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
load_dotenv()

from app.api import pdf_router

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

# Monter le dossier static pour servir les fichiers audio
app.mount("/app/static", StaticFiles(directory="app/static"), name="static")
# Inclure les routes PDF
app.include_router(pdf_router.router)

# Route de test
@app.get("/")
async def root():
    return {"message": "PDF to Audio API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 