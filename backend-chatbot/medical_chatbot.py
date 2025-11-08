"""
medical_chatbot.py

An offline/online-capable medical symptom-checker chatbot.

New feature:
✅ Automatically downloads the dataset from Kaggle using `kagglehub` if it's not already present.

Usage:
# Activate venv (Windows)
# .\venv\Scripts\activate
# Install dependencies
# pip install sentence-transformers pandas scikit-learn numpy kagglehub

# Run the chatbot
# python "d:/chat bot/medical_chatbot.py"
"""

from __future__ import annotations
import argparse
import hashlib
import os
import sys
import time
import shutil
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 🆕 KaggleHub for dataset download
import kagglehub


# -----------------------------------------------------------
# 🧩 Dataset Management with Smart Caching
# -----------------------------------------------------------
def ensure_dataset_available() -> Optional[str]:
    """
    Ensures the dataset is available locally.
    Downloads from Kaggle only if not present.
    Returns the local path to the CSV file.
    """
    target_path = os.path.join(os.path.dirname(__file__), "symptom2disease.csv")
    
    # Check if dataset already exists locally
    if os.path.exists(target_path):
        print(f"✅ Dataset already available: {target_path}")
        return target_path
    
    print("📦 Dataset not found locally. Downloading from Kaggle...")
    
    try:
        path = kagglehub.dataset_download("niyarrbarman/symptom2disease")
        dataset_file = os.path.join(path, "symptom2disease.csv")
        
        if os.path.exists(dataset_file):
            shutil.copy(dataset_file, target_path)
            print(f"✅ Dataset copied to: {target_path}")
            return target_path
        else:
            print("⚠️ Could not find 'symptom2disease.csv' in Kaggle dataset.")
            return None
            
    except Exception as e:
        print(f"❌ Failed to download dataset: {e}")
        return None


def find_csv_file(possible_names: List[str]) -> Optional[str]:
    """
    Finds the CSV file locally or ensures it's downloaded.
    Only downloads once - uses cached version on subsequent calls.
    """
    # First check if any of the expected filenames exist locally
    script_dir = os.path.dirname(__file__)
    
    for name in possible_names:
        path = os.path.join(script_dir, name)
        if os.path.isfile(path):
            print(f"✅ Found local dataset: {path}")
            return path
    
    # If not found, ensure dataset is available (download if needed)
    return ensure_dataset_available()



def load_dataset(csv_path: str) -> pd.DataFrame:
    """Load dataset with optimized memory usage"""
    # Use dtype optimization to reduce memory footprint
    df = pd.read_csv(csv_path, dtype={'text': 'string', 'label': 'string'})
    df.columns = [c.strip().lower() for c in df.columns]
    if "text" not in df.columns or "label" not in df.columns:
        raise ValueError("CSV must contain 'text' and 'label' columns (case-insensitive).")
    df = df.dropna(subset=["text"]).reset_index(drop=True)
    return df


# -----------------------------------------------------------
# 🧠 Embedding & Similarity
# -----------------------------------------------------------
def compute_cache_key(csv_path: str, model_id: str) -> str:
    st = f"{os.path.abspath(csv_path)}|{os.path.getmtime(csv_path)}|{model_id}"
    return hashlib.sha256(st.encode("utf-8")).hexdigest()


def load_or_build_embeddings(
    df: pd.DataFrame, model: SentenceTransformer, csv_path: str, cache_dir: str = ".cache"
) -> Tuple[np.ndarray, List[str]]:
    os.makedirs(cache_dir, exist_ok=True)
    model_id = getattr(model, "name", None) or getattr(model, "model_name", "model")
    key = compute_cache_key(csv_path, model_id)
    cache_path = os.path.join(cache_dir, f"embeddings_{key}.npz")

    texts = df["text"].astype(str).tolist()
    labels = df["label"].astype(str).tolist()

    if os.path.isfile(cache_path):
        try:
            data = np.load(cache_path, allow_pickle=True)
            emb = data["embeddings"]
            cached_texts = data["texts"].tolist()
            if len(cached_texts) == len(texts):
                return emb, labels
        except Exception:
            pass

    print("🔁 Building embeddings for dataset (this may take a moment)...")
    emb = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    emb = emb / np.linalg.norm(emb, axis=1, keepdims=True)

    try:
        np.savez_compressed(cache_path, embeddings=emb, texts=np.array(texts, dtype=object))
    except Exception:
        pass

    return emb, labels


