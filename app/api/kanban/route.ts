import { NextResponse } from 'next/server'
import {
  authorizeSheets,
  fetchSolicitacoesFromSheet,
  getSheetTitle,
  mapHeaderKey,
  normalizeHeader,
} from '@/lib/google-sheets'
import { STATUS, type Solicitacao } from '@/lib/nexlab-data'

const sheetId = process.env.GOOGLE_SHEET_ID
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
const privateKey = process.env.GOOGLE_PRIVATE_KEY

function getColumnLetter(columnIndex: number) {
  let letter = ''
  while (columnIndex > 0) {
    const remainder = (columnIndex - 1) % 26
    letter = String.fromCharCode(65 + remainder) + letter
    columnIndex = Math.floor((columnIndex - 1) / 26)
  }
  return letter
}

export async function GET() {
  try {
    const data = await fetchSolicitacoesFromSheet()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Google Sheets fetch error:', error)
    return NextResponse.json({ error: 'Falha ao ler os dados do Google Sheets.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!sheetId || !clientEmail || !privateKey) {
    return NextResponse.json({ error: 'Google Sheets credentials are not configured.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string' || typeof body.status !== 'string') {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  const status = body.status as Solicitacao['status']
  if (!Object.keys(STATUS).includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  try {
    const { jwtClient, sheetsApi } = await authorizeSheets()
    const sheetTitle = await getSheetTitle(jwtClient)
    const range = `${sheetTitle}!A1:Z1000`
    const response = await sheetsApi.spreadsheets.values.get({ spreadsheetId: sheetId, range })
    const rows = response.data.values ?? []

    if (rows.length < 2) {
      return NextResponse.json({ error: 'A planilha não contém dados suficientes.' }, { status: 404 })
    }

    const normalizedHeaders = rows[0].map((header) => normalizeHeader(String(header)))
    const mappedHeaders = normalizedHeaders.map(mapHeaderKey)
    const idColumn = mappedHeaders.findIndex((key) => key === 'id')
    const statusColumn = mappedHeaders.findIndex((key) => key === 'status')

    if (idColumn < 0 || statusColumn < 0) {
      return NextResponse.json({ error: 'A planilha não possui colunas de ID e status válidas.' }, { status: 422 })
    }

    const rowIndex = rows.findIndex(
      (row) => String(row[idColumn] ?? '').trim() === body.id.trim(),
    )
    if (rowIndex < 1) {
      return NextResponse.json({ error: 'Solicitação não encontrada.' }, { status: 404 })
    }

    const updateRange = `${sheetTitle}!${getColumnLetter(statusColumn + 1)}${rowIndex + 1}`
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status]] },
    })

    return NextResponse.json({ success: true, id: body.id, status })
  } catch (error) {
    console.error('Google Sheets update error:', error)
    return NextResponse.json({ error: 'Falha ao atualizar o status no Google Sheets.' }, { status: 500 })
  }
}
