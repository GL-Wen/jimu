import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_NAME_ZH, SITE_POSITIONING, SITE_TAGLINE } from "@/lib/brand";
import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";

export function Hero() {
  return (
    <section className="border-b border-[var(--border)]/60 bg-gradient-to-b from-amber-50/60 via-white/55 to-transparent px-4 py-8 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-brand">
            Powered by {DEFAULT_IMAGE_MODEL}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
            用 {DEFAULT_IMAGE_MODEL} 做可发布的商业图片
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            {SITE_TAGLINE} {SITE_POSITIONING}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#generator"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
            >
              开始使用 {SITE_NAME_ZH}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/palmistry"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200/90 bg-white/85 px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-amber-50/70"
            >
              生成手相卡
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
