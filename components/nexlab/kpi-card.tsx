import type { LucideIcon } from 'lucide-react'
import { CountUp } from './count-up'

type Severity = 'neutral' | 'primary' | 'warning' | 'info' | 'success' | 'danger'

const severityStyles: Record<Severity, { bar: string; badge: string }> = {
  neutral: { bar: '#cbd5e1', badge: 'bg-surface-alt text-ink-soft' },
  primary: { bar: 'var(--primary)', badge: 'bg-primary-soft text-primary-dark' },
  warning: { bar: 'var(--warning)', badge: 'bg-[#fdf3e5] text-[#b45309]' },
  info: { bar: '#7c3aed', badge: 'bg-[#f1ecfd] text-[#6d28d9]' },
  success: { bar: 'var(--success)', badge: 'bg-[#eaf7ee] text-[#15803d]' },
  danger: { bar: 'var(--danger)', badge: 'bg-[#fceae8] text-[#b91c1c]' },
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  severity,
  decimals = 0,
}: {
  label: string
  value: number | string
  delta: string
  icon: LucideIcon
  severity: Severity
  decimals?: number
}) {
  const s = severityStyles[severity]
  const numericValue = typeof value === 'string' ? Number(value.replace(/[^0-9.-]/g, '')) : value
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-border bg-card/95 p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {label}
          </span>
          <div className="mt-3 text-[28px] font-extrabold tracking-tight text-ink">
            <CountUp value={Number.isNaN(numericValue) ? 0 : numericValue} decimals={decimals} />
          </div>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-3xl ${s.badge}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-4 text-[12px] text-ink-soft">{delta}</div>
    </div>
  )
}
