"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { ModelBadge } from "@/components/brand/ModelBadge";
import { SITE_NAME_EN, SITE_NAME_ZH } from "@/lib/brand";
import { ApiKeyModal } from "../ApiKeyModal";

export function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/90 bg-[var(--surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900"
            onClick={(e) => e.preventDefault()}
          >
            <LogoMark className="h-8 w-8 shrink-0 shadow-sm" />
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-baseline gap-2">
                <span>{SITE_NAME_ZH}</span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400 sm:text-xs">
                  {SITE_NAME_EN}
                </span>
              </div>
              <ModelBadge size="sm" className="w-fit" />
            </div>
          </a>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-xl p-2.5 text-stone-600 transition hover:bg-amber-50/80 hover:text-stone-900"
            aria-label="设置"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>
      <ApiKeyModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
