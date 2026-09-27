import { useEffect, useMemo, useRef, useState } from "react";

type Page =
  | "Home"
  | "Reminders"
  | "Clients"
  | "Leads"
  | "Tasks"
  | "Catalogue"
  | "Design & Creative"
  | "Notes / Ideas"
  | "HR"
  | "Attendance"
  | "Sales"
  | "Expenses"
  | "Files";

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`enkel:${key}`);
      return stored ? JSON.parse(stored) as T : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(`enkel:${key}`, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

const nav: { page: Page; icon: string }[] = [
  { page: "Home", icon: "home" },
  { page: "Reminders", icon: "clock" },
  { page: "Clients", icon: "user" },
  { page: "Leads", icon: "chart" },
  { page: "Tasks", icon: "check" },
  { page: "Catalogue", icon: "grid" },
  { page: "Design & Creative", icon: "spark" },
  { page: "Notes / Ideas", icon: "note" },
  { page: "HR", icon: "users" },
  { page: "Attendance", icon: "scan" },
  { page: "Sales", icon: "receipt" },
  { page: "Expenses", icon: "wallet" },
  { page: "Files", icon: "folder" },
];

const paths: Record<string, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  clock: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/></>,
  user: <><circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-4 2.7-6 6.5-6s5.8 2 6.5 6"/></>,
  users: <><circle cx="9" cy="9" r="3"/><path d="M3 20c.4-4 2.3-6 6-6s5.6 2 6 6M16 6.5a3 3 0 0 1 0 5.8M17 15c2.4.5 3.6 2.2 4 5"/></>,
  chart: <><path d="M4 20v-6M9 20V9M14 20v-4M19 20V5"/></>,
  check: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
  spark: <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2ZM19 17l.6 2.4L22 20l-2.4.6L19 23l-.6-2.4L16 20l2.4-.6L19 17Z"/>,
  note: <><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  scan: <><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4"/><circle cx="12" cy="10" r="3"/><path d="M7.5 18c.5-3 2-4.5 4.5-4.5s4 1.5 4.5 4.5"/></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5ZM6 6V4h11v2"/></>,
  folder: <path d="M3 6h7l2 2h9v11H3V6Z"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  x: <path d="m6 6 12 12M18 6 6 18"/>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  filter: <path d="M4 6h16M7 12h10M10 18h4"/>,
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.note}</svg>;
}

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }: React.PropsWithChildren<{ variant?: "primary" | "secondary" | "ghost"; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; className?: string }>) {
  return <button className={`btn btn-${variant} ${className}`} onClick={onClick} type={type} disabled={disabled}>{children}</button>;
}

function Search({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (v: string) => void }) {
  return <label className="search"><Icon name="search" size={16}/><input placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)}/></label>;
}

function Logo() {
  return <div className="logo"><span className="logo-mark">›</span><strong>enkel</strong></div>;
}

function Sidebar({ page, setPage, open, close }: { page: Page; setPage: (p: Page) => void; open: boolean; close: () => void }) {
  return <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
    <div className="side-top"><Logo/><button className="mobile-close" onClick={close} aria-label="Close menu"><Icon name="x"/></button></div>
    <button className="workspace">
      <span className="avatar avatar-teal">N</span>
      <span><strong>Northline Studio</strong><small>SOFTWARE AGENCY</small></span>
      <span className="chevron">⌄</span>
    </button>
    <p className="eyebrow side-label">MODULES</p>
    <nav>
      {nav.map((item) => <button key={item.page} className={`nav-item ${page === item.page ? "active" : ""} ${item.page === "Attendance" ? "attendance-nav" : ""}`} onClick={() => { setPage(item.page); close(); }}>
        <Icon name={item.icon}/><span>{item.page}</span>{item.page === "Attendance" && <span className="new-badge">NEW</span>}
      </button>)}
    </nav>
  </aside>;
}

const attention = [
  ["Basanti Textiles — INV-0025", "₹20k outstanding · Sales", "38 days overdue"],
  ["Meridian Labs — INV-0031", "₹48k outstanding · Sales", "20 days overdue"],
  ["Wavelength FM — INV-0030", "₹32k outstanding · Sales", "12 days overdue"],
  ["Priya Nair — Printer cartridge", "₹1k pending reimbursement · No receipt attached · Expenses", "Needs approval"],
  ["Chase the signed addendum from Northpoint Dental", "Northpoint Dental · Reminders", "5 days overdue"],
  ["Send Sanchi Interiors the revised scope", "Sanchi Interiors · Reminders", "5 days overdue"],
];

const upcoming = [
  ["Send the revised SOW to Meridian Labs", "Meridian Labs", "11:00 AM"],
  ["Call about proposal — Rahul Sharma", "Meridian Labs", "Today, 11:00 AM"],
  ["Stand-up with the team", "Personal", "12:30 PM"],
  ["Follow up with Harbour Coffee on the quote", "Harbour Coffee Roasters", "Tomorrow"],
];

function PageHeader({ kicker, title, description, action }: { kicker?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className="page-header">
    <div>{kicker && <p className="eyebrow">{kicker}</p>}<h1>{title}</h1>{description && <p className="subtle">{description}</p>}</div>
    {action && <div>{action}</div>}
  </header>;
}

function Home() {
  const [dismissed, setDismissed] = useStoredState<string[]>("dismissed-attention", []);
  const visibleAttention = attention.filter((item) => !dismissed.includes(item[0]));
  const resetWorkspace = () => {
    if (!window.confirm("Restore all browser demo data to its original state? Attendance biometric data is not affected.")) return;
    Object.keys(localStorage).filter((key) => key.startsWith("enkel:")).forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };
  const go = (target: string) => { window.location.hash = `#app/${target}`; };
  return <div className="page">
    <PageHeader kicker="HOME · Northline Studio" title="Good morning, Ananya" description={new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date()) + " — here's what needs you today."} action={<Button variant="secondary" onClick={resetWorkspace}>Reset workspace</Button>}/>
    <section><h2>Needs your attention <span className="count">{visibleAttention.length}</span></h2>
      <div className="attention-list">{visibleAttention.map((a, i) => <div className="attention-row" key={a[0]}><span className="row-icon"><Icon name={i > 3 ? "clock" : "receipt"} size={17}/></span><button className="row-record grow" onClick={() => go(i < 3 ? "sales" : i === 3 ? "expenses" : "reminders")}><strong>{a[0]}</strong><small>{a[1]}</small></button><span className="status status-danger">{a[2]}</span><button className="icon-btn" onClick={() => setDismissed((items) => [...items, a[0]])} aria-label="Dismiss">×</button></div>)}</div>
      <button className="text-action" onClick={() => go("reminders")}>View all in Reminders →</button>
    </section>
    <section><h2>Today & upcoming</h2><div className="upcoming-list">{upcoming.map((u) => <div className="simple-row" key={u[0]}><Icon name="clock"/><div className="grow"><strong>{u[0]}</strong><small>{u[1]}</small></div><span className="muted">{u[2]}</span></div>)}</div></section>
    <section><h2>Business pulse</h2><div className="metrics"><Metric value="₹2.1L" label="Outstanding receivables"/><Metric value="11" label="Active clients"/><Metric value="14" label="Open tasks"/><Metric value="7/8" label="Team attendance"/><Metric value="₹9k" label="Spent this month"/></div></section>
    <section><h2>Quick actions</h2><div className="quick-actions"><Button variant="secondary" onClick={() => go("sales")}><Icon name="plus" size={14}/> Create invoice</Button><Button variant="secondary" onClick={() => go("clients")}><Icon name="plus" size={14}/> Add client</Button><Button variant="secondary" onClick={() => go("tasks")}><Icon name="plus" size={14}/> Add task</Button></div></section>
  </div>;
}

function Metric({ value, label, note, tone = "" }: { value: string; label: string; note?: string; tone?: string }) {
  return <div className="metric"><strong className={tone}>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div>;
}

