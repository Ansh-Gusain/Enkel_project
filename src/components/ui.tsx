// ─────────────────────────────────────────────────────────────
// ui.tsx — shared UI primitives used across every page
// ─────────────────────────────────────────────────────────────
import React from "react";

// ── SVG path data for every icon used in the app ─────────────
const paths: Record<string, React.ReactNode> = {
  home:   <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  clock:  <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/></>,
  user:   <><circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-4 2.7-6 6.5-6s5.8 2 6.5 6"/></>,
  users:  <><circle cx="9" cy="9" r="3"/><path d="M3 20c.4-4 2.3-6 6-6s5.6 2 6 6M16 6.5a3 3 0 0 1 0 5.8M17 15c2.4.5 3.6 2.2 4 5"/></>,
  chart:  <><path d="M4 20v-6M9 20V9M14 20v-4M19 20V5"/></>,
  check:  <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/></>,
  grid:   <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
  spark:  <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2ZM19 17l.6 2.4L22 20l-2.4.6L19 23l-.6-2.4L16 20l2.4-.6L19 17Z"/>,
  note:   <><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  scan:   <><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4"/><circle cx="12" cy="10" r="3"/><path d="M7.5 18c.5-3 2-4.5 4.5-4.5s4 1.5 4.5 4.5"/></>,
  receipt:<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5ZM6 6V4h11v2"/></>,
  folder: <path d="M3 6h7l2 2h9v11H3V6Z"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  plus:   <path d="M12 5v14M5 12h14"/>,
  menu:   <path d="M4 7h16M4 12h16M4 17h16"/>,
  x:      <path d="m6 6 12 12M18 6 6 18"/>,
  arrow:  <path d="M5 12h14m-5-5 5 5-5 5"/>,
  filter: <path d="M4 6h16M7 12h10M10 18h4"/>,
};

// ── Icon ─────────────────────────────────────────────────────
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.note}
    </svg>
  );
}

// ── Button ───────────────────────────────────────────────────
type ButtonProps = React.PropsWithChildren<{
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}>;

export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ── Search input ─────────────────────────────────────────────
export function Search({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="search">
      <Icon name="search" size={16} />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

// ── Logo ─────────────────────────────────────────────────────
export function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">›</span>
      <strong>enkel</strong>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────
export function Tabs({
  items,
  active,
  onChange,
}: {
  items: string[];
  active: string;
  onChange?: (i: string) => void;
}) {
  return (
    <div className="tabs">
      {items.map((i) => (
        <button
          key={i}
          className={active === i ? "active" : ""}
          onClick={() => onChange?.(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

// ── DataTable ─────────────────────────────────────────────────
export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Person cell (avatar + name + detail) ─────────────────────
export function Person({
  initials,
  name,
  detail,
}: {
  initials: string;
  name: string;
  detail: string;
}) {
  return (
    <div className="person">
      <span className="avatar">{initials}</span>
      <span>
        <strong>{name}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

// ── Metric card ──────────────────────────────────────────────
export function Metric({
  value,
  label,
  note,
  tone = "",
}: {
  value: string;
  label: string;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="metric">
      <strong className={tone}>{value}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────
export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {kicker && <p className="eyebrow">{kicker}</p>}
        <h1>{title}</h1>
        {description && <p className="subtle">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
