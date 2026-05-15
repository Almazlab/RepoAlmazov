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

- Frontend деплоится на Vercel (корень: `/`, repository root).
- Python API деплоится на VM (systemd + uvicorn) или Docker.
- В `.github/workflows/ci.yml` добавлены базовые проверки.


## Vercel deployment checklist (fix for 404 NOT_FOUND)

If `https://<project>.vercel.app/` returns `404: NOT_FOUND`, verify:

1. Vercel Project -> Settings -> **Root Directory** is set to `/` (repository root).
2. Framework preset is **Next.js**.
3. Environment variable `NEXT_PUBLIC_API_BASE_URL` is configured for Production/Preview.
4. Redeploy from the latest commit.

`vercel.json` intentionally minimal so Vercel uses standard Next.js root build.


## Important: frontend now lives at repository root for Vercel

To avoid repeated `404: NOT_FOUND` caused by monorepo root-directory misconfiguration,
the deployable Next.js app is now also provided at repository root (`app/`, `package.json`).

Use these Vercel settings:
- Root Directory: `/` (repository root)
- Framework: Next.js
- Build command: default (`next build`)
