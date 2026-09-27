// ─────────────────────────────────────────────────────────────
// HR.tsx — employee records with admin / member view toggle
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, Metric, PageHeader, Person } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { id: "emp-ananya", name: "Ananya Desai", role: "Product Designer",  status: "Active", joined: "20 Aug 2026" },
  { id: "emp-arjun",  name: "Arjun Mehta",  role: "Software Engineer", status: "Active", joined: "1 Sep 2026"  },
  { id: "emp-karan",  name: "Karan Mehta",  role: "Operations Lead",   status: "Active", joined: "12 Jan 2025" },
  { id: "emp-priya",  name: "Priya Nair",   role: "Account Manager",   status: "Active", joined: "4 Mar 2025"  },
];

export default function HR() {
  // admin = full edit controls; member = read-only
  const [admin, setAdmin] = useState(true);
  const [employees, setEmployees] = useStoredState("employees", seed);

  const addEmployee = () => {
    const name = window.prompt("Employee name");
    if (!name) return;
    const role = window.prompt("Role", "Team member") ?? "Team member";
    setEmployees((cur) => [...cur, {
      id: `emp-${Date.now()}`, name, role, status: "Active", joined: "Today",
    }]);
  };

  return (
    <div className="page">
      <PageHeader
        title="HR Overview"
        description="Manage employee records, documents, and payroll in one place."
        action={
          <div className="header-actions">
            {/* Admin / Member view toggle */}
            <div className="mode-switch">
              <button className={admin ? "active" : ""} onClick={() => setAdmin(true)}>Admin</button>
              <button className={!admin ? "active" : ""} onClick={() => setAdmin(false)}>Member</button>
            </div>
            {admin && (
              <Button onClick={addEmployee}><Icon name="plus" size={15} /> Add employee</Button>
            )}
          </div>
        }
      />

      <p className="subtle">Your workforce at a glance</p>

      {/* Summary metrics */}
      <div className="metrics metrics-3">
        <Metric value={`${employees.length}`}                                              label="Total employees" />
        <Metric value={`${employees.filter((e) => e.status === "Active").length}`}         label="Working today" tone="green" />
        <Metric value="1"                                                                   label="On leave" />
      </div>

      {/* Recent joiners */}
      <section>
        <h2>Recent & upcoming <span className="count">2</span></h2>
        <div className="panel">
          <div className="simple-row">
            <Person initials="AD" name="Ananya Desai" detail="Product Designer · Joined 20 Aug 2026" />
            <span>›</span>
          </div>
          <div className="simple-row">
            <Person initials="AM" name="Arjun Mehta" detail="Software Engineer · Joining 1 Sep 2026" />
            <span>›</span>
          </div>
        </div>
      </section>

      {/* Attention items */}
      <section>
        <h2>Needs attention <span className="count">1</span></h2>
        <div className="notice">
          <span className="danger-dot" />
          Arjun Mehta's contact details are incomplete.
          <span>›</span>
        </div>
      </section>

      {/* Full employee list */}
      <section>
        <h2>Manage</h2>
        <div className="panel">
          {employees.map((emp) => (
            <div className="simple-row" key={emp.id}>
              <span className="avatar">
                {emp.name.split(" ").map((p) => p[0]).join("")}
              </span>
              <div className="grow">
                <strong>{emp.name}</strong>
                <small>{emp.role} · Joined {emp.joined}</small>
              </div>
              <span className="status status-good">{emp.status}</span>
              {admin && (
                <div className="table-actions">
                  <button onClick={() => {
                    const role = window.prompt("Employee role", emp.role);
                    if (role) setEmployees((cur) => cur.map((e) => e.id === emp.id ? { ...e, role } : e));
                  }}>Edit</button>
                  <button onClick={() =>
                    window.confirm(`Delete ${emp.name}?`) &&
                    setEmployees((cur) => cur.filter((e) => e.id !== emp.id))
                  }>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Link to Attendance module */}
        <button
          className="attendance-link"
          onClick={() => { window.location.hash = "#app/attendance"; }}
        >
          Open biometric attendance <Icon name="arrow" size={15} />
        </button>
      </section>
    </div>
  );
}
