"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { useAppData } from "./ClientProviders";
import { ANTMOO_API_ORIGIN } from "@/lib/antmoo-config";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ApiKeyModal({ open, onClose }: Props) {
  const { apiKey, saveApiKey, isHydrated, clearAllData } = useAppData();
  const [value, setValue] = useState("");
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    queueMicrotask(() => {
      setValue(apiKey);
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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.15)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            API 设置
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
          请输入你在{" "}
          <a
            href={ANTMOO_API_ORIGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline decoration-brand/30 underline-offset-2 transition hover:decoration-brand"
          >
            {ANTMOO_API_ORIGIN.replace(/^https?:\/\//, "")}
          </a>{" "}
          获取的 API Key。应用数据均保存在本机{" "}
          <span className="whitespace-nowrap">IndexedDB</span>{" "}
          中（含密钥、提示词、上传与生成图），仅当你点击下方「清除本机数据」时才会删除。
        </p>
        <label className="mb-1 block text-sm font-medium text-zinc-800">
          API Key
        </label>
        <input
          type="password"
          name="antmoo_api_key"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isHydrated ? "sk-…" : ""}
          autoComplete="off"
          className="mb-4 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none ring-brand/30 focus:border-brand focus:ring-2"
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (
                !window.confirm(
                  "确定要清除本机所有数据吗？\n将删除 API Key、提示词、上传图与生成结果，且无法恢复。"
                )
              ) {
                return;
              }
              void clearAllData().then(() => onClose());
            }}
            className="me-auto rounded-xl border border-red-200/90 bg-red-50/80 px-3 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-100/80"
          >
            清除本机数据
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
