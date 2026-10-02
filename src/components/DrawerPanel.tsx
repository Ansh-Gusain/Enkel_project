// ─────────────────────────────────────────────────────────────
// DrawerPanel.tsx — right-side slide-in panel for all add/edit forms
// Matches the UI shown in the screenshots: slides in from right,
// scrim on the left, close button top-right, action buttons at bottom.
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from "react";
import { Button, Icon } from "./ui";

type DrawerProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  width?: number; // default 440
}>;

export function DrawerPanel({
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel = "Save",
  width = 440,
  children,
}: DrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Scrim — clicking closes the drawer */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 55,
          background: "rgba(20,19,16,.35)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: Math.min(width, window.innerWidth),
          zIndex: 56,
          background: "var(--paper)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-12px 0 40px rgba(0,0,0,.12)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px 14px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 3 }}>{subtitle ?? ""}</p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 640 }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "1px solid var(--line)", borderRadius: 7,
              background: "transparent", padding: 6, cursor: "pointer",
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {children}
        </div>

        {/* Footer actions */}
        <div style={{
          display: "flex", gap: 10, justifyContent: "flex-end",
          padding: "16px 24px",
          borderTop: "1px solid var(--line)",
          flexShrink: 0,
          background: "var(--paper)",
        }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </div>
    </>
  );
}

// ── Reusable field wrapper ────────────────────────────────────
export function Field({
  label,
  hint,
  row,
  children,
}: {
  label: string;
  hint?: string;
  row?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        marginBottom: row ? 6 : 7, color: "var(--ink)",
      }}>
        {label}
      </label>
      {row ? (
        <div style={{ display: "flex", gap: 10 }}>{children}</div>
      ) : (
        children
      )}
      {hint && (
        <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Chip selector (e.g. owner chips, priority chips) ─────────
export function ChipGroup({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
}) {
  const active = (o: string) =>
    multi ? (value as string[]).includes(o) : value === o;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          style={{
            padding: "5px 11px", borderRadius: 99, fontSize: 12,
            border: "1px solid",
            borderColor: active(o) ? "var(--orange)" : "var(--line)",
            background: active(o) ? "var(--coral-soft)" : "var(--paper)",
            color: active(o) ? "var(--orange-dark)" : "var(--muted)",
            fontWeight: active(o) ? 600 : 400,
            cursor: "pointer",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Shared input / select / textarea styles ───────────────────
export const inputStyle: React.CSSProperties = {
  width: "100%", height: 42, padding: "0 12px",
  border: "1px solid var(--line)", borderRadius: 8,
  background: "var(--paper)", fontSize: 13,
  fontFamily: "inherit", color: "var(--ink)", outline: "none",
  boxSizing: "border-box",
};

export const textareaStyle: React.CSSProperties = {
  width: "100%", minHeight: 90, padding: "10px 12px",
  border: "1px solid var(--line)", borderRadius: 8,
  background: "var(--paper)", fontSize: 13,
  fontFamily: "inherit", color: "var(--ink)", outline: "none",
  resize: "vertical", boxSizing: "border-box",
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: "pointer",
};

// ── Section divider ───────────────────────────────────────────
export function DrawerSection({ label }: { label: string }) {
  return (
    <p className="eyebrow" style={{ margin: "24px 0 14px", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
      {label}
    </p>
  );
}
