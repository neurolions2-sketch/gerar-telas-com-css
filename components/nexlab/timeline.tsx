'use client'

import { useEffect, useState } from 'react'

export type TimelineStep = {
  title: string
  sub: string
  done: boolean
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      i += 1
      setRevealed(i)
      if (i >= steps.length) clearInterval(timer)
    }, 140)
    return () => clearInterval(timer)
  }, [steps.length])

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const visible = i < revealed
        return (
          <div key={step.title} className="relative flex gap-3 pb-[18px] last:pb-0">
            {i < steps.length - 1 && (
              <span className="absolute left-[5px] top-3.5 h-full w-px bg-border" />
            )}
            <span
              className={`relative z-10 mt-0.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 transition-all duration-300 ${
                step.done
                  ? 'border-[#eaf7ee] bg-success'
                  : 'border-primary-soft bg-primary'
              } ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            />
            <div
              className={`transition-all duration-300 ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
            >
              <div className="text-[12px] font-semibold">{step.title}</div>
              <div className="mt-0.5 text-[11px] text-ink-faint">{step.sub}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
