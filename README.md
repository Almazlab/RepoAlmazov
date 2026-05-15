# XLSX ML Scoring Platform

Проект теперь собирается на Vercel **из корня репозитория**.

## Что уже работает без внешних сервисов

- Встроенный stub endpoint: `POST /api/score-xlsx`.
- UI загружает `.xlsx` и получает обратно файл с колонкой `prediction`.
- Это позволяет сразу проверить деплой без DataSphere/VM.

## Подключение реального backend

Если задать `NEXT_PUBLIC_API_BASE_URL`, frontend будет отправлять файл в внешний Python API:
- `${NEXT_PUBLIC_API_BASE_URL}/score-xlsx`

Если переменная **не задана**, используется внутренний stub `/api/score-xlsx`.

## Локальный запуск

```bash
npm install
npm run dev
```

## Vercel

- Root Directory: `/`
- Framework: Next.js
- Build command: default

## Python API (опционально, когда будете подключать DataSphere)

Сервис `python-api/` оставлен в репозитории как внешний production-вариант.
