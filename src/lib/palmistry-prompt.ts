/** 与 gpt-image-2 图生图配合：生成社交平台上流行的「手相运势卡」视觉 */

export const PALMISTRY_STYLES = [
  {
    id: "guofeng",
    label: "国风水墨",
    hint: "宣纸肌理、飞白笔触、朱砂印点缀、竖排瘦金体小字，留白诗意。",
  },
  {
    id: "cyber",
    label: "赛博灵视",
    hint: "霓虹青紫渐变、全息线框、微粒光点、未来感无衬线字体，轻微故障风。",
  },
  {
    id: "minimal",
    label: "极简金线",
    hint: "米白底、细金箔描线、大面积留白、现代无衬线中文，杂志封面气质。",
  },
  {
    id: "tarot",
    label: "塔罗复古",
    hint: "做旧羊皮纸、铜版画纹理、对称装饰边框、神秘学符号点缀。",
  },
] as const;

export type PalmistryStyleId = (typeof PALMISTRY_STYLES)[number]["id"];

export function buildPalmistryEditPrompt(styleId: PalmistryStyleId): string {
  const style = PALMISTRY_STYLES.find((s) => s.id === styleId) ?? PALMISTRY_STYLES[0];
  return [
    "你收到的是一张真人手掌摊开、掌心朝向镜头的照片。请基于这只手生成一张可发社交媒体的「手相运势卡」竖版主图（9:16 构图感）。",
    "要求：",
    "1）保留原图手掌的姿态、肤色与透视，可适度美化皮肤质感但不要换成别人的手。",
    "2）用半透明或线稿方式标出主要掌纹：生命线、智慧线、感情线、事业线（命运线），并在旁用小巧清晰的中文标注线名。",
    "3）在画面一角用 2～4 个短标签概括「性格 / 感情 / 事业 / 财运」方向的趣味解读（积极、轻松语气，避免恐吓式断言）。",
    "4）整体风格：" + style.hint,
    "5）底部用小字加入：「娱乐向 AI 生成 · 非专业命理 · 请理性看待」。",
    "6）不要出现真实人脸或身份证级隐私信息；不要医疗诊断用语。",
    "输出为一张完整成品图，信息层次清晰，适合手机全屏浏览。",
  ].join("\n");
}
