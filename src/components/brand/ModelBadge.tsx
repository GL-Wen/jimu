import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "px-1.5 py-0.5 text-[0.65rem] sm:text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
} as const;

/**
 * 用于页面各处突出与请求一致的模型名（{DEFAULT_IMAGE_MODEL}）。
 */
export function ModelBadge({ className = "", size = "md" }: Props) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg border border-brand/30 bg-amber-50/95 font-mono font-semibold tabular-nums text-brand ring-1 ring-brand/10 ${sizeClass[size]} ${className}`}
      title={`模型：${DEFAULT_IMAGE_MODEL}`}
    >
      {DEFAULT_IMAGE_MODEL}
    </span>
  );
}
