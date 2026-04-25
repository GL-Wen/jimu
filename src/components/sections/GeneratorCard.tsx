"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useAppData } from "../ClientProviders";
import { ASPECT_OPTIONS, aspectToSize, DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";
import {
  dataUrlFromB64,
  editImage,
  generateImages,
  type GenImageItem,
} from "@/lib/api-client";
import { COUNTS, type ResultSlot } from "@/lib/app-persist-idb";
import { ModelBadge } from "@/components/brand/ModelBadge";

const PROMPT_MAX = 5000;
const MAX_UPLOAD = 10;

/** 生图：单条有格调的占位，引导用户把创意写细 */
const PLACEHOLDER_GENERATE =
  "以字为引，将脑海中的光色、情致与画幅一一道来——越具体，越可触可感。";
const PLACEHOLDER_EDIT =
  "请描述如何编辑：例如将背景替换为海边日落，保持人物主体与光影自然…";

const FEATURED_PROMPTS = [
  "电影感镜头，浅景深，黄昏金色氛围，8K 细节",
  "扁平插画，柔和配色，界面空状态配图，留足负空间",
  "产品摄影，大理石台面，柔光箱，极简品牌风",
  "赛博朋克街景，霓虹反光，雨后地面，竖构图海报",
];

function itemToSrc(item: GenImageItem | undefined): string | null {
  if (!item) {
    return null;
  }
  if (item.url) {
    return item.url;
  }
  if (item.b64_json) {
    return dataUrlFromB64("image/png", item.b64_json);
  }
  return null;
}

function randomId() {
  return `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function srcToFile(src: string, name: string): Promise<File> {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error("fetch failed");
  }
  const blob = await res.blob();
  const type = blob.type && blob.type !== "text/html" ? blob.type : "image/png";
  return new File([blob], name, { type });
}

export function GeneratorCard() {
  const {
    apiKey,
    tab,
    setTab,
    prompt,
    setPrompt,
    n,
    setN,
    aspect,
    setAspect,
    sourceFiles,
    setSourceFiles,
    results,
    setResults,
    index,
    setIndex,
    message,
    setMessage,
  } = useAppData();
  const [loading, setLoading] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [reEditBusy, setReEditBusy] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const presetsRef = useRef<HTMLDivElement | null>(null);
  const resultsScrollRef = useRef<HTMLDivElement | null>(null);
  const resultsScrollHydratedRef = useRef(false);

  const current = results[index] ?? null;
  const lightboxActive = lightboxOpen && Boolean(current?.src);
  const size = aspectToSize(aspect);

  const previews = useMemo(() => {
    return sourceFiles.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
  }, [sourceFiles]);

  useEffect(() => {
    return () => {
      for (const p of previews) {
        URL.revokeObjectURL(p.url);
      }
    };
  }, [previews]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!presetsRef.current?.contains(e.target as Node)) {
        setPresetsOpen(false);
      }
    };
    if (presetsOpen) {
      document.addEventListener("mousedown", onDown);
    }
    return () => document.removeEventListener("mousedown", onDown);
  }, [presetsOpen]);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) {
      return;
    }
    setSourceFiles((prev) => {
      const more = Array.from(list);
      return [...prev, ...more].slice(0, MAX_UPLOAD);
    });
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const removeFileAt = (i: number) => {
    setSourceFiles((prev) => prev.filter((_, j) => j !== i));
  };

  const runGenerate = useCallback(async () => {
    setMessage(null);
    if (!apiKey.trim()) {
      setMessage("请先在右上角设置中填写 API Key。");
      return;
    }
    if (!prompt.trim()) {
      setMessage(
        tab === "edit" ? "请输入编辑描述。" : "请输入描述内容的提示词。"
      );
      return;
    }
    if (tab === "edit" && sourceFiles.length === 0) {
      setMessage("请至少上传一张图片（最多 10 张）。");
      return;
    }

    setLoading(true);
    try {
      if (tab === "generate") {
        const res = await generateImages(apiKey, {
          model: DEFAULT_IMAGE_MODEL,
          prompt: prompt.trim(),
          n,
          size,
        });
        if (res.error?.message) {
          setMessage(res.error.message);
          return;
        }
        const data = res.data ?? [];
        const next: ResultSlot[] = [];
        for (let i = 0; i < data.length; i += 1) {
          const d = data[i];
          const src = itemToSrc(d);
          if (!src) {
            continue;
          }
          next.push({
            id: `${randomId()}-${i}`,
            src,
            prompt: prompt.trim(),
            revisedPrompt: d.revised_prompt,
          });
        }
        if (!next.length) {
          setMessage("未收到有效图片数据，请检查上游返回格式或模型名称。");
          return;
        }
        setResults(next);
        setIndex(0);
        return;
      }

      const fd = new FormData();
      for (const f of sourceFiles) {
        fd.append("image", f);
      }
      fd.append("prompt", prompt.trim());
      fd.append("n", String(n));
      if (size) {
        fd.append("size", size);
      }
      fd.append("model", DEFAULT_IMAGE_MODEL);
      const res = await editImage(apiKey, fd);
      if (res.error?.message) {
        setMessage(res.error.message);
        return;
      }
      const data = res.data ?? [];
      const next: ResultSlot[] = [];
      for (let i = 0; i < data.length; i += 1) {
        const d = data[i];
        const src = itemToSrc(d);
        if (!src) {
          continue;
        }
        next.push({
          id: `${randomId()}-${i}`,
          src,
          prompt: prompt.trim(),
          revisedPrompt: d.revised_prompt,
        });
      }
      if (!next.length) {
        setMessage("编辑接口未返回图片，请确认接口是否支持或参数是否匹配。");
        return;
      }
      setResults(next);
      setIndex(0);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "请求失败，请稍后重试。"
      );
    } finally {
      setLoading(false);
    }
  }, [
    apiKey,
    n,
    prompt,
    size,
    sourceFiles,
    tab,
    setIndex,
    setMessage,
    setResults,
  ]);

  const onDownload = useCallback(async () => {
    if (!current?.src) {
      return;
    }
    try {
      if (current.src.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = current.src;
        a.download = "gpt-image-2.png";
        a.click();
        return;
      }
      const res = await fetch(current.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gpt-image-2.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("下载失败，可尝试在新标签页打开图片后手动保存。");
    }
  }, [current, setMessage]);

  const onReEdit = useCallback(async () => {
    if (!current?.src) {
      return;
    }
    setMessage(null);
    setReEditBusy(true);
    try {
      const file = await srcToFile(current.src, "current-result.png");
      setSourceFiles([file]);
      setTab("edit");
      setMessage("已载入当前图至「编辑图片」，在下方写清修改需求后点击「开始编辑」。");
    } catch {
      setMessage(
        "无法从当前预览载入图片（可能受跨域限制）。请先下载，再于左侧「添加图片」上传。"
      );
    } finally {
      setReEditBusy(false);
    }
  }, [current, setMessage, setSourceFiles, setTab]);

  const headerRight = useMemo(() => {
    if (!results.length) {
      return "0/0";
    }
    return `${index + 1}/${results.length}`;
  }, [index, results.length]);

  const syncIndexFromScroll = useCallback(() => {
    const el = resultsScrollRef.current;
    if (!el || !results.length) {
      return;
    }
    const w = el.clientWidth;
    if (w <= 0) {
      return;
    }
    const i = Math.round(el.scrollLeft / w);
    const clamped = Math.min(Math.max(0, i), results.length - 1);
    setIndex(clamped);
  }, [results.length, setIndex]);

  const goToSlide = useCallback(
    (i: number) => {
      const el = resultsScrollRef.current;
      if (!el || !results.length) {
        return;
      }
      const w = el.clientWidth;
      if (w <= 0) {
        return;
      }
      const clamped = Math.min(Math.max(0, i), results.length - 1);
      el.scrollTo({ left: clamped * w, behavior: "smooth" });
    },
    [results.length]
  );

  useLayoutEffect(() => {
    const el = resultsScrollRef.current;
    if (!el || !results.length) {
      return;
    }
    const w = el.clientWidth;
    if (w <= 0) {
      return;
    }
    if (!resultsScrollHydratedRef.current) {
      const i = Math.min(Math.max(0, index), results.length - 1);
      el.scrollTo({ left: i * w, behavior: "auto" });
      resultsScrollHydratedRef.current = true;
      return;
    }
    el.scrollTo({ left: 0, behavior: "auto" });
    setIndex(0);
    // 仅在 results 变化时重跑；index 仅作首次与 results 同帧对齐，不可加入依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, setIndex]);

  useEffect(() => {
    const el = resultsScrollRef.current;
    if (!el) {
      return;
    }
    const onScroll = () => {
      syncIndexFromScroll();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [syncIndexFromScroll]);

  useEffect(() => {
    const onResize = () => syncIndexFromScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncIndexFromScroll]);

  useEffect(() => {
    if (!lightboxActive) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxActive]);

  useEffect(() => {
    if (!lightboxActive) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (results.length <= 1) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide((index - 1 + results.length) % results.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide((index + 1) % results.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxActive, index, results.length, goToSlide]);

  const applyPreset = (text: string) => {
    setPrompt(text);
    setPresetsOpen(false);
  };

  return (
    <section
      id="generator"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6"
    >
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_24px_-4px_rgba(15,23,42,0.08),0_8px_32px_-8px_rgba(180,83,9,0.07)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)]/70 bg-gradient-to-r from-amber-50/90 to-stone-50/60 px-4 py-2.5 sm:px-5">
          <p className="text-xs font-medium text-stone-600">
            当前模型
            <span className="sr-only"> {DEFAULT_IMAGE_MODEL}</span>
          </p>
          <ModelBadge size="md" className="shadow-sm" />
        </div>
        <div className="grid gap-0 lg:grid-cols-2">
          {/* 左侧：与参考图一致的表单布局 */}
          <div className="border-b border-[var(--border)]/80 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="rounded-2xl bg-amber-50/50 p-1 ring-1 ring-amber-900/5">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("edit");
                    setMessage(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
                    tab === "edit"
                      ? "bg-brand text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  编辑图片
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("generate");
                    setMessage(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
                    tab === "generate"
                      ? "bg-brand text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  生成图片
                </button>
              </div>
            </div>

            {tab === "edit" && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-stone-900">
                  上传图片（最多{MAX_UPLOAD}张）
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <div className="flex flex-wrap gap-2">
                  {previews.map((p, i) => (
                    <div
                      key={`${p.file.name}-${i}-${p.file.size}`}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFileAt(i)}
                        className="absolute right-0.5 top-0.5 rounded bg-black/50 p-0.5 text-white hover:bg-black/70"
                        aria-label="移除"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {sourceFiles.length < MAX_UPLOAD && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 text-stone-500 transition hover:border-brand/50 hover:text-brand"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="px-0.5 text-center text-xs leading-tight">
                        添加图片
                      </span>
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-stone-400">
                  {sourceFiles.length}/{MAX_UPLOAD}
                </p>
              </div>
            )}

            <div
              className={`flex items-start justify-between gap-2 ${
                tab === "edit" ? "mt-5" : "mt-4"
              }`}
            >
              {tab === "edit" ? (
                <p className="flex items-center gap-1 text-sm font-medium text-stone-900">
                  <Sparkles className="h-4 w-4 text-brand" />
                  编辑描述
                </p>
              ) : (
                <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-stone-900">
                  <Sparkles className="h-4 w-4 shrink-0 text-brand" />
                  创意提示词
                </p>
              )}
              <div className="relative shrink-0" ref={presetsRef}>
                <button
                  type="button"
                  onClick={() => setPresetsOpen((o) => !o)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand/40 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-brand backdrop-blur-sm transition hover:bg-amber-50/90"
                >
                  <span aria-hidden>✦</span>
                  精选提示词
                </button>
                {presetsOpen && (
                  <ul className="absolute right-0 z-20 mt-1 w-[min(100vw-2rem,18rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 text-left text-sm shadow-lg">
                    {FEATURED_PROMPTS.map((line) => (
                      <li key={line}>
                        <button
                          type="button"
                          onClick={() => applyPreset(line)}
                          className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50/80"
                        >
                          {line}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="relative mt-2">
              <textarea
                value={prompt}
                maxLength={PROMPT_MAX}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  tab === "edit" ? PLACEHOLDER_EDIT : PLACEHOLDER_GENERATE
                }
                className="min-h-[140px] w-full resize-y rounded-2xl border border-[var(--border)] bg-stone-50/80 p-3 text-sm text-stone-900 placeholder:text-stone-400/90 outline-none ring-brand/15 focus:border-brand/80 focus:ring-2"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-stone-400">
                {prompt.length}/{PROMPT_MAX}
              </span>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-stone-800">输出数量</p>
              <div className="flex flex-wrap gap-2">
                {COUNTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setN(c)}
                    className={`h-9 min-w-[2.5rem] rounded-xl px-3 text-sm font-medium ${
                      n === c
                        ? "bg-brand text-white shadow-sm"
                        : "border border-stone-200/90 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-stone-800">长宽比</p>
              <div className="flex flex-wrap gap-2">
                {ASPECT_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAspect(a)}
                    className={`rounded-xl px-2.5 py-1.5 text-sm font-medium ${
                      aspect === a
                        ? "bg-brand text-white shadow-sm"
                        : "border border-stone-200/90 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={runGenerate}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-base font-medium text-white shadow-sm transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {loading
                ? tab === "edit"
                  ? "处理中…"
                  : "生成中…"
                : tab === "edit"
                  ? "开始编辑"
                  : "生成图片"}
            </button>
          </div>

          {/* 右侧结果 */}
          <div className="bg-gradient-to-b from-amber-50/30 to-stone-100/40 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-stone-900">
                生成结果
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>{headerRight}</span>
                <button
                  type="button"
                  onClick={() => {
                    setResults([]);
                    setIndex(0);
                    setMessage(null);
                  }}
                  className="rounded-lg border border-stone-200/90 bg-white/90 px-2 py-1 text-stone-700 transition hover:bg-white"
                >
                  清空
                </button>
              </div>
            </div>

            <div
              className={`relative w-full max-w-lg overflow-hidden rounded-2xl border border-dashed border-stone-300/80 bg-white/80 shadow-inner ${
                current ? "aspect-square" : "flex min-h-[min(18rem,60vw)] items-center justify-center"
              }`}
            >
              {current?.src ? (
                <>
                  {results.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => goToSlide(index - 1)}
                        disabled={index <= 0}
                        className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200/90 bg-white/95 p-1.5 text-stone-700 shadow-md transition hover:bg-amber-50/80 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="上一张"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToSlide(index + 1)}
                        disabled={index >= results.length - 1}
                        className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200/90 bg-white/95 p-1.5 text-stone-700 shadow-md transition hover:bg-amber-50/80 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="下一张"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <div
                    ref={resultsScrollRef}
                    className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {results.map((r) => (
                      <div
                        key={r.id}
                        className="flex h-full w-full min-w-full shrink-0 snap-start items-center justify-center"
                      >
                        <button
                          type="button"
                          onClick={() => setLightboxOpen(true)}
                          className="flex h-full w-full cursor-zoom-in items-center justify-center p-0"
                          title="点击查看大图"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.src}
                            alt="结果预览"
                            className="max-h-full w-full object-contain"
                            draggable={false}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-sm text-stone-500">
                  {tab === "edit"
                    ? "上传图片并填写编辑描述，点击「开始编辑」"
                    : "在左侧描述创意，点击「生成图片」"}
                  <br />
                  结果将显示于此
                </div>
              )}
            </div>

            {lightboxActive && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="大图预览"
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-[1px]"
                onClick={() => setLightboxOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="absolute right-3 top-3 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
                {results.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide(
                          (index - 1 + results.length) % results.length
                        );
                      }}
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-4"
                      aria-label="上一张"
                    >
                      <ChevronLeft className="h-7 w-7" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide((index + 1) % results.length);
                      }}
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-4"
                      aria-label="下一张"
                    >
                      <ChevronRight className="h-7 w-7" />
                    </button>
                    <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/95">
                      {index + 1} / {results.length}
                    </span>
                  </>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.src}
                  alt=""
                  className="max-h-[min(92dvh,100%)] max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ActionBtn
                icon={<Download className="h-4 w-4" />}
                label="下载"
                onClick={onDownload}
                disabled={!current}
              />
              <ActionBtn
                icon={
                  reEditBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )
                }
                label="重新编辑"
                onClick={onReEdit}
                disabled={!current || reEditBusy}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white/90 p-3 shadow-sm">
              <p className="text-xs font-medium text-stone-500">提示词</p>
              <p className="mt-1 text-sm text-stone-800">
                {current?.prompt || "—"}
              </p>
              {current?.revisedPrompt && (
                <p className="mt-2 text-xs text-stone-500">
                  修订后：{current.revisedPrompt}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-stone-200/90 bg-white/95 py-3.5 text-xs font-medium text-stone-800 shadow-sm transition hover:border-amber-200/80 hover:bg-amber-50/40 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}
