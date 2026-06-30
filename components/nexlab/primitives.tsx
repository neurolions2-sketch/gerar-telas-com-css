import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Panel({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3.5 rounded-[24px] border border-border bg-card/95 p-6 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        className,
      )}
      style={style}
    >
      {children}
    </section>
  )
}

export function PanelHead({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[13.5px] font-bold tracking-tight">{title}</h3>
      {tag && (
        <span className="rounded-md border border-border bg-surface-alt px-2 py-0.5 font-mono text-[9.5px] tracking-[0.03em] text-ink-faint">
          {tag}
        </span>
      )}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow && (
          <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[22px] font-extrabold tracking-tight text-balance">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-[520px] text-[12.5px] text-ink-soft text-pretty">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  )
}

export type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
  type?: 'button' | 'submit'
}

export function Btn({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[9px] px-[15px] py-[9px] text-[12.5px] font-semibold tracking-[0.01em] transition-colors',
        variant === 'primary'
          ? 'border border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(37,99,235,0.25)] hover:bg-primary-dark'
          : 'border border-border bg-card text-foreground hover:bg-surface-alt',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
