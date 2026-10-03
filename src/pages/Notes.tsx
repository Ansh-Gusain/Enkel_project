// ─────────────────────────────────────────────────────────────
// Notes.tsx — PINNED / RECENT section headers, ··· overflow
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader, Search } from "../components/ui";
import { DrawerPanel, DrawerSection, Field, inputStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { title: "Website proposal discussion",        content: "Discussed the revised proposal and the new maintenance package with the client. They want a phased rollout starting next quarter, with the maintenance plan kicking in first.",  tags: "proposal",   pinned: true,  state: "active" },
  { title: "New maintenance plan idea",          content: "Potential recurring maintenance package for existing agency clients — tiered by response time and scope (bronze/silver/gold).",                                                    tags: "ideas",     pinned: true,  state: "active" },
  { title: "Wavelength FM onboarding checklist", content: "Send welcome email, collect signed contract, schedule kickoff call, add to invoicing system.",                                                                                    tags: "clients",   pinned: false, state: "active" },
  { title: "Content ideas for agency growth",    content: "LinkedIn carousel series on before/after client results, published weekly. Could pair with short case-study write-ups on the blog.",                                              tags: "marketing ideas", pinned: false, state: "active" },
  { title: "Notes from Monday's client meeting", content: "Discussed Q4 scope, budget confirmed, kickoff scheduled for the first week of September.",                                                                                        tags: "meetings",  pinned: false, state: "active" },
  { title: "Q4 onboarding improvements",         content: "Streamline the new client onboarding checklist — fewer emails, one shared doc instead.",                                                                                          tags: "",          pinned: false, state: "active" },
];

type Note = { id: string; title: string; content: string; tags: string; pinned: boolean; state: string; };
const blank = (): Omit<Note, "id" | "state"> => ({ title: "", content: "", tags: "", pinned: false });

