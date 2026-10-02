// ─────────────────────────────────────────────────────────────
// Leads.tsx — pipeline with pill tabs + avatar owner chip + overflow menu
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { Button, Icon, PageHeader, Person, Search } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, selectStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { initials:"DV", name:"Deepak Verma",  email:"deepak@oaklineconsv.com", company:"Oakline Consulting", industry:"Consulting",  stage:"Working",   owner:"Priya Nair",  source:"Referral", priority:"High",   action:"Resend brief",         actionTime:"2 days overdue",       last:"14 Aug" },
  { initials:"PN", name:"Priya Nambiar", email:"priya@lumerarch.in",      company:"Lumen Architects",   industry:"Architecture", stage:"Working",   owner:"Abhishek",    source:"Website",  priority:"Medium", action:"Follow up on quote",   actionTime:"1 day overdue",        last:"15 Aug" },
  { initials:"PM", name:"Priya Mehta",   email:"priya@wavelengthfm.in",   company:"Wavelength FM",       industry:"Media",        stage:"New",       owner:"Ananya",      source:"Other",    priority:"Low",    action:"No follow-up",         actionTime:"",                     last:"22 Aug" },
  { initials:"VJ", name:"Vikram Joshi",  email:"vikram@torrentfit.in",    company:"Torrent Fitness",     industry:"Fitness",      stage:"New",       owner:"Karan Mehta", source:"Other",    priority:"Low",    action:"No follow-up",         actionTime:"",                     last:"19 Aug" },
  { initials:"KI", name:"Kavya Iyer",    email:"kavya@verdantnursery.in", company:"Verdant Nurseries",   industry:"Retail",       stage:"New",       owner:"Karan Mehta", source:"WhatsApp", priority:"Low",    action:"No follow-up",         actionTime:"",                     last:"12 Aug" },
  { initials:"RS", name:"Rahul Sharma",  email:"rahul@meridianlab.in",    company:"Meridian Labs",        industry:"Software",     stage:"Working",   owner:"Abhishek",    source:"Email",    priority:"High",   action:"Call about proposal",  actionTime:"Today, 11:00 AM",      last:"Today"  },
];

const STAGES  = ["All","New","Working","Qualified","Proposal","Won","Lost"];
const OWNERS  = ["Abhishek","Ananya","Priya Nair","Karan Mehta"];
const SOURCES = ["Referral","Website","WhatsApp","Email","Other"];

type Lead = { id:string; initials:string; name:string; email:string; company:string; industry:string; stage:string; owner:string; source:string; priority:string; action:string; actionTime:string; notes:string; attention:boolean; last:string; };
const blank = (): Omit<Lead,"id"|"initials"|"attention"|"last"> => ({
  name:"",company:"",industry:"",email:"",stage:"New",owner:"Ananya",source:"Other",priority:"Medium",action:"",actionTime:"",notes:"",
});

function OwnerChip({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0,2);
  return <span className="owner-chip" title={name}>{initials}</span>;
}

