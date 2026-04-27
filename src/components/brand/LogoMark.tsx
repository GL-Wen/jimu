"use client";

import { useId } from "react";

/**
 * 即幕 JIMU — 主标识：发布画幅 + 生成星芒。
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
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="7.5"
        fill={`url(#${gradId})`}
      />
      <rect
        x="6.8"
        y="8.2"
        width="18.4"
        height="14.2"
        rx="2.2"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M8.6 20.8 12.9 16a.65.65 0 0 1 .9 0l2.9 2.8 2.7-2.2a.65.65 0 0 1 .9.08l3.4 4.12H8.6Z"
        fill="var(--brand, #d97706)"
        fillOpacity="0.34"
      />
      <path
        d="M23.4 6.4v1.4m0 2.8V12m-2.8-2.8H22m2.8 0h1.4"
        stroke="white"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M10.4 11.2h6.2M10.4 13.8h4"
        stroke="var(--brand, #d97706)"
        strokeOpacity="0.32"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}
