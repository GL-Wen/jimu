import { ModelBadge } from "@/components/brand/ModelBadge";
import { SITE_NAME_ZH, SITE_TAGLINE } from "@/lib/brand";

export function Hero() {
  return (
    <section className="border-b border-[var(--border)]/60 bg-gradient-to-b from-amber-50/40 via-white/40 to-transparent px-4 py-16 text-center sm:py-20">
      <div className="mb-4 flex flex-col items-center gap-2 sm:mb-5 sm:flex-row sm:justify-center sm:gap-3">
        <p className="order-2 text-sm text-stone-500 sm:order-1 sm:text-base">
          生图与编辑均基于
        </p>
        <div className="order-1 sm:order-2">
          <ModelBadge size="lg" className="shadow-sm" />
        </div>
        <p className="order-3 text-sm text-stone-500 sm:text-base">多模态能力</p>
      </div>
      <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl">
        {SITE_NAME_ZH}：文字与参考图，秒成可商用主视觉
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
        {SITE_TAGLINE} 支持多样比例、多图并发生成，以及用自然语言快速编辑，无水印下载便于投放与落地页。
      </p>
    </section>
  );
}