def most_similar(query: str, model: SentenceTransformer, emb_matrix: np.ndarray) -> Tuple[float, int]:
    q_emb = model.encode([query], convert_to_numpy=True)
    q_emb = q_emb / (np.linalg.norm(q_emb, axis=1, keepdims=True) + 1e-12)
    sims = (emb_matrix @ q_emb.T).squeeze(1)
    idx = int(np.argmax(sims))
    score = float(sims[idx])
    return score, idx


# -----------------------------------------------------------
# 💬 Chatbot Logic
# -----------------------------------------------------------
def friendly_response(label: str, similarity: float) -> str:
    emojis = {"thinking": "🤔", "doctor": "🩺", "heart": "💙", "smile": "🙂"}
    if similarity >= 0.85:
        msg = f"{emojis['smile']} That closely matches {label} based on your description."
    elif similarity >= 0.65:
        msg = f"{emojis['thinking']} It sounds similar to {label} from what you described."
    else:
        msg = f"{emojis['thinking']} It may be {label}, but I'm not very confident about this match."
    return f"{msg}\n\n{emojis['doctor']} Please consult a doctor for confirmation."


def run_chatbot(csv_path: str, model: SentenceTransformer, threshold: float = 0.55) -> None:
    try:
        df = load_dataset(csv_path)
    except Exception as e:
        print(f"{os.path.basename(csv_path)} could not be loaded: {e}")
        return

    if df.empty:
        print("The dataset appears empty. Add rows to the CSV and try again.")
        return

    emb_matrix, labels = load_or_build_embeddings(df, model, csv_path)

    print(
        "\n🩺 Medical Symptom Checker (type 'exit' to quit)\n"
        "Ask about your symptoms in plain language and I'll try to suggest a possible disease.\n"
    )

    while True:
        try:
            query = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye — take care! 💙")
            break

        if not query:
            print("Please describe your symptoms, or type 'exit' to quit.")
            continue
        if query.lower() in {"exit", "quit", "bye"}:
            print("Goodbye — take care! 💙")
            break

        score, idx = most_similar(query, model, emb_matrix)
        if score < threshold:
            print("🤖 I'm not sure which disease matches your symptoms, please describe them more clearly.")
            continue

        disease = labels[idx]
        reply = friendly_response(disease, score)
        print(f"Bot: {reply}\n(Confidence: {score:.2f})\n")


# -----------------------------------------------------------
# 🚀 Entry Point
# -----------------------------------------------------------
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Medical symptom-checker chatbot")
    p.add_argument("--csv", default=None, help="Path to symptom CSV (optional)")
    p.add_argument("--local-model", default=os.environ.get("SENTENCE_TRANSFORMER_LOCAL_PATH"), help="Local model path")
    p.add_argument("--threshold", type=float, default=0.55, help="Similarity threshold")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    possible_csv_names = [
        "symptom2Disease.csv", "Symptom2Disease.csv", "Symptom2disease.csv", "symptom2disease.csv"
    ]
    
    # Smart dataset management - downloads only if needed
    csv_path = args.csv or find_csv_file(possible_csv_names)

    if csv_path is None:
        print("❌ Could not locate or download the dataset. Please check your internet connection.")
        return

    model_source = args.local_model or "all-MiniLM-L6-v2"
    print(f"Loading embedding model from: {model_source}")
    try:
        model = SentenceTransformer(model_source)
    except Exception as e:
        print(f"Failed to load model: {e}")
        print("If offline, set SENTENCE_TRANSFORMER_LOCAL_PATH to a local model folder.")
        return

    run_chatbot(csv_path, model, threshold=args.threshold)


if __name__ == "__main__":
    main()
