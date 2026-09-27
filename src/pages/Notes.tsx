// ─────────────────────────────────────────────────────────────
// Notes.tsx — quick-capture notes with pin, archive, trash
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader, Search, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed notes
const seed = [
  {
    title:   "Website proposal discussion",
    content: "Discussed the revised proposal and the new maintenance package with the client.",
    tags:    "proposal",
    pinned:  true,
    state:   "active",
  },
  {
    title:   "New maintenance plan idea",
    content: "Potential recurring maintenance package for existing agency clients.",
    tags:    "ideas",
    pinned:  true,
    state:   "active",
  },
  {
    title:   "Wavelength FM onboarding checklist",
    content: "Send welcome email, collect signed contract, schedule kickoff call.",
    tags:    "onboarding",
    pinned:  false,
    state:   "active",
  },
];

export default function Notes() {
  const [text, setText] = useState(""); // quick-capture input
  const [q,    setQ]    = useState(""); // search query
  const [tab,  setTab]  = useState("All Notes");

  const [notes, setNotes] = useStoredState(
    "notes",
    seed.map((s, i) => ({ id: `note-${i}`, ...s })),
  );

  // Add a note from the quick-capture bar
  const addNote = () => {
    if (!text.trim()) return;
    setNotes((cur) => [{
      id:      `note-${Date.now()}`,
      title:   text.trim(),
      content: "Quickly captured note.",
      tags:    "inbox",
      pinned:  false,
      state:   "active",
    }, ...cur]);
    setText("");
  };

  const pinnedCount = notes.filter((n) => n.pinned && n.state === "active").length;

  // Filter by search and active tab
  const visible = notes
    .filter((n) => `${n.title} ${n.content} ${n.tags}`.toLowerCase().includes(q.toLowerCase()))
    .filter((n) => {
      if (tab === "All Notes") return n.state === "active";
      if (tab === "Pinned")    return n.pinned && n.state === "active";
      if (tab === "Archived")  return n.state === "archived";
      if (tab === "Trash")     return n.state === "trash";
      return true;
    });

  return (
    <div className="page">
      <PageHeader
        kicker="NOTES / IDEAS"
        title="Notes / Ideas"
        description="Capture anything worth remembering before deciding what to do with it."
        action={<Button onClick={addNote}><Icon name="plus" size={15} /> New note</Button>}
      />

      <div className="notes-tools">
        <Search placeholder="Search notes, content, or tags" value={q} onChange={setQ} />
        {/* Quick-capture bar — press Enter to save */}
        <div className="note-capture">
          <Icon name="spark" />
          <input
            placeholder="Capture a thought and press Enter..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
        </div>
      </div>

      <Tabs
        items={["All Notes", `Pinned ${pinnedCount}`, "Archived", "Tags", "Trash"]}
        active={tab === "Pinned" ? `Pinned ${pinnedCount}` : tab}
        onChange={(v) => setTab(v.replace(/\s\d+$/, ""))}
      />

      <p className="eyebrow section-label">{tab.toUpperCase()}</p>

      {visible.map((note) => (
        <article className="note-row" key={note.id}>
          <div className="grow">
            {/* Click title to edit */}
            <button className="note-title" onClick={() => {
              const title   = window.prompt("Note title",   note.title);
              const content = window.prompt("Note content", note.content);
              if (title && content)
                setNotes((cur) => cur.map((n) => n.id === note.id ? { ...n, title, content } : n));
            }}>
              <strong>{note.pinned ? "⌖  " : ""}{note.title}</strong>
            </button>
            <p>{note.content}</p>
            <span className="tag">{note.tags}</span>
          </div>

          <div className="note-actions">
            <button onClick={() =>
              setNotes((cur) => cur.map((n) => n.id === note.id ? { ...n, pinned: !n.pinned } : n))
            }>{note.pinned ? "Unpin" : "Pin"}</button>

            {note.state === "trash" ? (
              <>
                <button onClick={() =>
                  setNotes((cur) => cur.map((n) => n.id === note.id ? { ...n, state: "active" } : n))
                }>Restore</button>
                <button onClick={() =>
                  window.confirm("Permanently delete this note?") &&
                  setNotes((cur) => cur.filter((n) => n.id !== note.id))
                }>Delete forever</button>
              </>
            ) : (
              <>
                <button onClick={() =>
                  setNotes((cur) => cur.map((n) => n.id === note.id ? { ...n, state: "archived" } : n))
                }>Archive</button>
                <button onClick={() =>
                  setNotes((cur) => cur.map((n) => n.id === note.id ? { ...n, state: "trash" } : n))
                }>Trash</button>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
