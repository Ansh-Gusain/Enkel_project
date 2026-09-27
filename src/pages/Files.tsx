// ─────────────────────────────────────────────────────────────
// Files.tsx — document store with grid/list toggle and upload
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { Button, Icon, PageHeader, Search, Tabs } from "../components/ui";
import { useStoredState } from "../hooks/useStoredState";

const seedFiles = [
  "FY25-26 GST Returns Summary.xlsx",
  "Vendor NDA - Freelance Design.pdf",
  "Fire Safety Training Certificate.pdf",
  "Employee Handbook 2026.pdf",
  "ISO 9001 Certification.pdf",
  "Shop & Establishment License.pdf",
  "Leave & WFH Policy.pdf",
  "Office Contents Insurance.pdf",
  "GST Registration Certificate.pdf",
  "Workmen Compensation Policy.pdf",
  "Fire Safety NOC.pdf",
  "Meridian Labs MSA.pdf",
];

export default function Files() {
  const [q,      setQ]      = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  // Hidden file input ref for the upload button
  const picker = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useStoredState(
    "files",
    seedFiles.map((name, i) => ({
      id:       `file-${i}`,
      name,
      size:     `${150 + i * 90} KB`,
      category: i % 3 === 0 ? "Licenses & Registrations"
               : i % 3 === 1 ? "Legal & Contracts"
               : "HR & Policies",
      uploader: i % 2 ? "Karan Mehta" : "Abhishek",
      expires:  i % 3 === 0 ? `Expires in ${12 + i} days` : "",
    })),
  );

  // Handle file upload via the hidden input
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRecords((cur) => [{
      id:       `file-${Date.now()}`,
      name:     file.name,
      size:     `${Math.max(1, Math.round(file.size / 1024))} KB`,
      category: "Other",
      uploader: "Ananya",
      expires:  "",
    }, ...cur]);
    event.target.value = "";
  };

  const visible = records.filter((f) =>
    `${f.name} ${f.category} ${f.uploader}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="page">
      <PageHeader
        kicker="FILES"
        title="Files"
        description="Licenses, certifications, contracts and other org documents, in one place."
        action={
          <>
            {/* Hidden native file picker */}
            <input ref={picker} className="hidden-input" type="file" onChange={handleUpload} />
            <Button onClick={() => picker.current?.click()}>
              <Icon name="plus" size={15} /> Upload file
            </Button>
          </>
        }
      />

      <Tabs
        items={[`All files ${records.length}`, "Licenses & Registrations", "Certifications", "Legal & Contracts", "Finance & Tax", "HR & Policies"]}
        active={`All files ${records.length}`}
      />

      <div className="toolbar">
        <Search placeholder="Search files..." value={q} onChange={setQ} />
        <Button variant="secondary" onClick={() => setLayout(layout === "grid" ? "list" : "grid")}>
          <Icon name={layout === "grid" ? "note" : "grid"} size={15} />
          {layout === "grid" ? "List" : "Grid"} view
        </Button>
      </div>

      <div className={layout === "grid" ? "file-grid" : "file-list"}>
        {visible.map((file) => (
          <article className="file-card" key={file.id}>
            <div>
              {/* File type badge from extension */}
              <span className="file-type">
                {file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
              </span>
              <strong>{file.name}</strong>
              <div className="table-actions">
                <button onClick={() => {
                  const name = window.prompt("File name", file.name);
                  if (name) setRecords((cur) => cur.map((f) => f.id === file.id ? { ...f, name } : f));
                }}>Edit</button>
                <button onClick={() =>
                  window.confirm(`Delete ${file.name}?`) &&
                  setRecords((cur) => cur.filter((f) => f.id !== file.id))
                }>Delete</button>
              </div>
            </div>
            <small>{file.size} · Today · {file.uploader}<br />{file.category}</small>
            {file.expires && <span className="status status-warn">{file.expires}</span>}
          </article>
        ))}
      </div>
    </div>
  );
}
