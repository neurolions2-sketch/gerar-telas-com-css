'use client'

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  ArrowLeftRight,
} from 'lucide-react'

const groups = [
  {
    label: 'Operação',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/solicitacoes', label: 'Solicitações', icon: ClipboardList },
      { href: '/kanban', label: 'Kanban', icon: KanbanSquare },
      { href: '/calendario', label: 'Calendário', icon: CalendarDays },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [solicitacoesCount, setSolicitacoesCount] = useState<number | null>(null)
  const [synced, setSynced] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/kanban')
        if (!res.ok) {
          if (isMounted) setSynced(false)
          return
        }
        const payload = await res.json().catch(() => null)
        if (!isMounted || !payload || !Array.isArray(payload.data)) {
          if (isMounted) setSynced(false)
          return
        }
        setSolicitacoesCount(payload.data.length)
        setSynced(true)
      } catch {
        if (isMounted) setSynced(false)
      }
    }

    fetchCount()
    return () => {
      isMounted = false
    }
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-6 bg-gradient-to-b from-[#081223] to-[#0e1b39] px-3 py-6 text-sidebar-foreground shadow-[0_24px_80px_rgba(12,20,40,0.18)] lg:flex ${
        collapsed ? 'w-[86px]' : 'w-[248px]'
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <Link
          href="/"
          className={`flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-3 py-3 shadow-[0_18px_60px_rgba(12,20,40,0.15)] transition-all duration-200 hover:bg-white/10 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#4f46e5] to-[#2563eb] font-mono text-sm font-bold text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)]">
            NX
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-white">NEXLAB</span>
              <span className="mt-0.5 text-[9.5px] uppercase tracking-[0.06em] text-[#9aa5c8]">
                Laboratory Management
              </span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expandir menu' : 'Minimizar menu'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#9aa5c8] transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <nav className="flex flex-col gap-4 px-1">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <span
              className={`px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4d4e5a] ${
                collapsed ? 'hidden' : 'block'
              }`}
            >
              {group.label}
            </span>
            {group.items.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              const countLabel = item.href === '/solicitacoes' ? (solicitacoesCount !== null ? `${solicitacoesCount}` : '...') : null
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={() => collapsed && setCollapsed(false)}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[13.5px] font-medium transition-all duration-200 ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-white/10 text-white shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                      : 'text-[#9aa5c8] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-opacity duration-200 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active ? 'text-[#dbe4ff]' : 'text-[#9aa5c8] group-hover:text-white'
                    }`}
                    strokeWidth={2}
                  />
                  {!collapsed && item.label}
                  {!collapsed && countLabel && (
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#c7d0ea]">
                      {countLabel}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div
        className={`mt-auto rounded-[22px] border border-white/10 bg-white/5 p-4 text-[12px] text-[#c7d0ea] backdrop-blur-sm transition-all duration-200 ${
          collapsed ? 'mx-auto w-12 p-3 text-center' : ''
        }`}
      >
        {!collapsed ? (
          <>
            <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#7d8db7]">Sincronização</div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  synced === false
                    ? 'bg-danger shadow-[0_0_0_8px_rgba(220,38,38,0.18)]'
                    : 'bg-success shadow-[0_0_0_8px_rgba(20,184,166,0.18)]'
                }`}
              />
              <span>
                {synced === null
                  ? 'Verificando planilha…'
                  : synced
                    ? 'Conectado à planilha'
                    : 'Sem conexão com a planilha'}
              </span>
            </div>
          </>
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#c7d0ea]">OK</span>
        )}
      </div>
    </aside>
  )
}
