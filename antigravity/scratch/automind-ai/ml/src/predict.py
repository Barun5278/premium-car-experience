"""
AUTOMIND AI — Production Inference Wrapper
Loads preprocessor and XGBoost model artifacts to run single/batch predictions.
"""
import os
from typing import Dict, Any
import joblib
import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


class CarPricePredictor:
    def __init__(self):
        self.model_path = os.path.join(MODELS_DIR, "car_price_xgb.joblib")
        self.preprocessor_path = os.path.join(MODELS_DIR, "preprocessor.joblib")
        self.model = None
        self.preprocessor = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path) and os.path.exists(self.preprocessor_path):
            self.model = joblib.load(self.model_path)
            self.preprocessor = joblib.load(self.preprocessor_path)

    def predict_single(self, features: Dict[str, Any]) -> float:
        if not self.model or not self.preprocessor:
            raise RuntimeError("Model or preprocessor artifact not loaded. Run train.py first.")

        df = pd.DataFrame([features])
        transformed = self.preprocessor.transform(df)
        pred = self.model.predict(transformed)
        return float(pred[0])