function Reminders() {
  const [tab, setTab] = useState("Today");
  const [notifications, setNotifications] = useStoredState("notification-prompt", true);
  const [items, setItems] = useStoredState("reminders", upcoming.map((item, index) => ({ id: `rem-${index}`, title: item[0], client: item[1], time: item[2], priority: index === 0 ? "High" : "Normal", status: "Today" })));
  const createReminder = () => {
    const suggestions = [["Renew studio insurance", "Northline Studio"], ["Follow up with Meridian Labs", "Meridian Labs"], ["Review GST filing documents", "Finance"]];
    const suggestion = suggestions[items.length % suggestions.length];
    const title = window.prompt("Reminder title", suggestion[0]);
    if (!title) return;
    setItems((current) => [...current, { id: `rem-${Date.now()}`, title, client: suggestion[1], time: "Today, 5:00 PM", priority: "Normal", status: "Today" }]);
  };
  const visible = items.filter((item) => tab === "Completed" ? item.status === "Completed" : item.status === tab);
  const count = (status: string) => items.filter((item) => item.status === status).length;
  return <div className="page">
    <PageHeader title="Nothing slips" action={<Button onClick={createReminder}><Icon name="plus" size={15}/> New reminder</Button>}/>
    {notifications && <div className="notice">Desktop notifications help you catch time-sensitive reminders.<Button variant="ghost" onClick={async () => { if ("Notification" in window) await Notification.requestPermission(); setNotifications(false); }}>Enable</Button><Button variant="ghost" onClick={() => setNotifications(false)}>Dismiss</Button></div>}
    <Tabs items={[`Today ${count("Today")}`, `Overdue ${count("Overdue")}`, `Upcoming ${count("Upcoming")}`, `Completed ${count("Completed")}`]} active={`${tab} ${count(tab)}`} onChange={(v) => setTab(v.split(" ")[0])}/>
    <section><h2>{tab}</h2><p className="subtle">Everything due {tab.toLowerCase()}.</p>
      <div className="panel">{visible.length ? visible.map((item) => <div className={`reminder-row ${item.status === "Completed" ? "is-done" : ""}`} key={item.id}><input type="checkbox" checked={item.status === "Completed"} onChange={() => setItems((current) => current.map((record) => record.id === item.id ? { ...record, status: record.status === "Completed" ? "Today" : "Completed" } : record))}/><div className="grow"><strong>{item.title}</strong><span className="tag">Client · {item.client}</span><small>{item.time} · {item.priority} priority</small></div><div className="row-actions"><Button variant="ghost" onClick={() => { const title = window.prompt("Edit reminder", item.title); if (title) setItems((current) => current.map((record) => record.id === item.id ? { ...record, title } : record)); }}>Edit</Button><Button variant="ghost" onClick={() => setItems((current) => current.map((record) => record.id === item.id ? { ...record, status: "Upcoming", time: "Tomorrow, 9:00 AM" } : record))}>Reschedule</Button><Button variant="ghost" onClick={() => window.confirm("Delete this reminder?") && setItems((current) => current.filter((record) => record.id !== item.id))}>Delete</Button></div></div>) : <div className="empty-row">No reminders in this view.</div>}</div>
    </section>
  </div>;
}

const clients = [
  ["ML", "Meridian Labs", "Rahul Sethi · +91 98200 41122", "Retainer · Software", "Send the revised SOW", "Today, 9:02"],
  ["WF", "Wavelength FM", "Nikita Bose · +91 98676 20114", "Media", "Send signed addendum", "6 Aug"],
  ["KC", "Kulkarni Clinic", "Dr. Anita Kulkarni · +91 90040 77321", "Clinic", "Call about the retainer", "Yesterday"],
  ["KF", "Kalyan Foods", "Deepak Kalyan · +91 99300 55810", "Food · Retainer", "No follow-up", "12 Aug"],
  ["SI", "Sanchi Interiors", "Sanchita Rao · +91 98450 31207", "Interiors", "Scoping call", "11 Aug"],
  ["HC", "Harbour Coffee Roasters", "Imran Qureshi · +91 91670 44902", "Cafe", "Follow up on quote", "10 Aug"],
];

function Clients() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [records, setRecords] = useStoredState("clients", clients.map((client, index) => ({ id: `client-${index}`, initials: client[0], name: client[1], contact: client[2], tags: client[3], action: client[4], last: client[5], status: "Active", attention: index === 1 || index === 4 })));
  const rows = records.filter((client) => client.name.toLowerCase().includes(q.toLowerCase()) || client.contact.toLowerCase().includes(q.toLowerCase())).filter((client) => filter === "All" || (filter === "Needs attention" ? client.attention : client.status === filter));
  const addClient = () => {
    const name = window.prompt("Client or business name");
    if (!name) return;
    const contact = window.prompt("Contact name, phone, or email", "New contact · +91 ") ?? "";
    setRecords((current) => [{ id: `client-${Date.now()}`, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), name, contact, tags: "New", action: "Schedule introduction", last: "Just now", status: "Active", attention: false }, ...current]);
  };
  return <div className="page"><PageHeader kicker="CLIENTS · Northline Studio" title={`${records.length} clients · ${records.filter((client) => client.attention).length} need attention`} action={<div className="header-actions"><Search placeholder="Search name, phone, email" value={q} onChange={setQ}/><Button onClick={addClient}><Icon name="plus" size={15}/> New client</Button></div>}/>
    <Tabs items={[`All ${records.length}`, `Active ${records.filter((client) => client.status === "Active").length}`, `Needs attention ${records.filter((client) => client.attention).length}`, `Archived ${records.filter((client) => client.status === "Archived").length}`]} active={`${filter} ${filter === "All" ? records.length : filter === "Active" ? records.filter((client) => client.status === "Active").length : filter === "Archived" ? records.filter((client) => client.status === "Archived").length : records.filter((client) => client.attention).length}`} onChange={(value) => setFilter(value.replace(/\s\d+$/, ""))}/>
    <DataTable headers={["CLIENT", "TAGS", "NEXT ACTION", "STATUS", "LAST TOUCH", "ACTIONS"]} rows={rows.map((client) => [
      <Person key={client.id} initials={client.initials} name={client.name} detail={client.contact}/>, <span className="tag">{client.tags}</span>, <span>{client.action}</span>, <span className={`status ${client.status === "Active" ? "status-good" : ""}`}>{client.status}</span>, <span>{client.last}</span>,
      <div className="table-actions"><button onClick={() => { const name = window.prompt("Edit client name", client.name); if (name) setRecords((current) => current.map((record) => record.id === client.id ? { ...record, name } : record)); }}>Edit</button><button onClick={() => setRecords((current) => current.map((record) => record.id === client.id ? { ...record, status: record.status === "Active" ? "Archived" : "Active" } : record))}>{client.status === "Active" ? "Archive" : "Restore"}</button><button onClick={() => window.confirm(`Delete ${client.name}?`) && setRecords((current) => current.filter((record) => record.id !== client.id))}>Delete</button></div>,
    ])}/>
  </div>;
}

const leads = [
  ["DV", "Deepak Verma", "Oakline Consulting", "Working", "Priya Nair", "Resend brief"],
  ["PN", "Priya Nambiar", "Lumen Architects", "Working", "Abhishek", "Follow up on quote"],
  ["PM", "Priya Mehta", "Wavelength FM", "New", "Ananya", "No follow-up"],
  ["VJ", "Vikram Joshi", "Torrent Fitness", "New", "Karan Mehta", "No follow-up"],
  ["KI", "Kavya Iyer", "Verdant Nurseries", "New", "Karan Mehta", "No follow-up"],
  ["RS", "Rahul Sharma", "Meridian Labs", "Working", "Abhishek", "Call about proposal"],
];

function Leads() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("All");
  const [records, setRecords] = useStoredState("leads", leads.map((lead, index) => ({ id: `lead-${index}`, initials: lead[0], name: lead[1], company: lead[2], stage: lead[3], owner: lead[4], action: lead[5], attention: index < 2, last: "Today" })));
  const stages = ["All", "New", "Working", "Qualified", "Proposal", "Won", "Lost"];
  const rows = records.filter((lead) => `${lead.name} ${lead.company}`.toLowerCase().includes(q.toLowerCase())).filter((lead) => stage === "All" || lead.stage === stage);
  const addLead = () => {
    const name = window.prompt("Lead name");
    if (!name) return;
    const company = window.prompt("Company", "New company") ?? "New company";
    setRecords((current) => [{ id: `lead-${Date.now()}`, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2), name, company, stage: "New", owner: "Ananya", action: "Make first contact", attention: false, last: "Just now" }, ...current]);
  };
  return <div className="page"><PageHeader kicker="LEADS · Northline Studio" title={`${records.filter((lead) => !["Won", "Lost"].includes(lead.stage)).length} active · ${records.filter((lead) => ["Won", "Lost"].includes(lead.stage)).length} closed · ${records.filter((lead) => lead.attention).length} need attention`} action={<div className="header-actions"><Search placeholder="Search leads" value={q} onChange={setQ}/><Button onClick={addLead}><Icon name="plus" size={15}/> New lead</Button></div>}/>
    <Tabs items={stages.map((item) => `${item} ${item === "All" ? records.length : records.filter((lead) => lead.stage === item).length}`)} active={`${stage} ${stage === "All" ? records.length : records.filter((lead) => lead.stage === stage).length}`} onChange={(value) => setStage(value.replace(/\s\d+$/, ""))}/>
    <DataTable headers={["LEAD", "COMPANY", "STAGE", "OWNER", "NEXT ACTION", "ACTIONS"]} rows={rows.map((lead) => [<Person key={lead.id} initials={lead.initials} name={lead.name} detail={`${lead.name.split(" ")[0].toLowerCase()}@${lead.company.split(" ")[0].toLowerCase()}.com`}/>, lead.company, <select className="table-select" value={lead.stage} onChange={(event) => setRecords((current) => current.map((record) => record.id === lead.id ? { ...record, stage: event.target.value } : record))}>{stages.slice(1).map((item) => <option key={item}>{item}</option>)}</select>, <select className="table-select" value={lead.owner} onChange={(event) => setRecords((current) => current.map((record) => record.id === lead.id ? { ...record, owner: event.target.value } : record))}>{["Ananya", "Abhishek", "Priya Nair", "Karan Mehta"].map((owner) => <option key={owner}>{owner}</option>)}</select>, lead.action, <div className="table-actions"><button onClick={() => { const action = window.prompt("Next action", lead.action); if (action) setRecords((current) => current.map((record) => record.id === lead.id ? { ...record, action } : record)); }}>Edit</button><button onClick={() => window.confirm(`Delete ${lead.name}?`) && setRecords((current) => current.filter((record) => record.id !== lead.id))}>Delete</button></div>])}/>
  </div>;
}

