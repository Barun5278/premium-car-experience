# AUTOMIND AI — Machine Learning Pipeline

## Overview
The ML subsystem is dedicated to used-vehicle price valuation and depreciation curve modeling.

## Architecture
```
ml/
├── data/
│   ├── raw/                 # Ingested vehicle transaction CSVs
│   └── processed/           # Imputed and cleaned datasets
├── notebooks/               # EDA & feature importance experiments
├── src/
│   ├── data_pipeline.py     # ColumnTransformer (OneHotEncoder + StandardScaler + Imputer)
│   ├── train.py             # XGBoost Regressor training & cross-validation
│   ├── evaluate.py          # Metric tracking (RMSE, MAE, R², Residuals)
│   └── predict.py           # Production inference wrapper
└── models/
    ├── preprocessor.joblib   # Fitted pipeline
    └── car_price_xgb.joblib # Serialized model weights
```

## Features Used
- **Categorical**: `make`, `model`, `condition` (`excellent`, `good`, `fair`, `poor`), `fuel_type`, `transmission`
- **Numerical**: `year`, `mileage`, `accident_history_count`, `owner_count`
- **Target**: `price` (USD)

## Training Instructions
1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Execute model training:
   ```bash
   python src/train.py
   ```
3. Generated artifacts are automatically saved into `ml/models/` and loaded by the FastAPI backend.
