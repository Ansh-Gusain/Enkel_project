// ─────────────────────────────────────────────────────────────
// Tasks.tsx — kanban-style task lists with checkboxes
//             Each list is an array: [listName, ...taskTitles]
// ─────────────────────────────────────────────────────────────
import { Button, Icon, PageHeader, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed task lists: first element is the list name, rest are tasks
const seedLists = [
  ["Dev",       "Fix invoice PDF rendering bug", "Ship auth rework",       "Upgrade Node to 22"],
  ["Marketing", "Rewrite pricing page copy",      "Ask for a testimonial",  "Send October campaign plan"],
  ["Ops",       "Renew insurance policy",          "Chase signed addendum",  "Reconcile July expenses"],
  ["QA",        "Regression pass on billing",      "Write test plan for auth"],
];

export default function Tasks() {
  // checked = set of task titles that are ticked
  const [checked, setChecked] = useStoredState<string[]>("completed-tasks", []);
  // lists = array of [listName, ...tasks]
  const [lists, setLists] = useStoredState<string[][]>("task-lists", seedLists);

  const openCount = lists.flatMap((l) => l.slice(1)).filter((t) => !checked.includes(t)).length;

  const addTask = () => {
    const title = window.prompt("Task title");
    if (!title) return;
    const listName = window.prompt("Add to list", lists[0]?.[0] ?? "Client Work");
    setLists((cur) =>
      cur.map((list, idx) =>
        list[0] === listName || (idx === 0 && !cur.some((l) => l[0] === listName))
          ? [...list, title]
          : list,
      ),
    );
  };

  const addList = () => {
    const name = window.prompt("List name");
    if (name) setLists((cur) => [...cur, [name]]);
  };

  return (
    <div className="page">
      <PageHeader
        kicker="TASKS · Northline Studio"
        title="My lists"
        description={`${openCount} tasks open across ${lists.length} lists · 2 overdue`}
        action={<Button onClick={addTask}><Icon name="plus" size={15} /> New task</Button>}
      />

      {/* Static tabs — only "My Lists" is fully implemented */}
      <Tabs
        items={["My Lists", "My Tasks", "Today 2", "Upcoming", "Overdue 2", `Completed ${checked.length}`]}
        active="My Lists"
      />

      <div className="task-grid">
        {lists.map((list, i) => (
          <div className="task-card" key={list[0]}>
            <h3>
              <span className={`dot dot-${i % 4}`} />
              {/* Rename list on click */}
              <button
                className="task-title"
                onClick={() => {
                  const name = window.prompt("Rename list", list[0]);
                  if (name) setLists((cur) => cur.map((l) => l[0] === list[0] ? [name, ...l.slice(1)] : l));
                }}
              >
                {list[0]}
              </button>
              {/* Delete list (moves tasks to first list if not empty) */}
              <button
                className="task-delete"
                onClick={() => {
                  if (list.length > 1 && !window.confirm("This list contains tasks. Move them to the first list before deleting?")) return;
                  setLists((cur) => {
                    const remaining = cur.filter((l) => l[0] !== list[0]);
                    if (list.length > 1 && remaining[0]) remaining[0] = [...remaining[0], ...list.slice(1)];
                    return remaining;
                  });
                }}
              >×</button>
            </h3>

            {/* Task checkboxes */}
            {list.slice(1).map((task) => (
              <label key={task}>
                <input
                  type="checkbox"
                  checked={checked.includes(task)}
                  onChange={() =>
                    setChecked((cur) =>
                      cur.includes(task) ? cur.filter((t) => t !== task) : [...cur, task],
                    )
                  }
                />
                <span className={checked.includes(task) ? "strike" : ""}>{task}</span>
              </label>
            ))}

            <footer>
              <span>{list.length - 1} tasks</span>
              <span>{i % 2 ? "1 due today" : "1 overdue"}</span>
            </footer>
          </div>
        ))}

        <button className="new-list" onClick={addList}>+ New list</button>
      </div>
    </div>
  );
}