function Person({ initials, name, detail }: { initials: string; name: string; detail: string }) {
  return <div className="person"><span className="avatar">{initials}</span><span><strong>{name}</strong><small>{detail}</small></span></div>;
}

function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange?: (i: string) => void }) {
  return <div className="tabs">{items.map((i) => <button className={active === i ? "active" : ""} key={i} onClick={() => onChange?.(i)}>{i}</button>)}</div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

const taskLists = [
  ["Dev", "Fix invoice PDF rendering bug", "Ship auth rework", "Upgrade Node to 22"],
  ["Marketing", "Rewrite pricing page copy", "Ask for a testimonial", "Send October campaign plan"],
  ["Ops", "Renew insurance policy", "Chase signed addendum", "Reconcile July expenses"],
  ["QA", "Regression pass on billing", "Write test plan for auth"],
];

function Tasks() {
  const [checked, setChecked] = useStoredState<string[]>("completed-tasks", []);
  const [lists, setLists] = useStoredState<string[][]>("task-lists", taskLists);
  const addTask = () => {
    const title = window.prompt("Task title");
    if (!title) return;
    const listName = window.prompt("Add to list", lists[0]?.[0] ?? "Client Work");
    setLists((current) => current.map((list, index) => list[0] === listName || (index === 0 && !current.some((item) => item[0] === listName)) ? [...list, title] : list));
  };
  const addList = () => { const name = window.prompt("List name"); if (name) setLists((current) => [...current, [name]]); };
  return <div className="page"><PageHeader kicker="TASKS · Northline Studio" title="My lists" description={`${lists.flatMap((list) => list.slice(1)).filter((task) => !checked.includes(task)).length} tasks open across ${lists.length} lists · 2 overdue`} action={<Button onClick={addTask}><Icon name="plus" size={15}/> New task</Button>}/><Tabs items={["My Lists", "My Tasks", "Today 2", "Upcoming", "Overdue 2", `Completed ${checked.length}`]} active="My Lists"/>
    <div className="task-grid">{lists.map((list, i) => <div className="task-card" key={list[0]}><h3><span className={`dot dot-${i % 4}`}/><button className="task-title" onClick={() => { const name = window.prompt("Rename list", list[0]); if (name) setLists((current) => current.map((item) => item[0] === list[0] ? [name, ...item.slice(1)] : item)); }}>{list[0]}</button><button className="task-delete" onClick={() => { if (list.length > 1 && !window.confirm("This list contains tasks. Move them to the first list before deleting?")) return; setLists((current) => { const remaining = current.filter((item) => item[0] !== list[0]); if (list.length > 1 && remaining[0]) remaining[0] = [...remaining[0], ...list.slice(1)]; return remaining; }); }}>×</button></h3>{list.slice(1).map((task) => <label key={task}><input type="checkbox" checked={checked.includes(task)} onChange={() => setChecked((current) => current.includes(task) ? current.filter((item) => item !== task) : [...current, task])}/><span className={checked.includes(task) ? "strike" : ""}>{task}</span></label>)}<footer><span>{list.length - 1} tasks</span><span>{i % 2 ? "1 due today" : "1 overdue"}</span></footer></div>)}
      <button className="new-list" onClick={addList}>+ New list</button>
    </div>
  </div>;
}

const services = [
  ["Legacy CMS Migration", "Development", "One-time migration of outdated content management systems.", "₹60,000"],
  ["Mobile App Development", "Development", "iOS, Android and cross-platform apps, from prototype to app store.", "₹2,00,000+"],
  ["Performance Marketing", "Marketing", "Paid campaigns across search and social, managed end to end.", "₹30,000/mo"],
  ["SEO", "Marketing", "Ongoing search optimization, technical audits and content strategy.", "₹20,000/mo"],
  ["Technical Consulting", "Consulting", "Architecture reviews, tech due diligence and roadmaps.", "₹3,000/hr"],
  ["UI/UX Design", "Design", "Product design and prototyping for web and mobile experiences.", "₹40,000+"],
  ["Web Application Development", "Development", "Custom web applications and internal tools built to spec.", "₹1,50,000+"],
  ["Website Maintenance", "Support", "Monthly upkeep, updates, backups and monitoring.", "₹10,000/mo"],
];

function Catalogue() {
  const [tab, setTab] = useState("Items");
  const [q, setQ] = useState("");
  const [items, setItems] = useStoredState("catalogue", services.map((service, index) => ({ id: `service-${index}`, name: service[0], category: service[1], description: service[2], price: service[3], status: index === 0 ? "Archived" : "Active" })));
  const [drafts, setDrafts] = useStoredState<{ id: string; title: string; body: string }[]>("brand-drafts", []);
  const add = () => { const name = window.prompt("Service name"); if (name) setItems((current) => [...current, { id: `service-${Date.now()}`, name, category: "Consulting", description: "A new service offering.", price: "₹25,000+", status: "Active" }]); };
  return <div className="page"><PageHeader kicker="CATALOGUE" title="Catalogue" description="Your services and offerings, organized in one place." action={<Button onClick={add}><Icon name="plus" size={15}/> Add service</Button>}/><Tabs items={["Items", `Brand Assets ${drafts.length}`]} active={tab === "Items" ? "Items" : `Brand Assets ${drafts.length}`} onChange={(value) => setTab(value.startsWith("Brand") ? "Brand Assets" : "Items")}/>{tab === "Items" ? <><div className="toolbar"><Search placeholder="Search services..." value={q} onChange={setQ}/><Button variant="secondary">All categories⌄</Button><Button variant="secondary"><Icon name="filter" size={15}/> Filter</Button></div>
    <div className="catalogue-grid">{items.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(q.toLowerCase())).map((item) => <article className="service-card" key={item.id}><h3>{item.name}</h3><small>{item.category}</small><p>{item.description}</p><strong>{item.price}</strong><div><button className="tag" onClick={() => setItems((current) => current.map((record) => record.id === item.id ? { ...record, status: record.status === "Active" ? "Archived" : "Active" } : record))}>{item.status}</button><button className="text-action" onClick={() => { setDrafts((current) => [{ id: `draft-${Date.now()}`, title: `${item.name} campaign draft`, body: `Built for growing teams: ${item.description} Starting at ${item.price}.` }, ...current]); setTab("Brand Assets"); }}>Create draft</button></div></article>)}</div></> : <div className="draft-grid">{drafts.length ? drafts.map((draft) => <article className="note-row" key={draft.id}><div><strong>{draft.title}</strong><p>{draft.body}</p><span className="tag">Generated draft</span></div><Button variant="ghost" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}>Delete</Button></article>) : <div className="empty-row">Generate a content draft from any catalogue item.</div>}</div>}
  </div>;
}

function Notes() {
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("All Notes");
  const [notes, setNotes] = useStoredState("notes", ["Website proposal discussion", "New maintenance plan idea", "Wavelength FM onboarding checklist"].map((title, index) => ({ id: `note-${index}`, title, content: index === 0 ? "Discussed the revised proposal and the new maintenance package with the client." : index === 1 ? "Potential recurring maintenance package for existing agency clients." : "Send welcome email, collect signed contract, schedule kickoff call.", tags: index === 0 ? "proposal" : index === 1 ? "ideas" : "onboarding", pinned: index < 2, state: "active" })));
  const add = () => { if (text.trim()) { setNotes((current) => [{ id: `note-${Date.now()}`, title: text.trim(), content: "Quickly captured note.", tags: "inbox", pinned: false, state: "active" }, ...current]); setText(""); } };
  const visible = notes.filter((note) => `${note.title} ${note.content} ${note.tags}`.toLowerCase().includes(q.toLowerCase())).filter((note) => tab === "All Notes" ? note.state === "active" : tab === "Pinned" ? note.pinned && note.state === "active" : tab === "Archived" ? note.state === "archived" : tab === "Trash" ? note.state === "trash" : true);
  return <div className="page"><PageHeader kicker="NOTES / IDEAS" title="Notes / Ideas" description="Capture anything worth remembering before deciding what to do with it." action={<Button onClick={add}><Icon name="plus" size={15}/> New note</Button>}/>
    <div className="notes-tools"><Search placeholder="Search notes, content, or tags" value={q} onChange={setQ}/><div className="note-capture"><Icon name="spark"/><input placeholder="Capture a thought and press Enter..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}/></div></div>
    <Tabs items={["All Notes", `Pinned ${notes.filter((note) => note.pinned && note.state === "active").length}`, "Archived", "Tags", "Trash"]} active={tab === "Pinned" ? `Pinned ${notes.filter((note) => note.pinned && note.state === "active").length}` : tab} onChange={(value) => setTab(value.replace(/\s\d+$/, ""))}/>
    <p className="eyebrow section-label">{tab.toUpperCase()}</p>{visible.map((note) => <article className="note-row" key={note.id}><div className="grow"><button className="note-title" onClick={() => { const title = window.prompt("Note title", note.title); const content = window.prompt("Note content", note.content); if (title && content) setNotes((current) => current.map((item) => item.id === note.id ? { ...item, title, content } : item)); }}><strong>{note.pinned ? "⌖  " : ""}{note.title}</strong></button><p>{note.content}</p><span className="tag">{note.tags}</span></div><div className="note-actions"><button onClick={() => setNotes((current) => current.map((item) => item.id === note.id ? { ...item, pinned: !item.pinned } : item))}>{note.pinned ? "Unpin" : "Pin"}</button>{note.state === "trash" ? <><button onClick={() => setNotes((current) => current.map((item) => item.id === note.id ? { ...item, state: "active" } : item))}>Restore</button><button onClick={() => window.confirm("Permanently delete this note?") && setNotes((current) => current.filter((item) => item.id !== note.id))}>Delete forever</button></> : <><button onClick={() => setNotes((current) => current.map((item) => item.id === note.id ? { ...item, state: "archived" } : item))}>Archive</button><button onClick={() => setNotes((current) => current.map((item) => item.id === note.id ? { ...item, state: "trash" } : item))}>Trash</button></>}</div></article>)}
  </div>;
}

function HR() {
  const [admin, setAdmin] = useState(true);
  const [employees, setEmployees] = useStoredState("employees", [{ id: "emp-ananya", name: "Ananya Desai", role: "Product Designer", status: "Active", joined: "20 Aug 2026" }, { id: "emp-arjun", name: "Arjun Mehta", role: "Software Engineer", status: "Active", joined: "1 Sep 2026" }, { id: "emp-karan", name: "Karan Mehta", role: "Operations Lead", status: "Active", joined: "12 Jan 2025" }, { id: "emp-priya", name: "Priya Nair", role: "Account Manager", status: "Active", joined: "4 Mar 2025" }]);
  const addEmployee = () => { const name = window.prompt("Employee name"); if (name) setEmployees((current) => [...current, { id: `emp-${Date.now()}`, name, role: window.prompt("Role", "Team member") ?? "Team member", status: "Active", joined: "Today" }]); };
  return <div className="page"><PageHeader title="HR Overview" description="Manage employee records, documents, and payroll in one place." action={<div className="header-actions"><div className="mode-switch"><button className={admin ? "active" : ""} onClick={() => setAdmin(true)}>Admin</button><button className={!admin ? "active" : ""} onClick={() => setAdmin(false)}>Member</button></div>{admin && <Button onClick={addEmployee}><Icon name="plus" size={15}/> Add employee</Button>}</div>}/>
    <p className="subtle">Your workforce at a glance</p><div className="metrics metrics-3"><Metric value={`${employees.length}`} label="Total employees"/><Metric value={`${employees.filter((employee) => employee.status === "Active").length}`} label="Working today" tone="green"/><Metric value="1" label="On leave"/></div>
    <section><h2>Recent & upcoming <span className="count">2</span></h2><div className="panel"><div className="simple-row"><Person initials="AD" name="Ananya Desai" detail="Product Designer · Joined 20 Aug 2026"/><span>›</span></div><div className="simple-row"><Person initials="AM" name="Arjun Mehta" detail="Software Engineer · Joining 1 Sep 2026"/><span>›</span></div></div></section>
    <section><h2>Needs attention <span className="count">1</span></h2><div className="notice"><span className="danger-dot"/>Arjun Mehta's contact details are incomplete.<span>›</span></div></section>
    <section><h2>Manage</h2><div className="panel">{employees.map((employee) => <div className="simple-row" key={employee.id}><span className="avatar">{employee.name.split(" ").map((part) => part[0]).join("")}</span><div className="grow"><strong>{employee.name}</strong><small>{employee.role} · Joined {employee.joined}</small></div><span className="status status-good">{employee.status}</span>{admin && <div className="table-actions"><button onClick={() => { const role = window.prompt("Employee role", employee.role); if (role) setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, role } : item)); }}>Edit</button><button onClick={() => window.confirm(`Delete ${employee.name}?`) && setEmployees((current) => current.filter((item) => item.id !== employee.id))}>Delete</button></div>}</div>)}</div><button className="attendance-link" onClick={() => { window.location.hash = "#app/attendance"; }}>Open biometric attendance <Icon name="arrow" size={15}/></button></section>
  </div>;
}

const invoiceRows = [["INV-0025", "Basanti Textiles", "₹19,800", "38"], ["INV-0031", "Meridian Labs", "₹48,000", "20"], ["INV-0030", "Wavelength FM", "₹32,000", "12"]];

function Sales() {
  const [invoices, setInvoices] = useStoredState("invoices", invoiceRows.map((invoice) => ({ id: invoice[0], client: invoice[1], amount: Number(invoice[2].replace(/[₹,]/g, "")), days: Number(invoice[3]), status: "Overdue", reminderSent: false })));
  const addInvoice = () => { const client = window.prompt("Client name"); const amount = Number(window.prompt("Invoice amount in ₹", "25000")); if (client && amount) setInvoices((current) => [{ id: `INV-${String(Date.now()).slice(-4)}`, client, amount, days: 0, status: "Draft", reminderSent: false }, ...current]); };
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 100500);
  const outstanding = invoices.filter((invoice) => invoice.status !== "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  return <div className="page"><PageHeader title="Sales" description="Create invoices, track payments, and follow up on what's outstanding." action={<Button onClick={addInvoice}><Icon name="plus" size={15}/> New invoice</Button>}/><p className="subtle">Receivables at a glance</p><div className="metrics"><Metric value={`₹${total.toLocaleString("en-IN")}`} label="Total sales"/><Metric value={`₹${(total - outstanding).toLocaleString("en-IN")}`} label="Paid" tone="green"/><Metric value={`₹${outstanding.toLocaleString("en-IN")}`} label="Outstanding" tone="amber"/><Metric value={`₹${invoices.filter((invoice) => invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0).toLocaleString("en-IN")}`} label="Overdue" tone="orange"/><Metric value={`${invoices.filter((invoice) => invoice.status === "Draft").length}`} label="Drafts"/></div>
    <section><h2>Needs attention <span className="count">{invoices.filter((invoice) => invoice.status === "Overdue").length}</span></h2><div className="panel">{invoices.filter((invoice) => invoice.status === "Overdue").map((invoice) => <div className="invoice-row" key={invoice.id}><span className="danger-dot"/><div className="grow"><strong>{invoice.id} is overdue by {invoice.days} days. Follow up with {invoice.client}.</strong><small>₹{invoice.amount.toLocaleString("en-IN")} due {invoice.reminderSent ? "· Reminder recorded" : ""}</small></div><Button variant="ghost" onClick={() => { const tasks = JSON.parse(localStorage.getItem("enkel:task-lists") ?? JSON.stringify(taskLists)) as string[][]; tasks[0] = [...tasks[0], `Follow up ${invoice.id} — ${invoice.client}`]; localStorage.setItem("enkel:task-lists", JSON.stringify(tasks)); }}>Create task</Button><Button variant="secondary" onClick={() => setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, reminderSent: true } : item))}>Send reminder</Button><Button onClick={() => setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "Paid" } : item))}>Record payment</Button></div>)}</div></section>
    <section><h2>Recent invoices</h2><div className="panel">{invoices.map((invoice) => <div className="simple-row" key={invoice.id}><div className="grow"><strong>{invoice.client}</strong><small>{invoice.id} · Due 28 Jul</small></div><strong>₹{invoice.amount.toLocaleString("en-IN")}</strong><span className={`status ${invoice.status === "Overdue" ? "status-danger" : invoice.status === "Paid" ? "status-good" : ""}`}>{invoice.status}</span></div>)}</div></section>
  </div>;
}

const expenses = [["Aug 15", "Client dinner · Cafe Turmeric", "Business", "₹3,400", "Paid"], ["Aug 14", "Workspace subscription · Google Workspace", "Business", "₹1,850", "Paid"], ["Aug 13", "Cab to client meeting · Uber", "Karan Mehta", "₹620", "Pending review"], ["Aug 12", "Office stationery · Office Bazaar", "Business", "₹840", "Paid"]];

function Expenses() {
  const [q, setQ] = useState("");
  const [records, setRecords] = useStoredState("expenses", expenses.map((expense, index) => ({ id: `expense-${index}`, date: expense[0], name: expense[1], paidBy: expense[2], amount: Number(expense[3].replace(/[₹,]/g, "")), status: expense[4] })));
  const addExpense = () => { const name = window.prompt("Expense and vendor"); const amount = Number(window.prompt("Amount in ₹", "500")); if (name && amount) setRecords((current) => [{ id: `expense-${Date.now()}`, date: "Today", name, paidBy: "Business", amount, status: "Pending review" }, ...current]); };
  const exportCsv = () => {
    const data = ["Date,Expense,Paid by,Amount,Status", ...records.map((record) => [record.date, `"${record.name}"`, record.paidBy, record.amount, record.status].join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([data], { type: "text/csv" })); link.download = "enkel-expenses.csv"; link.click(); URL.revokeObjectURL(link.href);
  };
  const visible = records.filter((record) => `${record.name} ${record.paidBy} ${record.status}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="page"><PageHeader kicker="EXPENSES · Northline Studio" title="Track spend" description="See what the business has spent, find any expense, and act on what needs attention." action={<Button onClick={addExpense}><Icon name="plus" size={15}/> New expense</Button>}/><div className="metrics metrics-4"><Metric value={`₹${records.reduce((sum, record) => sum + record.amount, 0).toLocaleString("en-IN")}`} label="Spent this month"/><Metric value={`₹${records.filter((record) => record.status !== "Paid").reduce((sum, record) => sum + record.amount, 0).toLocaleString("en-IN")}`} label="Pending reimbursements" tone="amber"/><Metric value="₹4,200" label="Billable expenses"/><Metric value="₹38,999/mo" label="Upcoming recurring"/></div><Tabs items={[`All Expenses ${records.length}`, `Needs Attention ${records.filter((record) => record.status !== "Paid").length}`, "Reimbursements", "Recurring", "Reports"]} active={`All Expenses ${records.length}`}/>
    <div className="toolbar"><Search placeholder="Search vendor, client, employee, note" value={q} onChange={setQ}/><Button variant="secondary"><Icon name="filter" size={15}/> Filter</Button><Button variant="secondary" onClick={exportCsv}>Export CSV</Button></div><DataTable headers={["DATE", "EXPENSE", "PAID BY", "AMOUNT", "STATUS", "ACTIONS"]} rows={visible.map((record) => [record.date, record.name, record.paidBy, <strong>₹{record.amount.toLocaleString("en-IN")}</strong>, <span className={`status ${record.status === "Paid" ? "" : "status-warn"}`}>{record.status}</span>, <div className="table-actions">{record.status !== "Paid" && <><button onClick={() => setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status: "Paid" } : item))}>Approve</button><button onClick={() => { const reason = window.prompt("Rejection reason"); if (reason) setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status: `Rejected: ${reason}` } : item)); }}>Reject</button></>}<button onClick={() => window.confirm("Delete this expense?") && setRecords((current) => current.filter((item) => item.id !== record.id))}>Delete</button></div>])}/>
  </div>;
}

const files = ["FY25-26 GST Returns Summary.xlsx", "Vendor NDA - Freelance Design.pdf", "Fire Safety Training Certificate.pdf", "Employee Handbook 2026.pdf", "ISO 9001 Certification.pdf", "Shop & Establishment License.pdf", "Leave & WFH Policy.pdf", "Office Contents Insurance.pdf", "GST Registration Certificate.pdf", "Workmen Compensation Policy.pdf", "Fire Safety NOC.pdf", "Meridian Labs MSA.pdf"];

function Files() {
  const [q, setQ] = useState("");
  const picker = useRef<HTMLInputElement>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [records, setRecords] = useStoredState("files", files.map((name, index) => ({ id: `file-${index}`, name, size: `${150 + index * 90} KB`, category: index % 3 === 0 ? "Licenses & Registrations" : index % 3 === 1 ? "Legal & Contracts" : "HR & Policies", uploader: index % 2 ? "Karan Mehta" : "Abhishek", expires: index % 3 === 0 ? `Expires in ${12 + index} days` : "" })));
  const visible = records.filter((file) => `${file.name} ${file.category} ${file.uploader}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="page"><PageHeader kicker="FILES" title="Files" description="Licenses, certifications, contracts and other org documents, in one place." action={<><input ref={picker} className="hidden-input" type="file" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setRecords((current) => [{ id: `file-${Date.now()}`, name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, category: "Other", uploader: "Ananya", expires: "" }, ...current]); event.target.value = ""; }}/><Button onClick={() => picker.current?.click()}><Icon name="plus" size={15}/> Upload file</Button></>}/><Tabs items={[`All files ${records.length}`, "Licenses & Registrations", "Certifications", "Legal & Contracts", "Finance & Tax", "HR & Policies"]} active={`All files ${records.length}`}/><div className="toolbar"><Search placeholder="Search files..." value={q} onChange={setQ}/><Button variant="secondary" onClick={() => setLayout(layout === "grid" ? "list" : "grid")}><Icon name={layout === "grid" ? "note" : "grid"} size={15}/>{layout === "grid" ? "List" : "Grid"} view</Button></div>
    <div className={layout === "grid" ? "file-grid" : "file-list"}>{visible.map((file) => <article className="file-card" key={file.id}><div><span className="file-type">{file.name.split(".").pop()?.toUpperCase() ?? "FILE"}</span><strong>{file.name}</strong><div className="table-actions"><button onClick={() => { const name = window.prompt("File name", file.name); if (name) setRecords((current) => current.map((item) => item.id === file.id ? { ...item, name } : item)); }}>Edit</button><button onClick={() => window.confirm(`Delete ${file.name}?`) && setRecords((current) => current.filter((item) => item.id !== file.id))}>Delete</button></div></div><small>{file.size} · Today · {file.uploader}<br/>{file.category}</small>{file.expires && <span className="status status-warn">{file.expires}</span>}</article>)}</div>
  </div>;
}

function Creative() {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);
  return <div className="page creative-page"><PageHeader kicker="DESIGN & CREATIVE" title="Create without the creative bottleneck" description="Turn a product and a clear idea into campaign-ready visuals."/>
    <div className="creative-layout"><div className="creative-form"><div className="step"><span>1</span><div><strong>Choose what to feature</strong><p className="subtle">UI/UX Design · Northline Studio</p></div></div><div className="step"><span>2</span><div className="grow"><strong>Describe the creative intent</strong><textarea placeholder="A clean launch visual for our product design service..." value={prompt} onChange={(e) => setPrompt(e.target.value)}/></div></div><div className="step"><span>3</span><div><strong>Select format</strong><div className="choice-row"><button className="choice active">Square post</button><button className="choice">Story</button><button className="choice">Landscape ad</button></div></div></div><Button disabled={!prompt.trim()} onClick={() => setGenerated(true)}><Icon name="spark" size={16}/> Generate creative</Button></div>
      <div className={`creative-preview ${generated ? "is-generated" : ""}`}>{generated ? <><span className="preview-brand">NORTHLINE</span><div><small>DESIGN THAT MOVES</small><strong>Ideas into<br/>products.</strong></div><span>UI/UX DESIGN</span></> : <><Icon name="spark" size={30}/><strong>Your creative will appear here</strong><small>Choose a service and describe your idea.</small></>}</div></div>
  </div>;
}

type AttendanceProfile = { employee_id: string; name: string; sample_count: number; state: string };
type AttendanceRow = { id: number; employee_id: string; name: string; attendance_date: string; check_in_time: string; distance: number; corrected: number };
type AttendanceDashboard = { profiles: AttendanceProfile[]; records: AttendanceRow[]; registered: number; checked_in_today: number; not_checked_in: number; model_ready: boolean };
const ATTENDANCE_API = "http://127.0.0.1:8787";

