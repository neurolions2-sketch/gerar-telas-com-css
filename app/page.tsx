import Link from 'next/link'
import {
  ClipboardList,
  Search,
  FlaskConical,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import { AppShell } from '@/components/nexlab/app-shell'
import { Panel, PanelHead } from '@/components/nexlab/primitives'
import { KpiCard } from '@/components/nexlab/kpi-card'
import { CountUp } from '@/components/nexlab/count-up'
import { DonutChart, HorizontalBars, LineChart } from '@/components/nexlab/charts'
import { StatusBadge, PriorityTag } from '@/components/nexlab/badges'
import { fetchSolicitacoesFromSheet } from '@/lib/google-sheets'
import { STATUS, type Solicitacao, type StatusKey } from '@/lib/nexlab-data'

type StatusBreakdownItem = { key: StatusKey; pct: number }
type ChartRow = { label: string; value: number; pct: number }

function parseDateDMY(dateString: string) {
  const [day, month, year] = String(dateString).split('/').map(Number)
  return { day, month, year }
}

function formatMonthLabel(monthNumber: number, year: number) {
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${names[monthNumber - 1] ?? '??'} ${year}`
}

function buildStatusBreakdown(items: Solicitacao[]): StatusBreakdownItem[] {
  return Object.keys(STATUS).map((key) => {
    const count = items.filter((item) => item.status === key).length
    return {
      key: key as StatusKey,
      pct: items.length ? Math.round((count / items.length) * 100) : 0,
    }
  })
}

function buildSetorBreakdown(items: Solicitacao[]) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.setor ?? 'Outros'] = (acc[item.setor ?? 'Outros'] ?? 0) + 1
    return acc
  }, {})
  const max = Math.max(...Object.values(counts), 1)
  return Object.entries(counts).map(([label, value]) => ({ label, value, pct: Math.round((value / max) * 100) }))
}

function buildTopClients(items: Solicitacao[]) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.cliente] = (acc[item.cliente] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .map(([nome, value]) => ({ nome, value, pct: items.length ? Math.round((value / items.length) * 100) : 0 }))
    .sort((a, b) => b.value - a.value)
}

function buildEvolucaoMensal(items: Solicitacao[]) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const { day, month, year } = parseDateDMY(item.data)
    if (!day || !month || !year) return acc
    const key = `${year}-${String(month).padStart(2, '0')}`
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [year, month] = key.split('-').map(Number)
      return { mes: formatMonthLabel(month, year).split(' ')[0].toUpperCase(), value }
    })
}

function compareByDateDesc(a: Solicitacao, b: Solicitacao) {
  const aDate = parseDateDMY(a.data)
  const bDate = parseDateDMY(b.data)
  const dateA = new Date(aDate.year, aDate.month - 1, aDate.day).getTime()
  const dateB = new Date(bDate.year, bDate.month - 1, bDate.day).getTime()
  return dateB - dateA
}

export default async function DashboardPage() {
  const solicitacoes = await fetchSolicitacoesFromSheet()
  const total = solicitacoes.length
  const kpis = {
    total,
    analise: solicitacoes.filter((item) => item.status === 'analise').length,
    teste: solicitacoes.filter((item) => item.status === 'teste').length,
    finalizadas: solicitacoes.filter((item) => item.status === 'finalizada').length,
    canceladas: solicitacoes.filter((item) => item.status === 'cancelada').length,
    atrasadas: solicitacoes.filter((item) => item.atrasada).length,
  }
  const statusBreakdown = buildStatusBreakdown(solicitacoes)
  const setorBreakdown = buildSetorBreakdown(solicitacoes)
  const evolucaoMensal = buildEvolucaoMensal(solicitacoes)
  const recent = [...solicitacoes].sort(compareByDateDesc).slice(0, 6)
  const topClientes = buildTopClients(solicitacoes).slice(0, 6)

  return (
    <AppShell crumb="NEXLAB / OPERAÇÃO" title="Dashboard Executivo">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total" value={kpis.total} delta="↑ +12 esta semana" icon={ClipboardList} severity="neutral" />
        <KpiCard label="Em análise" value={kpis.analise} delta="15% do total" icon={Search} severity="warning" />
        <KpiCard label="Em teste" value={kpis.teste} delta="21% do total" icon={FlaskConical} severity="info" />
        <KpiCard label="Finalizadas" value={kpis.finalizadas} delta="57% do total" icon={Check} severity="success" />
        <KpiCard label="Canceladas" value={kpis.canceladas} delta="3,6% do total" icon={X} severity="neutral" />
        <KpiCard label="Atrasadas" value={kpis.atrasadas} delta="requer atenção" icon={AlertTriangle} severity="danger" />
      </div>

      {/* Donut + bars */}
      <div className="grid gap-3.5 lg:grid-cols-[1.3fr_1fr]">
        <Panel>
          <PanelHead title="Status das Solicitações" tag="DONUT" />
          <div className="flex flex-wrap items-center gap-6">
            <DonutChart
              segments={statusBreakdown.map((s) => ({
                color: STATUS[s.key].color,
                pct: s.pct,
              }))}
              centerValue={`${total}`}
              centerLabel="total"
            />
            <div className="flex flex-1 flex-col gap-2">
              {statusBreakdown.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-[11.5px]">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[3px]"
                    style={{ background: STATUS[s.key].color }}
                  />
                  <span className="flex-1 font-medium text-ink-soft">{STATUS[s.key].label}</span>
                  <span className="font-mono font-semibold">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Solicitações por Setor" tag="BAR" />
          <HorizontalBars rows={setorBreakdown} labelWidth={90} />
        </Panel>
      </div>

      {/* Line + tempo medio */}
      <div className="grid gap-3.5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead title="Evolução Mensal de Solicitações" tag="LINE" />
          <LineChart data={evolucaoMensal} />
        </Panel>
        <Panel>
          <PanelHead title="Tempo Médio" tag="KPI" />
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-2">
            <div className="font-mono text-[34px] font-bold">
              <CountUp value={6.4} decimals={1} />
              <span className="text-[15px] font-semibold text-ink-faint"> dias</span>
            </div>
            <div className="text-[11px] text-ink-faint">meta: 5,0 dias</div>
            <span className="mt-2 h-[7px] w-full overflow-hidden rounded-full bg-surface-alt">
              <span className="animate-grow-x block h-full rounded-full bg-gradient-to-r from-warning to-[#c2410c]" style={{ width: '78%' }} />
            </span>
          </div>
        </Panel>
      </div>

      {/* Recent table */}
      <Panel className="overflow-hidden">
        <PanelHead title="Solicitações Recentes" tag={`${recent.length} DE ${total}`} />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Nº', 'Data', 'Cliente', 'Equipamento', 'Prioridade', 'Status', 'Responsável', 'Previsão'].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-border px-2.5 pb-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-ink-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr
                  key={r.id}
                  className="animate-fade-up cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-surface-alt"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-2.5 py-3 font-mono text-[11.5px] font-semibold whitespace-nowrap">
                    <Link href={`/detalhe/${r.id}`} className="block">{r.id}</Link>
                  </td>
                  <td className="px-2.5 py-3 font-mono text-[11.5px] text-ink-soft whitespace-nowrap">{r.data}</td>
                  <td className="px-2.5 py-3 text-[12.5px] whitespace-nowrap">{r.cliente}</td>
                  <td className="px-2.5 py-3 text-[12.5px] whitespace-nowrap">{r.equipamento}</td>
                  <td className="px-2.5 py-3 whitespace-nowrap"><PriorityTag priority={r.prioridade} /></td>
                  <td className="px-2.5 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                  <td className="px-2.5 py-3 text-[12.5px] whitespace-nowrap">{r.responsavel}</td>
                  <td className="px-2.5 py-3 font-mono text-[11.5px] text-ink-soft whitespace-nowrap">{r.previsao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  )
}
