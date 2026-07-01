import type { ReactNode } from 'react'
import { Bell, Search } from 'lucide-react'
import { Sidebar } from './sidebar'

type Props = {
  title: string
  crumb: string
  children: ReactNode
}

export function AppShell({ title, crumb, children }: Props) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl md:px-7">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-faint">
              {crumb}
            </div>
            <h1 className="text-base font-bold tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-[9px] border border-border bg-card px-3 py-2 text-[12.5px] text-ink-faint md:flex md:w-60">
              <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">Buscar solicitação, cliente…</span>
            </div>
            <button
              type="button"
              aria-label="Notificações"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-border bg-card text-ink-soft transition-colors hover:bg-surface-alt"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2.5 border-l border-border pl-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#1e3a8a] font-mono text-[11px] font-bold text-white">
                NX
              </span>
              <div className="hidden leading-tight sm:block">
                <div className="text-[12.5px] font-semibold">NEXLAB</div>
                <div className="text-[10.5px] text-ink-faint">Gestão de Laboratório</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-5 pb-12 pt-6 md:px-7">
          {children}
        </main>
      </div>
    </div>
  )
}
