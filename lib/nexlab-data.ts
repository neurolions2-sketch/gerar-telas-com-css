export type StatusKey =
  | 'aberta'
  | 'analise'
  | 'material'
  | 'teste'
  | 'relatorio'
  | 'finalizada'
  | 'cancelada'

export type PriorityKey = 'baixa' | 'media' | 'alta' | 'critica'

export const STATUS: Record<
  StatusKey,
  { label: string; color: string; soft: string; ink: string }
> = {
  aberta: { label: 'Aberta', color: '#2563eb', soft: '#eaf1ff', ink: '#1d4ed8' },
  analise: { label: 'Em análise', color: '#d97706', soft: '#fdf3e5', ink: '#b45309' },
  material: { label: 'Aguardando material', color: '#0891b2', soft: '#e6f6fb', ink: '#0e7490' },
  teste: { label: 'Em teste', color: '#7c3aed', soft: '#f1ecfd', ink: '#6d28d9' },
  relatorio: { label: 'Em relatório', color: '#0d9488', soft: '#e7f6f5', ink: '#0f766e' },
  finalizada: { label: 'Finalizada', color: '#16a34a', soft: '#eaf7ee', ink: '#15803d' },
  cancelada: { label: 'Cancelada', color: '#dc2626', soft: '#fceae8', ink: '#b91c1c' },
}

export const PRIORITY: Record<PriorityKey, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: '#9aa6b8' },
  media: { label: 'Média', color: '#d97706' },
  alta: { label: 'Alta', color: '#ea580c' },
  critica: { label: 'Crítica', color: '#dc2626' },
}

export type Solicitacao = {
  id: string
  timestamp?: string
  data: string
  solicitante: string
  setor?: string
  setorSolicitante?: string
  cliente: string
  prioridade: PriorityKey
  previsao: string
  equipamento: string
  codigo: string
  numeroSerie?: string
  objetivoTeste?: string
  resultadoEsperado?: string
  fotosEquipamento?: string
  motivoSolicitacao?: string
  documentosComplementares?: string
  status: StatusKey
  responsavel: string
  responsavelIniciais: string
  conclusaoTecnica?: string
  melhoriasIdentificadas?: string
  dataFinalizacao?: string
  email?: string
  atrasada?: boolean
}

export const kanbanColumns: { key: StatusKey }[] = [
  { key: 'aberta' },
  { key: 'analise' },
  { key: 'material' },
  { key: 'teste' },
  { key: 'relatorio' },
  { key: 'finalizada' },
  { key: 'cancelada' },
]
