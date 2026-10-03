// ─────────────────────────────────────────────────────────────
// HR.tsx — employee records with detailed add employee drawer
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, Metric, PageHeader, Person } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, selectStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const seed = [
  { id: "emp-ananya", firstName: "Ananya", lastName: "Desai",  preferredName: "",       email: "ananya@northline.in",  personalEmail: "",  phone: "+91 98200 41122", designation: "Product Designer",  department: "Design & Creative", employmentType: "Full-time", joiningDate: "2026-08-20", salary: "60000", salaryFreq: "month", status: "Active" },
  { id: "emp-arjun",  firstName: "Arjun",  lastName: "Mehta",  preferredName: "",       email: "arjun@northline.in",   personalEmail: "",  phone: "",                designation: "Software Engineer", department: "Engineering",       employmentType: "Full-time", joiningDate: "2026-09-01", salary: "75000", salaryFreq: "month", status: "Active" },
  { id: "emp-karan",  firstName: "Karan",  lastName: "Mehta",  preferredName: "",       email: "karan@northline.in",   personalEmail: "",  phone: "+91 98300 11223", designation: "Operations Lead",   department: "Operations",        employmentType: "Full-time", joiningDate: "2025-01-12", salary: "55000", salaryFreq: "month", status: "Active" },
  { id: "emp-priya",  firstName: "Priya",  lastName: "Nair",   preferredName: "",       email: "priya@northline.in",   personalEmail: "",  phone: "+91 97700 44512", designation: "Account Manager",   department: "Sales",             employmentType: "Full-time", joiningDate: "2025-03-04", salary: "50000", salaryFreq: "month", status: "Active" },
];

type Employee = typeof seed[0] & { id: string };

const DESIGNATIONS = ["Account Manager", "Client Servicing Lead", "Founder", "Graphic Designer", "Product Designer", "Sales Associate", "Senior Developer", "Software Engineer"];
const DEPARTMENTS  = ["Design & Creative", "Engineering", "Leadership", "Operations", "Sales"];
const EMP_TYPES    = ["Full-time", "Part-time", "Contract", "Intern", "Freelance"];

const blank = (): Omit<Employee, "id"> => ({
  firstName: "", lastName: "", preferredName: "", email: "", personalEmail: "", phone: "",
  designation: "", department: "", employmentType: "Full-time",
  joiningDate: new Date().toISOString().slice(0, 10),
  salary: "", salaryFreq: "month", status: "Active",
});

