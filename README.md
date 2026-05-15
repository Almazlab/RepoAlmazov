# XLSX ML Scoring Platform (Vercel + Python API + Yandex DataSphere)

Монорепозиторий для вашего сценария:
- `frontend/` — Next.js UI для загрузки `.xlsx` и скачивания обработанного файла.
- `python-api/` — FastAPI сервис `/score-xlsx`, который вызывает ML endpoint (DataSphere) и возвращает исходный Excel с новой колонкой.

## Архитектура

1. Пользователь загружает `.xlsx` на frontend (Vercel).
2. Frontend отправляет файл в `python-api`.
3. `python-api`:
   - читает Excel,
   - вызывает DataSphere endpoint,
   - добавляет колонку `prediction`,
   - возвращает новый `.xlsx`.
4. Пользователь скачивает обработанный файл.

## Быстрый старт

### 1) Frontend

```bash
cd frontend
npm install
npm run dev
```

Создайте `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2) Python API

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Создайте `.env`:

```bash
DATASPHERE_API_URL=https://example-datasphere-endpoint/predict
DATASPHERE_API_TOKEN=your_token
MODEL_FEATURE_COLUMNS=feature_1,feature_2,feature_3
PREDICTION_COLUMN_NAME=prediction
```

> Сейчас в коде есть fallback-режим (dummy prediction), если переменные DataSphere не заданы.

## GitHub + Deploy

- Frontend деплоится на Vercel (корень: `frontend`).
- Python API деплоится на VM (systemd + uvicorn) или Docker.
- В `.github/workflows/ci.yml` добавлены базовые проверки.
