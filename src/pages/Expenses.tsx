// ─────────────────────────────────────────────────────────────
// Expenses.tsx — expense log with approve/reject and CSV export
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, DataTable, Icon, Metric, PageHeader, Search, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

// Seed expenses: [date, name, paidBy, amount, status]
const seed = [
  ["Aug 15", "Client dinner · Cafe Turmeric",             "Business",    "₹3,400", "Paid"],
  ["Aug 14", "Workspace subscription · Google Workspace", "Business",    "₹1,850", "Paid"],
  ["Aug 13", "Cab to client meeting · Uber",              "Karan Mehta", "₹620",   "Pending review"],
  ["Aug 12", "Office stationery · Office Bazaar",         "Business",    "₹840",   "Paid"],
];

export default function Expenses() {
  const [q, setQ] = useState("");

  const [records, setRecords] = useStoredState(
    "expenses",
    seed.map((e, i) => ({
      id:     `expense-${i}`,
      date:   e[0],
      name:   e[1],
      paidBy: e[2],
      amount: Number(e[3].replace(/[₹,]/g, "")),
      status: e[4],
    })),
  );

  const addExpense = () => {
    const name   = window.prompt("Expense and vendor");
    const amount = Number(window.prompt("Amount in ₹", "500"));
    if (name && amount) {
      setRecords((cur) => [{
        id: `expense-${Date.now()}`, date: "Today", name,
        paidBy: "Business", amount, status: "Pending review",
      }, ...cur]);
    }
  };

  // Export all expenses as a CSV file download
  const exportCsv = () => {
    const rows = [
      "Date,Expense,Paid by,Amount,Status",
      ...records.map((r) => [r.date, `"${r.name}"`, r.paidBy, r.amount, r.status].join(",")),
    ].join("\n");
    const link = document.createElement("a");
    link.href     = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    link.download = "enkel-expenses.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const total   = records.reduce((s, r) => s + r.amount, 0);
  const pending = records.filter((r) => r.status !== "Paid").reduce((s, r) => s + r.amount, 0);
  const visible = records.filter((r) =>
    `${r.name} ${r.paidBy} ${r.status}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="page">
      <PageHeader
        kicker="EXPENSES · Northline Studio"
        title="Track spend"
        description="See what the business has spent, find any expense, and act on what needs attention."
        action={<Button onClick={addExpense}><Icon name="plus" size={15} /> New expense</Button>}
      />

      <div className="metrics metrics-4">
        <Metric value={`₹${total.toLocaleString("en-IN")}`}   label="Spent this month" />
        <Metric value={`₹${pending.toLocaleString("en-IN")}`} label="Pending reimbursements" tone="amber" />
        <Metric value="₹4,200"                                 label="Billable expenses" />
        <Metric value="₹38,999/mo"                             label="Upcoming recurring" />
      </div>

      <Tabs
        items={[
          `All Expenses ${records.length}`,
          `Needs Attention ${records.filter((r) => r.status !== "Paid").length}`,
          "Reimbursements", "Recurring", "Reports",
        ]}
        active={`All Expenses ${records.length}`}
      />

      <div className="toolbar">
        <Search placeholder="Search vendor, client, employee, note" value={q} onChange={setQ} />
        <Button variant="secondary"><Icon name="filter" size={15} /> Filter</Button>
        <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
      </div>

      <DataTable
        headers={["DATE", "EXPENSE", "PAID BY", "AMOUNT", "STATUS", "ACTIONS"]}
        rows={visible.map((r) => [
          r.date,
          r.name,
          r.paidBy,
          <strong>₹{r.amount.toLocaleString("en-IN")}</strong>,
          <span className={`status ${r.status === "Paid" ? "" : "status-warn"}`}>{r.status}</span>,
          <div className="table-actions">
            {r.status !== "Paid" && (
              <>
                <button onClick={() =>
                  setRecords((cur) => cur.map((x) => x.id === r.id ? { ...x, status: "Paid" } : x))
                }>Approve</button>
                <button onClick={() => {
                  const reason = window.prompt("Rejection reason");
                  if (reason) setRecords((cur) => cur.map((x) => x.id === r.id ? { ...x, status: `Rejected: ${reason}` } : x));
                }}>Reject</button>
              </>
            )}
            <button onClick={() =>
              window.confirm("Delete this expense?") &&
              setRecords((cur) => cur.filter((x) => x.id !== r.id))
            }>Delete</button>
          </div>,
        ])}
      />
    </div>
  );
}
