// ─────────────────────────────────────────────────────────────
// Clients.tsx — CRM with pill filter tabs + overflow menu
//               Edit drawer includes: status, last touch,
//               next action + time, attention flag, owner
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { Button, Icon, PageHeader, Person, Search } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { initials: "ML", name: "Meridian Labs",          contact: "Rahul Sethi",        phone: "+91 98200 41122", email: "rahul@meridian.com",  tags: ["Retainer","Software"], action: "Send the revised SOW to Meridian Labs",  actionTime: "Today · 11:00 AM",  last: "Today, 9:02",  notes: "", attention: true,  status: "Active", owner: "Ananya"      },
  { initials: "WF", name: "Wavelength FM",           contact: "Nikita Bose",        phone: "+91 98676 20114", email: "nikita@wavelength.fm",tags: ["Media"],               action: "Send Wavelength FM the signed addendum",actionTime: "1 day overdue",     last: "6 Aug",        notes: "", attention: true,  status: "Active", owner: "Abhishek"    },
  { initials: "KC", name: "Kulkarni Clinic",         contact: "Dr. Anita Kulkarni", phone: "+91 90040 77321", email: "anita@kulkarni.in",  tags: ["Clinic"],              action: "Call Dr. Kulkarni back about the retainer",actionTime: "Today · 2:30 PM",  last: "Yesterday",    notes: "", attention: false, status: "Active", owner: "Priya Nair"  },
  { initials: "KF", name: "Kalyan Foods",            contact: "Deepak Kalyan",      phone: "+91 99300 55810", email: "deepak@kalyan.com",  tags: ["Food","Retainer"],     action: "No follow-up",                          actionTime: "",                  last: "12 Aug",       notes: "", attention: false, status: "Active", owner: "Ananya"      },
  { initials: "SI", name: "Sanchi Interiors",        contact: "Sanchita Rao",       phone: "+91 98450 31207", email: "sanchita@sanchi.in", tags: ["Interiors"],           action: "Scoping call with Sanchi Interiors",    actionTime: "19 Aug · 4:00 PM",  last: "11 Aug",       notes: "", attention: false, status: "Active", owner: "Karan Mehta" },
  { initials: "HC", name: "Harbour Coffee Roasters", contact: "Imran Qureshi",      phone: "+91 91670 44902", email: "imran@harbour.co",   tags: ["Cafe"],                action: "Follow up with Harbour Coffee on the quote",actionTime: "Tomorrow · 10:00 AM",last: "10 Aug",   notes: "", attention: false, status: "Active", owner: "Abhishek"    },
];

type Client = {
  id: string; initials: string; name: string; contact: string;
  phone: string; email: string; tags: string[];
  action: string; actionTime: string;
  last: string; status: string; attention: boolean; notes: string; owner: string;
};

// All editable form fields — including the ones that were missing before
type ClientForm = Omit<Client, "id" | "initials">;

const KNOWN_TAGS = ["Retainer","Software","Media","Clinic","Food","Interiors","Cafe","Retail","Fitness","Print"];
const OWNERS     = ["Ananya","Abhishek","Priya Nair","Karan Mehta"];
const STATUSES   = ["Active","Lead","On hold","Archived"];

const blank = (): ClientForm => ({
  name: "", contact: "", phone: "", email: "", tags: [],
  action: "", actionTime: "", last: "",
  status: "Active", attention: false, notes: "", owner: "Ananya",
});

