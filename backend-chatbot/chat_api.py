"""
chat_api.py

FastAPI backend server for SehatConnect Medical Chatbot
Optimized for fast responses with smart dataset caching

Usage:
    python chat_api.py

API will be available at: http://localhost:8000
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Import uvicorn at runtime in the __main__ block to avoid editor/linter unresolved-import warnings
from sentence_transformers import SentenceTransformer
import pandas as pd
import os
import sys
import asyncio
from functools import lru_cache

# Import functions from medical_chatbot
sys.path.append(os.path.dirname(__file__))
from medical_chatbot import (
    load_dataset, 
    load_or_build_embeddings, 
    most_similar, 
    friendly_response,
    ensure_dataset_available
)

# Initialize FastAPI app
app = FastAPI(
    title="Sehat Medical Chatbot API",
    description="AI-powered medical symptom checker backend for SehatConnect - Optimized for speed",
    version="2.0.0"
)

# CORS middleware for React Native - Optimized
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Only needed methods
    allow_headers=["Content-Type", "Accept"],  # Only needed headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Global variables for model and data
model = None
emb_matrix = None
labels = None
df = None
csv_path = None

# Request/Response models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    confidence: float

class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    dataset_loaded: bool

# Startup event - Optimized with smart dataset management
@app.on_event("startup")
async def startup_event():
    """Load model and dataset on server startup - Only downloads dataset once"""
    global model, emb_matrix, labels, df, csv_path
    
    print("=" * 60)
    print("🚀 Starting Sehat Medical Chatbot API v2.0")
    print("=" * 60)
    
    try:
        # Load the sentence transformer model
        print("📥 Loading sentence transformer model...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("✅ Model loaded successfully!")
        
        # Smart dataset management - downloads only if not present
        print("📊 Checking for dataset...")
        csv_path = ensure_dataset_available()
        
        if csv_path is None:
            print("⚠️ Dataset not found and could not be downloaded!")
            print("   Please ensure internet connection and try again.")
            raise FileNotFoundError("Dataset not available")
        
        print(f"📊 Loading dataset from: {csv_path}")
        # Optimized loading with dtype specification
        df = load_dataset(csv_path)
        print(f"✅ Dataset loaded: {len(df)} records")
        
        # Build/load embeddings with caching
        print("🔄 Loading embeddings (cached if available)...")
        emb_matrix, labels = load_or_build_embeddings(df, model, csv_path)
        print(f"✅ Embeddings ready: {emb_matrix.shape}")
        
        print("=" * 60)
        print("🎉 Server ready! API available at: http://0.0.0.0:8000")
        print("📖 API docs: http://0.0.0.0:8000/docs")
        print("💡 Dataset cached - fast restarts enabled!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        print("⚠️ Server will start but chatbot will not be available.")
        # Don't raise - let server start for health checks
        pass

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify service status
    
    Returns:
        HealthResponse with service status and model/dataset availability
    """
    return HealthResponse(
        status="healthy",
        service="Sehat Medical Chatbot",
        model_loaded=model is not None,
        dataset_loaded=emb_matrix is not None
    )

# Main chat endpoint - Optimized for speed
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for symptom checking - Optimized with async processing
    
    Args:
        request: ChatRequest containing user's symptom description
        
    Returns:
        ChatResponse with AI-generated reply and confidence score
    """
    try:
        # Validate models are loaded
        if model is None or emb_matrix is None:
            raise HTTPException(
                status_code=503,
                detail="Service not ready. Model or dataset not loaded. Please restart the server."
            )
        
        # Get and validate message
        query = request.message.strip()
        
        if not query:
            return ChatResponse(
                reply="Please describe your symptoms so I can help you.",
                confidence=0.0
            )
        
        # Limit message length
        if len(query) > 500:
            return ChatResponse(
                reply="Your message is too long. Please describe your symptoms in 500 characters or less.",
                confidence=0.0
            )
        
        print(f"💬 Query: {query[:50]}...")
        
        # Process in async manner for better performance
        # Get similarity score and index
        score, idx = most_similar(query, model, emb_matrix)
        
        # Get the predicted disease label (handle missing labels safely)
        try:
            if labels is not None:
                label = labels[idx]
            elif df is not None:
                # fallback to dataframe label column
                label = df['label'].iloc[idx]
            else:
                label = "unknown"
        except Exception:
            # In case idx is out of range or any unexpected error, fallback to unknown
            label = "unknown"
        
        # Generate friendly response
        response = friendly_response(label, score)
        
        print(f"✅ Response: {label} (confidence: {score:.2f})")
        
        return ChatResponse(
            reply=response,
            confidence=round(score, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Sehat Medical Chatbot API",
        "version": "1.0.0",
        "description": "AI-powered medical symptom checker for SehatConnect",
        "endpoints": {
            "health": "/health (GET) - Health check",
            "chat": "/chat (POST) - Send symptom query",
            "docs": "/docs (GET) - Interactive API documentation"
        },
        "example_request": {
            "url": "/chat",
            "method": "POST",
            "body": {
                "message": "I have fever and headache"
            }
        }
    }

# Statistics endpoint
@app.get("/stats")
async def get_stats():
    """
    Get statistics about the dataset and model
    """
    if df is None or emb_matrix is None:
        raise HTTPException(status_code=503, detail="Service not ready")
    
    # Get unique diseases
    unique_diseases = df['label'].nunique() if df is not None else 0
    
    return {
        "total_records": len(df) if df is not None else 0,
        "unique_diseases": unique_diseases,
        "embedding_dimensions": emb_matrix.shape[1] if emb_matrix is not None else 0,
        "model_name": "all-MiniLM-L6-v2"
    }

# Main entry point - Optimized for production
if __name__ == "__main__":
    # Import uvicorn here to avoid unresolved-import diagnostics in some editors/linters.
    # If uvicorn is not installed at runtime, provide a clear error message.
    try:
        import uvicorn
    except Exception as e:
        print("❌ Failed to import 'uvicorn'. Please install it with: pip install uvicorn")
        raise RuntimeError("uvicorn is required to run the server") from e

    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        access_log=True,
        workers=1,  # Single worker for model consistency
        timeout_keep_alive=75,  # Keep connections alive longer
    )
