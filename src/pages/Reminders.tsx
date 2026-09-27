// ─────────────────────────────────────────────────────────────
// Reminders.tsx — time-based reminders with tabs for
//                 Today / Overdue / Upcoming / Completed
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed data — matches the upcoming list on Home
const seed = [
  { title: "Send the revised SOW to Meridian Labs",           client: "Meridian Labs",          time: "11:00 AM",       priority: "High",   status: "Today" },
  { title: "Call about proposal — Rahul Sharma",              client: "Meridian Labs",          time: "Today, 11:00 AM",priority: "Normal", status: "Today" },
  { title: "Stand-up with the team",                          client: "Personal",               time: "12:30 PM",       priority: "Normal", status: "Today" },
  { title: "Follow up with Harbour Coffee on the quote",      client: "Harbour Coffee Roasters",time: "Tomorrow",       priority: "Normal", status: "Today" },
];

export default function Reminders() {
  const [tab, setTab] = useState("Today");

  // Whether to show the desktop notification opt-in banner
  const [notifications, setNotifications] = useStoredState("notification-prompt", true);

  // Reminder records stored in localStorage
  const [items, setItems] = useStoredState(
    "reminders",
    seed.map((s, i) => ({ id: `rem-${i}`, ...s })),
  );

  // Open a prompt to add a new reminder
  const createReminder = () => {
    const suggestions = [
      ["Renew studio insurance",          "Northline Studio"],
      ["Follow up with Meridian Labs",    "Meridian Labs"],
      ["Review GST filing documents",     "Finance"],
    ];
    const suggestion = suggestions[items.length % suggestions.length];
    const title = window.prompt("Reminder title", suggestion[0]);
    if (!title) return;
    setItems((current) => [
      ...current,
      { id: `rem-${Date.now()}`, title, client: suggestion[1], time: "Today, 5:00 PM", priority: "Normal", status: "Today" },
    ]);
  };

  // Helper: count reminders with a given status
  const count = (status: string) => items.filter((item) => item.status === status).length;

  // Items visible in the current tab
  const visible = items.filter((item) =>
    tab === "Completed" ? item.status === "Completed" : item.status === tab,
  );

  return (
    <div className="page">
      <PageHeader
        title="Nothing slips"
        action={<Button onClick={createReminder}><Icon name="plus" size={15} /> New reminder</Button>}
      />

      {/* Desktop notification opt-in banner */}
      {notifications && (
        <div className="notice">
          Desktop notifications help you catch time-sensitive reminders.
          <Button variant="ghost" onClick={async () => {
            if ("Notification" in window) await Notification.requestPermission();
            setNotifications(false);
          }}>Enable</Button>
          <Button variant="ghost" onClick={() => setNotifications(false)}>Dismiss</Button>
        </div>
      )}

      <Tabs
        items={[
          `Today ${count("Today")}`,
          `Overdue ${count("Overdue")}`,
          `Upcoming ${count("Upcoming")}`,
          `Completed ${count("Completed")}`,
        ]}
        active={`${tab} ${count(tab)}`}
        onChange={(v) => setTab(v.split(" ")[0])}
      />

      <section>
        <h2>{tab}</h2>
        <p className="subtle">Everything due {tab.toLowerCase()}.</p>
        <div className="panel">
          {visible.length ? visible.map((item) => (
            <div className={`reminder-row ${item.status === "Completed" ? "is-done" : ""}`} key={item.id}>
              {/* Checkbox toggles Completed status */}
              <input
                type="checkbox"
                checked={item.status === "Completed"}
                onChange={() => setItems((current) =>
                  current.map((r) =>
                    r.id === item.id
                      ? { ...r, status: r.status === "Completed" ? "Today" : "Completed" }
                      : r,
                  ),
                )}
              />
              <div className="grow">
                <strong>{item.title}</strong>
                <span className="tag">Client · {item.client}</span>
                <small>{item.time} · {item.priority} priority</small>
              </div>
              <div className="row-actions">
                <Button variant="ghost" onClick={() => {
                  const title = window.prompt("Edit reminder", item.title);
                  if (title) setItems((current) => current.map((r) => r.id === item.id ? { ...r, title } : r));
                }}>Edit</Button>
                <Button variant="ghost" onClick={() =>
                  setItems((current) => current.map((r) =>
                    r.id === item.id ? { ...r, status: "Upcoming", time: "Tomorrow, 9:00 AM" } : r,
                  ))
                }>Reschedule</Button>
                <Button variant="ghost" onClick={() =>
                  window.confirm("Delete this reminder?") &&
                  setItems((current) => current.filter((r) => r.id !== item.id))
                }>Delete</Button>
              </div>
            </div>
          )) : (
            <div className="empty-row">No reminders in this view.</div>
          )}
        </div>
      </section>
    </div>
  );
}