// ── Overflow ··· menu ─────────────────────────────────────────
function OverflowMenu({ onEdit, onArchive, onDelete, archived }: {
  onEdit(): void; onArchive(): void; onDelete(): void; archived: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="overflow-menu-wrap" ref={ref} onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <button className="overflow-btn" onClick={() => setOpen((o) => !o)} aria-label="More actions">···</button>
      {open && (
        <div className="overflow-menu">
          <button onClick={() => { onEdit(); setOpen(false); }}>Edit</button>
          <button onClick={() => { onArchive(); setOpen(false); }}>{archived ? "Restore" : "Archive"}</button>
          <hr />
          <button className="danger" onClick={() => { onDelete(); setOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Clients() {
  const [q, setQ]           = useState("");
  const [filter, setFilter] = useState("All");

  const [records, setRecords] = useStoredState<Client[]>(
    "clients",
    seed.map((c, i) => ({ id: `client-${i}`, ...c })),
  );

  // Migrate: old shape had tags as string or combined contact field
  const safeRecords: Client[] = records.map((c) => {
    if (Array.isArray(c.tags)) return { owner: "", ...c }; // already new shape
    const legacy = c as unknown as Record<string, unknown>;
    const contact = String(legacy.contact ?? "");
    return {
      id:         String(legacy.id ?? ""),
      initials:   String(legacy.initials ?? ""),
      name:       String(legacy.name ?? ""),
      contact:    contact.split("·")[0]?.trim() ?? "",
      phone:      contact.split("·")[1]?.trim() ?? "",
      email:      "",
      tags:       [],
      action:     String(legacy.action ?? ""),
      actionTime: "",
      last:       String(legacy.last ?? ""),
      status:     String(legacy.status ?? "Active"),
      attention:  Boolean(legacy.attention ?? false),
      notes:      "",
      owner:      "",
    };
  });

  // ── Drawer state ──────────────────────────────────────────
  const [drawer,   setDrawer]   = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState<ClientForm>(blank());
  const [tagInput, setTagInput] = useState("");

  const setField = (f: keyof ClientForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const toggleTag = (t: string) =>
    setForm((p) => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };

  const openAdd = () => {
    setForm(blank()); setTagInput(""); setEditId(null); setDrawer(true);
  };

  const openEdit = (c: Client) => {
    setForm({
      name: c.name, contact: c.contact, phone: c.phone, email: c.email,
      tags: Array.isArray(c.tags) ? c.tags : [],
      action: c.action, actionTime: c.actionTime,
      last: c.last, status: c.status, attention: c.attention,
      notes: c.notes, owner: c.owner ?? "",
    });
    setTagInput(""); setEditId(c.id); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const now = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (editId) {
      setRecords((cur) => cur.map((r) => r.id === editId
        ? {
            id:       editId,
            initials: r.initials || form.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
            ...form,
            // if last was blank, stamp today
            last: form.last.trim() || now,
          }
        : r,
      ));
    } else {
      setRecords((cur) => [{
        id:       `client-${Date.now()}`,
        initials: form.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
        ...form,
        last: now,
      }, ...cur]);
    }
    setDrawer(false);
  };

  // ── Computed counts ───────────────────────────────────────
  const active    = safeRecords.filter((c) => c.status === "Active").length;
  const needsAttn = safeRecords.filter((c) => c.attention).length;
  const archived  = safeRecords.filter((c) => c.status === "Archived").length;

  const filterTabs = [
    { label: `All ${safeRecords.length}`,    key: "All"             },
    { label: `Active ${active}`,             key: "Active"          },
    { label: `Needs attention ${needsAttn}`, key: "Needs attention" },
    { label: `Archived ${archived}`,         key: "Archived"        },
    { label: "+ Tag",                        key: "_tag"            },
  ];

  const rows = safeRecords
    .filter((c) => `${c.name} ${c.contact} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase()))
    .filter((c) => {
      if (filter === "All") return true;
      if (filter === "Needs attention") return c.attention;
      return c.status === filter;
    });

  return (
    <div className="page">
      <PageHeader
        kicker="CLIENTS · Northline Studio"
        title={`${safeRecords.length} clients · ${needsAttn} need attention`}
        action={
          <div className="header-actions">
            <Search placeholder="Search name, phone, email" value={q} onChange={setQ} />
            <Button onClick={openAdd}><Icon name="plus" size={15} /> New client</Button>
          </div>
        }
      />

      {/* Pill filter tabs */}
      <div className="pill-tabs">
        {filterTabs.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? "active" : f.key === "_tag" ? "pill-tag" : ""}
            onClick={() => f.key !== "_tag" && setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CLIENT</th>
              <th>TAGS</th>
              <th>NEXT ACTION</th>
              <th>STATUS</th>
              <th>LAST TOUCH</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <Person initials={c.initials} name={c.name} detail={`${c.contact}${c.phone ? ` · ${c.phone}` : ""}`} />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(Array.isArray(c.tags) ? c.tags : []).map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                </td>
                <td>
                  <span style={{ color: c.attention ? "var(--orange)" : "var(--ink)", fontWeight: c.attention ? 560 : 400 }}>
                    {c.action || "—"}
                  </span>
                  {c.actionTime && (
                    <span style={{ display: "block", fontSize: 11, marginTop: 2, color: c.actionTime.toLowerCase().includes("overdue") ? "var(--orange)" : "var(--muted)" }}>
                      {c.actionTime}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`status ${c.status === "Active" ? "status-good" : c.status === "Archived" ? "" : "status-warn"}`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{c.last}</td>
                <td>
                  <OverflowMenu
                    onEdit={() => openEdit(c)}
                    onArchive={() => setRecords((cur) => cur.map((r) =>
                      r.id === c.id ? { ...r, status: r.status === "Active" ? "Archived" : "Active" } : r,
                    ))}
                    onDelete={() => window.confirm(`Delete ${c.name}?`) && setRecords((cur) => cur.filter((r) => r.id !== c.id))}
                    archived={c.status === "Archived"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit drawer ── */}
      {drawer && (
        <DrawerPanel
          title={editId ? "Edit client" : "New client"}
          subtitle="BASIC INFORMATION"
          onClose={() => setDrawer(false)}
          onSubmit={handleSave}
          submitLabel="Save client"
          width={520}
        >
          <Field label="Client / company name *">
            <input autoFocus style={inputStyle} placeholder="Meridian Labs" value={form.name} onChange={setField("name")} />
          </Field>
          <Field label="Primary contact name">
            <input style={inputStyle} placeholder="Rahul Sethi" value={form.contact} onChange={setField("contact")} />
          </Field>
          <Field label="Phone & email" row>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="+91 98200 41122" value={form.phone} onChange={setField("phone")} />
            <input style={{ ...inputStyle, flex: 1 }} type="email" placeholder="rahul@company.in" value={form.email} onChange={setField("email")} />
          </Field>

          <Field label="Owner">
            <ChipGroup options={OWNERS} value={form.owner} onChange={(v) => setForm((p) => ({ ...p, owner: v }))} />
          </Field>

          <DrawerSection label="CLIENT CONTEXT" />

          <Field label="Tags">
            <input
              style={inputStyle} placeholder="Add a tag, press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              <p style={{ fontSize: 11, color: "var(--muted)", width: "100%", margin: "0 0 4px" }}>EXISTING TAGS</p>
              {KNOWN_TAGS.map((t) => (
                <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                  padding: "4px 10px", borderRadius: 99, fontSize: 11, cursor: "pointer", border: "1px solid",
                  borderColor: form.tags.includes(t) ? "var(--teal)" : "var(--line)",
                  background:  form.tags.includes(t) ? "var(--teal-soft)" : "var(--paper)",
                  color:       form.tags.includes(t) ? "var(--teal)" : "var(--muted)",
                }}>{t}{form.tags.includes(t) ? " ✓" : ""}</button>
              ))}
              {/* Show any custom tags already on the record */}
              {form.tags.filter((t) => !KNOWN_TAGS.includes(t)).map((t) => (
                <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                  padding: "4px 10px", borderRadius: 99, fontSize: 11, cursor: "pointer", border: "1px solid",
                  borderColor: "var(--teal)", background: "var(--teal-soft)", color: "var(--teal)",
                }}>{t} ✓</button>
              ))}
            </div>
          </Field>

          <Field label="Important context / notes">
            <textarea style={textareaStyle} placeholder="How they prefer to be contacted, what they care about, anything worth remembering." value={form.notes} onChange={setField("notes")} />
          </Field>

          <DrawerSection label="NEXT ACTION" />

          <Field label="What happens next">
            <input style={inputStyle} placeholder="Send revised SOW" value={form.action} onChange={setField("action")} />
          </Field>
          <Field label="When / time note">
            <input style={inputStyle} placeholder="Today · 11:00 AM" value={form.actionTime} onChange={setField("actionTime")} />
          </Field>

          <Field label="Needs attention">
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.attention}
                onChange={(e) => setForm((p) => ({ ...p, attention: e.target.checked }))}
              />
              Flag this client as needing attention
            </label>
          </Field>

          <DrawerSection label="STATUS & LAST TOUCH" />

          <Field label="Status">
            <ChipGroup options={STATUSES} value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: v }))} />
          </Field>

          <Field label="Last touch" hint="Leave blank to stamp today's date automatically.">
            <input style={inputStyle} placeholder="e.g. Today, 9:02  or  15 Aug" value={form.last} onChange={setField("last")} />
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}
