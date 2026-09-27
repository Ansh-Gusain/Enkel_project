// ─────────────────────────────────────────────────────────────
// Leads.tsx — sales pipeline with stage and owner dropdowns
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, DataTable, Icon, PageHeader, Person, Search, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed data: [initials, name, company, stage, owner, nextAction]
const seed = [
  ["DV", "Deepak Verma",  "Oakline Consulting", "Working",  "Priya Nair",  "Resend brief"],
  ["PN", "Priya Nambiar", "Lumen Architects",   "Working",  "Abhishek",    "Follow up on quote"],
  ["PM", "Priya Mehta",   "Wavelength FM",       "New",      "Ananya",      "No follow-up"],
  ["VJ", "Vikram Joshi",  "Torrent Fitness",     "New",      "Karan Mehta", "No follow-up"],
  ["KI", "Kavya Iyer",    "Verdant Nurseries",   "New",      "Karan Mehta", "No follow-up"],
  ["RS", "Rahul Sharma",  "Meridian Labs",        "Working",  "Abhishek",    "Call about proposal"],
];

const stages = ["All", "New", "Working", "Qualified", "Proposal", "Won", "Lost"];
const owners  = ["Ananya", "Abhishek", "Priya Nair", "Karan Mehta"];

export default function Leads() {
  const [q,     setQ]     = useState("");
  const [stage, setStage] = useState("All");

  const [records, setRecords] = useStoredState(
    "leads",
    seed.map((l, i) => ({
      id:       `lead-${i}`,
      initials: l[0],
      name:     l[1],
      company:  l[2],
      stage:    l[3],
      owner:    l[4],
      action:   l[5],
      attention: i < 2,
      last:     "Today",
    })),
  );

  const rows = records
    .filter((l) => `${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase()))
    .filter((l) => stage === "All" || l.stage === stage);

  const addLead = () => {
    const name = window.prompt("Lead name");
    if (!name) return;
    const company = window.prompt("Company", "New company") ?? "New company";
    setRecords((cur) => [{
      id:       `lead-${Date.now()}`,
      initials: name.split(" ").map((p) => p[0]).join("").slice(0, 2),
      name, company,
      stage:    "New",
      owner:    "Ananya",
      action:   "Make first contact",
      attention: false,
      last:     "Just now",
    }, ...cur]);
  };

  const count = (s: string) =>
    s === "All" ? records.length : records.filter((l) => l.stage === s).length;

  return (
    <div className="page">
      <PageHeader
        kicker="LEADS · Northline Studio"
        title={`${records.filter((l) => !["Won", "Lost"].includes(l.stage)).length} active · ${records.filter((l) => ["Won", "Lost"].includes(l.stage)).length} closed · ${records.filter((l) => l.attention).length} need attention`}
        action={
          <div className="header-actions">
            <Search placeholder="Search leads" value={q} onChange={setQ} />
            <Button onClick={addLead}><Icon name="plus" size={15} /> New lead</Button>
          </div>
        }
      />

      <Tabs
        items={stages.map((s) => `${s} ${count(s)}`)}
        active={`${stage} ${count(stage)}`}
        onChange={(v) => setStage(v.replace(/\s\d+$/, ""))}
      />

      <DataTable
        headers={["LEAD", "COMPANY", "STAGE", "OWNER", "NEXT ACTION", "ACTIONS"]}
        rows={rows.map((l) => [
          <Person
            key={l.id}
            initials={l.initials}
            name={l.name}
            detail={`${l.name.split(" ")[0].toLowerCase()}@${l.company.split(" ")[0].toLowerCase()}.com`}
          />,
          l.company,
          // Inline stage dropdown
          <select
            className="table-select"
            value={l.stage}
            onChange={(e) => setRecords((cur) => cur.map((r) => r.id === l.id ? { ...r, stage: e.target.value } : r))}
          >
            {stages.slice(1).map((s) => <option key={s}>{s}</option>)}
          </select>,
          // Inline owner dropdown
          <select
            className="table-select"
            value={l.owner}
            onChange={(e) => setRecords((cur) => cur.map((r) => r.id === l.id ? { ...r, owner: e.target.value } : r))}
          >
            {owners.map((o) => <option key={o}>{o}</option>)}
          </select>,
          l.action,
          <div className="table-actions">
            <button onClick={() => {
              const action = window.prompt("Next action", l.action);
              if (action) setRecords((cur) => cur.map((r) => r.id === l.id ? { ...r, action } : r));
            }}>Edit</button>
            <button onClick={() =>
              window.confirm(`Delete ${l.name}?`) &&
              setRecords((cur) => cur.filter((r) => r.id !== l.id))
            }>Delete</button>
          </div>,
        ])}
      />
    </div>
  );
}
