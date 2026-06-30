'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import { Btn, PageHeader, Panel } from './primitives'
import { PriorityTag, StatusBadge } from './badges'
import { PRIORITY, STATUS, type PriorityKey, type StatusKey } from '@/lib/nexlab-data'
import type { Solicitacao } from '@/lib/nexlab-data'

type Filters = {
  status: StatusKey | 'all'
  prioridade: PriorityKey | 'all'
  setor: string
}

const setores = ['Qualidade', 'Manutenção', 'Engenharia', 'Produção', 'P&D']
const PAGE_SIZE = 12

export function SolicitacoesView() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    prioridade: 'all',
    setor: 'all',
  })
  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [cards, setCards] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/kanban')
        if (!response.ok) {
          const json = await response.json().catch(() => null)
          throw new Error(json?.error || 'Falha ao carregar os dados da planilha')
        }
        const payload = (await response.json()) as { data: Solicitacao[] }
        setCards(payload.data)
        setError(null)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filtered = useMemo(() => {
    return cards.filter((s) => {
      if (filters.status !== 'all' && s.status !== filters.status) return false
      if (filters.prioridade !== 'all' && s.prioridade !== filters.prioridade) return false
      if (filters.setor !== 'all' && s.setor !== filters.setor) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          s.id.toLowerCase().includes(q) ||
          s.cliente.toLowerCase().includes(q) ||
          s.equipamento.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [cards, filters, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key))

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Solicitações"
        description="Lista completa de solicitações sincronizadas com a planilha do laboratório."
      />

      <Panel className="overflow-visible">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-[9px] border border-border bg-surface-alt px-3 py-2 text-[12.5px]">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar por nº, cliente ou equipamento…"
              className="w-full bg-transparent text-foreground outline-none placeholder:text-ink-faint"
            />
          </label>

          <FilterChip
            label="Status"
            value={filters.status === 'all' ? null : STATUS[filters.status].label}
            isOpen={open === 'status'}
            onToggle={() => toggle('status')}
            options={[
              { label: 'Todos', value: 'all' },
              ...(Object.keys(STATUS) as StatusKey[]).map((k) => ({
                label: STATUS[k].label,
                value: k,
              })),
            ]}
            onSelect={(v) => {
              setFilters((f) => ({ ...f, status: v as Filters['status'] }))
              setOpen(null)
              setPage(1)
            }}
          />
          <FilterChip
            label="Prioridade"
            value={filters.prioridade === 'all' ? null : PRIORITY[filters.prioridade].label}
            isOpen={open === 'prioridade'}
            onToggle={() => toggle('prioridade')}
            options={[
              { label: 'Todas', value: 'all' },
              ...(Object.keys(PRIORITY) as PriorityKey[]).map((k) => ({
                label: PRIORITY[k].label,
                value: k,
              })),
            ]}
            onSelect={(v) => {
              setFilters((f) => ({ ...f, prioridade: v as Filters['prioridade'] }))
              setOpen(null)
              setPage(1)
            }}
          />
          <FilterChip
            label="Setor"
            value={filters.setor === 'all' ? null : filters.setor}
            isOpen={open === 'setor'}
            onToggle={() => toggle('setor')}
            options={[
              { label: 'Todos', value: 'all' },
              ...setores.map((s) => ({ label: s, value: s })),
            ]}
            onSelect={(v) => {
              setFilters((f) => ({ ...f, setor: v }))
              setOpen(null)
              setPage(1)
            }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Nº', 'Data', 'Cliente', 'Solicitante', 'Equipamento', 'Código', 'Prioridade', 'Status', 'Responsável', 'Previsão'].map((h) => (
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
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-surface-alt"
                >
                  <td className="px-2.5 py-3 font-mono text-[11.5px] font-semibold whitespace-nowrap">
                    <Link href={`/detalhe/${r.id}`} className="block text-primary hover:text-primary-dark hover:underline underline-offset-2 transition-colors cursor-pointer">{r.id}</Link>
                  </td>
                  <td className="px-2.5 py-3 font-mono text-[11.5px] text-ink-soft whitespace-nowrap">{r.data}</td>
                  <td className="px-2.5 py-3 text-[12.5px] whitespace-nowrap">{r.cliente}</td>
                  <td className="px-2.5 py-3 text-[12.5px] text-ink-soft whitespace-nowrap">{r.solicitante}</td>
                  <td className="px-2.5 py-3 text-[12.5px] whitespace-nowrap">{r.equipamento}</td>
                  <td className="px-2.5 py-3 font-mono text-[11.5px] text-ink-soft whitespace-nowrap">{r.codigo}</td>
                  <td className="px-2.5 py-3 whitespace-nowrap"><PriorityTag priority={r.prioridade} /></td>
                  <td className="px-2.5 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                  <td className="px-2.5 py-3 text-[12.5px] whitespace-nowrap">{r.responsavel}</td>
                  <td className={`px-2.5 py-3 font-mono text-[11.5px] whitespace-nowrap ${r.atrasada ? 'font-bold text-danger' : 'text-ink-soft'}`}>{r.previsao}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-2.5 py-10 text-center text-[12.5px] text-ink-faint">
                    Nenhuma solicitação encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="flex items-center justify-between pt-1.5 text-[11px] text-ink-faint">
          <span>
            Exibindo {rows.length} de {filtered.length} solicitações
          </span>
          <div className="flex items-center gap-1.5">
            <PageBtn disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Anterior
            </PageBtn>
            <span className="px-2 font-mono text-foreground">
              {current} / {totalPages}
            </span>
            <PageBtn disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
              Próxima
            </PageBtn>
          </div>
        </footer>
      </Panel>
    </>
  )
}

function FilterChip({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  label: string
  value: string | null
  options: { label: string; value: string }[]
  isOpen: boolean
  onToggle: () => void
  onSelect: (value: string) => void
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 rounded-[9px] border px-3 py-2 text-[12px] font-medium transition-colors ${
          value
            ? 'border-primary bg-primary-soft text-primary-dark'
            : 'border-border bg-card text-ink-soft hover:bg-surface-alt'
        }`}
      >
        {label}
        {value && <span className="font-semibold">· {value}</span>}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>
      {isOpen && (
        <div className="animate-fade-in absolute left-0 top-[calc(100%+6px)] z-20 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-md)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className="block w-full rounded-lg px-3 py-2 text-left text-[12.5px] text-foreground transition-colors hover:bg-surface-alt"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PageBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
