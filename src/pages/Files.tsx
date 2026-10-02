// ─────────────────────────────────────────────────────────────
// Files.tsx — 2-column card grid, Expiring soon tab,
//             Remind me link, upload drawer
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { Button, Icon, PageHeader, Search } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, selectStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const CATEGORIES = ["Licenses & Registrations","Legal & Contracts","HR & Policies","Finance & Tax","Certifications","Insurance","Other"];

const seedFiles = [
  { name:"FY25-26 GST Returns Summary.xlsx",     category:"Finance & Tax",            uploader:"Abhishek",    size:"220 KB",  date:"12 Aug 2026",  expiryDate:"",             client:""              },
  { name:"Vendor NDA - Freelance Designer.pdf",  category:"Legal & Contracts",        uploader:"Karan Mehta", size:"200 KB",  date:"7 Aug 2026",   expiryDate:"",             client:""              },
  { name:"Fire Safety Training Certificate.pdf", category:"Certifications",           uploader:"Karan Mehta", size:"340 KB",  date:"28 Jul 2026",  expiryDate:"2026-09-26",   client:""              },
  { name:"Employee Handbook 2026.pdf",           category:"HR & Policies",            uploader:"Sanchita Rao",size:"3.3 MB",  date:"18 Jul 2026",  expiryDate:"",             client:""              },
  { name:"ISO 9001 Certification.pdf",           category:"Certifications",           uploader:"Sanchita Rao",size:"2.1 MB",  date:"18 Jun 2026",  expiryDate:"2027-06-13",   client:""              },
  { name:"Shop & Establishment License.pdf",     category:"Licenses & Registrations", uploader:"Priya Nair",  size:"512 KB",  date:"19 May 2026",  expiryDate:"2026-10-01",   client:""              },
  { name:"Leave & WFH Policy.pdf",               category:"HR & Policies",            uploader:"Sanchita Rao",size:"150 KB",  date:"9 May 2026",   expiryDate:"",             client:""              },
  { name:"Office Contents Insurance.pdf",        category:"Insurance",                uploader:"Priya Nair",  size:"590 KB",  date:"20 Mar 2026",  expiryDate:"2026-10-16",   client:""              },
  { name:"GST Registration Certificate.pdf",     category:"Licenses & Registrations", uploader:"Abhishek",    size:"840 KB",  date:"29 Jan 2026",  expiryDate:"",             client:""              },
  { name:"Workmen Compensation Policy.pdf",      category:"Insurance",                uploader:"Abhishek",    size:"670 KB",  date:"10 Dec 2025",  expiryDate:"2026-08-14",   client:""              },
  { name:"Fire Safety NOC.pdf",                  category:"Licenses & Registrations", uploader:"Abhishek",    size:"1.2 MB",  date:"13 Jul 2025",  expiryDate:"2026-08-02",   client:""              },
  { name:"Meridian Labs MSA.pdf",                category:"Legal & Contracts",        uploader:"Abhishek",    size:"960 KB",  date:"4 Apr 2025",   expiryDate:"",             client:"Meridian Labs" },
  { name:"PAN Card - Company.pdf",               category:"Finance & Tax",            uploader:"Abhishek",    size:"180 KB",  date:"25 Dec 2024",  expiryDate:"",             client:""              },
  { name:"Office Lease Agreement.pdf",           category:"Legal & Contracts",        uploader:"Priya Nair",  size:"1.7 MB",  date:"16 Sep 2024",  expiryDate:"2026-10-01",   client:""              },
];

type FileRecord = { id:string; name:string; category:string; uploader:string; size:string; date:string; expiryDate:string; client:string; notes:string; };

const today = new Date().toISOString().slice(0,10);

function getExpiryStatus(expiryDate: string): "expired" | "soon" | "" {
  if (!expiryDate) return "";
  if (expiryDate < today) return "expired";
  const diff = (new Date(expiryDate).getTime() - Date.now()) / 86400000;
  if (diff <= 30) return "soon";
  return "";
}

