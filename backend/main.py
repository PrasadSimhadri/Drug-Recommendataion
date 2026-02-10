"""
FastAPI Backend for Drug Recommendation System
Uses pre-computed embeddings for fast inference
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import pandas as pd
from pathlib import Path

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


class DiagnosisItem(BaseModel):
    icd_code: str
    icd_version: int
    cui: str
    hadm_id: str


class DiagnosesResponse(BaseModel):
    patient_id: str
    diagnoses: List[DiagnosisItem]


# Lazy load recommender and diagnosis data
_recommender = None
_diagnosis_df = None

def get_recommender():
    global _recommender
    if _recommender is None:
        from inference import get_recommender as load_recommender
        _recommender = load_recommender()
    return _recommender


def get_diagnosis_data():
    global _diagnosis_df
    if _diagnosis_df is None:
        try:
            csv_path = Path(r"C:\Users\saisi\OneDrive\Documents\Desktop\mimic_diagnoses_mapped.csv")
            if not csv_path.exists():
                print(f"Warning: Diagnosis CSV not found at {csv_path}")
                return pd.DataFrame()  # Return empty DataFrame instead of raising error
            _diagnosis_df = pd.read_csv(csv_path)
            print(f"Loaded {len(_diagnosis_df)} diagnosis records")
        except Exception as e:
            print(f"Error loading diagnosis CSV: {e}")
            _diagnosis_df = pd.DataFrame()  # Return empty DataFrame on error
    return _diagnosis_df


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


@app.get("/api/diagnoses/{patient_id}", response_model=DiagnosesResponse)
async def get_patient_diagnoses(patient_id: str, top_k: Optional[int] = 10):
    """
    Get diagnoses for a patient from MIMIC dataset.
    Returns unique ICD codes (one CUI per ICD code).
    """
    try:
        df = get_diagnosis_data()
        
        # Filter by patient ID
        patient_data = df[df['subject_id'] == int(patient_id)]
        
        if patient_data.empty:
            return DiagnosesResponse(
                patient_id=patient_id,
                diagnoses=[]
            )
        
        # Deduplicate: keep first CUI per unique ICD code
        unique_diagnoses = patient_data.drop_duplicates(subset=['icd_code'], keep='first')
        
        # Limit to top_k
        unique_diagnoses = unique_diagnoses.head(top_k)
        
        # Convert to response format
        diagnoses = [
            DiagnosisItem(
                icd_code=str(row['icd_code']),
                icd_version=int(row['icd_version']),
                cui=str(row['cui']),
                hadm_id=str(row['hadm_id'])
            )
            for _, row in unique_diagnoses.iterrows()
        ]
        
        return DiagnosesResponse(
            patient_id=patient_id,
            diagnoses=diagnoses
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("Starting Drug Recommendation API...")
    print("Loading embeddings (this may take a moment)...")
    
    # Pre-load embeddings
    get_recommender()
    
    print("Ready! Starting server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
