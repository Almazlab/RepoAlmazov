from __future__ import annotations

import io
import os
from typing import List

import pandas as pd
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

load_dotenv()

app = FastAPI(title="XLSX Scoring API", version="0.1.0")


DATASPHERE_API_URL = os.getenv("DATASPHERE_API_URL", "").strip()
DATASPHERE_API_TOKEN = os.getenv("DATASPHERE_API_TOKEN", "").strip()
MODEL_FEATURE_COLUMNS = [c.strip() for c in os.getenv("MODEL_FEATURE_COLUMNS", "").split(",") if c.strip()]
PREDICTION_COLUMN_NAME = os.getenv("PREDICTION_COLUMN_NAME", "prediction").strip() or "prediction"


def _predict_with_datasphere(features_df: pd.DataFrame) -> List[float]:
    if not DATASPHERE_API_URL or not DATASPHERE_API_TOKEN:
        return [0.0] * len(features_df)

    payload = {"rows": features_df.to_dict(orient="records")}
    headers = {
        "Authorization": f"Bearer {DATASPHERE_API_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.post(DATASPHERE_API_URL, headers=headers, json=payload, timeout=60)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"DataSphere error: {response.text}")

    data = response.json()
    predictions = data.get("predictions")
    if not isinstance(predictions, list) or len(predictions) != len(features_df):
        raise HTTPException(status_code=502, detail="Invalid predictions format from DataSphere")

    return predictions


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/score-xlsx")
async def score_xlsx(file: UploadFile = File(...)) -> StreamingResponse:
    if not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        df = pd.read_excel(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid XLSX file: {exc}") from exc

    if df.empty:
        raise HTTPException(status_code=400, detail="XLSX has no rows")

    feature_columns = MODEL_FEATURE_COLUMNS if MODEL_FEATURE_COLUMNS else list(df.columns)
    missing = [c for c in feature_columns if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {missing}")

    features_df = df[feature_columns]
    predictions = _predict_with_datasphere(features_df)
    df[PREDICTION_COLUMN_NAME] = predictions

    output = io.BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)

    out_name = file.filename.rsplit(".xlsx", 1)[0] + "_scored.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )
