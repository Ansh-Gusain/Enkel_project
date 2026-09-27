// ─────────────────────────────────────────────────────────────
// Catalogue.tsx — service catalogue + brand asset drafts
// Two tabs: "Items" (service cards) and "Brand Assets" (drafts)
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader, Search, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed services: [name, category, description, price]
const seed = [
  ["Legacy CMS Migration",        "Development", "One-time migration of outdated content management systems.",               "₹60,000"],
  ["Mobile App Development",      "Development", "iOS, Android and cross-platform apps, from prototype to app store.",        "₹2,00,000+"],
  ["Performance Marketing",       "Marketing",   "Paid campaigns across search and social, managed end to end.",              "₹30,000/mo"],
  ["SEO",                         "Marketing",   "Ongoing search optimization, technical audits and content strategy.",       "₹20,000/mo"],
  ["Technical Consulting",        "Consulting",  "Architecture reviews, tech due diligence and roadmaps.",                   "₹3,000/hr"],
  ["UI/UX Design",                "Design",      "Product design and prototyping for web and mobile experiences.",            "₹40,000+"],
  ["Web Application Development", "Development", "Custom web applications and internal tools built to spec.",                "₹1,50,000+"],
  ["Website Maintenance",         "Support",     "Monthly upkeep, updates, backups and monitoring.",                         "₹10,000/mo"],
];

type Draft = { id: string; title: string; body: string };

export default function Catalogue() {
  const [tab, setTab] = useState("Items");
  const [q,   setQ]   = useState("");

  const [items, setItems] = useStoredState(
    "catalogue",
    seed.map((s, i) => ({
      id:          `service-${i}`,
      name:        s[0],
      category:    s[1],
      description: s[2],
      price:       s[3],
      status:      i === 0 ? "Archived" : "Active",
    })),
  );

  const [drafts, setDrafts] = useStoredState<Draft[]>("brand-drafts", []);

  const addService = () => {
    const name = window.prompt("Service name");
    if (name) setItems((cur) => [...cur, {
      id: `service-${Date.now()}`, name,
      category: "Consulting", description: "A new service offering.", price: "₹25,000+", status: "Active",
    }]);
  };

  // Generate a marketing copy draft from a service card
  const createDraft = (item: typeof items[0]) => {
    setDrafts((cur) => [{
      id:    `draft-${Date.now()}`,
      title: `${item.name} campaign draft`,
      body:  `Built for growing teams: ${item.description} Starting at ${item.price}.`,
    }, ...cur]);
    setTab("Brand Assets");
  };

  const filtered = items.filter((i) =>
    `${i.name} ${i.category}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="page">
      <PageHeader
        kicker="CATALOGUE"
        title="Catalogue"
        description="Your services and offerings, organized in one place."
        action={<Button onClick={addService}><Icon name="plus" size={15} /> Add service</Button>}
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
            <Button variant="secondary">All categories ⌄</Button>
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
                  {/* Toggle Active / Archived */}
                  <button className="tag" onClick={() =>
                    setItems((cur) => cur.map((r) =>
                      r.id === item.id ? { ...r, status: r.status === "Active" ? "Archived" : "Active" } : r,
                    ))
                  }>{item.status}</button>
                  <button className="text-action" onClick={() => createDraft(item)}>
                    Create draft
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="draft-grid">
          {drafts.length ? drafts.map((draft) => (
            <article className="note-row" key={draft.id}>
              <div>
                <strong>{draft.title}</strong>
                <p>{draft.body}</p>
                <span className="tag">Generated draft</span>
              </div>
              <Button variant="ghost" onClick={() =>
                setDrafts((cur) => cur.filter((d) => d.id !== draft.id))
              }>Delete</Button>
            </article>
          )) : (
            <div className="empty-row">Generate a content draft from any catalogue item.</div>
          )}
        </div>
      )}
    </div>
  );
}