function NoteOverflow({ note, onEdit, onPin, onArchive, onTrash }: { note: Note; onEdit(): void; onPin(): void; onArchive(): void; onTrash(): void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-menu-wrap" onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <button className="overflow-btn" style={{ opacity: 1, color: "var(--faint)", fontSize: 18 }} onClick={() => setOpen((o) => !o)}>···</button>
      {open && (
        <div className="overflow-menu">
          <button onClick={() => { onEdit(); setOpen(false); }}>Edit</button>
          <button onClick={() => { onPin(); setOpen(false); }}>{note.pinned ? "Unpin" : "Pin"}</button>
          <hr />
          {note.state !== "trash" ? (
            <>
              <button onClick={() => { onArchive(); setOpen(false); }}>Archive</button>
              <button className="danger" onClick={() => { onTrash(); setOpen(false); }}>Move to trash</button>
            </>
          ) : (
            <>
              <button onClick={() => { onArchive(); setOpen(false); }}>Restore</button>
              <button className="danger" onClick={() => { onTrash(); setOpen(false); }}>Delete forever</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Notes() {
  const [captureText, setCaptureText] = useState("");
  const [q, setQ]   = useState("");
  const [tab, setTab] = useState("All Notes");
  const [sortNewest, setSortNewest] = useState(true);

  const [notes, setNotes] = useStoredState<Note[]>(
    "notes",
    seed.map((s, i) => ({ id: `note-${i}`, ...s })),
  );

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState(blank());

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = (prefill = "") => { setForm({ ...blank(), title: prefill }); setEditId(null); setDrawer(true); };
  const openEdit = (n: Note) => {
    setForm({ title: n.title, content: n.content, tags: n.tags, pinned: n.pinned });
    setEditId(n.id); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setNotes((cur) => cur.map((n) => n.id === editId ? { ...n, ...form } : n));
    } else {
      setNotes((cur) => [{ id: `note-${Date.now()}`, ...form, state: "active" }, ...cur]);
    }
    setDrawer(false);
  };

  const quickCapture = () => {
    if (!captureText.trim()) return;
    setNotes((cur) => [{ id: `note-${Date.now()}`, title: captureText.trim(), content: "", tags: "inbox", pinned: false, state: "active" }, ...cur]);
    setCaptureText("");
  };

  const pinnedCount = notes.filter((n) => n.pinned && n.state === "active").length;
  const tagCount    = new Set(notes.flatMap((n) => n.tags.split(",").map((t) => t.trim()).filter(Boolean))).size;

  const filtered = notes
    .filter((n) => `${n.title} ${n.content} ${n.tags}`.toLowerCase().includes(q.toLowerCase()))
    .filter((n) => {
      if (tab === "All Notes") return n.state === "active";
      if (tab === "Pinned")   return n.pinned && n.state === "active";
      if (tab === "Archived") return n.state === "archived";
      if (tab === "Trash")    return n.state === "trash";
      return true;
    });

  const pinned = filtered.filter((n) => n.pinned);
  const recent = filtered.filter((n) => !n.pinned);
  // sort: newest first or oldest first based on insertion order (id contains timestamp)
  const sortedRecent = [...recent].sort((a, b) => sortNewest ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id));

  const actions = {
    pin:     (id: string) => setNotes((cur) => cur.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n)),
    archive: (id: string) => setNotes((cur) => cur.map((n) => n.id === id ? { ...n, state: n.state === "archived" ? "active" : "archived" } : n)),
    trash:   (id: string) => setNotes((cur) => cur.map((n) => n.id === id ? { ...n, state: n.state === "trash" ? "active" : "trash" } : n)),
  };

  return (
    <div className="page">
      <PageHeader
        kicker="NOTES / IDEAS"
        title="Notes / Ideas"
        description="Capture anything worth remembering before deciding what to do with it."
        action={<Button onClick={() => openAdd()}><Icon name="plus" size={15} /> New note</Button>}
      />

      {/* Search + quick-capture */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 10, marginBottom: 4 }}>
        <Search placeholder="Search notes…" value={q} onChange={setQ} />
        <div className="note-capture">
          <Icon name="spark" />
          <input
            placeholder="Capture a thought…"
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && quickCapture()}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[`All Notes`, `Pinned ${pinnedCount}`, `Archived`, `Tags ${tagCount}`, `Trash`].map((t) => {
          const key = t.replace(/\s\d+$/, "");
          return <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{t}</button>;
        })}
      </div>

      {/* PINNED section */}
      {pinned.length > 0 && (
        <>
          <p className="notes-section-label">PINNED</p>
          {pinned.map((note) => <NoteCard key={note.id} note={note} onEdit={() => openEdit(note)} actions={actions} />)}
        </>
      )}

      {/* RECENT section */}
      {recent.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p className="notes-section-label">RECENT</p>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Sort <button style={{ border: 0, background: "transparent", color: "var(--muted)", fontSize: 11, cursor: "pointer" }}>Recently updated ⌄</button>
            </div>
          </div>
          {sortedRecent.map((note) => <NoteCard key={note.id} note={note} onEdit={() => openEdit(note)} actions={actions} />)}
        </>
      )}

      {filtered.length === 0 && (
        <div className="empty-row" style={{ marginTop: 24 }}>No notes in this view.</div>
      )}

      {drawer && (
        <DrawerPanel
          title={editId ? "Edit note" : "New note"}
          onClose={() => setDrawer(false)}
          onSubmit={handleSave}
          submitLabel="Save note"
          width={520}
        >
          <Field label="Title *">
            <input autoFocus style={inputStyle} placeholder="Website proposal discussion" value={form.title} onChange={set("title")} />
          </Field>
          <Field label="Content">
            <textarea style={{ ...textareaStyle, minHeight: 160 }} placeholder="Write your note here…" value={form.content} onChange={set("content")} />
          </Field>
          <DrawerSection label="OPTIONS" />
          <Field label="Tags">
            <input style={inputStyle} placeholder="proposal, ideas, client…" value={form.tags} onChange={set("tags")} />
          </Field>
          <Field label="Pin to top">
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))} />
              Pin this note
            </label>
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}

// ── Note card ─────────────────────────────────────────────────
function NoteCard({ note, onEdit, actions }: {
  note: { id: string; title: string; content: string; tags: string; pinned: boolean; state: string };
  onEdit(): void;
  actions: { pin(id: string): void; archive(id: string): void; trash(id: string): void };
}) {
  return (
    <div className="note-row" style={{ cursor: "pointer" }}>
      <div className="grow" onClick={onEdit}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {note.pinned && <span style={{ color: "var(--orange)", fontSize: 13 }}>📌</span>}
          <strong>{note.title}</strong>
        </div>
        {note.content && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{note.content}</p>}
        {note.tags && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
            {note.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <NoteOverflow
          note={note}
          onEdit={onEdit}
          onPin={() => actions.pin(note.id)}
          onArchive={() => actions.archive(note.id)}
          onTrash={() => actions.trash(note.id)}
        />
      </div>
    </div>
  );
}

