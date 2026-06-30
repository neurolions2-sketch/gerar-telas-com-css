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

const clientes = [
  'Vortex Indústria Ltda.',
  'Sertec Componentes',
  'Metalúrgica Andrade',
  'Polux Energia',
  'Cabralle Engenharia',
  'Norfield Petroquímica',
  'Delta Automação',
  'Brastemp Sistemas',
  'Quantum Sensores',
  'Ferraz Equipamentos',
  'TecnoVale Indústria',
  'Aurora Materiais',
]

const equipamentos = [
  'Transformador de corrente',
  'Atuador pneumático',
  'Motor de indução',
  'Sensor de pressão',
  'Válvula solenoide',
  'Disjuntor a vácuo',
  'Inversor de frequência',
  'Célula de carga',
  'Relé de proteção',
  'Bomba centrífuga',
  'Painel de comando',
  'Medidor de vazão',
]

const setores = ['Qualidade', 'Manutenção', 'Engenharia', 'Produção', 'P&D']

const responsaveis = [
  { nome: 'Eng. M. Tavares', iniciais: 'MT' },
  { nome: 'Eng. L. Prado', iniciais: 'LP' },
  { nome: 'Dra. C. Nunes', iniciais: 'CN' },
  { nome: 'Eng. R. Salles', iniciais: 'RS' },
  { nome: 'Téc. J. Moreira', iniciais: 'JM' },
  { nome: 'Eng. A. Bauer', iniciais: 'AB' },
]

const statusCycle: StatusKey[] = [
  'aberta',
  'analise',
  'material',
  'teste',
  'relatorio',
  'finalizada',
  'cancelada',
]
const prioCycle: PriorityKey[] = ['baixa', 'media', 'alta', 'critica']

function pad(n: number) {
  return String(n).padStart(4, '0')
}

export const solicitacoes: Solicitacao[] = Array.from({ length: 36 }).map(
  (_, i) => {
    const n = 241 - i
    const status = statusCycle[i % statusCycle.length]
    const prioridade = prioCycle[(i * 3 + 1) % prioCycle.length]
    const resp = responsaveis[i % responsaveis.length]
    const dia = 28 - (i % 26)
    const previsaoDia = 30 + (i % 5)
    const atrasada =
      (status === 'analise' || status === 'material' || status === 'teste') &&
      i % 4 === 1
    return {
      id: `SOL-2026-${pad(n)}`,
      data: `${String(dia).padStart(2, '0')}/06/2026`,
      cliente: clientes[i % clientes.length],
      solicitante: ['Ana Lima', 'Bruno Sá', 'Carla Reis', 'Diego Alves'][i % 4],
      equipamento: equipamentos[i % equipamentos.length],
      codigo: `EQ-${pad(1200 + n)}`,
      setor: setores[i % setores.length],
      prioridade,
      status,
      responsavel: resp.nome,
      responsavelIniciais: resp.iniciais,
      previsao: `${String(previsaoDia > 30 ? previsaoDia - 30 : previsaoDia).padStart(2, '0')}/${previsaoDia > 30 ? '07' : '06'}`,
      atrasada,
    }
  },
)

export const kpis = {
  total: 248,
  analise: 37,
  teste: 52,
  finalizadas: 141,
  canceladas: 9,
  atrasadas: 14,
}

export const heroStats = {
  tempoMedio: '6,4d',
  taxaConclusao: '94%',
  atrasadas: '14',
}

export const statusBreakdown: { key: StatusKey; pct: number }[] = [
  { key: 'aberta', pct: 34 },
  { key: 'analise', pct: 18 },
  { key: 'material', pct: 14 },
  { key: 'teste', pct: 12 },
  { key: 'finalizada', pct: 16 },
  { key: 'cancelada', pct: 6 },
]

export const setorBreakdown = [
  { label: 'Qualidade', value: 71, pct: 86 },
  { label: 'Manutenção', value: 53, pct: 64 },
  { label: 'Engenharia', value: 43, pct: 52 },
  { label: 'Produção', value: 34, pct: 41 },
  { label: 'P&D', value: 23, pct: 28 },
]