function Attendance() {
  const [mode, setMode] = useState<"Overview" | "Enroll" | "Recognize" | "Attendance Sheet">("Overview");
  const [camera, setCamera] = useState(false);
  const [employee, setEmployee] = useState("emp-ananya");
  const [consent, setConsent] = useState(false);
  const [samples, setSamples] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [enrollDone, setEnrollDone] = useState(false);
  const [serviceOnline, setServiceOnline] = useState(false);
  const [message, setMessage] = useState("Connect the local attendance service to begin.");
  const [dashboard, setDashboard] = useState<AttendanceDashboard>({ profiles: [], records: [], registered: 0, checked_in_today: 0, not_checked_in: 0, model_ready: false });
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const employeeOptions = [{ id: "emp-ananya", name: "Ananya Desai" }, { id: "emp-karan", name: "Karan Mehta" }, { id: "emp-priya", name: "Priya Nair" }, { id: "emp-arjun", name: "Arjun Mehta" }];
  const selectedEmployee = employeeOptions.find((item) => item.id === employee) ?? employeeOptions[0];

  // Reset per-employee state when employee changes
  useEffect(() => {
    setSamples(0);
    setConsent(false);
    setEnrollDone(false);
  }, [employee]);

  const refresh = async () => {
    try {
      const response = await fetch(`${ATTENDANCE_API}/dashboard`);
      if (!response.ok) throw new Error();
      setDashboard(await response.json() as AttendanceDashboard);
      setServiceOnline(true);
      setMessage("Local service connected. Biometric data stays on this machine.");
    } catch {
      setServiceOnline(false);
      setMessage("Local service is offline. Start the FastAPI service on port 8787.");
    }
  };
  useEffect(() => { void refresh(); const timer = window.setInterval(refresh, 10000); return () => window.clearInterval(timer); }, []);

  // Fix: attach stream to video via useEffect, not setTimeout, to avoid race condition
  useEffect(() => {
    if (camera && video.current && stream.current) {
      video.current.srcObject = stream.current;
    }
  }, [camera]);

  // Cleanup camera on unmount
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);

  const stopCamera = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCamera(false);
    setRecognizing(false);
    setCapturing(false);
    recognizeRef.current = false;
    if (video.current) video.current.srcObject = null;
  };

  const startCamera = async () => {
    if (stream.current) return; // already running
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      stream.current = s;
      setCamera(true); // triggers the useEffect above to attach srcObject
    } catch {
      setMessage("Camera access was blocked. Allow camera permission and try again.");
    }
  };

  const frame = () => {
    if (!video.current || video.current.videoWidth === 0 || video.current.readyState < 2) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.current.videoWidth;
    canvas.height = video.current.videoHeight;
    canvas.getContext("2d")?.drawImage(video.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.86);
  };

  const json = async (url: string, options?: RequestInit) => {
    const response = await fetch(`${ATTENDANCE_API}${url}`, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
    const body = response.status === 204 ? {} : await response.json();
    if (!response.ok) throw new Error(body.detail ?? "The local service rejected this request.");
    return body;
  };

  const deleteProfile = async (employeeId: string, name: string) => {
    if (!window.confirm(`Delete all biometric data for ${name}? This cannot be undone.`)) return;
    try {
      await fetch(`${ATTENDANCE_API}/profiles/${employeeId}`, { method: "DELETE" });
      await refresh();
      setMessage(`Biometric data for ${name} deleted.`);
    } catch {
      setMessage("Failed to delete profile. Check the service is running.");
    }
  };

  const beginCapture = async () => {
    if (!consent || !serviceOnline) return;
    // Auto-open camera if not already running
    if (!stream.current) {
      await startCamera();
      // Wait up to 2 s for video to start playing
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    setCapturing(true);
    setEnrollDone(false);
    setSamples(0);
    try {
      await json("/profiles", { method: "POST", body: JSON.stringify({ employee_id: employee, name: selectedEmployee.name, consent: true }) });
      let accepted = 0;
      while (accepted < 100) {
        const image = frame();
        if (!image) {
          setMessage("Waiting for camera to be ready…");
          await new Promise((resolve) => window.setTimeout(resolve, 200));
          continue;
        }
        try {
          const result = await json(`/profiles/${employee}/samples`, { method: "POST", body: JSON.stringify({ image }) }) as { sample_count: number };
          accepted = result.sample_count;
          setSamples(accepted);
          setMessage(`Accepted sample ${accepted} of 100. Slowly turn your head left and right.`);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Frame rejected — adjust lighting or position.");
        }
        await new Promise((resolve) => window.setTimeout(resolve, 170));
      }
      setMessage("100 samples captured. Training the LBPH model…");
      await json("/train", { method: "POST" });
      setEnrollDone(true);
      setMessage(`Training complete. ${selectedEmployee.name} is ready for recognition.`);
      await refresh();
      stopCamera(); // auto-stop camera when done
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enrollment failed.");
    } finally {
      setCapturing(false);
    }
  };

  // Recognition result state — drives the live confidence UI
  const [recogResult, setRecogResult] = useState<{
    tier: "good" | "uncertain" | "unknown" | null;
    name: string;
    confidence: number;
    streak: number;
    checkedIn: boolean;
    checkedInAt: string;
    duplicate: boolean;
  }>({ tier: null, name: "", confidence: 0, streak: 0, checkedIn: false, checkedInAt: "", duplicate: false });

  // Auto-retry loop: keeps running until success, stop-camera, or mode change.
  // No button click needed after each attempt.
  const recognizeRef = useRef(false); // tracks whether loop should keep running

  const stopRecognize = () => {
    recognizeRef.current = false;
    setRecognizing(false);
  };

  const startRecognize = async () => {
    if (!dashboard.model_ready || recognizeRef.current) return;
    // Auto-open camera if not already running
    if (!stream.current) {
      await startCamera();
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    recognizeRef.current = true;
    setRecognizing(true);
    setRecogResult({ tier: null, name: "", confidence: 0, streak: 0, checkedIn: false, checkedInAt: "", duplicate: false });

    try {
      while (recognizeRef.current) {
        const image = frame();
        if (!image) {
          await new Promise((resolve) => window.setTimeout(resolve, 200));
          continue;
        }

        let result: {
          matched: boolean; verified?: boolean; duplicate?: boolean;
          tier?: string; name?: string; checked_in_at?: string;
          stable_matches?: number; confidence?: number;
        };

        try {
          result = await json("/recognize", { method: "POST", body: JSON.stringify({ image }) });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Frame rejected";
          setMessage(msg);
          await new Promise((resolve) => window.setTimeout(resolve, 300));
          continue;
        }

        const conf   = result.confidence ?? 0;
        const tier   = (result.tier ?? (result.matched ? "good" : "unknown")) as "good" | "uncertain" | "unknown";
        const streak = result.stable_matches ?? 0;
        const name   = result.name ?? "";

        if (!result.matched) {
          setRecogResult((r) => ({ ...r, tier: "unknown", confidence: conf, streak: 0, name: "" }));
          setMessage("Unknown — face the camera and ensure good lighting.");
        } else if (!result.verified) {
          if (tier === "uncertain") {
            setRecogResult((r) => ({ ...r, tier: "uncertain", confidence: conf, streak: 0, name }));
            setMessage(`Uncertain match (${conf.toFixed(1)}%) — hold still and improve lighting.`);
          } else {
            setRecogResult((r) => ({ ...r, tier: "good", confidence: conf, streak, name }));
            setMessage(`Verifying ${name} — ${streak}/3 stable matches · ${conf.toFixed(1)}% confidence`);
          }
        } else {
          // verified — either fresh check-in or duplicate
          const checkedInAt = result.checked_in_at ?? "";
          const duplicate   = result.duplicate ?? false;
          setRecogResult({ tier: "good", name, confidence: conf, streak: 3, checkedIn: true, checkedInAt, duplicate });
          setMessage(
            duplicate
              ? `${name} already checked in at ${checkedInAt} IST.`
              : `✓ ${name} checked in at ${checkedInAt} IST (${conf.toFixed(1)}% confidence).`
          );
          await refresh();
          // Always stop loop and camera after a result (fresh or duplicate)
          recognizeRef.current = false;
          setRecognizing(false);
          stopCamera();
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 280));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recognition failed.");
    } finally {
      recognizeRef.current = false;
      setRecognizing(false);
    }
  };

  // Stop recognize loop when tab changes or camera stops
  const recognize = startRecognize;

  const currentProfile = dashboard.profiles.find((p) => p.employee_id === employee);
  const alreadyEnrolled = currentProfile?.state === "ready";

  return (
    <div className="page attendance-page">
      <PageHeader
        kicker="ATTENDANCE · FACE RECOGNITION"
        title="Attendance"
        description="Local OpenCV face registration, LBPH recognition, and daily attendance."
        action={<div className={`system-state ${serviceOnline ? "online" : ""}`}><span />{serviceOnline ? "Local service online" : "Local service offline"}</div>}
      />
      <Tabs items={["Overview", "Enroll", "Recognize", "Attendance Sheet"]} active={mode} onChange={(value) => { stopCamera(); setMode(value as typeof mode); }} />
      

      {/* ── OVERVIEW ── */}
      {mode === "Overview" && (
        <>
          <div className="metrics metrics-4">
            <Metric value={`${dashboard.registered}`} label="Registered profiles" />
            <Metric value={`${dashboard.checked_in_today}`} label="Checked in today" tone="green" />
            <Metric value={`${dashboard.not_checked_in}`} label="Not checked in" />
            <Metric value={dashboard.model_ready ? "Ready" : "Setup"} label="LBPH model" />
          </div>
          <div className="attendance-columns">
            <section>
              <h2>Employee registration</h2>
              <div className="panel">
                {employeeOptions.map((person) => {
                  const profile = dashboard.profiles.find((item) => item.employee_id === person.id);
                  return (
                    <div className="simple-row" key={person.id}>
                      <span className="avatar">{person.name.split(" ").map((part) => part[0]).join("")}</span>
                      <div className="grow">
                        <strong>{person.name}</strong>
                        <small>{profile ? `${profile.sample_count}/100 samples` : "No biometric data"}</small>
                      </div>
                      <span className={`status ${profile?.state === "ready" ? "status-good" : "status-warn"}`}>
                        {profile?.state === "ready" ? "Ready" : profile ? "Incomplete" : "Not registered"}
                      </span>
                      {profile && (
                        <button
                          className="table-actions"
                          style={{ marginLeft: 8 }}
                          onClick={() => void deleteProfile(person.id, person.name)}
                          title="Delete biometric data"
                        >
                          <span style={{ color: "var(--orange)", fontSize: 11 }}>Delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button className="section-button" onClick={() => setMode("Enroll")}>Register an employee</Button>
            </section>
            <section>
              <div className="section-heading">
                <h2>Attendance history</h2>
                <Button variant="secondary" onClick={() => window.open(`${ATTENDANCE_API}/attendance.csv`, "_blank")}>Export CSV</Button>
              </div>
              <div className="panel">
                {dashboard.records.length
                  ? dashboard.records.slice(0, 8).map((record) => (
                    <div className="simple-row" key={record.id}>
                      <span className="avatar">{record.name.split(" ").map((part) => part[0]).join("")}</span>
                      <div className="grow">
                        <strong>{record.name}</strong>
                        <small>{record.attendance_date} · confidence {Math.max(0, Math.round(100 - record.distance))}%{record.corrected ? " · corrected" : ""}</small>
                      </div>
                      <strong>{record.check_in_time.slice(0, 5)}</strong>
                    </div>
                  ))
                  : <div className="empty-row">No attendance has been recorded yet.</div>}
              </div>
            </section>
          </div>
        </>
      )}

      {/* ── ENROLL / RECOGNIZE ── */}
      {(mode === "Enroll" || mode === "Recognize") && (
        <div className="camera-layout">
          <section className="camera-card">
            <div className={`camera-view ${camera ? "camera-live" : ""}`}>
              <video ref={video} autoPlay muted playsInline />
              <div className="face-frame" />
              {!camera && (
                <div className="camera-empty">
                  <Icon name="scan" size={44} />
                  <strong>Camera is off</strong>
                  <small>Frames are sent only to your local service.</small>
                </div>
              )}
              {(recognizing || capturing) && <div className="scanning-line" />}
            </div>
            {/* In Enroll mode the camera is managed automatically by beginCapture — no manual controls needed */}
            {mode === "Recognize" && (
              camera
                ? <Button variant="secondary" onClick={stopCamera}>Stop camera</Button>
                : <Button onClick={() => void startCamera()}>Enable camera</Button>
            )}
          </section>

          {/* ── ENROLL PANEL ── */}
          {mode === "Enroll" && (
            <section className="setup-panel">
              <p className="eyebrow">FACE REGISTRATION</p>
              <h2>Register an employee</h2>
              <p className="subtle">OpenCV accepts 100 quality-controlled grayscale samples, then safely replaces the trained LBPH model.</p>

              <label className="field">
                <span>Select employee</span>
                <select value={employee} onChange={(event) => { stopCamera(); setEmployee(event.target.value); }}>
                  {employeeOptions.map((person) => {
                    const p = dashboard.profiles.find((x) => x.employee_id === person.id);
                    const tag = p?.state === "ready" ? " ✓" : p ? " (incomplete)" : "";
                    return <option key={person.id} value={person.id}>{person.name}{tag}</option>;
                  })}
                </select>
              </label>

              {alreadyEnrolled && !capturing && (
                <div className="service-message warning" style={{ marginBottom: 12 }}>
                  {selectedEmployee.name} is already enrolled.
                  <button onClick={() => void deleteProfile(employee, selectedEmployee.name)}>Re-enroll</button>
                </div>
              )}

              {enrollDone && (
                <div className="service-message success" style={{ marginBottom: 12 }}>
                  Enrollment complete. Switch to Recognize to mark attendance.
                  <button onClick={() => setMode("Recognize")}>Go →</button>
                </div>
              )}

              <label className="consent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>I have explicit consent to store this employee's normalized biometric face samples on this local device.</span>
              </label>

              <div className="sample-progress">
                <div><strong>{samples}</strong><span>/ 100 accepted samples</span></div>
                <div className="progress"><span style={{ width: `${samples}%` }} /></div>
                <small>Dark, blurry, duplicate, small, missing, or multiple-face frames are rejected.</small>
              </div>

              <Button
                onClick={() => void beginCapture()}
                disabled={!consent || !serviceOnline || capturing || (alreadyEnrolled && !capturing)}
              >
                {capturing ? `Capturing… ${samples}/100` : "Capture 100 samples & train"}
              </Button>

              <div className="tech-note">
                <strong>Privacy</strong>
                <span>Samples, the LBPH model, and SQLite records remain under server/data. This prototype does not include liveness detection.</span>
              </div>
            </section>
          )}

          {/* ── RECOGNIZE PANEL ── */}
          {mode === "Recognize" && (
            <section className="setup-panel">
              <p className="eyebrow">MARK ATTENDANCE</p>
              <h2>Recognize & check in</h2>
              <p className="subtle">Click Start — the camera opens automatically and runs until a match is confirmed.</p>

              {!dashboard.model_ready && (
                <div className="warning" style={{ marginBottom: 16 }}>
                  No trained model available. Go to <strong>Enroll</strong> to register an employee first.
                </div>
              )}

              {/* ── Result card ── */}
              {recogResult.checkedIn ? (
                <div style={{
                  margin: "16px 0",
                  padding: "18px 16px",
                  border: `1px solid ${recogResult.duplicate ? "var(--line)" : "#b9ded1"}`,
                  borderRadius: 10,
                  background: recogResult.duplicate ? "var(--soft)" : "#eff9f5",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}>
                  <span className="avatar" style={{ background: recogResult.duplicate ? "var(--soft)" : "var(--teal-soft)", color: "var(--teal)", fontSize: 14, width: 40, height: 40 }}>
                    {recogResult.name.split(" ").map((x) => x[0]).join("")}
                  </span>
                  <div>
                    <strong style={{ display: "block", fontSize: 15 }}>{recogResult.name}</strong>
                    <small style={{ color: recogResult.duplicate ? "var(--muted)" : "var(--green)", marginTop: 3, display: "block" }}>
                      {recogResult.duplicate
                        ? `Already checked in today · ${recogResult.checkedInAt} IST`
                        : `✓ Checked in · ${recogResult.checkedInAt} IST · ${recogResult.confidence.toFixed(1)}% confidence`}
                    </small>
                  </div>
                </div>
              ) : (
                <>
                  {/* Live confidence bar — only while scanning */}
                  {recogResult.tier !== null && (
                    <div style={{ margin: "16px 0 12px", padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--paper)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                          {recogResult.tier === "unknown"
                            ? "No match — adjust position"
                            : recogResult.tier === "uncertain"
                              ? "Uncertain — hold still"
                              : `Verifying ${recogResult.name}`}
                        </span>
                        <span style={{ color: "var(--muted)" }}>{recogResult.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="progress" style={{ height: 10, borderRadius: 99 }}>
                        <span style={{
                          width: `${recogResult.confidence}%`,
                          display: "block", height: "100%", borderRadius: 99,
                          background: recogResult.tier === "unknown"
                            ? "var(--orange)"
                            : recogResult.tier === "uncertain"
                              ? "#c8860a"
                              : "var(--teal)",
                          transition: "width .15s ease, background .2s",
                        }} />
                      </div>
                      {/* Streak dots */}
                      {recogResult.tier === "good" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                          {[1, 2, 3].map((n) => (
                            <span key={n} style={{
                              width: 10, height: 10, borderRadius: "50%",
                              background: recogResult.streak >= n ? "var(--teal)" : "var(--line)",
                              transition: "background .2s",
                              flexShrink: 0,
                            }} />
                          ))}
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>
                            {recogResult.streak}/3 stable matches
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ── Action buttons ── */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {!recogResult.checkedIn && (
                  <Button onClick={() => void recognize()} disabled={!dashboard.model_ready || recognizing}>
                    {recognizing ? "Scanning…" : "Start recognition"}
                  </Button>
                )}
                {recognizing && (
                  <Button variant="secondary" onClick={stopRecognize}>Stop</Button>
                )}
              </div>

              <div className="tech-note" style={{ marginTop: 20 }}>
                <strong>Confidence tiers</strong>
                <span>Distance &lt; 50 = solid match (teal) · 50–85 = uncertain (amber) · above 85 = unknown. Three consecutive solid matches record attendance with IST timestamp.</span>
              </div>
            </section>
          )}
        </div>
      )}
      {/* ── ATTENDANCE SHEET ── */}
      {mode === "Attendance Sheet" && (() => {
        const today = new Date().toISOString().slice(0, 10);
        return <AttendanceSheet records={dashboard.records} today={today} onExport={() => window.open(`${ATTENDANCE_API}/attendance.csv`, "_blank")} />;
      })()}
    </div>
  );
}

function AttendanceSheet({ records, today, onExport }: {
  records: AttendanceRow[];
  today: string;
  onExport: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(today);

  const datesWithRecords = Array.from(new Set(records.map((r) => r.attendance_date))).sort().reverse();
  const dayRecords = records.filter((r) => r.attendance_date === selectedDate);
  const allEmployees = Array.from(new Map(records.map((r) => [r.employee_id, r.name])).entries());
  const checkedInIds = new Set(dayRecords.map((r) => r.employee_id));
  const absentEmployees = allEmployees.filter(([id]) => !checkedInIds.has(id));

  const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div>
      {/* ── Toolbar row ── */}
      <div className="toolbar" style={{ marginTop: 20 }}>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            height: 40, padding: "0 12px", border: "1px solid var(--line)",
            borderRadius: 8, background: "var(--paper)", fontSize: 13,
            fontFamily: "inherit", color: "var(--ink)", outline: "none", cursor: "pointer",
          }}
        />
        <Button variant="secondary" onClick={onExport}>Export CSV</Button>
      </div>

      {/* ── Date pills — quick jump to days that have data ── */}
      {datesWithRecords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {datesWithRecords.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              style={{
                padding: "5px 12px", borderRadius: 99, fontSize: 11,
                border: "1px solid",
                borderColor: selectedDate === d ? "var(--teal)" : "var(--line)",
                background: selectedDate === d ? "var(--teal-soft)" : "var(--paper)",
                color: selectedDate === d ? "var(--teal)" : "var(--muted)",
                fontWeight: selectedDate === d ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </button>
          ))}
        </div>
      )}

      {/* ── Summary metrics ── */}
      <div className="metrics metrics-3" style={{ marginBottom: 24 }}>
        <Metric value={String(dayRecords.length)} label="Present" tone="green" />
        <Metric value={String(absentEmployees.length)} label="Absent" tone={absentEmployees.length > 0 ? "orange" : ""} />
        <Metric value={String(allEmployees.length)} label="Total enrolled" />
      </div>

      {/* ── Heading ── */}
      <div className="section-heading" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>
          {formattedDate}
          <span className="count">{dayRecords.length}</span>
        </h2>
      </div>

      {/* ── Present table ── */}
      {dayRecords.length === 0 ? (
        <div className="panel">
          <div className="empty-row">No attendance recorded for this date.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>CHECK-IN (IST)</th>
                <th>CONFIDENCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {dayRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="person">
                      <span className="avatar">{record.name.split(" ").map((p: string) => p[0]).join("")}</span>
                      <span><strong>{record.name}</strong></span>
                    </div>
                  </td>
                  <td><strong>{record.check_in_time.slice(0, 5)}</strong></td>
                  <td>{Math.max(0, Math.round(100 - record.distance))}%</td>
                  <td>
                    <span className={`status ${record.corrected ? "status-warn" : "status-good"}`}>
                      {record.corrected ? "Corrected" : "Present"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Absent table ── */}
      {absentEmployees.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>Absent <span className="count">{absentEmployees.length}</span></h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {absentEmployees.map(([id, name]) => (
                  <tr key={id}>
                    <td>
                      <div className="person">
                        <span className="avatar">{name.split(" ").map((p: string) => p[0]).join("")}</span>
                        <span><strong>{name}</strong></span>
                      </div>
                    </td>
                    <td><span className="status status-danger">Absent</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
function Modal({ title, children, close }: React.PropsWithChildren<{ title: string; close: () => void }>) {
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={close}><Icon name="x"/></button><p className="eyebrow">ASK ENKEL</p><h2>{title}</h2>{children}</div></div>;
}

function AskEnkel() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const submit = () => { if (!question.trim()) return; setAnswer("You have 3 overdue invoices worth ₹99,800. Meridian Labs is the highest-value follow-up due today."); };
  return <><button className="ask-pill" onClick={() => setOpen(true)}><Icon name="spark" size={16}/> Ask Enkel <span>⌘ K</span></button>{open && <Modal title="What can I help with?" close={() => setOpen(false)}><p className="subtle">Ask across clients, sales, expenses, files and your team's work.</p><div className="ask-input"><input autoFocus placeholder="What's outstanding this week?" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}/><Button onClick={submit}><Icon name="arrow"/></Button></div>{answer && <div className="answer"><Icon name="spark"/><p>{answer}</p></div>}<div className="suggestions"><button onClick={() => setQuestion("Which invoices are overdue?")}>Which invoices are overdue?</button><button onClick={() => setQuestion("Who needs a follow-up?")}>Who needs a follow-up?</button></div></Modal>}</>;
}

function Landing({ enterApp }: { enterApp: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return <div className="landing">
    <header className="landing-nav">
      <Logo/>
      <nav>
        <button className="landing-link active" onClick={() => scrollTo("home")}>Home</button>
        <button className="landing-link" onClick={() => scrollTo("how")}>How It Works</button>
        <button className="landing-link" onClick={() => scrollTo("solutions")}>Solutions</button>
        <button className="landing-link" onClick={() => scrollTo("pricing")}>Pricing</button>
      </nav>
      <div className="landing-actions"><Button variant="ghost" onClick={enterApp}>Sign in</Button><Button onClick={enterApp}>Get Started</Button></div>
    </header>

    <main className="landing-main">
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow teal-copy">FOR SMALL BUSINESS OWNERS</p>
          <h1>Run your business<br/>without keeping<br/>everything in your<br/>head.</h1>
          <p>Enkel keeps the context on every client and job in one place — so you always know what matters, and what to do next.</p>
          <div className="hero-actions"><Button onClick={enterApp}>Get Started</Button><button className="see-how" onClick={() => scrollTo("how")}>See how Enkel works <Icon name="arrow" size={15}/></button></div>
          <small>No setup required to start seeing what matters.</small>
        </div>
        <div className="hero-visual">
          <span className="float-chip chip-sales"><i/> Sales · Inv #114</span>
          <span className="float-chip chip-catalogue"><i/> Catalogue · SEO</span>
          <div className="client-context">
            <div className="context-head"><span className="avatar avatar-teal">ML</span><div><strong>Meridian Labs</strong><small>Client since Feb 2025 · Owner: Priya S.</small></div><span className="status status-good">ACTIVE</span></div>
            <div className="context-rule"/>
            <p className="eyebrow orange-copy">TODAY · 3 THINGS NEED ATTENTION</p>
            <div className="timeline-line"><i/><div><small>CONTEXT</small><p>Prefers email over calls. Renewal discussion underway. Pricing sensitivity noted.</p></div></div>
            <div className="timeline-line teal-line"><i/><div><small>RECENT ACTIVITY</small><p>Invoice #114 sent — 5 days ago.</p></div></div>
            <div className="attention-callout"><small>NEEDS YOUR ATTENTION</small><strong>Follow up on pricing</strong><b>DUE FRI</b></div>
          </div>
          <span className="float-chip chip-files"><i/> Files · Contract</span>
          <span className="float-chip chip-activity"><i/> Activity</span>
          <p className="visual-caption">One business relationship — everything around it connected.</p>
        </div>
      </section>

      <section className="problem-section" id="how">
        <div className="center-title"><p className="eyebrow">THE PROBLEM</p><h2>From scattered to seen</h2></div>
        <div className="compare">
          <div><p className="eyebrow">SCATTERED</p><div className="scatter-card">{["WhatsApp", "Email", "Calendar", "Spreadsheet", "Drive", "Notes"].map((x, i) => <span key={x} className={`scatter-pill scatter-${i}`}><i/>{x}</span>)}</div></div>
          <Icon name="arrow" size={23}/>
          <div><p className="eyebrow teal-copy">ENKEL</p><div className="enkel-card"><div><span className="avatar avatar-teal">ML</span><strong>Meridian Labs</strong></div><div className="context-tags">{["Context", "Activity", "Follow-up", "Files", "Sales"].map((x) => <span key={x}><i/>{x}</span>)}</div></div></div>
        </div>
        <div className="problem-copy"><h2>Your business is already connected. Your tools aren't.</h2><p>Everything about Meridian Labs is real and true — it's just scattered across six places that don't talk to each other. Enkel gives it all one home, so nothing gets missed.</p></div>
      </section>

      <section className="context-section" id="solutions">
        <div><h2>What you stop keeping track of.</h2>{["Did I follow up with them?", "Where did I save that file?", "What did we agree on?", "Which invoice is still unpaid?", "What did I promise to send?"].map((x) => <p key={x}>“{x}”</p>)}</div>
        <div className="orbit"><span className="orbit-center">Enkel</span>{["WhatsApp", "Email", "Calendar", "Notes", "Spreadsheet", "Drive"].map((x, i) => <span key={x} className={`orbit-item orbit-${i}`}>{x}</span>)}</div>
      </section>

      <section className="principles">
        <div className="center-title"><p className="eyebrow orange-copy">WHY ENKEL</p><h2>Four principles, not fifty features.</h2><p>Everything above comes down to this.</p></div>
        {[["01", "Simple by design", "Useful before setup."], ["02", "Connected by default", "Clients, work, files and money stay together."], ["03", "Built around real work", "Designed for owner-operators and small teams."], ["04", "Attention that helps", "See what needs action without hunting for it."]].map((p) => <details key={p[0]} open={p[0] === "01"}><summary><span>{p[0]}</span><strong>{p[1]}</strong><b>⌄</b></summary><p>{p[2]}</p></details>)}
      </section>

      <section className="landing-cta" id="pricing"><h2>Run your business. Not your software.</h2><p>Less to remember. Less to search for. Less to chase.<br/><strong>More context. More clarity. More time for the actual work.</strong></p><Button onClick={enterApp}>Get Started</Button><small>Start with your name and email. Everything else can wait.</small></section>
    </main>
    <footer className="landing-footer"><div><Logo/><p>One place to see what your small business<br/>needs, today.</p></div><div className="footer-links"><div><span>PRODUCT</span><button onClick={() => scrollTo("home")}>Home</button><button onClick={() => scrollTo("how")}>How Enkel Works</button><button onClick={() => scrollTo("solutions")}>Solutions</button></div><div><span>COMPANY</span><button>About</button><button>Contact</button></div><div><span>ACCOUNT</span><button onClick={enterApp}>Log in</button><button className="orange-copy" onClick={enterApp}>Start using Enkel</button></div></div></footer>
  </div>;
}

const pageSlug = (page: Page) => page.toLowerCase().replaceAll(" & ", "-").replaceAll(" / ", "-").replaceAll(" ", "-");
const pageFromHash = (): Page => {
  const slug = window.location.hash.replace("#app/", "");
  return nav.find((item) => pageSlug(item.page) === slug)?.page ?? "Home";
};

function App() {
  const [inApp, setInApp] = useState(() => window.location.hash.startsWith("#app/"));
  const [page, setPage] = useState<Page>(() => pageFromHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    window.history.pushState({}, "", `#app/${pageSlug(nextPage)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const enterApp = () => {
    setInApp(true);
    setPage("Home");
    window.history.pushState({}, "", "#app/home");
  };
  useEffect(() => {
    const syncRoute = () => {
      const appRoute = window.location.hash.startsWith("#app/");
      setInApp(appRoute);
      if (appRoute) setPage(pageFromHash());
    };
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);
  const content = useMemo(() => {
    const pages: Record<Page, React.ReactNode> = {
      Home: <Home/>, Reminders: <Reminders/>, Clients: <Clients/>, Leads: <Leads/>, Tasks: <Tasks/>, Catalogue: <Catalogue/>, "Design & Creative": <Creative/>, "Notes / Ideas": <Notes/>, HR: <HR/>, Attendance: <Attendance/>, Sales: <Sales/>, Expenses: <Expenses/>, Files: <Files/>,
    };
    return pages[page];
  }, [page]);
  if (!inApp) return <Landing enterApp={enterApp}/>;
  return <div className="app-shell"><Sidebar page={page} setPage={navigate} open={menuOpen} close={() => setMenuOpen(false)}/>{menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation"/>}<div className="mobile-bar"><button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu"/></button><Logo/><span className="avatar avatar-teal">N</span></div><main>{content}</main><AskEnkel/></div>;
}

export default App;
