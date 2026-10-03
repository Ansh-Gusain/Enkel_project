// ─────────────────────────────────────────────────────────────
// Sales.tsx — invoice list + full-page invoice creation
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, Metric, PageHeader } from "../components/ui";
import { inputStyle, selectStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

type LineItem = { name: string; hsn: string; qty: number; rate: number; disc: number; tax: number; desc: string };
type Invoice  = {
  id: string; client: string; amount: number; days: number; status: string;
  reminderSent: boolean; dueDate: string; invoiceDate: string; description: string;
  items: LineItem[]; discount: number; discountType: "flat" | "percent";
  paymentInfo: string; notes: string; terms: string; placeOfSupply: string;
};

const blankItem = (): LineItem => ({ name: "", hsn: "", qty: 1, rate: 0, disc: 0, tax: 18, desc: "" });

const blankInvoice = (): Omit<Invoice, "id" | "amount" | "days" | "reminderSent"> => ({
  client: "", status: "Draft", dueDate: "", description: "",
  items: [blankItem()],
  discount: 0, discountType: "flat",
  paymentInfo: "UPI: northline@okhdfcbank \u00b7 A/C 50100XXXXXX1234, HDFC Bank, IFSC HDFC0001234",
  notes: "", terms: "Payment due within the agreed timeline. Late payments may attract a 2% monthly fee.",
  invoiceDate: new Date().toISOString().slice(0, 10),
  placeOfSupply: "Maharashtra",
});

const lineAmt = (it: LineItem) => it.qty * it.rate * (1 - it.disc / 100);

const calcTotals = (items: LineItem[], discount: number, discountType: "flat" | "percent") => {
  const subtotal = items.reduce((s, it) => s + lineAmt(it), 0);
  const taxTotal = items.reduce((s, it) => s + lineAmt(it) * (it.tax / 100), 0);
  const disc     = discountType === "flat" ? discount : subtotal * (discount / 100);
  return { subtotal, taxTotal, disc, total: subtotal + taxTotal - disc };
};

// Use Unicode escape for rupee to avoid encoding issues
const RS = "\u20B9"; // ₹

const seedInvoices: Invoice[] = [
  { id: "INV-0025", client: "Basanti Textiles", amount: 19800,  days: 38, status: "Overdue", reminderSent: false, dueDate: "2026-07-28", invoiceDate: "2026-07-01", description: "Website redesign",      items: [blankItem()], discount: 0, discountType: "flat", paymentInfo: "UPI: northline@okhdfcbank", notes: "", terms: "Payment due within the agreed timeline.", placeOfSupply: "Maharashtra" },
  { id: "INV-0031", client: "Meridian Labs",    amount: 48000,  days: 20, status: "Overdue", reminderSent: false, dueDate: "2026-07-15", invoiceDate: "2026-07-01", description: "Monthly retainer",      items: [blankItem()], discount: 0, discountType: "flat", paymentInfo: "UPI: northline@okhdfcbank", notes: "", terms: "Payment due within the agreed timeline.", placeOfSupply: "Maharashtra" },
  { id: "INV-0030", client: "Wavelength FM",    amount: 62000,  days: 12, status: "Overdue", reminderSent: false, dueDate: "2026-08-05", invoiceDate: "2026-07-05", description: "Performance Marketing", items: [blankItem()], discount: 0, discountType: "flat", paymentInfo: "UPI: northline@okhdfcbank", notes: "", terms: "Payment due within the agreed timeline.", placeOfSupply: "Maharashtra" },
  { id: "INV-0029", client: "Kalyan Foods",     amount: 21500,  days: 0,  status: "Paid",    reminderSent: false, dueDate: "2026-08-01", invoiceDate: "2026-07-01", description: "SEO retainer",           items: [blankItem()], discount: 0, discountType: "flat", paymentInfo: "UPI: northline@okhdfcbank", notes: "", terms: "", placeOfSupply: "Maharashtra" },
  { id: "INV-0028", client: "Sanchi Interiors", amount: 88000,  days: 0,  status: "Sent",    reminderSent: false, dueDate: "2026-08-25", invoiceDate: "2026-08-01", description: "Website & branding",     items: [blankItem()], discount: 0, discountType: "flat", paymentInfo: "UPI: northline@okhdfcbank", notes: "", terms: "", placeOfSupply: "Maharashtra" },
  { id: "INV-0027", client: "Harbour Coffee",   amount: 15000,  days: 0,  status: "Draft",   reminderSent: false, dueDate: "2026-08-20", invoiceDate: "2026-08-10", description: "Social media package",   items: [blankItem()], discount: 0, discountType: "flat", paymentInfo: "UPI: northline@okhdfcbank", notes: "", terms: "", placeOfSupply: "Maharashtra" },
];

const TAX_OPTIONS = ["0%", "5%", "12%", "18%", "28%"];
const TASK_KEY    = "enkel:task-lists";

// ── Full-page invoice creation / editing ──────────────────────
function InvoicePage({ invoice, onBack, onSave }: {
  invoice: Omit<Invoice, "id" | "amount" | "days" | "reminderSent"> & { id?: string };
  onBack(): void;
  onSave(data: Omit<Invoice, "id" | "amount" | "days" | "reminderSent">): void;
}) {
  const [form, setForm] = useState({ ...invoice });

  const setF = (f: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: f === "discount" ? Number(e.target.value) : e.target.value }));

  const setItem = (idx: number, f: keyof LineItem) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => {
        const items = [...p.items];
        const val = ["qty", "rate", "disc", "tax"].includes(f)
          ? Number((e.target.value || "0").replace("%", ""))
          : e.target.value;
        items[idx] = { ...items[idx], [f]: val };
        return { ...p, items };
      });
    };

  const addItem    = () => setForm((p) => ({ ...p, items: [...p.items, blankItem()] }));
  const removeItem = (idx: number) => setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const { subtotal, taxTotal, disc, total } = calcTotals(form.items, form.discount, form.discountType);
  const invoiceId = invoice.id ?? `INV-${String(Date.now()).slice(-4)}`;

  const fmt = (n: number) => `${RS}${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div className="page invoice-page">
      <button className="invoice-page back-link" onClick={onBack}>&larr; Sales</button>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 4px" }}>{invoiceId}</p>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>{invoice.id ? `Edit ${invoiceId}` : "New invoice"}</h1>
        <div className="invoice-page page-actions">
          <Button variant="secondary">Preview</Button>
          <Button variant="secondary">Download PDF</Button>
          <Button variant="secondary" onClick={() => onSave({ ...form, status: "Draft" })}>Save draft</Button>
          <Button onClick={() => onSave({ ...form, status: "Sent" })}>Save &amp; send</Button>
        </div>
      </div>

      {/* Client */}
      <div className="invoice-section">
        <p className="invoice-section-label">CLIENT</p>
        <select style={{ ...selectStyle, width: "100%" }} value={form.client}
          onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}>
          <option value="">Select a client</option>
          {["Meridian Labs", "Wavelength FM", "Kalyan Foods", "Kulkarni Clinic", "Sanchi Interiors", "Harbour Coffee Roasters", "Basanti Textiles"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Invoice details */}
      <div className="invoice-section">
        <p className="invoice-section-label">INVOICE DETAILS</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }}>Invoice date</p>
            <input style={inputStyle} type="date" value={form.invoiceDate} onChange={setF("invoiceDate")} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }}>Due date</p>
            <input style={inputStyle} type="date" value={form.dueDate} onChange={setF("dueDate")} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }}>Place of supply</p>
            <select style={selectStyle} value={form.placeOfSupply} onChange={setF("placeOfSupply")}>
              {["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "West Bengal", "Gujarat", "Telangana"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="invoice-section">
        <p className="invoice-section-label">SERVICES / ITEMS</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 60px 90px 60px 90px 80px 24px", gap: 6, alignItems: "start" }}>
          {["ITEM", "HSN/SAC", "QTY", `RATE (${RS})`, "DISC %", "TAX %", "AMOUNT", ""].map((h) => (
            <p key={h} style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 6px", fontFamily: "ui-monospace,monospace", letterSpacing: ".1em" }}>{h}</p>
          ))}
        </div>
        {form.items.map((it, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 60px 90px 60px 90px 80px 24px", gap: 6, alignItems: "center" }}>
              <input style={inputStyle} placeholder="Service or item name" value={it.name} onChange={setItem(idx, "name")} />
              <input style={inputStyle} placeholder="e.g. 9983" value={it.hsn} onChange={setItem(idx, "hsn")} />
              <input style={inputStyle} type="number" min="1" value={it.qty} onChange={setItem(idx, "qty")} />
              <input style={inputStyle} type="number" min="0" value={it.rate || ""} onChange={setItem(idx, "rate")} />
              <input style={inputStyle} type="number" min="0" max="100" value={it.disc || ""} onChange={setItem(idx, "disc")} />
              <select style={selectStyle} value={`${it.tax}%`} onChange={setItem(idx, "tax")}>
                {TAX_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <span style={{ fontSize: 13, fontWeight: 560, paddingLeft: 6 }}>{fmt(lineAmt(it))}</span>
              <button type="button" onClick={() => removeItem(idx)}
                style={{ border: "1px solid var(--line)", borderRadius: 6, background: "transparent", cursor: "pointer", color: "var(--muted)", fontSize: 16, width: 24, height: 24, display: "grid", placeItems: "center" }}>
                &times;
              </button>
            </div>
            <input style={{ ...inputStyle, marginTop: 4, color: "var(--muted)", fontSize: 12 }} placeholder="Add a description (optional)" value={it.desc} onChange={setItem(idx, "desc")} />
          </div>
        ))}
        <button type="button" onClick={addItem}
          style={{ border: 0, background: "transparent", color: "var(--orange)", fontSize: 13, cursor: "pointer", padding: 0, marginTop: 4 }}>
          + Add item
        </button>
      </div>

      {/* Discount */}
      <div className="invoice-section">
        <p className="invoice-section-label">OVERALL DISCOUNT</p>
        <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
          <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", marginRight: 12 }}>
            {(["flat", "percent"] as const).map((t) => (
              <button key={t} type="button"
                onClick={() => setForm((p) => ({ ...p, discountType: t }))}
                style={{ padding: "8px 14px", border: 0, background: form.discountType === t ? "var(--ink)" : "transparent", color: form.discountType === t ? "white" : "var(--muted)", cursor: "pointer", fontSize: 12 }}>
                {t === "flat" ? `${RS} Flat` : "% Percent"}
              </button>
            ))}
          </div>
          <input style={{ ...inputStyle, width: 120 }} type="number" min="0" value={form.discount || ""} onChange={setF("discount")} />
        </div>
      </div>

      {/* Payment info */}
      <div className="invoice-section">
        <p className="invoice-section-label">PAYMENT INFORMATION</p>
        <textarea style={textareaStyle} value={form.paymentInfo} onChange={setF("paymentInfo")} />
      </div>

      {/* Notes */}
      <div className="invoice-section">
        <p className="invoice-section-label">NOTES</p>
        <textarea style={textareaStyle} placeholder="A note for the client on this invoice (optional)" value={form.notes} onChange={setF("notes")} />
      </div>

      {/* Terms */}
      <div className="invoice-section">
        <p className="invoice-section-label">TERMS &amp; CONDITIONS</p>
        <textarea style={textareaStyle} value={form.terms} onChange={setF("terms")} />
      </div>

      {/* Invoice summary */}
      <div className="invoice-summary-box" style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".1em", fontFamily: "ui-monospace,monospace", margin: "0 0 12px" }}>INVOICE SUMMARY</p>
        {[
          ["Subtotal",       fmt(subtotal)],
          ["Item discounts", `-${fmt(disc)}`],
          ["Taxable amount", fmt(subtotal - disc)],
          ["CGST",           fmt(taxTotal / 2)],
          ["SGST",           fmt(taxTotal / 2)],
        ].map(([l, v]) => (
          <div key={l} className="invoice-summary-row"><span>{l}</span><span>{v}</span></div>
        ))}
        <div className="invoice-summary-row total"><strong>Total</strong><strong>{fmt(total)}</strong></div>
        <div className="invoice-summary-row"><span style={{ color: "var(--muted)" }}>Amount paid</span><span>{RS}0</span></div>
        <div className="invoice-summary-row balance"><span>Balance due</span><strong>{fmt(total)}</strong></div>
      </div>
    </div>
  );
}

// ── Sales list page ───────────────────────────────────────────
export default function Sales() {
  const [invoices, setInvoices] = useStoredState<Invoice[]>("invoices", seedInvoices);
  const [view, setView]         = useState<"list" | "create" | "edit">("list");
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [tab, setTab]           = useState("All");

  const openCreate = () => { setEditInvoice(null); setView("create"); };
  const openEdit   = (inv: Invoice) => { setEditInvoice(inv); setView("edit"); };

  const handleSave = (data: Omit<Invoice, "id" | "amount" | "days" | "reminderSent">) => {
    const { total } = calcTotals(data.items, data.discount, data.discountType);
    if (editInvoice) {
      setInvoices((cur) => cur.map((r) => r.id === editInvoice.id ? { ...r, ...data, amount: Math.round(total) } : r));
    } else {
      setInvoices((cur) => [{
        id: `INV-${String(Date.now()).slice(-4)}`,
        ...data, amount: Math.round(total), days: 0, reminderSent: false,
      }, ...cur]);
    }
    setView("list");
  };

  const createTask = (inv: Invoice) => {
    const raw   = localStorage.getItem(TASK_KEY);
    const lists = raw ? JSON.parse(raw) as string[][] : [["Dev"]];
    lists[0]    = [...lists[0], `Follow up ${inv.id} \u2014 ${inv.client}`];
    localStorage.setItem(TASK_KEY, JSON.stringify(lists));
  };

  const fmt = (n: number) => `${RS}${Math.round(n).toLocaleString("en-IN")}`;

  if (view === "create" || view === "edit") {
    return <InvoicePage invoice={editInvoice ?? blankInvoice()} onBack={() => setView("list")} onSave={handleSave} />;
  }

  const overdue     = invoices.filter((i) => i.status === "Overdue");
  const total       = invoices.reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);

  const tabDef = [
    { label: `All ${invoices.length}`,                                       key: "All"     },
    { label: `Overdue ${overdue.length}`,                                    key: "Overdue" },
    { label: `Sent ${invoices.filter((i) => i.status === "Sent").length}`,   key: "Sent"    },
    { label: `Paid ${invoices.filter((i) => i.status === "Paid").length}`,   key: "Paid"    },
    { label: `Draft ${invoices.filter((i) => i.status === "Draft").length}`, key: "Draft"   },
  ];

  const visible = tab === "All" ? invoices : invoices.filter((i) => i.status === tab);

  return (
    <div className="page">
      <PageHeader
        title="Sales"
        description="Create invoices, track payments, and follow up on what's outstanding."
        action={<Button onClick={openCreate}><Icon name="plus" size={15} /> New invoice</Button>}
      />

      <p className="subtle">Receivables at a glance</p>
      <div className="metrics">
        <Metric value={fmt(total)}                                           label="Total sales" />
        <Metric value={fmt(total - outstanding)}                             label="Paid"        tone="green" />
        <Metric value={fmt(outstanding)}                                     label="Outstanding" tone="amber" />
        <Metric value={fmt(overdue.reduce((s, i) => s + i.amount, 0))}      label="Overdue"     tone="orange" />
        <Metric value={`${invoices.filter((i) => i.status === "Draft").length}`} label="Drafts" />
      </div>

      {/* Overdue attention */}
      {overdue.length > 0 && tab === "All" && (
        <section>
          <h2>Needs attention <span className="count">{overdue.length}</span></h2>
          <div className="panel">
            {overdue.map((inv) => (
              <div className="invoice-row" key={inv.id}>
                <span className="danger-dot" />
                <div className="grow">
                  <strong>{inv.id} is overdue by {inv.days} days. Follow up with {inv.client}.</strong>
                  <small>{fmt(inv.amount)} due{inv.reminderSent ? " \u00b7 Reminder sent" : ""}</small>
                </div>
                <Button variant="ghost" onClick={() => createTask(inv)}>Create task</Button>
                <Button variant="ghost" onClick={() => setInvoices((cur) => cur.map((i) => i.id === inv.id ? { ...i, days: 0 } : i))}>Snooze</Button>
                <Button variant="secondary" onClick={() => setInvoices((cur) => cur.map((i) => i.id === inv.id ? { ...i, reminderSent: true } : i))}>Send reminder</Button>
                <Button onClick={() => setInvoices((cur) => cur.map((i) => i.id === inv.id ? { ...i, status: "Paid" } : i))}>Record payment</Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pill tabs */}
      <div className="pill-tabs" style={{ marginTop: 20 }}>
        {tabDef.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Invoice table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>INVOICE</th><th>CLIENT</th><th>AMOUNT</th><th>DUE DATE</th><th>STATUS</th><th></th></tr>
          </thead>
          <tbody>
            {visible.map((inv) => (
              <tr key={inv.id} onClick={() => openEdit(inv)} style={{ cursor: "pointer" }}>
                <td>
                  <strong>{inv.id}</strong>
                  {inv.description && <small style={{ display: "block", color: "var(--muted)" }}>{inv.description}</small>}
                </td>
                <td>{inv.client}</td>
                <td><strong>{fmt(inv.amount)}</strong></td>
                <td style={{ color: "var(--muted)" }}>{inv.dueDate || "\u2014"}</td>
                <td>
                  <span className={`status ${inv.status === "Overdue" ? "status-danger" : inv.status === "Paid" ? "status-good" : inv.status === "Sent" ? "status-warn" : ""}`}>
                    {inv.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="table-actions">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(inv); }}>Edit</button>
                    {inv.status !== "Paid" && (
                      <button onClick={(e) => { e.stopPropagation(); setInvoices((cur) => cur.map((i) => i.id === inv.id ? { ...i, status: "Paid" } : i)); }}>Mark paid</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); window.confirm(`Delete ${inv.id}?`) && setInvoices((cur) => cur.filter((i) => i.id !== inv.id)); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2>Manage</h2>
        <div className="panel">
          <div className="simple-row">
            <span style={{ fontSize: 22 }}>&#x1F9FE;</span>
            <div className="grow">
              <strong>Invoices</strong>
              <small>View, filter, and manage every invoice.</small>
            </div>
            <button className="text-action" onClick={() => setTab("All")}>View invoices &rarr;</button>
          </div>
        </div>
      </section>
    </div>
  );
}
