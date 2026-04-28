"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  ImageIcon,
  Loader2,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useApiKey } from "@/components/ClientProviders";
import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";
import { dataUrlFromB64, editImage, type GenImageItem } from "@/lib/api-client";
import {
  buildPalmReadingGuidePrompt,
  PALM_READING_GUIDE_SIZE,
} from "@/lib/palm-reading-guide-prompt";

const GUIDE_WIDTH = 1024;
const GUIDE_HEIGHT = 1536;
const GUIDE_SAFE_PADDING = 72;
const MAX_FILE_BYTES = 18 * 1024 * 1024;

function itemToSrc(item: GenImageItem | undefined): string | null {
  if (!item) return null;
  if (item.url) return item.url;
  if (item.b64_json) return dataUrlFromB64("image/png", item.b64_json);
  return null;
}

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

async function normalizeGuideSource(file: File): Promise<File> {
  const img = await loadImageElement(file);
  if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
    throw new Error("图片尺寸读取失败，请换一张照片重试。");
  }

  const canvas = document.createElement("canvas");
  canvas.width = GUIDE_WIDTH;
  canvas.height = GUIDE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("当前浏览器不支持图片预处理，请换浏览器重试。");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, GUIDE_WIDTH, GUIDE_HEIGHT);

  const maxDrawWidth = GUIDE_WIDTH - GUIDE_SAFE_PADDING * 2;
  const maxDrawHeight = GUIDE_HEIGHT - GUIDE_SAFE_PADDING * 2;
  const scale = Math.min(
    maxDrawWidth / img.naturalWidth,
    maxDrawHeight / img.naturalHeight
  );
  const drawWidth = Math.round(img.naturalWidth * scale);
  const drawHeight = Math.round(img.naturalHeight * scale);
  const drawX = Math.round((GUIDE_WIDTH - drawWidth) / 2);
  const drawY = Math.round((GUIDE_HEIGHT - drawHeight) / 2);

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  return canvasToPngFile(canvas, "palm-reading-guide-source.png");
}

function PalmOutlinePreview() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 620"
      className="h-full w-full text-stone-950"
      fill="none"
    >
      <rect
        x="22"
        y="22"
        width="376"
        height="576"
        rx="18"
        className="stroke-stone-200"
      />
      <path
        d="M207 493c-55-8-87-47-92-103-3-33-11-65-31-95-13-20-8-41 10-43 13-2 24 12 36 34l6 10-20-144c-3-20 6-35 22-35 15 0 24 13 29 34l22 109-6-154c-1-23 9-38 26-38 18 0 27 15 28 39l4 149 13-133c3-22 14-35 30-33 16 2 24 17 21 39l-17 140 28-91c6-20 19-31 34-27 16 4 21 20 15 40l-34 114c-9 31-12 60-13 91-2 68-48 107-111 100Z"
        className="stroke-stone-950"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M151 390c29-50 65-75 109-82"
        className="stroke-stone-950"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M144 334c55-7 102 3 148 33"
        className="stroke-stone-950"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M149 283c54-14 99-13 137 4"
        className="stroke-stone-950"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M223 438c1-51-5-89-21-119"
        className="stroke-stone-950"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M92 115h62M276 115h52M74 522h84M262 522h84"
        className="stroke-stone-300"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="210"
        y="566"
        textAnchor="middle"
        className="fill-stone-500 text-[13px] font-medium"
      >
        BLACK LINE PALM MAP
      </text>
    </svg>
  );
}

