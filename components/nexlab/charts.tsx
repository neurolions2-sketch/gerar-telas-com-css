'use client'

import { useEffect, useRef, useState } from 'react'

function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ---------------- Donut ---------------- */
export function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 132,
}: {
  segments: { color: string; pct: number }[]
  centerValue: string
  centerLabel: string
  size?: number
}) {
  const { ref, inView } = useInView<SVGSVGElement>()
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let cumulative = 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (seg.pct / 100) * c
          const offset = (cumulative / 100) * c
          cumulative += seg.pct
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${inView ? len : 0} ${c}`}
              strokeDashoffset={-offset}
              style={{
                transition: `stroke-dasharray 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
              }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[18px] font-bold leading-none">{centerValue}</span>
        <span className="mt-1 text-[9px] text-ink-faint">{centerLabel}</span>
      </div>
    </div>
  )
}

/* ---------------- Horizontal bars ---------------- */
export function HorizontalBars({
  rows,
  labelWidth = 118,
  format = (v: number) => String(v),
}: {
  rows: { label: string; value: number; pct: number }[]
  labelWidth?: number
  format?: (v: number) => string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="grid items-center gap-2.5"
          style={{ gridTemplateColumns: `${labelWidth}px 1fr 40px` }}
        >
          <span className="truncate text-[11.5px] font-medium text-ink-soft">{row.label}</span>
          <span className="h-[7px] overflow-hidden rounded-full bg-surface-alt">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-primary to-[#60a5fa]"
              style={{
                width: inView ? `${row.pct}%` : '0%',
                transition: `width 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`,
              }}
            />
          </span>
          <span className="text-right font-mono text-[11px] font-semibold">{format(row.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Line chart ---------------- */
export function LineChart({
  data,
  height = 150,
}: {
  data: { mes: string; value: number }[]
  height?: number
}) {
  const { ref, inView } = useInView<SVGSVGElement>()
  const w = 560
  const h = height
  const pad = { top: 14, bottom: 26, left: 6, right: 12 }
  const max = Math.max(...data.map((d) => d.value)) * 1.15
  const min = 0
  const innerW = w - pad.left - pad.right
  const innerH = h - pad.top - pad.bottom

  const points = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1)) * innerW
    const y = pad.top + innerH - ((d.value - min) / (max - min)) * innerH
    return { x, y, ...d }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${points[points.length - 1].x},${pad.top + innerH} L${points[0].x},${pad.top + innerH} Z`
  const last = points[points.length - 1]

  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${h}`} className="h-[150px] w-full">
      {[0.25, 0.55, 0.85].map((g) => (
        <line
          key={g}
          x1={pad.left}
          x2={w - pad.right}
          y1={pad.top + innerH * g}
          y2={pad.top + innerH * g}
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      <defs>
        <linearGradient id="nx-line-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(37,99,235,0.16)" />
          <stop offset="100%" stopColor="rgba(37,99,235,0)" />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill="url(#nx-line-area)"
        style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}
      />
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: inView ? 0 : 1,
          transition: 'stroke-dashoffset 0.9s ease-out',
        }}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill="var(--primary)"
        stroke="#fff"
        strokeWidth={2}
        style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.3s ease 0.9s' }}
      />
      {points.map((p) => (
        <text
          key={p.mes}
          x={p.x}
          y={h - 8}
          textAnchor="middle"
          className="fill-[var(--ink-faint)] font-mono"
          fontSize={9}
        >
          {p.mes}
        </text>
      ))}
    </svg>
  )
}

/* ---------------- Progress ring ---------------- */
export function ProgressRing({
  pct,
  color = 'var(--primary)',
  size = 96,
  label,
}: {
  pct: number
  color?: string
  size?: number
  label?: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c - (pct / 100) * c : c}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-base font-bold">
        {label ?? `${pct}%`}
      </span>
    </div>
  )
}
