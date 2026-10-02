// ─────────────────────────────────────────────────────────────
// Home.tsx — dashboard: attention, today/tomorrow/this week,
//            business pulse, recent activity, quick actions
// ─────────────────────────────────────────────────────────────
import { Icon, Metric, PageHeader } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

const attention = [
  { title: "Basanti Textiles — INV-0025",                  sub: "₹20k outstanding · Sales",                                    badge: "38 days overdue",  dest: "sales"     },
  { title: "Meridian Labs — INV-0031",                     sub: "₹48k outstanding · Sales",                                    badge: "20 days overdue",  dest: "sales"     },
  { title: "Wavelength FM — INV-0030",                     sub: "₹32k outstanding · Sales",                                    badge: "12 days overdue",  dest: "sales"     },
  { title: "Priya Nair — Printer cartridge",               sub: "₹1k pending reimbursement · No receipt attached · Expenses",  badge: "Needs approval",   dest: "expenses"  },
  { title: "Chase the signed addendum from Northpoint Dental", sub: "Northpoint Dental · Reminders",                           badge: "5 days overdue",   dest: "reminders" },
  { title: "Send Sanchi Interiors the revised scope",      sub: "Sanchi Interiors · Reminders",                                badge: "5 days overdue",   dest: "reminders" },
];

// Grouped into Today / Tomorrow / This Week
const upcoming = {
  TODAY: [
    { title: "Send the revised SOW to Meridian Labs",       client: "Meridian Labs",           time: "11:00 AM",      icon: "clock"   },
    { title: "Call about proposal — Rahul Sharma",          client: "Meridian Labs",           time: "Today, 11:00 AM", icon: "chart"  },
    { title: "Stand-up with the team",                      client: "Personal",                time: "12:30 PM",      icon: "clock"   },
  ],
  TOMORROW: [
    { title: "Follow up with Harbour Coffee on the quote",  client: "Harbour Coffee Roasters", time: "Tomorrow",      icon: "clock"   },
    { title: "Intro call — Kunal Bose",                     client: "Alloy Studio",            time: "Tomorrow, 10:30", icon: "chart" },
  ],
  "THIS WEEK": [
    { title: "Call Arjun Kapoor about the Kalyan Foods pilot", client: "Kalyan Foods",         time: "Wed 19 Aug",    icon: "clock"   },
  ],
};

const recentActivity = [
  { text: "Meridian Labs — call logged",                              module: "Clients",          time: "Today, 9:02 AM"      },
  { text: "Note updated — \"Q4 onboarding improvements\"",           module: "Notes",            time: "Today"               },
  { text: "Kulkarni Clinic — call logged",                           module: "Clients",          time: "Yesterday, 11:40 AM" },
  { text: "Creative generated for UI/UX Design (Social Post)",       module: "Design & Creative", time: "2 days ago"         },
  { text: "Lakeview Realty — ₹15k payment recorded by Ananya Sachan", module: "Sales",           time: "8 days ago"          },
];

export default function Home() {
  const [dismissed, setDismissed] = useStoredState<string[]>("dismissed-attention", []);
  const visibleAttention = attention.filter((item) => !dismissed.includes(item.title));

  const go = (target: string) => { window.location.hash = `#app/${target}`; };

  const resetWorkspace = () => {
    if (!window.confirm("Restore all browser demo data? Attendance biometric data is not affected.")) return;
    Object.keys(localStorage).filter((k) => k.startsWith("enkel:")).forEach((k) => localStorage.removeItem(k));
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
      />

      {/* ── Needs attention ── */}
      <section>
        <h2>Needs your attention <span className="count">{visibleAttention.length}</span></h2>
        <div className="attention-list">
          {visibleAttention.map((a) => (
            <div className="attention-row" key={a.title}>
              <span className="row-icon"><Icon name="receipt" size={16} /></span>
              <button className="row-record grow" onClick={() => go(a.dest)}>
                <strong>{a.title}</strong>
                <small>{a.sub}</small>
              </button>
              <span className="status status-danger">{a.badge}</span>
              <button className="icon-btn" onClick={() => setDismissed((d) => [...d, a.title])} aria-label="Dismiss">×</button>
            </div>
          ))}
        </div>
        {visibleAttention.length < attention.length && (
          <button className="text-action" onClick={() => go("reminders")}>
            +{attention.length - visibleAttention.length} more need attention — view in Reminders →
          </button>
        )}
        {visibleAttention.length === attention.length && (
          <button className="text-action" onClick={() => go("reminders")}>View all in Reminders →</button>
        )}
      </section>

      {/* ── Today & upcoming — grouped ── */}
      <section>
        <h2>Today & upcoming</h2>
        {Object.entries(upcoming).map(([group, items]) => (
          <div key={group}>
            <p className="eyebrow" style={{ margin: "14px 0 8px" }}>{group}</p>
            {items.map((u) => (
              <div className="simple-row" key={u.title} style={{ marginBottom: 6 }}>
                <Icon name={u.icon} size={16} />
                <div className="grow">
                  <strong>{u.title}</strong>
                  <small>{u.client}</small>
                </div>
                <span className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{u.time}</span>
              </div>
            ))}
          </div>
        ))}
        <button className="text-action" onClick={() => go("reminders")}>View all in Reminders →</button>
      </section>

      {/* ── Business pulse ── */}
      <section>
        <h2>Business pulse</h2>
        <div className="metrics">
          <Metric value="4"     label="Client follow-ups due" />
          <Metric value="1"     label="Leads needing attention" />
          <Metric value="5"     label="Invoices awaiting payment" note="₹2.1L outstanding" />
          <Metric value="2"     label="Tasks due this week" />
          <Metric value="₹9k"   label="Spent this month" />
        </div>
      </section>

      {/* ── Recent activity ── */}
      <section>
        <h2>Recent activity</h2>
        <div className="activity-feed">
          {recentActivity.map((a) => (
            <div className="activity-row" key={a.text}>
              <span className="activity-dot" />
              <span className="grow">{a.text} · <span className="activity-module">{a.module}</span></span>
              <span className="activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section>
        <h2>Quick actions</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "+ Add reminder", dest: "reminders" },
            { label: "+ Add client",   dest: "clients"   },
            { label: "+ Add task",     dest: "tasks"     },
            { label: "+ Add lead",     dest: "leads"     },
            { label: "+ Add sale",     dest: "sales"     },
            { label: "+ Add expense",  dest: "expenses"  },
          ].map((q) => (
            <button key={q.label} className="quick-pill" onClick={() => go(q.dest)}>
              {q.label}
            </button>
          ))}
        </div>
      </section>

      {/* Reset workspace */}
      <div style={{ marginTop: 40 }}>
        <button
          style={{ fontSize: 11, color: "var(--faint)", border: 0, background: "transparent", cursor: "pointer" }}
          onClick={resetWorkspace}
        >
          Reset demo workspace
        </button>
      </div>
    </div>
  );
}