export const evolucaoMensal = [
  { mes: 'JAN', value: 28 },
  { mes: 'FEV', value: 34 },
  { mes: 'MAR', value: 31 },
  { mes: 'ABR', value: 48 },
  { mes: 'MAI', value: 44 },
  { mes: 'JUN', value: 63 },
]

export const kanbanColumns: { key: StatusKey }[] = [
  { key: 'aberta' },
  { key: 'analise' },
  { key: 'material' },
  { key: 'teste' },
  { key: 'relatorio' },
  { key: 'finalizada' },
  { key: 'cancelada' },
]

export const topClientes = [
  { nome: 'Vortex Indústria', value: 38, pct: 100 },
  { nome: 'Norfield Petroquímica', value: 31, pct: 82 },
  { nome: 'Polux Energia', value: 27, pct: 71 },
  { nome: 'Delta Automação', value: 22, pct: 58 },
  { nome: 'Sertec Componentes', value: 19, pct: 50 },
  { nome: 'Metalúrgica Andrade', value: 16, pct: 42 },
  { nome: 'Quantum Sensores', value: 13, pct: 34 },
  { nome: 'Cabralle Engenharia', value: 11, pct: 29 },
]

export const topEquipamentos = [
  { nome: 'Transformador de corrente', value: 44, pct: 100 },
  { nome: 'Motor de indução', value: 37, pct: 84 },
  { nome: 'Sensor de pressão', value: 29, pct: 66 },
  { nome: 'Disjuntor a vácuo', value: 24, pct: 55 },
  { nome: 'Relé de proteção', value: 20, pct: 45 },
  { nome: 'Inversor de frequência', value: 17, pct: 39 },
  { nome: 'Válvula solenoide', value: 14, pct: 32 },
  { nome: 'Bomba centrífuga', value: 12, pct: 27 },
]

export const tempoPorResponsavel = [
  { nome: 'Eng. M. Tavares', value: 4.8, pct: 60 },
  { nome: 'Dra. C. Nunes', value: 5.3, pct: 66 },
  { nome: 'Eng. R. Salles', value: 6.1, pct: 76 },
  { nome: 'Eng. L. Prado', value: 6.9, pct: 86 },
  { nome: 'Téc. J. Moreira', value: 7.4, pct: 92 },
  { nome: 'Eng. A. Bauer', value: 8.0, pct: 100 },
]

export const relatoriosRecentes = [
  {
    titulo: 'Relatório Mensal — Junho 2026',
    meta: 'PDF · 248 solicitações · gerado há 2h',
    tipo: 'pdf' as const,
  },
  {
    titulo: 'Exportação Qualidade — Q2',
    meta: 'Excel · setor Qualidade · gerado ontem',
    tipo: 'excel' as const,
  },
  {
    titulo: 'Indicadores de Atraso — Maio',
    meta: 'PDF · 18 ocorrências · 02/06/2026',
    tipo: 'pdf' as const,
  },
  {
    titulo: 'Top Clientes — Semestre',
    meta: 'Excel · ranking consolidado · 28/05/2026',
    tipo: 'excel' as const,
  },
]

export const usuarios = [
  { nome: 'Renata Castro', email: 'renata.castro@nexlab.com', papel: 'Coordenação Técnica', perfil: 'Administrador' },
  { nome: 'Marcos Tavares', email: 'marcos.tavares@nexlab.com', papel: 'Engenharia', perfil: 'Editor' },
  { nome: 'Carolina Nunes', email: 'carolina.nunes@nexlab.com', papel: 'P&D', perfil: 'Editor' },
  { nome: 'João Moreira', email: 'joao.moreira@nexlab.com', papel: 'Manutenção', perfil: 'Visualizador' },
  { nome: 'Lucas Prado', email: 'lucas.prado@nexlab.com', papel: 'Qualidade', perfil: 'Editor' },
]
