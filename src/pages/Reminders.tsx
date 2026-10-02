// ─────────────────────────────────────────────────────────────
// Reminders.tsx — drawer with date+time side by side,
//                 client-link search, priority chips
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, selectStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { title: "Send the revised SOW to Meridian Labs",         client: "Meridian Labs",          date: "", time: "11:00", priority: "High",   status: "Today",    repeat: "Does not repeat", notification: "At reminder time", notes: "" },
  { title: "Call about proposal — Rahul Sharma",            client: "Meridian Labs",          date: "", time: "11:00", priority: "Normal", status: "Today",    repeat: "Does not repeat", notification: "At reminder time", notes: "" },
  { title: "Stand-up with the team",                        client: "Personal",               date: "", time: "12:30", priority: "Normal", status: "Today",    repeat: "Weekly",          notification: "At reminder time", notes: "" },
  { title: "Call Dr. Kulkarni back about the retainer",     client: "Kulkarni Clinic",        date: "", time: "14:30", priority: "Normal", status: "Today",    repeat: "Does not repeat", notification: "At reminder time", notes: "" },
  { title: "Chase invoice #0142 — Wavelength FM",           client: "Wavelength FM",          date: "", time: "17:00", priority: "High",   status: "Today",    repeat: "Does not repeat", notification: "At reminder time", notes: "" },
];

type Reminder = { id: string; title: string; client: string; date: string; time: string; priority: string; status: string; repeat: string; notification: string; notes: string; };

const blank = (): Omit<Reminder, "id" | "status"> => ({
  title: "", client: "", date: new Date().toISOString().slice(0, 10),
  time: "", priority: "Normal", repeat: "Does not repeat",
  notification: "At reminder time", notes: "",
});

const CLIENT_OPTIONS = ["Meridian Labs", "Wavelength FM", "Kulkarni Clinic", "Kalyan Foods", "Sanchi Interiors", "Harbour Coffee Roasters", "Personal"];

