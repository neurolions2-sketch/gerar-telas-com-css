'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/nexlab/app-shell'
import { Panel, PanelHead, PageHeader, Btn } from '@/components/nexlab/primitives'
import { DonutChart, HorizontalBars } from '@/components/nexlab/charts'
import { STATUS, type Solicitacao, type StatusKey } from '@/lib/nexlab-data'
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'

const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function parseDateDMY(dateString: string) {
  const [day, month, year] = String(dateString).split('/').map(Number)
  return { day, month, year }
}

function formatMonthLabel(month: number, year: number) {
  const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${names[month - 1] ?? 'Mês'} ${year}`
}

function buildMonthList(items: Solicitacao[]) {
  const map = new Map<string, { year: number; month: number; label: string }>()
  items.forEach((item) => {
    const { month, year } = parseDateDMY(item.previsao)
    if (!month || !year) return
    const key = `${year}-${String(month).padStart(2, '0')}`
    map.set(key, { year, month, label: formatMonthLabel(month, year) })
  })
  return Array.from(map.values()).sort((a, b) => a.year - b.year || a.month - b.month)
}

function buildCalendar(month: number, year: number, items: Solicitacao[]) {
  const firstOfMonth = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0).getDate()
  const firstWeekday = firstOfMonth.getDay()

  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1
    const date = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
    const events = items.filter((item) => item.previsao === date).length
    return { day, date, events }
  })

  return { firstWeekday, days }
}

function buildStatusSummary(items: Solicitacao[]) {
  const counts = items.reduce<Partial<Record<StatusKey, number>>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1
    return acc
  }, {})
  const total = items.length || 1
  return Object.entries(counts).map(([key, value]) => ({ key: key as StatusKey, pct: Math.round(((value ?? 0) / total) * 100) }))
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

export default function CalendarioPage() {
  const [cards, setCards] = useState<Solicitacao[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [monthIndex, setMonthIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kanban')
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || 'Falha ao carregar os dados do calendário')
        }
        const payload = (await res.json()) as { data: Solicitacao[] }
        setCards(payload.data)
        setError(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const months = useMemo(() => buildMonthList(cards), [cards])
  useEffect(() => {
    if (months.length > 0 && monthIndex >= months.length) {
      setMonthIndex(months.length - 1)
    }
  }, [months, monthIndex])

  const selectedMonth = months[monthIndex] ?? { label: 'Junho 2026', year: 2026, month: 6 }
  const calendar = useMemo(() => buildCalendar(selectedMonth.month, selectedMonth.year, cards), [cards, selectedMonth])
  const monthEvents = useMemo(
    () => cards.filter((item) => {
      const parsed = parseDateDMY(item.previsao)
      return parsed.year === selectedMonth.year && parsed.month === selectedMonth.month
    }),
    [cards, selectedMonth],
  )
  const overdueCount = useMemo(() => cards.filter((item) => item.atrasada).length, [cards])
  const nextWeekCount = useMemo(
    () => cards.filter((item) => {
      const parsed = parseDateDMY(item.previsao)
      return parsed.year === selectedMonth.year && parsed.month === selectedMonth.month && parsed.day <= 7
    }).length,
    [cards, selectedMonth],
  )
  const statusBreakdown = useMemo(() => buildStatusSummary(cards), [cards])
  const topClientes = useMemo(() => buildTopClients(cards), [cards])

  return (
    <AppShell crumb="NEXLAB / OPERAÇÃO" title="Calendário">
      <PageHeader
        eyebrow="Operação"
        title="Calendário"
        description="Navegue entre meses para visualizar prazos, eventos e o fluxo de solicitações do laboratório."
        actions={
          <Btn variant="ghost">
            <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
            Sincronizar agora
          </Btn>
        }
      />

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-ink-soft">Carregando dados do calendário...</div>
      ) : error ? (
        <div className="rounded-3xl border border-danger bg-surface-alt p-6 text-center text-sm text-danger">{error}</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.5fr_0.95fr]">
          <Panel>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <PanelHead title="Calendário mensal" />
                  <p className="text-[13px] text-ink-soft">Visualização completa do mês com dias programados e métricas operacionais.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMonthIndex((value) => Math.max(0, value - 1))}
                    disabled={monthIndex === 0}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink-soft transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <div className="rounded-full border border-border bg-surface-alt px-4 py-2 text-sm font-semibold text-foreground">
                    {selectedMonth.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonthIndex((value) => Math.min(months.length - 1, value + 1))}
                    disabled={monthIndex === months.length - 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink-soft transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                {weekDayLabels.map((label) => (
                  <div key={label} className="text-center font-semibold">
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: calendar.firstWeekday }).map((_, index) => (
                  <div key={`blank-${index}`} className="h-24 rounded-[18px] bg-transparent" />
                ))}
                {calendar.days.map((day) => (
                  <div
                    key={day.date}
                    className={`group flex h-24 flex-col justify-between rounded-[18px] border p-3 transition ${
                      day.events > 0 ? 'border-primary/30 bg-primary/5 shadow-[0_10px_30px_rgba(59,130,246,0.08)]' : 'border-border bg-card'
                    } hover:border-primary/50 hover:bg-white/5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{day.day}</span>
                      {day.events > 0 ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                    </div>
                    <div className="text-[11px] text-ink-faint">
                      {day.events} evento{day.events === 1 ? '' : 's'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Visão rápida" />
            <div className="space-y-4">
              <div className="rounded-[22px] border border-border bg-surface-alt p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">Resumo do mês</p>
                <div className="mt-3 space-y-3">
                  <PanelStat label="Eventos no mês" value={`${monthEvents.length}`} />
                  <PanelStat label="Prazos na semana" value={`${nextWeekCount}`} />
                  <PanelStat label="Atrasos" value={`${overdueCount}`} />
                </div>
              </div>

              <div className="rounded-[24px] border border-border bg-card p-4">
                <PanelHead title="Distribuição de status" />
                <div className="mt-5 flex items-center justify-center">
                  <DonutChart
                    size={156}
                    segments={statusBreakdown.map((item) => ({ color: STATUS[item.key]?.color ?? '#9ca3af', pct: item.pct }))}
                    centerValue={`${cards.length}`}
                    centerLabel="solic."
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-border bg-card p-4">
                <PanelHead title="Top clientes do mês" />
                <div className="mt-4">
                  <HorizontalBars rows={topClientes.slice(0, 5).map((item) => ({ label: item.nome, value: item.value, pct: item.pct }))} />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  )
}

function PanelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-border bg-card px-3 py-3">
      <span className="text-[12px] text-ink-faint">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
