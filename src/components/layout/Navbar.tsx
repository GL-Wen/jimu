"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { SITE_NAME_EN, SITE_NAME_ZH } from "@/lib/brand";
import { useAppData } from "@/components/ClientProviders";

export function Navbar() {
  const pathname = usePathname();
  const { openApiKeyModal } = useAppData();
  const onHome = pathname === "/";
  const onPalmistry = pathname === "/palmistry";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/90 bg-[var(--surface)]/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-base font-bold text-stone-900 sm:text-lg"
          aria-label={`${SITE_NAME_ZH} ${SITE_NAME_EN} 首页`}
        >
          <LogoMark className="h-8 w-8 shrink-0 shadow-sm" />
          <div className="flex min-w-0 items-baseline gap-2">
            <span>{SITE_NAME_ZH}</span>
            <span className="hidden text-xs font-semibold uppercase text-stone-400 sm:inline">
              {SITE_NAME_EN}
            </span>
          </div>
        </Link>
        <nav
          className="flex shrink-0 items-center gap-0.5 sm:gap-1"
          aria-label="主导航"
        >
          <Link
            href="/#generator"
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm ${
              onHome
                ? "bg-amber-100/90 text-stone-900"
                : "text-stone-600 hover:bg-amber-50/80 hover:text-stone-900"
            }`}
          >
            AI 生图
          </Link>
          <Link
            href="/palmistry"
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm ${
              onPalmistry
                ? "bg-amber-100/90 text-stone-900"
                : "text-stone-600 hover:bg-amber-50/80 hover:text-stone-900"
            }`}
          >
            手相运势
          </Link>
        </nav>
        <button
          type="button"
          onClick={openApiKeyModal}
          className="min-h-11 min-w-11 rounded-xl p-2.5 text-stone-600 transition hover:bg-amber-50/80 hover:text-stone-900"
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
