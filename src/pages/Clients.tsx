// ─────────────────────────────────────────────────────────────
// Clients.tsx — client CRM: search, filter, add/edit/archive
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, DataTable, Icon, PageHeader, Person, Search, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed data: [initials, name, contact, tags, nextAction, lastTouch]
const seed = [
  ["ML", "Meridian Labs",         "Rahul Sethi · +91 98200 41122",  "Retainer · Software", "Send the revised SOW",   "Today, 9:02"],
  ["WF", "Wavelength FM",         "Nikita Bose · +91 98676 20114",  "Media",               "Send signed addendum",   "6 Aug"],
  ["KC", "Kulkarni Clinic",       "Dr. Anita Kulkarni · +91 90040 77321", "Clinic",        "Call about the retainer","Yesterday"],
  ["KF", "Kalyan Foods",          "Deepak Kalyan · +91 99300 55810","Food · Retainer",     "No follow-up",           "12 Aug"],
  ["SI", "Sanchi Interiors",      "Sanchita Rao · +91 98450 31207", "Interiors",           "Scoping call",           "11 Aug"],
  ["HC", "Harbour Coffee Roasters","Imran Qureshi · +91 91670 44902","Cafe",               "Follow up on quote",     "10 Aug"],
];

export default function Clients() {
  const [q, setQ] = useState("");           // search query
  const [filter, setFilter] = useState("All"); // active tab filter

  const [records, setRecords] = useStoredState(
    "clients",
    seed.map((c, i) => ({
      id:       `client-${i}`,
      initials: c[0],
      name:     c[1],
      contact:  c[2],
      tags:     c[3],
      action:   c[4],
      last:     c[5],
      status:   "Active",
      attention: i === 1 || i === 4, // Meridian and Sanchi need attention
    })),
  );

  // Filter by search query and active tab
  const rows = records
    .filter((c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.contact.toLowerCase().includes(q.toLowerCase()),
    )
    .filter((c) =>
      filter === "All"
        ? true
        : filter === "Needs attention"
          ? c.attention
          : c.status === filter,
    );

  const addClient = () => {
    const name = window.prompt("Client or business name");
    if (!name) return;
    const contact = window.prompt("Contact name, phone, or email", "New contact · +91 ") ?? "";
    setRecords((current) => [{
      id:       `client-${Date.now()}`,
      initials: name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
      name,
      contact,
      tags:     "New",
      action:   "Schedule introduction",
      last:     "Just now",
      status:   "Active",
      attention: false,
    }, ...current]);
  };

  // Counts for tab badges
  const active   = records.filter((c) => c.status === "Active").length;
  const needsAttn = records.filter((c) => c.attention).length;
  const archived = records.filter((c) => c.status === "Archived").length;

  // Current tab count (for the active tab highlight)
  const activeCount =
    filter === "All" ? records.length :
    filter === "Active" ? active :
    filter === "Archived" ? archived : needsAttn;

  return (
    <div className="page">
      <PageHeader
        kicker="CLIENTS · Northline Studio"
        title={`${records.length} clients · ${needsAttn} need attention`}
        action={
          <div className="header-actions">
            <Search placeholder="Search name, phone, email" value={q} onChange={setQ} />
            <Button onClick={addClient}><Icon name="plus" size={15} /> New client</Button>
          </div>
        }
      />

      <Tabs
        items={[`All ${records.length}`, `Active ${active}`, `Needs attention ${needsAttn}`, `Archived ${archived}`]}
        active={`${filter} ${activeCount}`}
        onChange={(value) => setFilter(value.replace(/\s\d+$/, ""))}
      />

      <DataTable
        headers={["CLIENT", "TAGS", "NEXT ACTION", "STATUS", "LAST TOUCH", "ACTIONS"]}
        rows={rows.map((c) => [
          <Person key={c.id} initials={c.initials} name={c.name} detail={c.contact} />,
          <span className="tag">{c.tags}</span>,
          <span>{c.action}</span>,
          <span className={`status ${c.status === "Active" ? "status-good" : ""}`}>{c.status}</span>,
          <span>{c.last}</span>,
          <div className="table-actions">
            <button onClick={() => {
              const name = window.prompt("Edit client name", c.name);
              if (name) setRecords((cur) => cur.map((r) => r.id === c.id ? { ...r, name } : r));
            }}>Edit</button>
            <button onClick={() =>
              setRecords((cur) => cur.map((r) =>
                r.id === c.id ? { ...r, status: r.status === "Active" ? "Archived" : "Active" } : r,
              ))
            }>{c.status === "Active" ? "Archive" : "Restore"}</button>
            <button onClick={() =>
              window.confirm(`Delete ${c.name}?`) &&
              setRecords((cur) => cur.filter((r) => r.id !== c.id))
            }>Delete</button>
          </div>,
        ])}
      />
    </div>
  );
}
