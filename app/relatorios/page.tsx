'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/nexlab/app-shell'
import { Panel, PanelHead, PageHeader, Btn } from '@/components/nexlab/primitives'
import { HorizontalBars } from '@/components/nexlab/charts'
import { STATUS, type Solicitacao } from '@/lib/nexlab-data'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { FileText, BarChart3, Clock3, Download, Plus } from 'lucide-react'

type ReportType = 'pdf' | 'excel'
type ReportItem = { titulo: string; meta: string; tipo: ReportType }

const relatoriosRecentes: ReportItem[] = [
  {
    titulo: 'Relatório Mensal',
    meta: 'PDF · panorama de solicitações do mês',
    tipo: 'pdf',
  },
  {
    titulo: 'Exportação Qualidade',
    meta: 'Excel · solicitações do setor Qualidade',
    tipo: 'excel',
  },
  {
    titulo: 'Indicadores de Atraso',
    meta: 'PDF · solicitações em atraso por setor',
    tipo: 'pdf',
  },
  {
    titulo: 'Top Clientes',
    meta: 'Excel · ranking consolidado de clientes',
    tipo: 'excel',
  },
]

function SummaryCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface-alt p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-[12px] text-ink-soft">{caption}</p>
    </div>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportQualityExcel(solicitacoes: Solicitacao[]) {
  const rows = solicitacoes
    .filter((item) => item.setor === 'Qualidade')
    .map((item) => ({
      'Nº Solicitação': item.id,
      Cliente: item.cliente,
      Setor: item.setor,
      Equipamento: item.equipamento,
      Responsável: item.responsavel,
      Prioridade: item.prioridade.toUpperCase(),
      Status: STATUS[item.status].label,
      Abertura: item.data,
      Previsão: item.previsao,
      Atrasada: item.atrasada ? 'Sim' : 'Não',
    }))

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      'Nº Solicitação',
      'Cliente',
      'Setor',
      'Equipamento',
      'Responsável',
      'Prioridade',
      'Status',
      'Abertura',
      'Previsão',
      'Atrasada',
    ],
  })

  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 24 },
    { wch: 22 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Qualidade Q2')
  downloadWorkbook(workbook, `Exportacao-Qualidade-Q2-${new Date().toISOString().split('T')[0]}.xlsx`)
}

function exportTopClientsExcel(topClientes: { nome: string; value: number; pct: number }[]) {
  const rows = topClientes.map((client, index) => ({
    Ranking: index + 1,
    Cliente: client.nome,
    'Volume de solicitações': client.value,
    'Participação (%)': client.pct,
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['Ranking', 'Cliente', 'Volume de solicitações', 'Participação (%)'],
  })

  worksheet['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 20 }, { wch: 16 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Clientes')
  downloadWorkbook(workbook, `Top-Clientes-Semestre-${new Date().toISOString().split('T')[0]}.xlsx`)
}

function exportReport(reportTitle: string, solicitacoes: Solicitacao[], topClientes: { nome: string; value: number; pct: number }[]) {
  try {
    if (reportTitle.includes('Qualidade')) {
      exportQualityExcel(solicitacoes)
    } else if (reportTitle.includes('Top Clientes')) {
      exportTopClientsExcel(topClientes)
    } else {
      exportQualityExcel(solicitacoes)
    }
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao gerar o arquivo Excel')
  }
}

function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename)
}

const monthNameToNumber: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  março: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
}

function parseMonthYear(reportTitle: string) {
  const match = reportTitle.match(/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+(\d{4}))?/i)
  if (!match) return null
  const monthName = match[1].toLowerCase()
  const year = match[2] ? Number(match[2]) : new Date().getFullYear()
  return { month: monthNameToNumber[monthName], year }
}

function parseDateDMY(dateString: string) {
  const [day, month, year] = String(dateString).split('/').map(Number)
  return { day, month, year }
}

