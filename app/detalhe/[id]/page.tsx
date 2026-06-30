import Link from 'next/link'
import { ArrowLeft, Download, FileText, Pencil } from 'lucide-react'
import { AppShell } from '@/components/nexlab/app-shell'
import { Panel, PanelHead, Btn } from '@/components/nexlab/primitives'
import { StatusBadge, PriorityTag } from '@/components/nexlab/badges'
import { Gallery } from '@/components/nexlab/gallery'
import { Timeline, type TimelineStep } from '@/components/nexlab/timeline'
import { fetchSolicitacoesFromSheet } from '@/lib/google-sheets'
import { type Solicitacao } from '@/lib/nexlab-data'
import { ProgressRing } from '@/components/nexlab/charts'

const images = [
  { src: '/equip/transformador-1.png', alt: 'Equipamento no banco de testes' },
  { src: '/equip/transformador-2.png', alt: 'Detalhe dos terminais e conexões' },
  { src: '/equip/transformador-3.png', alt: 'Medição com multímetro digital' },
]

const documentos = [
  { nome: 'Laudo-preliminar-SOL.pdf', tamanho: '1,2 MB' },
  { nome: 'Especificacao-tecnica.pdf', tamanho: '840 KB' },
  { nome: 'Foto-etiqueta-equipamento.pdf', tamanho: '512 KB' },
]

export default async function DetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const solicitacoes = await fetchSolicitacoesFromSheet()
  const fallback: Solicitacao = {
    id: 'N/A',
    data: '',
    solicitante: '',
    cliente: '',
    prioridade: 'baixa',
    previsao: '',
    equipamento: '',
    codigo: '',
    status: 'aberta',
    responsavel: '',
    responsavelIniciais: '',
  }
  const sol = solicitacoes.find((s) => s.id === decoded) ?? solicitacoes[0] ?? fallback

  const steps: TimelineStep[] = [
    { title: 'Solicitação aberta', sub: `${sol.data} · ${sol.solicitante}`, done: true },
    { title: 'Triagem técnica', sub: '28/06/2026 · Coordenação', done: true },
    { title: 'Análise inicial', sub: '29/06/2026 · ' + sol.responsavel, done: true },
    { title: 'Em teste de bancada', sub: 'Em andamento · laboratório', done: false },
    { title: 'Elaboração do relatório', sub: 'Pendente', done: false },
    { title: 'Devolutiva ao cliente', sub: `Previsto ${sol.previsao}`, done: false },
  ]

  return (
    <AppShell crumb={`NEXLAB / SOLICITAÇÕES / ${sol.id}`} title="Detalhe da Solicitação">
      <Link
        href="/solicitacoes"
        className="inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Voltar para solicitações
      </Link>

      {/* Header */}
      <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] text-ink-faint">{sol.id}</span>
          <h2 className="text-lg font-extrabold">
            {sol.equipamento} — {sol.cliente}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PriorityTag priority={sol.prioridade} />
            <StatusBadge status={sol.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Btn variant="ghost">
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            Editar status
          </Btn>
          <Btn>
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            Exportar relatório PDF
          </Btn>
        </div>
      </div>

      <div className="grid items-start gap-3.5 lg:grid-cols-[2fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-3.5">
          <Panel>
            <PanelHead title="Dados Gerais" />
            <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
              <Field label="Cliente" value={sol.cliente} />
              <Field label="Solicitante" value={sol.solicitante ?? 'Não informado'} />
              <Field label="Setor" value={sol.setor ?? 'Não informado'} />
              <Field label="Data de abertura" value={sol.data} />
              <Field label="Responsável técnico" value={sol.responsavel ?? 'Sem responsável'} />
              <Field label="Previsão de devolutiva" value={sol.previsao ?? 'Não informado'} />
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Dados Técnicos" />
            <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
              <Field label="Equipamento" value={sol.equipamento} />
              <Field label="Código" value={sol.codigo} mono />
              <Field label="Nº de série" value="SN-2026-44871" mono />
              <Field label="Tensão nominal" value="13,8 kV" />
            </div>
            <Field
              label="Descrição da ocorrência"
              long
              value="Equipamento apresentou variação de leitura fora da faixa de tolerância durante a operação. Solicitada análise completa de calibração, isolação e resposta de carga conforme norma técnica vigente."
            />
          </Panel>

          <Panel>
            <PanelHead title="Galeria de Fotos do Equipamento" tag="3 FOTOS" />
            <Gallery images={images} />
          </Panel>

          <Panel>
            <PanelHead title="Documentos Complementares" />
            <div className="flex flex-col gap-2">
              {documentos.map((doc) => (
                <div
                  key={doc.nome}
                  className="flex items-center gap-2.5 rounded-[10px] border border-border px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fceae8] text-danger">
                    <FileText className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="flex flex-1 flex-col leading-tight">
                    <span className="text-[12px] font-semibold">{doc.nome}</span>
                    <span className="text-[10.5px] text-ink-faint">{doc.tamanho}</span>
                  </div>
                  <Download className="h-4 w-4 text-ink-faint" strokeWidth={2} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3.5">
          <Panel>
            <PanelHead title="Linha do Tempo" />
            <Timeline steps={steps} />
          </Panel>

          <Panel>
            <PanelHead title="Conclusão Técnica" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              Análise em andamento. Os ensaios preliminares indicam desvio de
              calibração compatível com desgaste de uso. Aguardando teste de
              bancada para confirmação antes da emissão do laudo final.
            </p>
            <div className="mt-1 flex items-center gap-2 rounded-[10px] bg-surface-alt px-3 py-2.5 text-[11.5px] text-ink-soft">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
              Laudo final previsto para {sol.previsao}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}

function Field({
  label,
  value,
  mono,
  long,
}: {
  label: string
  value: string
  mono?: boolean
  long?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 ${long ? 'sm:col-span-2' : ''}`}>
      <span className="text-[10.5px] font-bold uppercase tracking-[0.04em] text-ink-faint">
        {label}
      </span>
      <span
        className={`${long ? 'text-[12.5px] font-normal leading-relaxed text-ink-soft' : 'text-[13px] font-medium'} ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
