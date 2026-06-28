"use client"

import Link from "next/link"
import { BrandLogo, useBrand } from "@/components/brand-provider"
import { cn } from "@/lib/utils"

const sizes = {
  sm: { img: "h-8 w-8 rounded-md", text: "text-xl" },
  md: { img: "h-9 w-9 rounded-lg", text: "text-xl" },
  lg: { img: "h-10 w-10 rounded-lg", text: "text-xl" },
  xl: { img: "h-16 w-16 rounded-xl shadow-md", text: "text-2xl" },
}

export function BrandMark({
  href,
  size = "md",
  showName = true,
  className,
  nameClassName,
}: {
  href?: string
  size?: keyof typeof sizes
  showName?: boolean
  className?: string
  nameClassName?: string
}) {
  const { appName } = useBrand()
  const s = sizes[size]

  const content = (
    <>
      <BrandLogo className={cn(s.img, "object-cover shrink-0", className)} />
      {showName && (
        <span className={cn("font-bold tracking-tighter truncate text-primary", s.text, nameClassName)}>
          {appName}
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2 min-w-0">
        {content}
      </Link>
    )
  }

  return <div className="flex items-center gap-2 min-w-0">{content}</div>
}
