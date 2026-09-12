"use client";

import { useState } from "react";
import { useLanguage, type Lang } from "@/lib/i18n";

const LABELS: Record<Lang, string> = { uz: "UZ", ru: "RU", en: "EN" };

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer",
          color: "var(--fg)", fontSize: 13, fontWeight: 700,
        }}
      >
        {LABELS[lang]}
        <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
          <div
            style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow)",
              minWidth: 120, padding: 6, zIndex: 100,
            }}
          >
            {(Object.keys(LABELS) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                  padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: lang === l ? "var(--accent-bg)" : "transparent",
                  color: lang === l ? "var(--accent-text)" : "var(--fg)",
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
