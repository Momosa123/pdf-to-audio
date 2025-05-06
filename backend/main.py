from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import pdf_router

load_dotenv()


app = FastAPI(title="PDF to Audio API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # To configure the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static folder to serve audio files
app.mount("/app/static", StaticFiles(directory="app/static"), name="static")
# Include the PDF routes
app.include_router(pdf_router.router)


# Route de test
@app.get("/")
async def root():
    return {"message": "PDF to Audio API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)  # Run the app on port 8000
