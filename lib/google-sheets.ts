import { google } from 'googleapis'
import {
  PRIORITY,
  STATUS,
  solicitacoes as demoSolicitacoes,
  type PriorityKey,
  type Solicitacao,
  type StatusKey,
} from './nexlab-data'

const sheetId = process.env.GOOGLE_SHEET_ID
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
const privateKey = process.env.GOOGLE_PRIVATE_KEY

export function normalizeHeader(header: string) {
  return header
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\s_-]/g, '')
}

export function mapHeaderKey(normalizedHeader: string) {
  const map: Record<string, keyof Solicitacao | 'responsavelIniciais' | 'atrasada' | null> = {
    id: 'id',
    'nºsolicitação': 'id',
    'numeroSolicitacao': 'id',
    codigo: 'codigo',
    'códigodoprodutocomponente': 'codigo',
    data: 'data',
    datasolicitacao: 'data',
    'datadasolicitação': 'data',
    previsoriodevolutiva: 'previsao',
    previsao: 'previsao',
    prioridade: 'prioridade',
    cliente: 'cliente',
    nomedocliente: 'cliente',
    solicitante: 'solicitante',
    nomedosolicitante: 'solicitante',
    setor: 'setor',
    setorsolicitante: 'setor',
    responsavel: 'responsavel',
    responsaveltecnico: 'responsavel',
    responsaveliniciais: 'responsavelIniciais',
    responsavel_iniciais: 'responsavelIniciais',
    descricaoequipamento: 'equipamento',
    'descrição/tipodeequipamento': 'equipamento',
    'descrição / tipodeequipamento': 'equipamento',
    objetivo: 'objetivoTeste',
    objetivodeteste: 'objetivoTeste',
    resultadoesperado: 'resultadoEsperado',
    fotosdoequipamento: 'fotosEquipamento',
    motivo: 'motivoSolicitacao',
    motivodasolicitação: 'motivoSolicitacao',
    documentoscomplementares: 'documentosComplementares',
    status: 'status',
    conclusãotécnica: 'conclusaoTecnica',
    conclusaotecnica: 'conclusaoTecnica',
    melhoriasidentificadas: 'melhoriasIdentificadas',
    datadefinalização: 'dataFinalizacao',
    email: 'email',
    'e-mail': 'email',
    atrasada: 'atrasada',
    atrasado: 'atrasada',
    'carimbodedata/hora': 'timestamp',
    'carimbodedatahora': 'timestamp',
  }
  return map[normalizedHeader] ?? null
}

export function parseBoolean(value: unknown) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return ['true', '1', 'sim', 'yes', 'y'].includes(normalized)
}

export function resolveStatus(value: unknown) {
  const normalized = String(value ?? '').trim().toLowerCase()
  const found = Object.entries(STATUS).find(
    ([key, meta]) => key === normalized || meta.label.toLowerCase() === normalized,
  )
  return (found?.[0] ?? 'aberta') as StatusKey
}

export function resolvePriority(value: unknown) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized.includes('crit')) return 'critica'
  if (normalized.includes('alt')) return 'alta'
  if (normalized.includes('méd') || normalized.includes('med')) return 'media'
  return 'baixa'
}

function parseDateDMY(value: string) {
  const [day, month, year] = String(value)
    .split('/')
    .map((part) => Number(part.trim()))
  if (!day || !month || !year) return null
  return new Date(year, month - 1, day)
}

function computeIsDelayed(previsao: string, status: StatusKey) {
  const date = parseDateDMY(previsao)
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today && status !== 'finalizada'
}

