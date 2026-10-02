// ─────────────────────────────────────────────────────────────
// Tasks.tsx — kanban lists with inline quick-add bar,
//             +N more truncation, overflow menu per card
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader, Search, Tabs } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seedLists = [
  ["Dev",       "Fix invoice PDF rendering bug", "Ship auth rework",        "Upgrade Node to 22",         "Write migration guide"   ],
  ["Marketing", "Rewrite pricing page copy",      "Ask for a testimonial",   "Send October campaign plan", "Brief the design team"   ],
  ["Ops",       "Renew insurance policy",          "Chase signed addendum",   "Reconcile July expenses",    "Book team offsite venue" ],
  ["QA",        "Regression pass on billing",      "Write test plan for auth" ],
];

// Dot colours per list index
const DOT_COLOURS = ["var(--orange)", "var(--teal)", "#6b5fc9", "#555047"];

function OverflowMenu({ onRename, onDelete }: { onRename(): void; onDelete(): void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-menu-wrap" onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <button className="overflow-btn" onClick={() => setOpen((o) => !o)}>···</button>
      {open && (
        <div className="overflow-menu">
          <button onClick={() => { onRename(); setOpen(false); }}>Rename list</button>
          <hr />
          <button className="danger" onClick={() => { onDelete(); setOpen(false); }}>Delete list</button>
        </div>
      )}
    </div>
  );
}

