"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
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
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  )
}

export function HeroGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] h-[520px] w-[820px] rounded-full bg-primary/15 blur-[120px] animate-pulse" />
      <div className="absolute top-[18%] left-[12%] h-72 w-72 rounded-full bg-primary/10 blur-[90px] animate-vf-float" />
      <div className="absolute bottom-[12%] right-[10%] h-64 w-64 rounded-full bg-secondary/20 blur-[80px] animate-vf-float-slow" />
      <div className="absolute top-[40%] right-[22%] h-40 w-40 rounded-full bg-secondary/10 blur-[60px] animate-vf-float" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,hsl(var(--background))_75%)]" />
    </div>
  )
}
