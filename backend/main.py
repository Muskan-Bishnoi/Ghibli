from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend to access this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define model mapping
MODEL_ENDPOINTS = {
    "ghibli": "https://api-inference.huggingface.co/models/Lykon/dreamshaper-7",
    "comic": "https://api-inference.huggingface.co/models/nitrosocke/Comic-Diffusion",
    "3d": "https://api-inference.huggingface.co/models/cyberes/3D-Render-Diffusion",
    "pixar": "https://api-inference.huggingface.co/models/nitrosocke/PixarStyle",
    "disney": "https://api-inference.huggingface.co/models/stablediffusionapi/disney-pixar-cartoon",
}

# Replace this with your actual Hugging Face API key
HUGGINGFACE_API_KEY = "api_key"

@app.post("/stylize/")
async def stylize_image(file: UploadFile = File(...), style: str = Form(...)):
    if style not in MODEL_ENDPOINTS:
        return JSONResponse(status_code=400, content={"error": "Invalid style"})

    image_bytes = await file.read()
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/octet-stream"
    }

    response = requests.post(MODEL_ENDPOINTS[style], headers=headers, data=image_bytes)

    if response.status_code != 200:
        return JSONResponse(status_code=response.status_code, content={"error": "Model inference failed"})

    return JSONResponse(content={"image": response.content.encode("base64").decode("utf-8")})