export default function HR() {
  const [admin, setAdmin] = useState(true);
  const [employees, setEmployees] = useStoredState<Employee[]>("employees", seed);

  // Migrate: old shape had { id, name, role, status, joined } — normalise to new shape
  const safeEmployees: Employee[] = employees.map((e) => {
    if (e.firstName) return e; // already new shape
    const legacy = e as unknown as { id: string; name?: string; role?: string; status?: string; joined?: string };
    const parts  = (legacy.name ?? "").split(" ");
    return {
      ...blank(),
      id:            legacy.id,
      firstName:     parts[0] ?? "",
      lastName:      parts.slice(1).join(" "),
      designation:   legacy.role ?? "",
      joiningDate:   legacy.joined ?? "",
      status:        legacy.status ?? "Active",
    };
  });

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blank());

  const set = (f: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = () => { setForm(blank()); setEditId(null); setDrawer(true); };
  const openEdit = (emp: Employee) => {
    setForm({ firstName: emp.firstName, lastName: emp.lastName, preferredName: emp.preferredName, email: emp.email, personalEmail: emp.personalEmail, phone: emp.phone, designation: emp.designation, department: emp.department, employmentType: emp.employmentType, joiningDate: emp.joiningDate, salary: emp.salary, salaryFreq: emp.salaryFreq, status: emp.status });
    setEditId(emp.id); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim()) return;
    if (editId) {
      // Write normalised shape back — heals any legacy records
      setEmployees((cur) => cur.map((e) => e.id === editId ? { id: e.id, ...form } : e));
    } else {
      setEmployees((cur) => [...cur, { id: `emp-${Date.now()}`, ...form }]);
    }
    setDrawer(false);
  };

  const getName = (e: Employee) => `${e.firstName} ${e.lastName}`.trim();
  const getInitials = (e: Employee) => `${e.firstName[0] ?? ""}${e.lastName[0] ?? ""}`;

  return (
    <div className="page">
      <PageHeader
        title="HR Overview"
        description="Manage employee records, documents, and payroll in one place."
        action={
          <div className="header-actions">
            <div className="mode-switch">
              <button className={admin ? "active" : ""} onClick={() => setAdmin(true)}>Admin</button>
              <button className={!admin ? "active" : ""} onClick={() => setAdmin(false)}>Member</button>
            </div>
            {admin && <Button onClick={openAdd}><Icon name="plus" size={15} /> Add employee</Button>}
          </div>
        }
      />

      <p className="subtle">Your workforce at a glance</p>
      <div className="metrics metrics-3">
        <Metric value={`${safeEmployees.length}`}                                           label="Total employees" />
        <Metric value={`${safeEmployees.filter((e) => e.status === "Active").length}`}      label="Active"  tone="green" />
        <Metric value={`${safeEmployees.filter((e) => e.status !== "Active").length}`}      label="Former" />
      </div>

      <section>
        <h2>Recent & upcoming <span className="count">2</span></h2>
        <div className="panel">
          <div className="simple-row"><Person initials="AD" name="Ananya Desai" detail="Product Designer · Joined 20 Aug 2026" /><span>›</span></div>
          <div className="simple-row"><Person initials="AM" name="Arjun Mehta"  detail="Software Engineer · Joining 1 Sep 2026" /><span>›</span></div>
        </div>
      </section>

      {(() => {
        const incomplete = safeEmployees.filter((e) => !e.phone && !e.personalEmail);
        if (incomplete.length === 0) return null;
        return (
          <section>
            <h2>Needs attention <span className="count">{incomplete.length}</span></h2>
            {incomplete.map((emp) => (
              <div className="notice" key={emp.id}>
                <span className="danger-dot" />
                {emp.firstName} {emp.lastName}&apos;s contact details are incomplete.
                <button style={{ border:0, background:"transparent", cursor:"pointer", color:"var(--orange)", fontSize:12, marginLeft:8 }} onClick={() => openEdit(emp)}>Fix →</button>
              </div>
            ))}
          </section>
        );
      })()}

      <section>
        <h2>Manage</h2>
        <div className="panel">
          {safeEmployees.map((emp) => (
            <div className="simple-row" key={emp.id}>
              <span className="avatar">{getInitials(emp)}</span>
              <div className="grow">
                <strong>{getName(emp)}</strong>
                <small>{emp.designation} · Joined {emp.joiningDate}</small>
              </div>
              <span className="status status-good">{emp.status}</span>
              {admin && (
                <div className="table-actions">
                  <button onClick={() => openEdit(emp)}>Edit</button>
                  <button onClick={() => window.confirm(`Delete ${getName(emp)}?`) && setEmployees((cur) => cur.filter((e) => e.id !== emp.id))}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="attendance-link" onClick={() => { window.location.hash = "#app/attendance"; }}>
          Open biometric attendance <Icon name="arrow" size={15} />
        </button>
      </section>

      {drawer && (
        <DrawerPanel
          title={editId ? "Edit employee" : "Add employee"}
          subtitle="BASIC INFORMATION"
          onClose={() => setDrawer(false)}
          onSubmit={handleSave}
          submitLabel="Add employee"
          width={520}
        >
          <Field label="First & last name *" row>
            <input autoFocus style={{ ...inputStyle, flex: 1 }} placeholder="Ananya" value={form.firstName} onChange={set("firstName")} />
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Desai" value={form.lastName} onChange={set("lastName")} />
          </Field>
          <Field label="Preferred name">
            <input style={inputStyle} placeholder="What they go by day to day" value={form.preferredName} onChange={set("preferredName")} />
          </Field>

          <DrawerSection label="CONTACT" />
          <Field label="Work email">
            <input style={inputStyle} type="email" placeholder="ananya@company.in" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Personal email & phone" row>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="ananya@gmail.com" value={form.personalEmail} onChange={set("personalEmail")} />
            <input style={{ ...inputStyle, flex: 1 }} placeholder="+91 98200 41122" value={form.phone} onChange={set("phone")} />
          </Field>

          <DrawerSection label="EMPLOYMENT" />
          <Field label="Designation">
            <input style={inputStyle} placeholder="Product Designer" value={form.designation} onChange={set("designation")} />
            <ChipGroup options={DESIGNATIONS} value={form.designation} onChange={(v) => setForm((p) => ({ ...p, designation: v }))} />
          </Field>
          <Field label="Department">
            <input style={inputStyle} placeholder="Design & Creative" value={form.department} onChange={set("department")} />
            <ChipGroup options={DEPARTMENTS} value={form.department} onChange={(v) => setForm((p) => ({ ...p, department: v }))} />
          </Field>
          <Field label="Employment type & joining date" row>
            <select style={{ ...selectStyle, flex: 1 }} value={form.employmentType} onChange={set("employmentType")}>
              {EMP_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input style={{ ...inputStyle, flex: 1 }} type="date" value={form.joiningDate} onChange={set("joiningDate")} />
          </Field>

          <DrawerSection label="COMPENSATION · OPTIONAL" />
          <Field label="Salary & frequency" row>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="₹60,000" value={form.salary} onChange={set("salary")} />
            <select style={{ ...selectStyle, width: 120 }} value={form.salaryFreq} onChange={set("salaryFreq")}>
              {["month", "year", "day", "hour"].map((f) => <option key={f}>/ {f}</option>)}
            </select>
          </Field>
        </DrawerPanel>
      )}
    </div>
  );
}

