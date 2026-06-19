"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function HeroGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div
        className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 blur-[80px] rounded-full"
        style={{ animation: "vf-float 8s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 blur-[60px] rounded-full"
        style={{ animation: "vf-float 10s ease-in-out infinite reverse" }}
      />
    </div>
  )
}
