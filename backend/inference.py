"""
Drug Recommendation Inference Module
Uses pre-computed embeddings for fast inference without sparse dependencies
"""

import os
import torch


class DrugRecommender:
    """
    Drug recommendation engine using pre-computed embeddings.
    No model inference required - just embedding similarity.
    """
    
    def __init__(self, embeddings_path: str, mappings_path: str):
        print("Loading pre-computed embeddings...")
        
        # Load embeddings
        embeddings = torch.load(embeddings_path, weights_only=False, map_location='cpu')
        self.patient_embeddings = embeddings['patient_embeddings']
        self.concept_embeddings = embeddings['concept_embeddings']
        self.drug_concept_indices = embeddings['drug_concept_indices']
        
        print(f"Patient embeddings: {self.patient_embeddings.shape}")
        print(f"Concept embeddings: {self.concept_embeddings.shape}")
        print(f"Drug indices: {self.drug_concept_indices.shape}")
        
        # Pre-compute drug embeddings for fast lookup
        self.drug_embeddings = self.concept_embeddings[self.drug_concept_indices]
        print(f"Drug embeddings: {self.drug_embeddings.shape}")
        
        # Load mappings
        print(f"Loading mappings from: {mappings_path}")
        self.mappings = torch.load(mappings_path, weights_only=False, map_location='cpu')
        
        # Setup ID mappings
        self._setup_mappings()
        print("DrugRecommender ready!")
    
    def _setup_mappings(self):
        """Setup patient and drug ID mappings."""
        # Patient ID to index mapping (MIMIC patient IDs like '10000032')
        if 'pid_to_idx' in self.mappings:
            self.patient_to_idx = self.mappings['pid_to_idx']
        elif 'patient_to_idx' in self.mappings:
            self.patient_to_idx = self.mappings['patient_to_idx']
        else:
            num_patients = self.patient_embeddings.size(0)
            self.patient_to_idx = {str(i): i for i in range(num_patients)}
        
        # CUID to index mapping (CUIDs like 'C0000039')
        if 'cui_to_idx' in self.mappings:
            # Create reverse mapping: index -> CUID
            self.idx_to_cuid = {v: k for k, v in self.mappings['cui_to_idx'].items()}
        elif 'concept_to_idx' in self.mappings:
            self.idx_to_cuid = {v: k for k, v in self.mappings['concept_to_idx'].items()}
        elif 'idx_to_concept' in self.mappings:
            self.idx_to_cuid = self.mappings['idx_to_concept']
        else:
            self.idx_to_cuid = {i: f"C{i:07d}" for i in range(self.concept_embeddings.size(0))}
        
        print(f"Patient mappings: {len(self.patient_to_idx)} patients")
        print(f"Concept mappings: {len(self.idx_to_cuid)} concepts")
        
        # Print sample mappings for verification
        sample_patients = list(self.patient_to_idx.items())[:3]
        sample_concepts = list(self.idx_to_cuid.items())[:3]
        print(f"Sample patient IDs: {sample_patients}")
        print(f"Sample concept CUIDs: {sample_concepts}")
    
    def get_sample_patients(self, n: int = 20) -> list:
        """Get sample patient IDs."""
        return list(self.patient_to_idx.keys())[:n]
    
    @torch.no_grad()
    def recommend(self, patient_id: str, top_k: int = 5) -> list:
        """
        Recommend top-k drugs for a patient using embedding similarity.
        
        Args:
            patient_id: Patient identifier (MIMIC patient ID like '10000032')
            top_k: Number of recommendations
            
        Returns:
            List of dicts with drug CUID and score
        """
        # Get patient index
        if patient_id in self.patient_to_idx:
            patient_idx = self.patient_to_idx[patient_id]
        else:
            # Try different formats
            patient_id_str = str(patient_id).strip()
            if patient_id_str in self.patient_to_idx:
                patient_idx = self.patient_to_idx[patient_id_str]
            else:
                # Return list of valid sample patient IDs in error message
                sample_ids = list(self.patient_to_idx.keys())[:10]
                return {"error": f"Patient ID '{patient_id}' not found. Sample valid IDs: {sample_ids}"}
        
        # Get patient embedding
        patient_emb = self.patient_embeddings[patient_idx]
        
        # Calculate similarity scores with all drugs (dot product)
        scores = torch.matmul(self.drug_embeddings, patient_emb)
        
        # Get top-k
        topk_scores, topk_idx = torch.topk(scores, min(top_k, scores.size(0)))
        
        # Build recommendations
        recommendations = []
        for i, (idx, score) in enumerate(zip(topk_idx.tolist(), topk_scores.tolist())):
            # Map local drug index to global concept index
            concept_idx = self.drug_concept_indices[idx].item()
            cuid = self.idx_to_cuid.get(concept_idx, f"C{concept_idx:07d}")
            recommendations.append({
                "cuid": str(cuid),
                "score": round(float(score), 4),
                "concept_idx": concept_idx
            })
        
        return recommendations


# Singleton instance
_recommender = None


def get_recommender():
    """Get or create the recommender singleton."""
    global _recommender
    if _recommender is None:
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        embeddings_path = os.path.join(base_path, "model", "embeddings.pt")
        mappings_path = os.path.join(base_path, "model", "mappings.pt")
        
        print(f"Base path: {base_path}")
        print(f"Embeddings path: {embeddings_path}")
        print(f"Mappings path: {mappings_path}")
        
        _recommender = DrugRecommender(embeddings_path, mappings_path)
    
    return _recommender
