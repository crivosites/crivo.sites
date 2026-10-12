"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import type { BrandConfig, NavbarConfig } from "@/lib/site-config"

export function MobileMenu({ navbar, brand }: { navbar: NavbarConfig; brand: BrandConfig }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={navbar.menuToggleLabel}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">{navbar.menuToggleLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="text-left">
          <Logo brand={brand} />
          <SheetTitle className="text-base font-semibold">{navbar.menuTitle}</SheetTitle>
          <SheetDescription>{navbar.menuDescription}</SheetDescription>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {navbar.links.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg border-b border-border/50 px-4 py-3 text-base font-medium transition-all last:border-b-0 hover:bg-primary/5 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {navbar.ctaLabel ? (
          <Button asChild className="mt-6 w-full">
            <a href={navbar.ctaUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              {navbar.ctaLabel}
            </a>
          </Button>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
