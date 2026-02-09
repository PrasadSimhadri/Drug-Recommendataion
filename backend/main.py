"""
FastAPI Backend for Drug Recommendation System
Uses pre-computed embeddings for fast inference
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Drug Recommendation API",
    description="HGT-based drug recommendation system",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class RecommendRequest(BaseModel):
    patient_id: str
    top_k: Optional[int] = 5


class DrugRecommendation(BaseModel):
    cuid: str
    score: float
    concept_idx: int


class RecommendResponse(BaseModel):
    patient_id: str
    recommendations: List[DrugRecommendation]


# Lazy load recommender
_recommender = None

def get_recommender():
    global _recommender
    if _recommender is None:
        from inference import get_recommender as load_recommender
        _recommender = load_recommender()
    return _recommender


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "drug-recommendation-api"}


@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_drugs(request: RecommendRequest):
    """
    Get drug recommendations for a patient.
    """
    try:
        recommender = get_recommender()
        recommendations = recommender.recommend(
            patient_id=request.patient_id,
            top_k=request.top_k or 5
        )
        
        if isinstance(recommendations, dict) and "error" in recommendations:
            raise HTTPException(status_code=404, detail=recommendations["error"])
        
        return RecommendResponse(
            patient_id=request.patient_id,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/patients")
async def list_patients():
    """Get list of available patient IDs (sample)."""
    try:
        recommender = get_recommender()
        patient_ids = list(recommender.patient_to_idx.keys())[:20]
        return {"patients": patient_ids, "total": len(recommender.patient_to_idx)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("Starting Drug Recommendation API...")
    print("Loading embeddings (this may take a moment)...")
    
    # Pre-load embeddings
    get_recommender()
    
    print("Ready! Starting server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
