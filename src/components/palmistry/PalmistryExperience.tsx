"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Sparkles, Upload, X } from "lucide-react";
import {
  buildPalmistryEditPrompt,
  PALMISTRY_STYLES,
} from "@/lib/palmistry-prompt";
import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";
import { dataUrlFromB64, editImage, type GenImageItem } from "@/lib/api-client";
import { usePalmistryData } from "@/components/ClientProviders";
import { ImageLightbox } from "@/components/ImageLightbox";

function itemToSrc(item: GenImageItem | undefined): string | null {
  if (!item) return null;
  if (item.url) return item.url;
  if (item.b64_json) return dataUrlFromB64("image/png", item.b64_json);
  return null;
}

/** 运势卡竖版，与 ASPECT_TO_SIZE 中 9:16 一致 */
const CARD_WIDTH = 1024;
const CARD_HEIGHT = 1536;
const CARD_SIZE = `${CARD_WIDTH}x${CARD_HEIGHT}`;
const CARD_SAFE_PADDING = 64;

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败，请换一张清晰照片重试。"));
    };
    img.src = url;
  });
}

function canvasToPngFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("图片预处理失败，请换一张照片重试。"));
        return;
      }
      resolve(new File([blob], name, { type: "image/png" }));
    }, "image/png");
  });
}

async function normalizePalmistrySource(file: File): Promise<File> {
  const img = await loadImageElement(file);
  if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
    throw new Error("图片尺寸读取失败，请换一张照片重试。");
  }
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("当前浏览器不支持图片预处理，请换浏览器重试。");
  }

  ctx.fillStyle = "#f7f2ea";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const maxDrawWidth = CARD_WIDTH - CARD_SAFE_PADDING * 2;
  const maxDrawHeight = CARD_HEIGHT - CARD_SAFE_PADDING * 2;
  const scale = Math.min(
    maxDrawWidth / img.naturalWidth,
    maxDrawHeight / img.naturalHeight
  );
  const drawWidth = Math.round(img.naturalWidth * scale);
  const drawHeight = Math.round(img.naturalHeight * scale);
  const drawX = Math.round((CARD_WIDTH - drawWidth) / 2);
  const drawY = Math.round((CARD_HEIGHT - drawHeight) / 2);

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  return canvasToPngFile(canvas, "palmistry-source-1024x1536.png");
}

export function PalmistryExperience() {
  const {
    apiKey,
    openApiKeyModal,
    styleId,
    setStyleId,
    file,
    setFile,
    resultSrc,
    setResultSrc,
    message,
    setMessage,
  } = usePalmistryData();
  const [loading, setLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const clearPalm = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const runReading = useCallback(async () => {
    setMessage(null);
    if (!apiKey.trim()) {
      openApiKeyModal();
      return;
    }
    if (!file) {
      setMessage("请上传一张掌心朝向镜头、光线清晰的照片。");
      return;
    }

    setLoading(true);
    setResultSrc(null);
    try {
      const normalizedFile = await normalizePalmistrySource(file);
      const fd = new FormData();
      fd.append("image", normalizedFile);
      fd.append("prompt", buildPalmistryEditPrompt(styleId));
      fd.append("n", "1");
      fd.append("size", CARD_SIZE);
      fd.append("model", DEFAULT_IMAGE_MODEL);
      const res = await editImage(apiKey, fd);
      if (res.error?.message) {
        setMessage(res.error.message);
        return;
      }
      const src = itemToSrc(res.data?.[0]);
      if (!src) {
        setMessage("未收到图片数据，请稍后重试或检查上游返回。");
        return;
      }
      setResultSrc(src);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, [
    apiKey,
    file,
    openApiKeyModal,
    setMessage,
    setResultSrc,
    styleId,
  ]);

  const onDownload = useCallback(async () => {
    if (!resultSrc) return;
    try {
      if (resultSrc.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = resultSrc;
        a.download = "palmistry-card.png";
        a.click();
        return;
      }
      const r = await fetch(resultSrc);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "palmistry-card.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("下载失败，可尝试长按或新标签页打开图片后保存。");
    }
  }, [resultSrc, setMessage]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">
            {DEFAULT_IMAGE_MODEL} · 参考图编辑
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            用一张掌心照生成竖版手相卡
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-600">
            这是一个基于 gpt-image-2 图片编辑能力的示例玩法：保留手掌姿态，生成掌纹标注、趣味标签和完整卡片版式。仅供娱乐，非专业命理。
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_24px_-4px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="border-b border-[var(--border)]/80 p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold text-stone-900">照片要求</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-600">
                <li>自然光下拍摄，掌心完全展开并对准镜头</li>
                <li>避免强反光与过度模糊</li>
                <li>无需露脸，可裁成仅手部</li>
              </ul>

              <p className="mt-6 text-sm font-semibold text-stone-900">卡片风格</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PALMISTRY_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyleId(s.id)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                      styleId === s.id
                        ? "bg-brand text-white shadow-sm"
                        : "border border-stone-200/90 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-sm font-semibold text-stone-900">上传掌心照</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f ?? null);
                  setMessage(null);
                }}
              />
              <div className="mt-3">
                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50 py-12 text-stone-600 transition hover:border-brand/50 hover:bg-amber-50/30 hover:text-brand"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">点击上传掌心照片</span>
                    <span className="text-xs text-stone-400">PNG / JPG / WebP</span>
                  </button>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl ?? ""}
                      alt="待解读的掌心预览"
                      className="max-h-64 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearPalm}
                      className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/70"
                      aria-label="移除图片"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {message && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={runReading}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {loading ? "正在生成卡片…" : "生成运势卡"}
              </button>

              <p className="mt-3 text-center text-xs text-stone-400">
                使用模型 {DEFAULT_IMAGE_MODEL} · 竖版 {CARD_SIZE.replace("x", " × ")}
              </p>
            </div>

            <div className="bg-stone-50/70 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-900">卡片预览</h2>
                {resultSrc && (
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxOpen(false);
                      setResultSrc(null);
                    }}
                    className="text-xs font-medium text-stone-500 hover:text-stone-800"
                  >
                    清空
                  </button>
                )}
              </div>
              <div
                className={`relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-stone-200 bg-white/90 shadow-sm ${
                  resultSrc ? "aspect-[9/16]" : ""
                }`}
              >
                {resultSrc ? (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="h-full w-full cursor-zoom-in"
                    title="点击查看大图"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultSrc}
                      alt="手相运势卡"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                ) : (
                  <div className="p-5 text-sm text-stone-600">
                    <p className="font-semibold text-stone-950">等待生成卡片</p>
                    <ul className="mt-3 space-y-2 leading-relaxed">
                      <li>上传清晰掌心照片，选择卡片风格。</li>
                      <li>点击生成后，这里会显示完整竖版成品。</li>
                      <li>生成完成后可直接下载保存。</li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onDownload}
                disabled={!resultSrc}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200/90 bg-white py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-amber-50/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                下载运势卡
              </button>
              <ImageLightbox
                open={lightboxOpen && Boolean(resultSrc)}
                images={resultSrc ? [{ src: resultSrc, alt: "手相运势卡" }] : []}
                index={0}
                title="手相运势卡"
                onClose={() => setLightboxOpen(false)}
              />
            </div>
          </div>
        </div>
      </section>
  );
}
