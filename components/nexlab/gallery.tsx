'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

export function Gallery({
  images,
}: {
  images: { src: string; alt: string }[]
}) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[10px] border border-border"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 30vw, 160px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/80 p-6 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setActive(null)}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <div
            className="relative h-[70vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active].src}
              alt={images[active].alt}
              fill
              sizes="768px"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