function OverflowMenu({ onEdit, onDelete }: { onEdit(): void; onDelete(): void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-menu-wrap" onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <button className="overflow-btn" onClick={() => setOpen((o) => !o)}>···</button>
      {open && (
        <div className="overflow-menu">
          <button onClick={() => { onEdit(); setOpen(false); }}>Edit</button>
          <hr />
          <button className="danger" onClick={() => { onDelete(); setOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default function Leads() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("All");

  const [records, setRecords] = useStoredState<Lead[]>(
    "leads",
    seed.map((l, i) => ({ id:`lead-${i}`, ...l, attention: i < 2 })),
  );

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blank());

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = () => { setForm(blank()); setEditId(null); setDrawer(true); };
  const openEdit = (l: Lead) => {
    setForm({ name:l.name,company:l.company,industry:l.industry,email:l.email,stage:l.stage,owner:l.owner,source:l.source,priority:l.priority,action:l.action,actionTime:l.actionTime,notes:l.notes });
    setEditId(l.id); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setRecords((cur) => cur.map((r) => r.id === editId ? { ...r, ...form } : r));
    } else {
      setRecords((cur) => [{
        id:`lead-${Date.now()}`,
        initials: form.name.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase(),
        ...form, attention: !form.actionTime, last: "Just now",
      }, ...cur]);
    }
    setDrawer(false);
  };

  const active = records.filter((l) => !["Won","Lost"].includes(l.stage)).length;
  const closed = records.filter((l) => ["Won","Lost"].includes(l.stage)).length;
  const needsAttn = records.filter((l) => l.attention).length;

  const count = (s: string) => s === "All" ? records.length : records.filter((l) => l.stage === s).length;

  const stageTabs = [
    { label: `All ${records.length}`,  key: "All"       },
    { label: `Active ${active}`,        key: "Active"    },
    ...["New","Working","Qualified"].map((s) => ({ label: `${s} ${count(s)}`, key: s })),
    { label: `Closed ${closed}`,        key: "Closed"    },
  ];

  const rows = records
    .filter((l) => `${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase()))
    .filter((l) => {
      if (stage === "All") return true;
      if (stage === "Active") return !["Won","Lost"].includes(l.stage);
      if (stage === "Closed") return ["Won","Lost"].includes(l.stage);
      return l.stage === stage;
    });

  return (
    <div className="page">
      <PageHeader
        kicker="LEADS · Northline Studio"
        title={`${active} active · ${closed} closed · ${needsAttn} need attention`}
        action={
          <div className="header-actions">
            <Search placeholder="Search name, company, phone, email" value={q} onChange={setQ} />
            <Button variant="secondary"><Icon name="filter" size={14} /> Filter</Button>
            <Button onClick={openAdd}><Icon name="plus" size={15} /> New lead</Button>
          </div>
        }
      />

      {/* Pill tabs */}
      <div className="pill-tabs">
        {stageTabs.map((t) => (
          <button key={t.key} className={stage === t.key ? "active" : ""} onClick={() => setStage(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>LEAD</th>
              <th>COMPANY</th>
              <th>STATUS</th>
              <th>OWNER</th>
              <th>NEXT ACTION</th>
              <th>LAST TOUCH</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>
                  <Person
                    initials={l.initials}
                    name={l.attention ? `● ${l.name}` : l.name}
                    detail={l.email}
                  />
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{l.company}</span>
                  <small style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>{l.industry}</small>
                </td>
                <td>
                  <select
                    className="table-select"
                    value={l.stage}
                    onChange={(e) => setRecords((cur) => cur.map((r) => r.id === l.id ? { ...r, stage: e.target.value } : r))}
                  >
                    {STAGES.slice(1).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <OwnerChip name={l.owner} />
                </td>
                <td>
                  <span>{l.action || "—"}</span>
                  {l.actionTime && (
                    <span style={{ display: "block", fontSize: 11, marginTop: 2, color: l.actionTime.toLowerCase().includes("overdue") ? "var(--orange)" : "var(--muted)" }}>
                      {l.actionTime}
                    </span>
                  )}
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{l.last}</td>
                <td>
                  <OverflowMenu
                    onEdit={() => openEdit(l)}
                    onDelete={() => window.confirm(`Delete ${l.name}?`) && setRecords((cur) => cur.filter((r) => r.id !== l.id))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawer && (
        <DrawerPanel
          title={editId ? "Edit lead" : "New lead"}
          subtitle="WHO"
          onClose={() => setDrawer(false)}
          onSubmit={handleSave}
          submitLabel="Save lead"
          width={520}
        >
          <Field label="Lead name *">
            <input autoFocus style={inputStyle} placeholder="Rahul Sharma" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Company">
            <input style={inputStyle} placeholder="Meridian Labs" value={form.company} onChange={set("company")} />
          </Field>
          <Field label="Phone & email" row>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="+91 98200 41122" value={""} readOnly />
            <input style={{ ...inputStyle, flex: 1 }} type="email" placeholder="rahul@meridian.com" value={form.email} onChange={set("email")} />
          </Field>

          <DrawerSection label="NEXT ACTION" />
          <Field label="What happens next">
            <input style={inputStyle} placeholder="Intro call" value={form.action} onChange={set("action")} />
          </Field>
          <Field label="When" hint="Leave blank and the lead lands in the list flagged as needing attention.">
            <input style={inputStyle} type="date" value={form.actionTime} onChange={set("actionTime")} />
          </Field>

          <DrawerSection label="CONTEXT" />
          <Field label="Owner">
            <input style={inputStyle} placeholder="Type a name" value={form.owner} onChange={set("owner")} />
            <ChipGroup options={OWNERS} value={form.owner} onChange={(v) => setForm((p) => ({ ...p, owner: v }))} />
          </Field>
          <Field label="Source">
            <ChipGroup options={SOURCES} value={form.source} onChange={(v) => setForm((p) => ({ ...p, source: v }))} />
          </Field>
          <Field label="Priority">
            <ChipGroup options={["High","Medium","Low"]} value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v }))} />
          </Field>
          <Field label="Notes">
            <textarea style={textareaStyle} placeholder="What they asked for, budget hints, anything worth remembering." value={form.notes} onChange={set("notes")} />
          </Field>

          <DrawerSection label="STATUS" />
          <Field label="Stage" hint="Every lead starts as New. Move it along from the list.">
            <select style={selectStyle} value={form.stage} onChange={set("stage")}>
              {STAGES.slice(1).map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}
