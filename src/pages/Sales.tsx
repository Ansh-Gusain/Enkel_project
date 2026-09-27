// ─────────────────────────────────────────────────────────────
// Sales.tsx — invoice tracking: overdue alerts, send reminder,
//             record payment, create follow-up task
// ─────────────────────────────────────────────────────────────
import { Button, Metric, PageHeader } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed invoices: [id, client, amount, daysOverdue]
const seedInvoices = [
  ["INV-0025", "Basanti Textiles", "₹19,800", "38"],
  ["INV-0031", "Meridian Labs",    "₹48,000", "20"],
  ["INV-0030", "Wavelength FM",    "₹32,000", "12"],
];

// Seed task lists key — used to add follow-up tasks directly
const TASK_KEY = "enkel:task-lists";

export default function Sales() {
  const [invoices, setInvoices] = useStoredState(
    "invoices",
    seedInvoices.map((inv) => ({
      id:            inv[0],
      client:        inv[1],
      amount:        Number(inv[2].replace(/[₹,]/g, "")),
      days:          Number(inv[3]),
      status:        "Overdue",
      reminderSent:  false,
    })),
  );

  const addInvoice = () => {
    const client = window.prompt("Client name");
    const amount = Number(window.prompt("Invoice amount in ₹", "25000"));
    if (client && amount) {
      setInvoices((cur) => [{
        id:           `INV-${String(Date.now()).slice(-4)}`,
        client, amount, days: 0, status: "Draft", reminderSent: false,
      }, ...cur]);
    }
  };

  // Add a follow-up task to the first task list
  const createTask = (inv: typeof invoices[0]) => {
    const raw   = localStorage.getItem(TASK_KEY);
    const lists = raw ? JSON.parse(raw) as string[][] : [["Dev"]];
    lists[0] = [...lists[0], `Follow up ${inv.id} — ${inv.client}`];
    localStorage.setItem(TASK_KEY, JSON.stringify(lists));
  };

  const total       = invoices.reduce((s, i) => s + i.amount, 100500);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const overdue     = invoices.filter((i) => i.status === "Overdue");

  return (
    <div className="page">
      <PageHeader
        title="Sales"
        description="Create invoices, track payments, and follow up on what's outstanding."
        action={<Button onClick={addInvoice}>+ New invoice</Button>}
      />

      <p className="subtle">Receivables at a glance</p>

      {/* Summary metrics */}
      <div className="metrics">
        <Metric value={`₹${total.toLocaleString("en-IN")}`}                                                          label="Total sales" />
        <Metric value={`₹${(total - outstanding).toLocaleString("en-IN")}`}                                          label="Paid"        tone="green" />
        <Metric value={`₹${outstanding.toLocaleString("en-IN")}`}                                                    label="Outstanding" tone="amber" />
        <Metric value={`₹${overdue.reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}`}                      label="Overdue"     tone="orange" />
        <Metric value={`${invoices.filter((i) => i.status === "Draft").length}`}                                      label="Drafts" />
      </div>

      {/* Overdue invoices — needs attention */}
      <section>
        <h2>Needs attention <span className="count">{overdue.length}</span></h2>
        <div className="panel">
          {overdue.map((inv) => (
            <div className="invoice-row" key={inv.id}>
              <span className="danger-dot" />
              <div className="grow">
                <strong>{inv.id} is overdue by {inv.days} days. Follow up with {inv.client}.</strong>
                <small>₹{inv.amount.toLocaleString("en-IN")} due{inv.reminderSent ? " · Reminder recorded" : ""}</small>
              </div>
              <Button variant="ghost" onClick={() => createTask(inv)}>Create task</Button>
              <Button variant="secondary" onClick={() =>
                setInvoices((cur) => cur.map((i) => i.id === inv.id ? { ...i, reminderSent: true } : i))
              }>Send reminder</Button>
              <Button onClick={() =>
                setInvoices((cur) => cur.map((i) => i.id === inv.id ? { ...i, status: "Paid" } : i))
              }>Record payment</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Full invoice list */}
      <section>
        <h2>Recent invoices</h2>
        <div className="panel">
          {invoices.map((inv) => (
            <div className="simple-row" key={inv.id}>
              <div className="grow">
                <strong>{inv.client}</strong>
                <small>{inv.id} · Due 28 Jul</small>
              </div>
              <strong>₹{inv.amount.toLocaleString("en-IN")}</strong>
              <span className={`status ${inv.status === "Overdue" ? "status-danger" : inv.status === "Paid" ? "status-good" : ""}`}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