function formatMonthLabel(month: number, year: number) {
  const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${names[month - 1] ?? 'Mês'} ${year}`
}

function filterSolicitacoesByMonthYear(solicitacoes: Solicitacao[], month: number, year: number) {
  return solicitacoes.filter((item) => {
    const parsed = parseDateDMY(item.data)
    return parsed.month === month && parsed.year === year
  })
}

function computeTopClients(items: Solicitacao[]) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.cliente] = (acc[item.cliente] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .map(([cliente, value]) => ({ cliente, value, pct: items.length ? Math.round((value / items.length) * 100) : 0 }))
    .sort((a, b) => b.value - a.value)
}

function generateMonthlyPdf(reportTitle: string, solicitacoes: Solicitacao[]) {
  const parsed = parseMonthYear(reportTitle) || { month: 6, year: 2026 }
  const data = filterSolicitacoesByMonthYear(solicitacoes, parsed.month, parsed.year)
  const topClients = computeTopClients(data).slice(0, 5)
  const total = data.length
  const finished = data.filter((item) => item.status === 'finalizada').length
  const delayed = data.filter((item) => item.atrasada).length
  const monthLabel = reportTitle.replace(/^Relatório\s+Mensal\s+—\s+/, '')

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  const pageWidth = doc.internal.pageSize.width
  const usableWidth = pageWidth - margin * 2
  let y = margin

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXLAB', margin, 52)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Relatório Mensal — ${monthLabel}`, margin, 72)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 40, { align: 'right' })
  doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, 58, { align: 'right' })

  y += 100
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(37, 99, 235)
  doc.roundedRect(margin, y, usableWidth, 60, 16, 16, 'F')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Panorama mensal', margin + 16, y + 24)
  doc.setFontSize(10)
  doc.text('Visão consolidada de solicitações, status e clientes mais ativos.', margin + 16, y + 42)

  y += 90
  const summaryCards = [
    { label: 'Total de solicitações', value: `${total}` },
    { label: 'Concluídas', value: `${finished}` },
    { label: 'Atrasadas', value: `${delayed}` },
  ]

  const cardWidth = (usableWidth - 20) / 3
  summaryCards.forEach((card, index) => {
    const x = margin + index * (cardWidth + 10)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, cardWidth, 70, 14, 14, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(card.label, x + 14, y + 20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(15, 23, 42)
    doc.text(card.value, x + 14, y + 48)
  })

  y += 100
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text(`Top ${topClients.length} clientes de ${monthLabel.toLowerCase()}`, margin, y)
  y += 24
  doc.setFontSize(10)
  topClients.forEach((client, index) => {
    doc.text(`${index + 1}. ${client.cliente}`, margin + 14, y)
    doc.text(`${client.pct}%`, margin + cardWidth + 10, y, { align: 'right' })
    y += 20
  })

  y += 12
  doc.setFontSize(12)
  doc.text(`Últimas solicitações de ${monthLabel.toLowerCase()}`, margin, y)
  y += 24
  doc.setFontSize(10)
  const latest = data.slice(0, 5)
  if (latest.length === 0) {
    doc.text('Sem dados disponíveis para este período.', margin + 14, y)
    y += 20
  } else {
    latest.forEach((item) => {
      doc.text(`${item.id} | ${item.cliente} | ${STATUS[item.status].label} | ${item.responsavel}`, margin + 14, y)
      y += 18
    })
  }

  y += 24
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Relatório focado nas métricas operacionais de ${monthLabel.toLowerCase()}, baseado nos dados de solicitações reais.`, margin, y, { maxWidth: usableWidth })

  downloadPdf(doc, `Relatorio-Mensal-${monthLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}

function generateDelayPdf(reportTitle: string, solicitacoes: Solicitacao[]) {
  const parsed = parseMonthYear(reportTitle) || { month: 5, year: 2026 }
  const filtered = filterSolicitacoesByMonthYear(solicitacoes, parsed.month, parsed.year)
  const delayed = filtered.filter((item) => item.atrasada)
  const delayedBySector = delayed.reduce<Record<string, number>>((acc, item) => {
    const setor = item.setor ?? 'Outros'
    acc[setor] = (acc[setor] ?? 0) + 1
    return acc
  }, {})
  const monthLabel = reportTitle.replace(/^Indicadores de Atraso\s+—\s+/, '')

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  const pageWidth = doc.internal.pageSize.width
  const usableWidth = pageWidth - margin * 2
  let y = margin

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXLAB', margin, 52)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Indicadores de Atraso — ${monthLabel}`, margin, 72)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 40, { align: 'right' })
  doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, 58, { align: 'right' })

  y += 100
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Resumo de atrasos', margin, y)
  y += 22
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Solicitações atrasadas: ${delayed.length} de ${filtered.length}`, margin, y)
  y += 18
  doc.text(`Percentual de atraso: ${filtered.length ? Math.round((delayed.length / filtered.length) * 100) : 0}%`, margin, y)

  y += 30
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Atrasos por setor', margin, y)
  y += 22
  doc.setFontSize(10)
  if (Object.keys(delayedBySector).length === 0) {
    doc.text('Nenhum atraso encontrado para este período.', margin + 14, y)
    y += 20
  } else {
    Object.entries(delayedBySector).forEach(([setor, count]) => {
      doc.text(`${setor}: ${count} solicitações`, margin + 14, y)
      y += 18
    })
  }

  y += 16
  doc.setFontSize(12)
  doc.text('Top 5 solicitações atrasadas', margin, y)
  y += 24
  if (delayed.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text('Não há solicitações atrasadas neste período.', margin + 14, y)
    y += 20
  } else {
    delayed.slice(0, 5).forEach((item) => {
      doc.text(`${item.id} | ${item.cliente} | ${STATUS[item.status].label} | ${item.responsavel}`, margin + 14, y)
      y += 18
    })
  }

  y += 24
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Relatório com foco nos atrasos ativos de ${monthLabel.toLowerCase()}, responsável por área e principais solicitações pendentes.`, margin, y, {
    maxWidth: usableWidth,
  })

  downloadPdf(doc, `Indicadores-Atraso-${monthLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}

function generatePdf(reportTitle: string, solicitacoes: Solicitacao[]) {
  try {
    if (reportTitle.includes('Mensal')) {
      generateMonthlyPdf(reportTitle, solicitacoes)
    } else if (reportTitle.includes('Atraso')) {
      generateDelayPdf(reportTitle, solicitacoes)
    } else {
      generateMonthlyPdf(reportTitle, solicitacoes)
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar relatório PDF')
  }
}

export default function RelatoriosPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/kanban')
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || 'Falha ao carregar os dados da planilha')
        }
        const payload = (await res.json()) as { data: Solicitacao[] }
        setSolicitacoes(payload.data)
        setError(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const kpis = useMemo(() => {
    const total = solicitacoes.length
    return {
      total,
      analise: solicitacoes.filter((item) => item.status === 'analise').length,
      teste: solicitacoes.filter((item) => item.status === 'teste').length,
      finalizadas: solicitacoes.filter((item) => item.status === 'finalizada').length,
      canceladas: solicitacoes.filter((item) => item.status === 'cancelada').length,
      atrasadas: solicitacoes.filter((item) => item.atrasada).length,
    }
  }, [solicitacoes])

  const topClientes = useMemo(() => {
    const counts = solicitacoes.reduce<Record<string, number>>((acc, item) => {
      const cliente = item.cliente || 'Não informado'
      acc[cliente] = (acc[cliente] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
      .map(([nome, value]) => ({ nome, value, pct: solicitacoes.length ? Math.round((value / solicitacoes.length) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
  }, [solicitacoes])

  const currentMonth = useMemo(() => {
    const parsed = parseDateDMY(solicitacoes[0]?.previsao ?? '')
    if (!parsed.month || !parsed.year) {
      const now = new Date()
      return { month: now.getMonth() + 1, year: now.getFullYear(), label: formatMonthLabel(now.getMonth() + 1, now.getFullYear()) }
    }
    return { month: parsed.month, year: parsed.year, label: formatMonthLabel(parsed.month, parsed.year) }
  }, [solicitacoes])

  const currentReportTitle = `Relatório Mensal — ${currentMonth.label}`

  return (
    <AppShell crumb="NEXLAB / ANÁLISE" title="Relatórios">
      <PageHeader
        eyebrow="Análise"
        title="Relatórios"
        description="Relatórios operacionais e indicadores de desempenho, com acesso rápido aos últimos arquivos e volumes mais relevantes."
        actions={
          <>
            <Btn variant="ghost">
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Sincronizar
            </Btn>
            <Btn>
              <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
              Novo relatório
            </Btn>
          </>
        }
      />

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-ink-soft">
          Carregando dados da planilha...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-danger bg-surface-alt p-6 text-center text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Modelos de relatório" value={`${relatoriosRecentes.length}`} caption="Disponíveis para exportação" />
            <SummaryCard label="Solicitações no painel" value={`${kpis.total}`} caption="Total de solicitações" />
            <SummaryCard label="Atrasos ativos" value={`${kpis.atrasadas}`} caption="Solicitações em atraso" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_0.95fr]">
            <Panel>
              <PanelHead title="Relatórios recentes" />
              <div className="mt-4 space-y-3">
                {relatoriosRecentes.map((report) => (
                  <article
                    key={report.titulo}
                    className="grid gap-3 rounded-[20px] border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-surface-alt"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{report.titulo}</h3>
                        <p className="mt-1 text-[12px] text-ink-faint">{report.meta}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-surface-alt px-3 py-1 text-[11px] text-ink-faint">{report.tipo.toUpperCase()}</span>
                      <span className="text-[12px] font-medium text-ink-soft">Acesso rápido ao documento</span>
                    </div>
                    {report.tipo === 'excel' && (
                      <Btn
                        variant="ghost"
                        className="mt-2 w-full justify-center"
                        onClick={() => exportReport(report.titulo, solicitacoes, topClientes)}
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        Exportar Excel
                      </Btn>
                    )}
                    {report.tipo === 'pdf' && (
                      <Btn
                        variant="ghost"
                        className="mt-2 w-full justify-center"
                        onClick={() => generatePdf(report.titulo, solicitacoes)}
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        Exportar PDF
                      </Btn>
                    )}
                  </article>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Gerar relatório" />
              <div className="mt-4 space-y-4">
                <ReportMetric label="Total de solicitações" value={`${kpis.total}`} />
                <ReportMetric label="Solicitações em análise" value={`${kpis.analise}`} />
                <ReportMetric label="Concluídas" value={`${kpis.finalizadas}`} />
                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">Resumo</p>
                  <p className="mt-3 text-[13px] leading-6 text-ink-soft">
                    Relatório gerado a partir das métricas do painel e das tendências de volume. Inclui status operacionais, clientes prioritários e atrasos ativos para compartilhar rapidamente em reuniões.
                  </p>
                </div>
                <Btn onClick={() => generatePdf(currentReportTitle, solicitacoes)}>
                  <Download className="h-3.5 w-3.5" strokeWidth={2} />
                  Gerar relatório
                </Btn>
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-4">
          <Panel>
            <PanelHead title="Top clientes por volume" />
            <div className="mt-4">
              <HorizontalBars
                rows={topClientes.slice(0, 6).map((item) => ({ label: item.nome, value: item.value, pct: item.pct }))}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Notas de sincronização" />
            <div className="space-y-3">
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock3 className="h-4.5 w-4.5 text-secondary" />
                  Última sincronização concluída em 2 minutos.
                </div>
                <p className="mt-3 text-[13px] text-ink-soft">
                  Os dados estão atualizados com todas as solicitações recebidas e relatórios gerados automaticamente. Consulte o histórico sempre que precisar validar volumes ou prazos.
                </p>
              </div>
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BarChart3 className="h-4.5 w-4.5 text-primary" />
                  Indicadores principais
                </div>
                <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
                  <li className="flex items-center justify-between">
                    <span>Relatórios PDF</span>
                    <span className="font-semibold text-foreground">2</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Planilhas Excel</span>
                    <span className="font-semibold text-foreground">2</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Clientes no período</span>
                    <span className="font-semibold text-foreground">8</span>
                  </li>
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
