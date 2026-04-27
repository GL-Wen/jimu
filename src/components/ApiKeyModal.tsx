"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { ANTMOO_API_ORIGIN } from "@/lib/antmoo-config";

const SUPPORT_QQ = "3575554244";

type Props = {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  saveApiKey: (key: string) => void;
  isHydrated: boolean;
  clearAllData: () => Promise<void>;
};

export function ApiKeyModal({
  open,
  onClose,
  apiKey,
  saveApiKey,
  isHydrated,
  clearAllData,
}: Props) {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    queueMicrotask(() => {
      setValue(apiKey);
      setCopied(false);
    });
  }, [open, apiKey]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={onClose}
        aria-label="关闭"
      />
      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.15)] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            使用设置
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-100/80 hover:text-zinc-800"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p id={descId} className="mb-4 text-sm leading-relaxed text-zinc-600">
          即幕会在生成图片时使用 gpt-image-2。请先到{" "}
          <a
            href={ANTMOO_API_ORIGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline decoration-brand/30 underline-offset-2 transition hover:decoration-brand"
          >
            {ANTMOO_API_ORIGIN.replace(/^https?:\/\//, "")}
          </a>{" "}
          获取你的使用凭证，再粘贴到下方。凭证和创作记录只保存在这台设备上，点击生成时才会发送。
        </p>
        <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-sm leading-relaxed text-amber-950">
          <div className="flex gap-3">
            <Image
              src="/support-qq.jpg"
              alt="客服 QQ 二维码"
              width={96}
              height={105}
              className="h-24 w-24 shrink-0 rounded-lg border border-white/80 bg-white object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-stone-950">不会填写？</p>
              <p className="mt-1 text-amber-950">
                扫码添加客服 QQ，发送页面截图，我们会帮你完成设置。
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-stone-950">
                  {SUPPORT_QQ}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(SUPPORT_QQ);
                    setCopied(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white/80 px-2 py-1 text-xs font-medium text-amber-900 transition hover:bg-white"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "已复制" : "复制号码"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <label className="mb-1 block text-sm font-medium text-zinc-800">
          使用凭证
        </label>
        <input
          type="password"
          name="antmoo_api_key"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isHydrated ? "粘贴你的使用凭证" : ""}
          autoComplete="off"
          className="mb-4 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-base text-zinc-900 outline-none ring-brand/30 focus:border-brand focus:ring-2 sm:text-sm"
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (
                !window.confirm(
                  "确定要清除这台设备上的所有数据吗？\n将删除使用凭证、提示词、上传图片与生成结果，且无法恢复。"
                )
              ) {
                return;
              }
              void clearAllData().then(() => onClose());
            }}
            className="me-auto rounded-xl border border-red-200/90 bg-red-50/80 px-3 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-100/80"
          >
            清除本机记录
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              saveApiKey(value.trim());
              onClose();
            }}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand/90"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
