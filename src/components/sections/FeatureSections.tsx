/**
 * 设为 `true` 可恢复首页下方卖点区块（未删代码，仅不渲染）。
 */
export const SHOW_FEATURE_SECTIONS = false;

const blocks = [
  {
    title: "秒出可商用的视觉素材",
    body: [
      "面向营销与产品页面的高质量主视觉与 Banner。",
      "无水印可下载，直接用于社媒、落地页与投放素材。",
    ],
    imageSide: "left" as const,
  },
  {
    title: "更快创建完美图像",
    body: [
      "极速出图、快速迭代，让你专注于创意而不是参数。",
      "支持多样比例与多图并发生成。",
    ],
    imageSide: "right" as const,
  },
  {
    title: "构建风格一致的逼真角色",
    body: [
      "角色与服装在多张图中保持统一，可延续同一视觉任务。",
      "适合 IP、漫画与品牌吉祥物场景。",
    ],
    imageSide: "left" as const,
  },
  {
    title: "用自然语言编辑图像",
    body: [
      "告诉模型你想改什么，而不是涂抹像素。",
      "适合建筑渲染、产品精修等需要指令式修改的场景。",
    ],
    imageSide: "right" as const,
  },
  {
    title: "轻松融合图像与风格",
    body: [
      "把参考图、风格与文字指令组合起来，让画面既统一又灵活。",
      "为影视感镜头与产品合成留足空间。",
    ],
    imageSide: "left" as const,
  },
];

function FeatureVisual({ tone }: { tone: "a" | "b" | "c" }) {
  const map = {
    a: "from-orange-200/80 to-amber-100/60",
    b: "from-sky-200/80 to-cyan-100/60",
    c: "from-violet-200/80 to-fuchsia-100/60",
  } as const;
  return (
    <div
      className={`relative h-56 w-full overflow-hidden rounded-2xl bg-gradient-to-br ${map[tone]} sm:h-64`}
    >
      <div className="absolute inset-4 rounded-xl border border-white/50 bg-white/20 backdrop-blur-sm" />
    </div>
  );
}

const tones: ("a" | "b" | "c")[] = ["a", "b", "a", "b", "c"];

export function FeatureSections() {
  if (!SHOW_FEATURE_SECTIONS) {
    return null;
  }

  return (
    <section className="border-t border-[var(--border)]/70 bg-[var(--surface)]/90 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-20">
        {blocks.map((b, i) => {
          const isLeft = b.imageSide === "left";
          return (
            <div
              key={b.title}
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                isLeft ? "" : "lg:grid-flow-dense"
              }`}
            >
              <div className={isLeft ? "lg:order-1" : "lg:order-2"}>
                <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                  {b.title}
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-600">
                  {b.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div
                className={isLeft ? "lg:order-2" : "lg:order-1"}
              >
                <FeatureVisual tone={tones[i] ?? "a"} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
