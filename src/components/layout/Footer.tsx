import { SITE_NAME_ZH } from "@/lib/brand";
import { ANTMOO_API_ORIGIN, DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/95 py-8 text-center text-xs text-stone-500">
      <p>
        © {new Date().getFullYear()} {SITE_NAME_ZH} · 图像模型{" "}
        <code className="font-mono text-stone-600">{DEFAULT_IMAGE_MODEL}</code>{" "}
        · 接口{" "}
        <a
          href={ANTMOO_API_ORIGIN}
          className="text-brand underline decoration-brand/25 underline-offset-2 hover:decoration-brand"
        >
          {ANTMOO_API_ORIGIN.replace(/^https?:\/\//, "")}
        </a>
      </p>
    </footer>
  );
}
