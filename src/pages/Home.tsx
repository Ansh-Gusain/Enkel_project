// ─────────────────────────────────────────────────────────────
// Home.tsx — dashboard overview: attention items, upcoming
//            tasks, business pulse metrics, quick actions
// ─────────────────────────────────────────────────────────────
import { Button, Icon, Metric, PageHeader } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Items that need the user's attention (overdue invoices, reminders)
const attention = [
  ["Basanti Textiles — INV-0025",                 "₹20k outstanding · Sales",                               "38 days overdue"],
  ["Meridian Labs — INV-0031",                    "₹48k outstanding · Sales",                               "20 days overdue"],
  ["Wavelength FM — INV-0030",                    "₹32k outstanding · Sales",                               "12 days overdue"],
  ["Priya Nair — Printer cartridge",              "₹1k pending reimbursement · No receipt attached · Expenses", "Needs approval"],
  ["Chase the signed addendum from Northpoint Dental", "Northpoint Dental · Reminders",                    "5 days overdue"],
  ["Send Sanchi Interiors the revised scope",     "Sanchi Interiors · Reminders",                           "5 days overdue"],
];

// Upcoming tasks shown in the "Today & upcoming" section
const upcoming = [
  ["Send the revised SOW to Meridian Labs",        "Meridian Labs",          "11:00 AM"],
  ["Call about proposal — Rahul Sharma",           "Meridian Labs",          "Today, 11:00 AM"],
  ["Stand-up with the team",                       "Personal",               "12:30 PM"],
  ["Follow up with Harbour Coffee on the quote",   "Harbour Coffee Roasters","Tomorrow"],
];

export default function Home() {
  // dismissed stores which attention items the user has closed
  const [dismissed, setDismissed] = useStoredState<string[]>("dismissed-attention", []);
  const visibleAttention = attention.filter((item) => !dismissed.includes(item[0]));

  // Navigate to a module by setting the URL hash
  const go = (target: string) => { window.location.hash = `#app/${target}`; };

  // Wipe all localStorage demo data and reload
  const resetWorkspace = () => {
    if (!window.confirm("Restore all browser demo data to its original state? Attendance biometric data is not affected.")) return;
    Object.keys(localStorage)
      .filter((key) => key.startsWith("enkel:"))
      .forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <div className="page">
      <PageHeader
        kicker="HOME · Northline Studio"
        title="Good morning, Ananya"
        description={
          new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date())
          + " — here's what needs you today."
        }
        action={<Button variant="secondary" onClick={resetWorkspace}>Reset workspace</Button>}
      />

      {/* ── Needs attention ── */}
      <section>
        <h2>Needs your attention <span className="count">{visibleAttention.length}</span></h2>
        <div className="attention-list">
          {visibleAttention.map((a, i) => (
            <div className="attention-row" key={a[0]}>
              <span className="row-icon">
                <Icon name={i > 3 ? "clock" : "receipt"} size={17} />
              </span>
              {/* clicking the row navigates to the relevant module */}
              <button
                className="row-record grow"
                onClick={() => go(i < 3 ? "sales" : i === 3 ? "expenses" : "reminders")}
              >
                <strong>{a[0]}</strong>
                <small>{a[1]}</small>
              </button>
              <span className="status status-danger">{a[2]}</span>
              <button
                className="icon-btn"
                onClick={() => setDismissed((items) => [...items, a[0]])}
                aria-label="Dismiss"
              >×</button>
            </div>
          ))}
        </div>
        <button className="text-action" onClick={() => go("reminders")}>View all in Reminders →</button>
      </section>

      {/* ── Today & upcoming ── */}
      <section>
        <h2>Today & upcoming</h2>
        <div className="upcoming-list">
          {upcoming.map((u) => (
            <div className="simple-row" key={u[0]}>
              <Icon name="clock" />
              <div className="grow">
                <strong>{u[0]}</strong>
                <small>{u[1]}</small>
              </div>
              <span className="muted">{u[2]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Business pulse metrics ── */}
      <section>
        <h2>Business pulse</h2>
        <div className="metrics">
          <Metric value="₹2.1L" label="Outstanding receivables" />
          <Metric value="11"    label="Active clients" />
          <Metric value="14"    label="Open tasks" />
          <Metric value="7/8"   label="Team attendance" />
          <Metric value="₹9k"   label="Spent this month" />
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section>
        <h2>Quick actions</h2>
        <div className="quick-actions">
          <Button variant="secondary" onClick={() => go("sales")}>
            <Icon name="plus" size={14} /> Create invoice
          </Button>
          <Button variant="secondary" onClick={() => go("clients")}>
            <Icon name="plus" size={14} /> Add client
          </Button>
          <Button variant="secondary" onClick={() => go("tasks")}>
            <Icon name="plus" size={14} /> Add task
          </Button>
        </div>
      </section>
    </div>
  );
}