export default function Tasks() {
  const [checked, setChecked] = useStoredState<string[]>("completed-tasks", []);
  const [lists, setLists]     = useStoredState<string[][]>("task-lists", seedLists);
  const [q, setQ]             = useState("");

  // Inline quick-add bar
  const [quickText,    setQuickText]    = useState("");
  const [quickList,    setQuickList]    = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const submitQuick = () => {
    if (!quickText.trim()) return;
    const target = quickList || lists[0]?.[0];
    setLists((cur) => cur.map((l, i) =>
      l[0] === target || (i === 0 && !cur.some((x) => x[0] === target))
        ? [...l, quickText.trim()] : l,
    ));
    setQuickText(""); setShowQuickAdd(false);
  };

  // New task drawer
  const [drawer,       setDrawer]       = useState(false);
  const [taskTitle,    setTaskTitle]     = useState("");
  const [taskList,     setTaskList]      = useState("");
  const [taskDue,      setTaskDue]       = useState("");
  const [taskPriority, setTaskPriority]  = useState("Normal");

  const openDrawer = (listName?: string) => {
    setTaskTitle(""); setTaskList(listName || lists[0]?.[0] || "");
    setTaskDue(""); setTaskPriority("Normal"); setDrawer(true);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    const target = taskList || lists[0]?.[0];
    setLists((cur) => cur.map((l, i) =>
      l[0] === target || (i === 0 && !cur.some((x) => x[0] === target))
        ? [...l, taskTitle.trim()] : l,
    ));
    setDrawer(false);
  };

  // New list drawer
  const [listDrawer, setListDrawer] = useState(false);
  const [listName,   setListName]   = useState("");
  const handleAddList = () => {
    if (!listName.trim()) return;
    setLists((cur) => [...cur, [listName.trim()]]);
    setListDrawer(false);
  };

  // Rename list
  const renameList = (old: string) => {
    const name = window.prompt("Rename list", old);
    if (name && name !== old) setLists((cur) => cur.map((l) => l[0] === old ? [name, ...l.slice(1)] : l));
  };

  const openCount = lists.flatMap((l) => l.slice(1)).filter((t) => !checked.includes(t)).length;

  // Filter by search
  const visibleLists = q
    ? lists.map((l) => [l[0], ...l.slice(1).filter((t) => t.toLowerCase().includes(q.toLowerCase()))])
    : lists;

  return (
    <div className="page">
      <PageHeader
        kicker="TASKS · Northline Studio"
        title="My lists"
        description={`${openCount} tasks open across ${lists.length} lists`}
        action={
          <div className="header-actions">
            <Search placeholder="Search tasks" value={q} onChange={setQ} />
            <Button onClick={() => openDrawer()}><Icon name="plus" size={15} /> New task</Button>
          </div>
        }
      />

      <Tabs items={["My Lists", "My Tasks", `Completed ${checked.length}`]} active="My Lists" />

      {/* ── Inline quick-add bar ── */}
      {showQuickAdd ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
          <input
            autoFocus
            style={{ ...inputStyle as React.CSSProperties, flex: 1 }}
            placeholder="What needs doing?"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitQuick(); if (e.key === "Escape") setShowQuickAdd(false); }}
          />
          {/* List selector chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {lists.map((l) => (
              <button key={l[0]} type="button" onClick={() => setQuickList(l[0])} style={{
                padding: "5px 11px", borderRadius: 99, fontSize: 12, cursor: "pointer", border: "1px solid",
                borderColor: (quickList || lists[0]?.[0]) === l[0] ? "var(--orange)" : "var(--line)",
                background:  (quickList || lists[0]?.[0]) === l[0] ? "var(--coral-soft)" : "var(--paper)",
                color:       (quickList || lists[0]?.[0]) === l[0] ? "var(--orange-dark)" : "var(--muted)",
              }}>{l[0]}</button>
            ))}
          </div>
          <Button onClick={submitQuick}>Add task</Button>
          <Button variant="ghost" onClick={() => setShowQuickAdd(false)}>Cancel</Button>
        </div>
      ) : (
        <button
          style={{ border: 0, background: "transparent", color: "var(--muted)", fontSize: 13, padding: "10px 0 6px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => { setQuickText(""); setQuickList(""); setShowQuickAdd(true); }}
        >
          <Icon name="plus" size={14} /> What needs doing?
        </button>
      )}

      {/* ── Kanban grid ── */}
      <div className="task-grid">
        {visibleLists.map((list, i) => {
          const tasks     = list.slice(1);
          const SHOW      = 3;
          const visible   = tasks.slice(0, SHOW);
          const remaining = tasks.length - SHOW;
          const overdue   = i % 2 === 0;  // demo — alternate lists show overdue indicator

          return (
            <div className="task-card" key={list[0]}>
              <h3>
                <span className="dot" style={{ background: DOT_COLOURS[i % DOT_COLOURS.length] }} />
                <span className="task-title">{list[0]}</span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>{tasks.length}</span>
                  <OverflowMenu
                    onRename={() => renameList(list[0])}
                    onDelete={() => {
                      if (tasks.length > 0 && !window.confirm(`Delete "${list[0]}"? Tasks will move to the first list.`)) return;
                      setLists((cur) => {
                        const remaining = cur.filter((l) => l[0] !== list[0]);
                        if (tasks.length > 0 && remaining[0]) remaining[0] = [...remaining[0], ...tasks];
                        return remaining;
                      });
                    }}
                  />
                </span>
              </h3>

              {visible.map((task) => (
                <label key={task} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "8px 0", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={checked.includes(task)}
                    onChange={() => setChecked((cur) =>
                      cur.includes(task) ? cur.filter((t) => t !== task) : [...cur, task],
                    )}
                    style={{ marginTop: 2 }}
                  />
                  <span className={checked.includes(task) ? "strike" : ""}
                    style={{ color: overdue && !checked.includes(task) && task === visible[0] ? "var(--orange)" : "inherit" }}>
                    {task}
                  </span>
                </label>
              ))}

              {remaining > 0 && (
                <button className="task-more">+{remaining} more</button>
              )}

              {/* Per-card add task */}
              <button
                style={{ border: 0, background: "transparent", color: "var(--muted)", fontSize: 12, padding: "6px 0 0", cursor: "pointer", textAlign: "left" }}
                onClick={() => openDrawer(list[0])}
              >+ Add task</button>

              <footer>
                <span>{tasks.length} tasks</span>
                <span className={overdue ? "task-overdue-badge" : ""} style={{ color: "var(--muted)" }}>
                  {overdue ? "1 overdue" : `${tasks.filter((t) => checked.includes(t)).length} done`}
                </span>
              </footer>
            </div>
          );
        })}

        <button className="new-list" onClick={() => { setListName(""); setListDrawer(true); }}>
          + New list
        </button>
      </div>

      {/* New task drawer */}
      {drawer && (
        <DrawerPanel title="New task" onClose={() => setDrawer(false)} onSubmit={handleAddTask} submitLabel="Add task">
          <Field label="Task title *">
            <input autoFocus style={inputStyle} placeholder="Fix invoice PDF rendering bug" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          </Field>
          <Field label="Add to list">
            <ChipGroup options={lists.map((l) => l[0])} value={taskList || lists[0]?.[0] || ""} onChange={(v) => setTaskList(v)} />
          </Field>
          <DrawerSection label="OPTIONAL" />
          <Field label="Due date">
            <input style={inputStyle} type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
          </Field>
          <Field label="Priority">
            <ChipGroup options={["Low","Normal","High","Urgent"]} value={taskPriority} onChange={(v) => setTaskPriority(v)} />
          </Field>
        </DrawerPanel>
      )}

      {/* New list drawer */}
      {listDrawer && (
        <DrawerPanel title="New list" onClose={() => setListDrawer(false)} onSubmit={handleAddList} submitLabel="Create list">
          <Field label="List name *">
            <input autoFocus style={inputStyle} placeholder="Client Work" value={listName} onChange={(e) => setListName(e.target.value)} />
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}
