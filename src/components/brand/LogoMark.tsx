"use client";

import { useId } from "react";

/**
 * 即幕 JIMU — 主标识：画幅（可商用主幕）+ 星芒（秒级出光）。
 */
export function LogoMark({ className }: { className?: string }) {
  const uid = useId();
  const gradId = `jm-${uid.replace(/[:]/g, "")}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="4"
          y1="3"
          x2="28"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand, #d97706)" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill={`url(#${gradId})`}
      />
      <rect
        x="7.5"
        y="9.5"
        width="15"
        height="11.5"
        rx="1.5"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M8.2 20.1 12.1 16a.5.5 0 0 1 .7 0l2.1 2 3.1-2.5a.5.5 0 0 1 .7.1L23.2 20H8.2Z"
        fill="var(--brand, #d97706)"
        fillOpacity="0.28"
      />
      <path
        d="M22.5 8.2v1.1m0 1.1v1.1m.9-1.6-.6.3m-1.2.7-.6.3m1.2-2.3-.6.3m-1.2.7-.6.3"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