function expiryLabel(expiryDate: string): string {
  if (!expiryDate) return "";
  const status = getExpiryStatus(expiryDate);
  if (status === "expired") {
    const d = new Date(expiryDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
    return `Expired ${d}`;
  }
  const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  return diff <= 30 ? `Expires in ${diff} days` : `Expires ${new Date(expiryDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}`;
}

function fileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export default function Files() {
  const [q, setQ]           = useState("");
  const [activeTab, setActiveTab] = useState("All files");
  const [layout, setLayout]       = useState<"grid"|"list">("grid");
  const picker = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useStoredState<FileRecord[]>(
    "files",
    seedFiles.map((f, i) => ({ id:`file-${i}`, ...f, notes:"" })),
  );

  const [drawer, setDrawer]     = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name:string; size:string } | null>(null);
  const [form, setForm]         = useState({ name:"", category:"Other", uploader:"Ananya", expiryDate:"", client:"", notes:"" });

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile({ name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB` });
    setForm((p) => ({ ...p, name: file.name }));
    setEditId(null); setDrawer(true);
    e.target.value = "";
  };

  const openEdit = (f: FileRecord) => {
    setForm({ name:f.name, category:f.category, uploader:f.uploader, expiryDate:f.expiryDate, client:f.client, notes:f.notes });
    setPendingFile(null); setEditId(f.id); setDrawer(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setRecords((cur) => cur.map((r) => r.id === editId ? { ...r, ...form } : r));
    } else {
      setRecords((cur) => [{
        id: `file-${Date.now()}`, size: pendingFile?.size ?? "—",
        date: new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
        ...form,
      }, ...cur]);
    }
    setDrawer(false); setPendingFile(null);
  };

  // Expiring soon: within 30 days. Expired: past today.
  const expiringCount = records.filter((r) => getExpiryStatus(r.expiryDate) === "soon").length;
  const expiredCount  = records.filter((r) => getExpiryStatus(r.expiryDate) === "expired").length;

  const catTabs = [
    { label: `All files ${records.length}`, key: "All files" },
    ...CATEGORIES.slice(0,5).map((c) => ({ label:`${c} ${records.filter((r) => r.category === c).length}`, key: c })),
    { label: `Expiring soon · ${expiringCount}`, key: "Expiring soon" },
    { label: `Expired · ${expiredCount}`,         key: "Expired"       },
  ];

  const visible = records
    .filter((f) => `${f.name} ${f.category} ${f.uploader} ${f.client}`.toLowerCase().includes(q.toLowerCase()))
    .filter((f) => {
      if (activeTab === "All files") return true;
      if (activeTab === "Expiring soon") return getExpiryStatus(f.expiryDate) === "soon";
      if (activeTab === "Expired")      return getExpiryStatus(f.expiryDate) === "expired";
      return f.category === activeTab;
    });

  return (
    <div className="page">
      <PageHeader
        kicker="FILES"
        title="Files"
        description="Licenses, certifications, contracts and other org documents, in one place."
        action={
          <>
            <input ref={picker} className="hidden-input" type="file" onChange={handleFilePick} />
            <Button onClick={() => picker.current?.click()}><Icon name="plus" size={15} /> Upload file</Button>
          </>
        }
      />

      {/* Scrollable category tabs */}
      <div className="tabs" style={{ marginBottom:0 }}>
        {catTabs.map((t) => (
          <button key={t.key} className={activeTab === t.key ? "active" : ""} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Second row: search + filter/view */}
      <div className="toolbar" style={{ marginTop:12 }}>
        <Search placeholder="Search files…" value={q} onChange={setQ} />
        <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
          {/* Grid/list toggle */}
          <button style={{ padding:"5px 8px", border:"1px solid var(--line)", borderRadius:8, background:"var(--paper)", cursor:"pointer" }}>
            <Icon name="grid" size={14} />
          </button>
          <button style={{ padding:"5px 8px", border:"1px solid var(--line)", borderRadius:8, background:"var(--paper)", cursor:"pointer" }}>
            <Icon name="note" size={14} />
          </button>
        </div>
      </div>

      {/* 2-column card grid */}
      <div className={layout==="grid"?"file-grid-2":"file-list"}>
        {visible.map((file) => {
          const expStatus = getExpiryStatus(file.expiryDate);
          const expLabel  = expiryLabel(file.expiryDate);
          return (
            <div className="file-card-2" key={file.id}>
              <div className="file-type-2">{fileExt(file.name)}</div>
              <div className="file-info">
                <strong>{file.name}</strong>
                <small>{file.size} · {file.date} · {file.uploader}</small>
                {file.client && <small style={{ color:"var(--teal)" }}>{file.client}</small>}
                {expLabel && (
                  <div style={{ marginTop:5 }}>
                    <span className={`file-expiry ${expStatus === "expired" ? "file-expiry-expired" : ""}`}>
                      {expLabel}
                    </span>
                    {" "}
                    <button className="remind-link">Remind me</button>
                  </div>
                )}
              </div>
              <button
                style={{ border:0, background:"transparent", color:"var(--faint)", fontSize:18, padding:"0 4px", cursor:"pointer", flexShrink:0, alignSelf:"flex-start" }}
                onClick={() => openEdit(file)}
              >···</button>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && <div className="empty-row" style={{ marginTop:24 }}>No files in this view.</div>}

      {/* Upload / edit drawer */}
      {drawer && (
        <DrawerPanel
          title={editId ? "Edit file" : "Upload file"}
          subtitle={pendingFile ? `Uploading: ${pendingFile.name}` : ""}
          onClose={() => { setDrawer(false); setPendingFile(null); }}
          onSubmit={handleSave}
          submitLabel={editId ? "Save changes" : "Upload"}
          width={460}
        >
          {/* Drop zone */}
          {!editId && (
            <div
              onClick={() => picker.current?.click()}
              style={{ border:"1px dashed var(--line)", borderRadius:10, padding:"28px 20px", textAlign:"center", cursor:"pointer", marginBottom:20, color:"var(--muted)" }}>
              <Icon name="folder" size={24} />
              <p style={{ margin:"10px 0 4px", fontWeight:560 }}>Click to choose a file</p>
              <small>PDF, JPG, PNG, DOC, XLSX — up to 10 MB</small>
            </div>
          )}

          <Field label="File name *">
            <input autoFocus style={inputStyle} placeholder="GST Registration Certificate" value={form.name} onChange={set("name")} />
          </Field>

          <Field label="Folder & expiry date" row>
            <select style={{ ...selectStyle, flex:1 }} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input style={{ ...inputStyle, flex:1 }} type="date" value={form.expiryDate} onChange={set("expiryDate")} placeholder="dd-mm-yyyy" />
          </Field>

          <DrawerSection label="DETAILS" />

          <Field label="Uploaded by">
            <ChipGroup options={["Ananya","Abhishek","Karan Mehta","Priya Nair"]} value={form.uploader} onChange={(v) => setForm((p) => ({ ...p, uploader: v }))} />
          </Field>

          <Field label="Note (optional)">
            <input style={inputStyle} placeholder="Add any context for this file…" value={form.notes} onChange={set("notes")} />
          </Field>

          <DrawerSection label="LINK TO A RECORD (OPTIONAL)" />
          <ChipGroup options={["None","Client","Employee","Task"]} value="None" onChange={() => {}} />
        </DrawerPanel>
      )}
    </div>
  );
}

