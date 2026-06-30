'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from './primitives'
import {
  STATUS,
  kanbanColumns,
  type Solicitacao,
  type StatusKey,
} from '@/lib/nexlab-data'

export function KanbanView() {
  const router = useRouter()
  const [cards, setCards] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<StatusKey | null>(null)
  const [dropped, setDropped] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/kanban')
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || 'Falha ao carregar dados do Kanban')
        }

        const payload = (await res.json()) as { data: Solicitacao[] }
        setCards(payload.data)
        setError(null)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError))
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const handleDrop = async (status: StatusKey) => {
    if (!dragId) return
    const id = dragId
    const previousStatus = cards.find((item) => item.id === id)?.status
    if (!previousStatus) return

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    setDragId(null)
    setOverCol(null)
    setDropped(id)
    window.setTimeout(() => setDropped((d) => (d === id ? null : d)), 220)

    try {
      const res = await fetch('/api/kanban', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Falha ao atualizar o status no Google Sheets')
      }
    } catch (updateError) {
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: previousStatus } : c)))
      setError(updateError instanceof Error ? updateError.message : String(updateError))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Quadro Kanban"
        description="Arraste os cards entre as colunas para atualizar o status de cada solicitação."
      />

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-ink-soft">Carregando dados do Kanban...</div>
      ) : error ? (
        <div className="rounded-3xl border border-danger bg-surface-alt p-6 text-center text-sm text-danger">{error}</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {kanbanColumns.map((col) => {
            const colCards = cards.filter((c) => c.status === col.key)
            const meta = STATUS[col.key]
            const isOver = overCol === col.key
            return (
              <div
                key={col.key}
                className="flex w-[230px] shrink-0 flex-col gap-2.5"
                onDragOver={(e) => {
                  e.preventDefault()
                  setOverCol(col.key)
                }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-[11.5px] font-bold">
                    <span className="h-[7px] w-[7px] rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                  <span className="rounded-md border border-border bg-surface-alt px-1.5 py-px font-mono text-[10px] text-ink-faint">
                    {colCards.length}
                  </span>
                </div>

                <div
                  className={`flex min-h-[120px] flex-col gap-2.5 rounded-xl p-1 transition-colors ${
                    isOver ? 'bg-primary-soft/60 outline-2 outline-dashed outline-primary/40' : ''
                  }`}
                >
                  {colCards.map((card) => (
                    <article
                      key={card.id}
                      draggable
                      onDragStart={() => setDragId(card.id)}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverCol(null)
                      }}
                      onClick={() => router.push(`/detalhe/${card.id}`)}
                      className={`flex cursor-grab flex-col gap-2 rounded-[11px] border bg-card p-3 shadow-[var(--shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#d6d8e2] hover:shadow-[var(--shadow-md)] active:cursor-grabbing ${
                        card.atrasada ? 'border-l-[3px] border-l-danger border-border' : 'border-border'
                      } ${dragId === card.id ? 'opacity-40' : ''} ${dropped === card.id ? 'animate-fade-up' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-ink-faint">{card.id}</span>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                      </div>
                      <h4 className="text-[12.5px] font-semibold leading-snug">{card.equipamento}</h4>
                      <p className="text-[11px] text-ink-soft">
                        {card.cliente} · {card.setor}
                      </p>
                      <div className="flex items-center justify-between border-t border-border/60 pt-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft font-mono text-[8.5px] font-bold text-primary">
                          {card.responsavelIniciais}
                        </span>
                        <span
                          className={`font-mono text-[10px] ${card.atrasada ? 'font-bold text-danger' : 'text-ink-faint'}`}
                        >
                          {card.previsao}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
