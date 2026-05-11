"use client";

import { useEffect, useState } from "react";

interface WhaleLoaderProps {
  visible?: boolean;
}

export default function WhaleLoader({ visible = true }: WhaleLoaderProps) {
  const [show, setShow] = useState(visible);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setHiding(false);
    } else {
      setHiding(true);
      const t = setTimeout(() => {
        setShow(false);
        setHiding(false);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        animation: `${hiding ? "whaleFadeOut" : "whaleFadeIn"} 0.35s ease both`,
      }}
    >
      {/* Whale SVG */}
      <div className="whale-swim">
        <svg
          viewBox="0 0 200 110"
          width="200"
          height="110"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tail group (animated separately) */}
          <g className="whale-tail">
            <path d="M38 55 L10 34 L28 55 L10 76 Z" fill="#e76f51" />
          </g>

          {/* Body */}
          <ellipse cx="108" cy="55" rx="72" ry="30" fill="#e76f51" />

          {/* Belly */}
          <path
            d="M55 65 Q108 82 162 65 Q162 72 108 74 Q54 72 55 65Z"
            fill="#f4a261"
            opacity="0.55"
          />

          {/* Dorsal fin */}
          <path d="M108 25 L122 50 L94 50Z" fill="#d1523c" />

          {/* Eye */}
          <circle cx="160" cy="49" r="6" fill="white" />
          <circle cx="162" cy="49" r="3" fill="#2d2420" />
          <circle cx="163" cy="48" r="1.2" fill="white" />

          {/* Smile */}
          <path
            d="M165 56 Q170 61 176 57"
            stroke="white"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Spout streams */}
          <path
            className="whale-spout"
            d="M142 30 Q137 17 141 8"
            stroke="#e76f51"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="whale-spout-2"
            d="M148 28 Q145 14 149 6"
            stroke="#f4a261"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="whale-spout-3"
            d="M153 30 Q151 19 155 12"
            stroke="#e76f51"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Bubbles */}
          <circle
            className="bubble bubble-1"
            cx="82"
            cy="75"
            r="3.5"
            fill="#e76f51"
            opacity="0.35"
          />
          <circle
            className="bubble bubble-2"
            cx="68"
            cy="80"
            r="2.5"
            fill="#f4a261"
            opacity="0.3"
          />
          <circle
            className="bubble bubble-3"
            cx="58"
            cy="76"
            r="3"
            fill="#e76f51"
            opacity="0.3"
          />

          {/* Water surface */}
          <path
            d="M0 90 Q25 85 50 90 Q75 95 100 90 Q125 85 150 90 Q175 95 200 90 L200 110 L0 110Z"
            fill="var(--surface-3)"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Label */}
      <p
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.14em",
          animation: "whalePulseText 1.5s ease-in-out infinite",
        }}
      >
        LOADING...
      </p>
    </div>
  );
}
