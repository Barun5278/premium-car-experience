"""
AUTOMIND AI — Model Training Script
Trains an XGBoost Regressor pipeline for used car price valuation,
evaluates on validation set, and persists artifacts to ml/models/.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
from data_pipeline import build_preprocessor, prepare_features_and_target

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def generate_sample_training_dataset(num_samples: int = 1500) -> pd.DataFrame:
    """
    Generates synthetic training dataset based on real-world automotive depreciation curves
    to seed model weights before external CSV datasets are ingested.
    """
    np.random.seed(42)
    makes = ["Porsche", "BMW", "Audi", "Mercedes-Benz", "Tesla", "Toyota", "Ford"]
    models_map = {
        "Porsche": ["911 Carrera", "Taycan 4S", "Cayenne GTS"],
        "BMW": ["M3 Competition", "M4 Coupe", "i4 M50"],
        "Audi": ["RS6 Avant", "e-tron GT", "R8 V10"],
        "Mercedes-Benz": ["AMG GT", "C63 AMG", "EQS Sedan"],
        "Tesla": ["Model S Plaid", "Model 3 Performance", "Model X"],
        "Toyota": ["GR Supra", "RAV4 Prime", "Land Cruiser"],
        "Ford": ["Mustang Mach 1", "F-150 Lightning", "Bronco Raptor"],
    }
    conditions = ["excellent", "good", "fair", "poor"]
    fuel_types = ["gasoline", "electric", "hybrid"]
    transmissions = ["automatic", "dual-clutch", "manual", "direct-drive"]

    data = []
    for _ in range(num_samples):
        make = np.random.choice(makes)
        model = np.random.choice(models_map[make])
        year = int(np.random.randint(2016, 2025))
        age = 2026 - year
        mileage = int(np.random.normal(loc=age * 11000, scale=4000))
        mileage = max(500, mileage)
        condition = np.random.choice(conditions, p=[0.35, 0.45, 0.15, 0.05])
        fuel_type = "electric" if "Tesla" in make or "Taycan" in model or "EQS" in model or "e-tron" in model else np.random.choice(fuel_types)
        transmission = "direct-drive" if fuel_type == "electric" else np.random.choice(transmissions)
        accidents = int(np.random.choice([0, 1, 2], p=[0.75, 0.20, 0.05]))
        owners = int(np.random.choice([1, 2, 3], p=[0.60, 0.30, 0.10]))

        base_val = 110000.0 if "Porsche" in make or "R8" in model or "Plaid" in model else (65000.0 if make in ["BMW", "Audi", "Mercedes-Benz"] else 38000.0)
        depreciation = (age * 0.075) + (mileage / 120000.0 * 0.22)
        cond_mult = {"excellent": 1.05, "good": 0.96, "fair": 0.82, "poor": 0.65}[condition]
        accident_deduct = accidents * 2200.0

        price = max(4000.0, (base_val * (1.0 - min(0.85, depreciation)) * cond_mult) - accident_deduct + np.random.normal(0, 1500))

        data.append({
            "make": make,
            "model": model,
            "year": year,
            "mileage": mileage,
            "condition": condition,
            "fuel_type": fuel_type,
            "transmission": transmission,
            "accident_history_count": accidents,
            "owner_count": owners,
            "price": round(price, 2),
        })

    return pd.DataFrame(data)


def train_pipeline():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print("[ML Train] Preparing training dataset...")
    df = generate_sample_training_dataset()

    X, y = prepare_features_and_target(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = build_preprocessor()
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)

    print("[ML Train] Fitting XGBoost Regressor...")
    model = xgb.XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )
    model.fit(X_train_transformed, y_train)

    # Evaluation
    preds = model.predict(X_test_transformed)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print("=" * 40)
    print("AUTOMIND AI — Valuation Model Performance")
    print("=" * 40)
    print(f"RMSE: ${rmse:,.2f}")
    print(f"MAE:  ${mae:,.2f}")
    print(f"R²:   {r2:.4f}")
    print("=" * 40)

    # Save artifacts
    model_path = os.path.join(MODELS_DIR, "car_price_xgb.joblib")
    preprocessor_path = os.path.join(MODELS_DIR, "preprocessor.joblib")
    joblib.dump(model, model_path)
    joblib.dump(preprocessor, preprocessor_path)
    print(f"[ML Train] Saved model artifacts to {MODELS_DIR}")


if __name__ == "__main__":
    train_pipeline()
