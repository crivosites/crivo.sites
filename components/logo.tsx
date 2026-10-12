import type { BrandConfig } from "@/lib/site-config"

export function Logo({ brand, className = "" }: { brand: BrandConfig; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span aria-hidden="true" className="text-2xl font-bold text-primary">{brand.logoIcon}</span>
        <span className="text-xl font-semibold tracking-tight ml-1">{brand.name}</span>
      </div>
    </div>
  )
}
