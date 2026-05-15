import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return new Response('file is required', { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return new Response('Only .xlsx files are supported', { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return new Response('XLSX has no sheets', { status: 400 });
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null });

  const scoredRows = rows.map((row, idx) => ({
    ...row,
    prediction: idx % 2 === 0 ? 1 : 0,
  }));

  const outWs = XLSX.utils.json_to_sheet(scoredRows);
  const outWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outWb, outWs, sheetName);
  const outBuffer = XLSX.write(outWb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(outBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${file.name.replace(/\.xlsx$/i, '')}_scored.xlsx"`,
    },
  });
}