export default function Reminders() {
  const [tab, setTab] = useState("Today");
  const [notifications, setNotifications] = useStoredState("notification-prompt", true);
  const [items, setItems] = useStoredState<Reminder[]>(
    "reminders",
    seed.map((s, i) => ({ id: `rem-${i}`, ...s })),
  );

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState(blank());
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen,   setClientOpen]   = useState(false);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = () => { setForm(blank()); setEditId(null); setClientSearch(""); setDrawer(true); };
  const openEdit = (r: Reminder) => {
    setForm({ title: r.title, client: r.client, date: r.date, time: r.time, priority: r.priority, repeat: r.repeat, notification: r.notification, notes: r.notes });
    setEditId(r.id); setClientSearch(r.client); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setItems((cur) => cur.map((r) => r.id === editId ? { ...r, ...form } : r));
    } else {
      setItems((cur) => [...cur, { id: `rem-${Date.now()}`, ...form, status: "Today" }]);
    }
    setDrawer(false);
  };

  const count = (s: string) => items.filter((i) => i.status === s).length;
  const visible = items.filter((i) => tab === "Completed" ? i.status === "Completed" : i.status === tab);

  const filteredClients = CLIENT_OPTIONS.filter((c) => c.toLowerCase().includes(clientSearch.toLowerCase()));

  return (
    <div className="page">
      <PageHeader
        kicker="REMINDERS · Northline Studio"
        title="Nothing slips"
        action={<Button onClick={openAdd}><Icon name="plus" size={15} /> New reminder</Button>}
      />

      {notifications && (
        <div className="notice">
          Notifications are turned off. Enable notifications so you don't miss reminders.
          <Button variant="ghost" onClick={async () => { if ("Notification" in window) await Notification.requestPermission(); setNotifications(false); }}>Enable notifications</Button>
          <Button variant="ghost" onClick={() => setNotifications(false)}>Dismiss</Button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[`Today ${count("Today")}`, `Overdue ${count("Overdue")}`, `Upcoming ${count("Upcoming")}`, `Completed ${count("Completed")}`].map((t) => (
          <button key={t} className={tab === t.split(" ")[0] ? "active" : ""} onClick={() => setTab(t.split(" ")[0])}>
            {t}
          </button>
        ))}
      </div>

      <section>
        <h2>{tab}</h2>
        <p className="subtle">Everything due {tab.toLowerCase()}.</p>
        <div className="panel">
          {visible.length ? visible.map((item) => (
            <div className={`reminder-row ${item.status === "Completed" ? "is-done" : ""}`} key={item.id}>
              <input type="checkbox" checked={item.status === "Completed"}
                onChange={() => setItems((cur) => cur.map((r) => r.id === item.id ? { ...r, status: r.status === "Completed" ? "Today" : "Completed" } : r))}
              />
              <div className="grow">
                <strong>{item.title}</strong>
                {item.client && (
                  <span className="reminder-client-tag">Client · {item.client}</span>
                )}
                <small style={{ display: "block", marginTop: 4, color: "var(--muted)" }}>
                  {item.time && `${item.time}`}{item.date ? ` · ${item.date}` : ""}
                  {item.priority !== "Normal" && <span className={`reminder-priority ${item.priority === "High" ? "reminder-priority-high" : ""}`}> · {item.priority}</span>}
                </small>
              </div>
              <div className="row-actions">
                <Button variant="ghost" onClick={() => openEdit(item)}>Edit</Button>
                <Button variant="ghost" onClick={() => setItems((cur) => cur.map((r) => r.id === item.id ? { ...r, status: "Upcoming", time: "09:00" } : r))}>Reschedule</Button>
                <Button variant="ghost" onClick={() => window.confirm("Delete this reminder?") && setItems((cur) => cur.filter((r) => r.id !== item.id))}>Delete</Button>
              </div>
            </div>
          )) : <div className="empty-row">No reminders in this view.</div>}
        </div>
      </section>

      {drawer && (
        <DrawerPanel
          title={editId ? "Edit reminder" : "New reminder"}
          subtitle="NEW REMINDER"
          onClose={() => setDrawer(false)}
          onSubmit={handleSave}
          submitLabel="Save reminder"
        >
          {/* Big title input */}
          <Field label="">
            <input
              autoFocus style={{ ...inputStyle, fontSize: 15, height: 52 }}
              placeholder="What do you need to remember?"
              value={form.title} onChange={set("title")}
            />
          </Field>

          {/* Date + time side by side */}
          <Field label="" row>
            <input style={{ ...inputStyle, flex: 1 }} type="date" value={form.date} onChange={set("date")} />
            <input style={{ ...inputStyle, flex: 1 }} type="time" value={form.time} onChange={set("time")} />
          </Field>

          <DrawerSection label="MORE OPTIONS" />

          <Field label="Notification">
            <select style={selectStyle} value={form.notification} onChange={set("notification")}>
              {["At reminder time","5 minutes before","15 minutes before","1 hour before","1 day before"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Repeat">
            <select style={selectStyle} value={form.repeat} onChange={set("repeat")}>
              {["Does not repeat","Daily","Weekly","Monthly","Yearly"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <ChipGroup options={["None","Low","Normal","High","Urgent"]} value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v }))} />
          </Field>

          {/* Client search dropdown */}
          <Field label="Link client">
            <div style={{ position: "relative" }}>
              <input
                style={inputStyle}
                placeholder="Search clients…"
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setForm((p) => ({ ...p, client: e.target.value })); setClientOpen(true); }}
                onFocus={() => setClientOpen(true)}
                onBlur={() => setTimeout(() => setClientOpen(false), 150)}
              />
              {clientOpen && filteredClients.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.1)", maxHeight: 180, overflowY: "auto" }}>
                  {filteredClients.map((c) => (
                    <button key={c} type="button" style={{ display: "block", width: "100%", padding: "10px 14px", border: 0, background: "transparent", textAlign: "left", fontSize: 13, cursor: "pointer" }}
                      onClick={() => { setClientSearch(c); setForm((p) => ({ ...p, client: c })); setClientOpen(false); }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Field label="Notes">
            <textarea style={textareaStyle} placeholder="Add a note…" value={form.notes} onChange={set("notes")} />
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}
