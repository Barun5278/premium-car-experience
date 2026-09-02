"""
AUTOMIND AI — ML Data Pipeline & Feature Engineering
Responsible for cleaning raw car valuation datasets, imputing missing values,
and building the scikit-learn ColumnTransformer preprocessor.
"""
from typing import Tuple
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer


CATEGORICAL_FEATURES = ["make", "model", "condition", "fuel_type", "transmission"]
NUMERICAL_FEATURES = ["year", "mileage", "accident_history_count", "owner_count"]
TARGET_COLUMN = "price"


def build_preprocessor() -> ColumnTransformer:
    """
    Constructs an sklearn ColumnTransformer for categorical and numerical features
    """
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ]
    )
    return preprocessor


def prepare_features_and_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Separates feature matrix X and target vector y
    """
    required_cols = CATEGORICAL_FEATURES + NUMERICAL_FEATURES + [TARGET_COLUMN]
    available_cols = [c for c in required_cols if c in df.columns]
    clean_df = df[available_cols].dropna(subset=[TARGET_COLUMN])

    X = clean_df.drop(columns=[TARGET_COLUMN])
    y = clean_df[TARGET_COLUMN]
    return X, y
