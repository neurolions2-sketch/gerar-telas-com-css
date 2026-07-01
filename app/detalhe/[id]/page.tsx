import Link from 'next/link'
import { ArrowLeft, Download, FileText, Pencil } from 'lucide-react'
import { AppShell } from '@/components/nexlab/app-shell'
import { Panel, PanelHead, Btn } from '@/components/nexlab/primitives'
import { StatusBadge, PriorityTag } from '@/components/nexlab/badges'
import { Gallery } from '@/components/nexlab/gallery'
import { Timeline, type TimelineStep } from '@/components/nexlab/timeline'
import { fetchSolicitacoesFromSheet } from '@/lib/google-sheets'
import { type Solicitacao } from '@/lib/nexlab-data'
function splitLinks(value?: string) {
  return String(value ?? '')
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url).pathname
    const name = decodeURIComponent(path.split('/').filter(Boolean).pop() ?? '')
    return name || url
  } catch {
    return url
  }
}

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

  const fotos = splitLinks(sol.fotosEquipamento)
  const images = fotos.map((src, index) => ({ src, alt: `Foto do equipamento ${index + 1}` }))
  const documentos = splitLinks(sol.documentosComplementares).map((url) => ({
    nome: fileNameFromUrl(url),
    url,
  }))

  const flow: { key: Solicitacao['status']; title: string }[] = [
    { key: 'aberta', title: 'Solicitação aberta' },
    { key: 'analise', title: 'Em análise' },
    { key: 'material', title: 'Aguardando material' },
    { key: 'teste', title: 'Em teste' },
    { key: 'relatorio', title: 'Elaboração do relatório' },
    { key: 'finalizada', title: 'Finalizada' },
  ]
  const currentIndex = flow.findIndex((step) => step.key === sol.status)
  const steps: TimelineStep[] = flow.map((step, index) => {
    let sub = 'Pendente'
    if (step.key === 'aberta') sub = [sol.data, sol.solicitante].filter(Boolean).join(' · ') || 'Não informado'
    else if (step.key === 'finalizada' && sol.dataFinalizacao) sub = `Concluída em ${sol.dataFinalizacao}`
    else if (index === currentIndex) sub = 'Em andamento'
    else if (currentIndex >= 0 && index < currentIndex) sub = 'Concluída'
    return { title: step.title, sub, done: currentIndex >= 0 && index <= currentIndex }
  })

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
              <Field label="Equipamento" value={sol.equipamento || 'Não informado'} />
              <Field label="Código" value={sol.codigo || 'Não informado'} mono />
              <Field label="Nº de série" value={sol.numeroSerie || 'Não informado'} mono />
              <Field label="Objetivo do teste" value={sol.objetivoTeste || 'Não informado'} />
            </div>
            <Field
              label="Motivo da solicitação"
              long
              value={sol.motivoSolicitacao || 'Não informado'}
            />
            {sol.resultadoEsperado ? (
              <Field label="Resultado esperado" long value={sol.resultadoEsperado} />
            ) : null}
          </Panel>

          <Panel>
            <PanelHead title="Galeria de Fotos do Equipamento" tag={`${images.length} FOTO${images.length === 1 ? '' : 'S'}`} />
            {images.length > 0 ? (
              <Gallery images={images} />
            ) : (
              <p className="text-[12.5px] text-ink-faint">Nenhuma foto do equipamento cadastrada nesta solicitação.</p>
            )}
          </Panel>

          <Panel>
            <PanelHead title="Documentos Complementares" />
            {documentos.length > 0 ? (
              <div className="flex flex-col gap-2">
                {documentos.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-[10px] border border-border px-3 py-2.5 transition-colors hover:bg-surface-alt"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fceae8] text-danger">
                      <FileText className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="flex flex-1 flex-col leading-tight">
                      <span className="truncate text-[12px] font-semibold">{doc.nome}</span>
                      <span className="text-[10.5px] text-ink-faint">Abrir documento</span>
                    </div>
                    <Download className="h-4 w-4 text-ink-faint" strokeWidth={2} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-ink-faint">Nenhum documento complementar cadastrado.</p>
            )}
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
              {sol.conclusaoTecnica ||
                (sol.status === 'finalizada'
                  ? 'Solicitação finalizada sem conclusão técnica registrada.'
                  : 'Conclusão técnica ainda não registrada para esta solicitação.')}
            </p>
            {sol.melhoriasIdentificadas ? (
              <div className="mt-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.04em] text-ink-faint">
                  Melhorias identificadas
                </span>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{sol.melhoriasIdentificadas}</p>
              </div>
            ) : null}
            {sol.previsao ? (
              <div className="mt-1 flex items-center gap-2 rounded-[10px] bg-surface-alt px-3 py-2.5 text-[11.5px] text-ink-soft">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {sol.status === 'finalizada' && sol.dataFinalizacao
                  ? `Finalizada em ${sol.dataFinalizacao}`
                  : `Devolutiva prevista para ${sol.previsao}`}
              </div>
            ) : null}
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
