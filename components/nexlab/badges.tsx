import { PRIORITY, STATUS, type PriorityKey, type StatusKey } from '@/lib/nexlab-data'

export function StatusBadge({ status }: { status: StatusKey }) {
  const s = STATUS[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap"
      style={{ background: s.soft, color: s.ink }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  )
}

export function PriorityTag({ priority }: { priority: PriorityKey }) {
  const p = PRIORITY[priority]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
      {p.label}
    </span>
  )
}
