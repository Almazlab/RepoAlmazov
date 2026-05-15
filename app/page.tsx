'use client';

import { FormEvent, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '';
const SCORE_PATH = '/api/score-xlsx';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!file) {
      setStatus('Выберите .xlsx файл.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setStatus('Обработка файла...');

    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/score-xlsx` : SCORE_PATH;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Ошибка при обработке файла');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.xlsx$/i, '') + '_scored.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus('Готово. Файл скачан.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>XLSX ML Scoring</h1>
      <p>
        Загрузите Excel-файл и получите тот же файл с новой колонкой prediction.
        <br />
        Если не задан NEXT_PUBLIC_API_BASE_URL, используется встроенный stub API.
      </p>

      <form onSubmit={onSubmit}>
        <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ marginTop: 16 }}>
          <button type="submit">Обработать</button>
        </div>
      </form>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