export function PalmReadingGuideExperience() {
  const { apiKey, openApiKeyModal } = useApiKey();
  const [file, setFile] = useState<File | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const clearFile = () => {
    setFile(null);
    setMessage(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const selectFile = (nextFile: File | undefined) => {
    setMessage(null);
    setResultSrc(null);
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!nextFile.type.startsWith("image/")) {
      setMessage("请上传 PNG、JPG 或 WebP 图片。");
      return;
    }
    if (nextFile.size > MAX_FILE_BYTES) {
      setMessage("图片请控制在 18MB 以内。");
      return;
    }
    setFile(nextFile);
  };

  const runGuide = useCallback(async () => {
    setMessage(null);
    if (!apiKey.trim()) {
      openApiKeyModal();
      return;
    }
    if (!file) {
      setMessage("请先上传一张掌心清晰朝向镜头的照片。");
      return;
    }

    setLoading(true);
    setResultSrc(null);
    setLightboxOpen(false);
    try {
      const normalizedFile = await normalizeGuideSource(file);
      const fd = new FormData();
      fd.append("image", normalizedFile);
      fd.append("prompt", buildPalmReadingGuidePrompt());
      fd.append("n", "1");
      fd.append("size", PALM_READING_GUIDE_SIZE);
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
  }, [apiKey, file, openApiKeyModal]);

  const onDownload = useCallback(async () => {
    if (!resultSrc) return;
    try {
      if (resultSrc.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = resultSrc;
        a.download = "palm-reading-guide.png";
        a.click();
        return;
      }
      const r = await fetch(resultSrc);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "palm-reading-guide.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("下载失败，可尝试打开大图后保存。");
    }
  }, [resultSrc]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-normal text-stone-700">
            <ScanLine className="h-4 w-4" />
            Palm Reading Guide
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-normal text-stone-950 sm:text-4xl">
            极简黑白掌相阅读指南
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            上传掌心照片，生成一页细线条掌纹轮廓图与克制的掌相阅读卡片。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-stone-600">
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-3">
            <p className="text-stone-950">黑白线稿</p>
            <p className="mt-1 text-stone-500">fine lines</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-3">
            <p className="text-stone-950">四条主线</p>
            <p className="mt-1 text-stone-500">palm map</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-3">
            <p className="text-stone-950">阅读指南</p>
            <p className="mt-1 text-stone-500">editorial</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-950">
                <ImageIcon className="h-4 w-4" />
                掌心照片
              </h2>
              {file && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="min-h-9 min-w-9 p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
                  aria-label="移除图片"
                  title="移除图片"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-600 transition hover:border-stone-950 hover:bg-white hover:text-stone-950"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="掌心照片预览"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm font-medium">
                  <Upload className="h-8 w-8" />
                  上传掌心照片
                </span>
              )}
            </button>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-stone-500">
              <span className="rounded-md border border-stone-200 py-2">自然光</span>
              <span className="rounded-md border border-stone-200 py-2">掌心展开</span>
              <span className="rounded-md border border-stone-200 py-2">无需露脸</span>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-950">
              <FileText className="h-4 w-4" />
              输出规格
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-stone-200 p-3">
                <dt className="text-xs text-stone-500">模型</dt>
                <dd className="mt-1 font-medium text-stone-950">
                  {DEFAULT_IMAGE_MODEL}
                </dd>
              </div>
              <div className="rounded-lg border border-stone-200 p-3">
                <dt className="text-xs text-stone-500">尺寸</dt>
                <dd className="mt-1 font-medium text-stone-950">
                  {PALM_READING_GUIDE_SIZE.replace("x", " × ")}
                </dd>
              </div>
            </dl>

            {message && (
              <p className="mt-4 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-800">
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={runGuide}
              disabled={loading}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {loading ? "正在生成指南…" : "生成掌相指南"}
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={!resultSrc}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              下载结果
            </button>
          </section>
        </div>

        <section className="min-h-[620px] rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-950">
              <ScanLine className="h-4 w-4" />
              指南预览
            </h2>
            {resultSrc && (
              <button
                type="button"
                onClick={() => {
                  setResultSrc(null);
                  setLightboxOpen(false);
                }}
                className="min-h-9 px-3 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              >
                清空
              </button>
            )}
          </div>

          <div className="flex min-h-[540px] items-center justify-center rounded-lg bg-stone-50 p-3 sm:p-6">
            {resultSrc ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="block aspect-[2/3] h-auto max-h-[720px] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-stone-200"
                title="点击查看大图"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultSrc}
                  alt="掌相阅读指南生成结果"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            ) : (
              <div className="grid w-full max-w-4xl gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="aspect-[2/3] rounded-lg bg-white p-3 shadow-sm ring-1 ring-stone-200">
                  <PalmOutlinePreview />
                </div>
                <div className="grid content-center gap-3">
                  <div className="rounded-lg border border-stone-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-stone-400">
                      Reading Structure
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                      掌纹轮廓、主线标注、阅读摘要会合成在同一页。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      生命线
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      智慧线
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      感情线
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      事业线
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-stone-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在绘制黑白掌纹指南
            </div>
          )}
        </section>
      </div>

      <ImageLightbox
        open={lightboxOpen && Boolean(resultSrc)}
        images={resultSrc ? [{ src: resultSrc, alt: "掌相阅读指南" }] : []}
        index={0}
        title="掌相阅读指南"
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