export function buildSolicitacaoFromRow(row: Record<string, unknown>): Solicitacao {
  const status = resolveStatus(row.status)
  const prioridade = resolvePriority(row.prioridade)
  const responsavel = String(row.responsavel ?? row.responsavelTecnico ?? '').trim() || 'Sem responsável'
  const responsavelIniciais = (String(row.responsavelIniciais ?? '')
    .trim()
    .slice(0, 2)
    .toUpperCase() ||
    responsavel
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()) || '??'
  const dataSolicitacao = String(row.data ?? row.dataSolicitacao ?? row.dataDaSolicitacao ?? '').trim()
  const previsao = String(row.previsao ?? row.previsaoDeDevolutiva ?? '').trim()
  const descricao = String(row.equipamento ?? row.descricaoEquipamento ?? row['descrição/tipo de equipamento'] ?? '').trim()
  const codigo = String(row.codigo ?? row.codigoDoProdutoComponente ?? '').trim()

  return {
    id: String(row.id ?? row.numeroSolicitacao ?? row['nºSolicitação'] ?? '').trim() || 'N/A',
    timestamp: String(row.timestamp ?? row.carimbo ?? row.carimbodeDataHora ?? '').trim(),
    data: dataSolicitacao || '',
    cliente: String(row.cliente ?? row.nomeDoCliente ?? '').trim() || 'Cliente não informado',
    solicitante: String(row.solicitante ?? row.nomeDoSolicitante ?? '').trim() || 'Não informado',
    setorSolicitante: String(row.setor ?? row.setorSolicitante ?? '').trim() || 'Não informado',
    setor: String(row.setor ?? row.setorSolicitante ?? '').trim() || 'Outros',
    prioridade,
    status,
    responsavel,
    responsavelIniciais,
    previsao: previsao || '',
    equipamento: descricao || 'Não informado',
    codigo: codigo || 'Não informado',
    numeroSerie: String(row.numeroSerie ?? row.numeroDeSerie ?? '').trim(),
    objetivoTeste: String(row.objetivoTeste ?? row.objetivoDoTeste ?? '').trim(),
    resultadoEsperado: String(row.resultadoEsperado ?? '').trim(),
    fotosEquipamento: String(row.fotosEquipamento ?? '').trim(),
    motivoSolicitacao: String(row.motivoSolicitacao ?? row.motivoDaSolicitacao ?? '').trim(),
    documentosComplementares: String(row.documentosComplementares ?? '').trim(),
    conclusaoTecnica: String(row.conclusaoTecnica ?? row.conclusãoTécnica ?? '').trim(),
    melhoriasIdentificadas: String(row.melhoriasIdentificadas ?? '').trim(),
    dataFinalizacao: String(row.dataFinalizacao ?? row.dataDeFinalizacao ?? '').trim(),
    email: String(row.email ?? '').trim(),
    atrasada: parseBoolean(row.atrasada ?? row.atrasado ?? computeIsDelayed(previsao, status)),
  }
}

export async function authorizeSheets() {
  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error('Google Sheets credentials are not configured.')
  }

  const jwtClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  await jwtClient.authorize()
  return {
    jwtClient,
    sheetsApi: google.sheets({ version: 'v4', auth: jwtClient }),
  }
}

export async function getSheetTitle(authClient: any) {
  const sheetsApi = google.sheets({ version: 'v4', auth: authClient })
  const response = await sheetsApi.spreadsheets.get({ spreadsheetId: sheetId! })
  return response.data.sheets?.[0]?.properties?.title ?? 'Sheet1'
}

export async function fetchSolicitacoesFromSheet() {
  if (!sheetId || !clientEmail || !privateKey) {
    console.warn('Google Sheets credentials are not configured. Using demo data fallback.')
    return demoSolicitacoes
  }

  try {
    const { jwtClient, sheetsApi } = await authorizeSheets()
    const sheetTitle = await getSheetTitle(jwtClient)
    const range = `${sheetTitle}!A1:Z1000`
    const response = await sheetsApi.spreadsheets.values.get({ spreadsheetId: sheetId!, range })
    const rows = response.data.values ?? []

    if (rows.length < 2) {
      return [] as Solicitacao[]
    }

    const headers = rows[0].map((header) => normalizeHeader(String(header)))
    return rows.slice(1).map((row) => {
      const rowObject: Record<string, unknown> = {}
      row.forEach((cell, index) => {
        const headerKey = mapHeaderKey(headers[index])
        if (headerKey) {
          rowObject[headerKey] = cell
        }
      })
      return buildSolicitacaoFromRow(rowObject)
    })
  } catch (error) {
    console.warn(
      '[v0] Failed to read Google Sheet (check GOOGLE_SHEET_ID and that the service account has access). Using demo data fallback.',
      error instanceof Error ? error.message : error,
    )
    return demoSolicitacoes
  }
}
