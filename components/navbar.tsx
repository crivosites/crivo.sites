"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { MobileMenu } from "@/components/mobile-menu"
import { Button } from "@/components/ui/button"
import type { BrandConfig, NavbarConfig } from "@/lib/site-config"

export function Navbar({ navbar, brand }: { navbar: NavbarConfig; brand: BrandConfig }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "border-b border-border bg-background/80 backdrop-blur-lg" : "bg-transparent"
      }`}
      aria-label="Navegação principal"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label={`${brand.name} — página inicial`}>
            <Logo brand={brand} />
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navbar.links.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {navbar.ctaLabel ? (
              <Button asChild size="sm" className="hidden md:inline-flex">
                <a href={navbar.ctaUrl} target="_blank" rel="noopener noreferrer">
                  {navbar.ctaLabel}
                </a>
              </Button>
            ) : null}
            <ThemeToggle label={navbar.themeToggleLabel} />
            <MobileMenu navbar={navbar} brand={brand} />
          </div>
        </div>
      </div>
    </nav>
  )
}
