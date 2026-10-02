// ─────────────────────────────────────────────────────────────
// Catalogue.tsx — service catalogue with add-service drawer
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader, Search, Tabs } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, selectStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { name: "Legacy CMS Migration",        category: "Development", description: "One-time migration of outdated content management systems.",               price: "₹60,000",     status: "Archived" },
  { name: "Mobile App Development",      category: "Development", description: "iOS, Android and cross-platform apps, from prototype to app store.",        price: "₹2,00,000+",  status: "Active"   },
  { name: "Performance Marketing",       category: "Marketing",   description: "Paid campaigns across search and social, managed end to end.",              price: "₹30,000/mo",  status: "Active"   },
  { name: "SEO",                         category: "Marketing",   description: "Ongoing search optimization, technical audits and content strategy.",       price: "₹20,000/mo",  status: "Active"   },
  { name: "Technical Consulting",        category: "Consulting",  description: "Architecture reviews, tech due diligence and roadmaps.",                   price: "₹3,000/hr",   status: "Active"   },
  { name: "UI/UX Design",                category: "Design",      description: "Product design and prototyping for web and mobile experiences.",            price: "₹40,000+",    status: "Active"   },
  { name: "Web Application Development", category: "Development", description: "Custom web applications and internal tools built to spec.",                price: "₹1,50,000+",  status: "Active"   },
  { name: "Website Maintenance",         category: "Support",     description: "Monthly upkeep, updates, backups and monitoring.",                         price: "₹10,000/mo",  status: "Active"   },
];

const CATEGORIES = ["Development", "Marketing", "Consulting", "Design", "Support", "Other"];
const PRICE_UNITS = ["one-time", "/mo", "/hr", "/project", "+"];

type Draft = { id: string; title: string; body: string };

const blank = () => ({ name: "", category: "Development", description: "", price: "", priceUnit: "one-time", status: "Active" });

export default function Catalogue() {
  const [tab, setTab] = useState("Items");
  const [q, setQ] = useState("");

  const [items, setItems] = useStoredState(
    "catalogue",
    seed.map((s, i) => ({ id: `service-${i}`, ...s })),
  );
  const [drafts, setDrafts] = useStoredState<Draft[]>("brand-drafts", []);

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blank());

  const set = (f: keyof ReturnType<typeof blank>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = () => { setForm(blank()); setEditId(null); setDrawer(true); };
  const openEdit = (item: typeof items[0]) => {
    setForm({ name: item.name, category: item.category, description: item.description, price: item.price, priceUnit: "one-time", status: item.status });
    setEditId(item.id); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setItems((cur) => cur.map((r) => r.id === editId ? { ...r, ...form } : r));
    } else {
      setItems((cur) => [...cur, { id: `service-${Date.now()}`, ...form }]);
    }
    setDrawer(false);
  };

  const createDraft = (item: typeof items[0]) => {
    setDrafts((cur) => [{ id: `draft-${Date.now()}`, title: `${item.name} campaign draft`, body: `Built for growing teams: ${item.description} Starting at ${item.price}.` }, ...cur]);
    setTab("Brand Assets");
  };

  const filtered = items.filter((i) => `${i.name} ${i.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page">
      <PageHeader
        kicker="CATALOGUE"
        title="Catalogue"
        description="Your services and offerings, organized in one place."
        action={<Button onClick={openAdd}><Icon name="plus" size={15} /> Add service</Button>}
      />

      <Tabs
        items={["Items", `Brand Assets ${drafts.length}`]}
        active={tab === "Items" ? "Items" : `Brand Assets ${drafts.length}`}
        onChange={(v) => setTab(v.startsWith("Brand") ? "Brand Assets" : "Items")}
      />

      {tab === "Items" ? (
        <>
          <div className="toolbar">
            <Search placeholder="Search services..." value={q} onChange={setQ} />
            <Button variant="secondary"><Icon name="filter" size={15} /> Filter</Button>
          </div>
          <div className="catalogue-grid">
            {filtered.map((item) => (
              <article className="service-card" key={item.id}>
                <h3>{item.name}</h3>
                <small>{item.category}</small>
                <p>{item.description}</p>
                <strong>{item.price}</strong>
                <div>
                  <button className="tag" onClick={() => setItems((cur) => cur.map((r) => r.id === item.id ? { ...r, status: r.status === "Active" ? "Archived" : "Active" } : r))}>
                    {item.status}
                  </button>
                  <button className="text-action" onClick={() => openEdit(item)}>Edit</button>
                  <button className="text-action" onClick={() => createDraft(item)}>Create with AI</button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="draft-grid">
          {drafts.length ? drafts.map((d) => (
            <article className="note-row" key={d.id}>
              <div><strong>{d.title}</strong><p>{d.body}</p><span className="tag">Generated draft</span></div>
              <Button variant="ghost" onClick={() => setDrafts((cur) => cur.filter((x) => x.id !== d.id))}>Delete</Button>
            </article>
          )) : <div className="empty-row">Generate a content draft from any catalogue item.</div>}
        </div>
      )}

      {drawer && (
        <DrawerPanel
          title={editId ? "Edit service" : "Add service"}
          subtitle={editId ? "" : "Add a service your agency offers."}
          onClose={() => setDrawer(false)}
          onSubmit={handleSave}
          submitLabel={editId ? "Save changes" : "Add Service"}
          width={480}
        >
          <Field label="Service name *">
            <input autoFocus style={inputStyle} placeholder="e.g. SEO, Website Development" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Category">
            <input style={inputStyle} placeholder="e.g. Development" value={form.category} onChange={set("category")} />
            <ChipGroup options={CATEGORIES} value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
          </Field>
          <Field label="Description">
            <textarea style={textareaStyle} placeholder="A line or two about what this is" value={form.description} onChange={set("description")} />
          </Field>
          <Field label="Price" row>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="75000" value={form.price} onChange={set("price")} />
            <select style={{ ...selectStyle, width: 120 }} value={form.priceUnit} onChange={set("priceUnit")}>
              {PRICE_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>

          <DrawerSection label="STATUS" />
          <Field label="Visibility">
            <ChipGroup options={["Active", "Archived"]} value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: v }))} />
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}
