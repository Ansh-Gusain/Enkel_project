// ─────────────────────────────────────────────────────────────
// Expenses.tsx — Owner/My view toggle (actually filters),
//                icon row actions all wired, GST fields
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { Button, Icon, Metric, PageHeader, Search } from "../components/ui";
import { ChipGroup, DrawerPanel, DrawerSection, Field, inputStyle, selectStyle, textareaStyle } from "../components/DrawerPanel";
import { useStoredState } from "../hooks/useStoredState";

const CURRENT_USER = "Karan Mehta";

const seed = [
  { date:"Aug 15", name:"Client dinner · Cafe Turmeric",             category:"Client Entertainment", paidBy:"Business",    client:"Kalyan Foods",  amount:3400,  status:"Paid",           billable:true,  gst:0,  method:"Card" },
  { date:"Aug 14", name:"Workspace subscription · Google Workspace", category:"SaaS / Software",      paidBy:"Business",    client:"",              amount:1850,  status:"Paid",           billable:false, gst:18, method:"Card" },
  { date:"Aug 13", name:"Cab to client meeting · Uber",              category:"Travel",               paidBy:"Karan Mehta", client:"Wavelength FM", amount:620,   status:"Pending review", billable:true,  gst:5,  method:"Cash" },
  { date:"Aug 12", name:"Office stationery · Office Bazaar",         category:"Office Supplies",      paidBy:"Business",    client:"",              amount:940,   status:"Paid",           billable:false, gst:12, method:"Card" },
  { date:"Aug 5",  name:"Printer cartridge",                         category:"Office Supplies",      paidBy:"Priya Nair",  client:"",              amount:1200,  status:"Pending review", billable:false, gst:12, method:"Card" },
  { date:"Jul 28", name:"Vendor retainer · Design work",             category:"Professional Services",paidBy:"Business",    client:"",              amount:12000, status:"Unpaid",         billable:false, gst:18, method:"NEFT" },
  { date:"Aug 1",  name:"Coworking space · WeWork",                  category:"Office Rent",          paidBy:"Karan Mehta", client:"Meridian Labs",  amount:800,   status:"Reimbursed",     billable:true,  gst:18, method:"Cash" },
  { date:"Jul 20", name:"Creative tools · Figma",                    category:"SaaS / Software",      paidBy:"Business",    client:"",              amount:4300,  status:"Paid",           billable:false, gst:18, method:"Card" },
];

type Expense = { id:string; date:string; name:string; category:string; paidBy:string; client:string; amount:number; status:string; billable:boolean; gst:number; method:string; notes:string; };
const blank = (): Omit<Expense,"id"> => ({
  date: new Date().toISOString().slice(0,10), name:"", category:"", paidBy:"Business",
  client:"", amount:0, status:"Pending review", billable:false, gst:0, method:"Cash", notes:"",
});
const CATEGORIES  = ["Client Entertainment","SaaS / Software","Travel","Office Supplies","Office Rent","Professional Services","Utilities","Marketing","Other"];
const GST_RATES   = ["0%","5%","12%","18%","28%"];
const TEAM_MEMBERS = ["Business","Ananya Desai","Abhishek","Karan Mehta","Priya Nair"];

function ExpIcon({ icon, danger, title, onClick }: { icon:string; danger?:boolean; title?:string; onClick():void }) {
  return <button className={`exp-action-btn ${danger?"danger":""}`} onClick={onClick} title={title} aria-label={title}><Icon name={icon} size={14}/></button>;
}

export default function Expenses() {
  const [q, setQ]               = useState("");
  const [ownerView, setOwnerView] = useState(true);
  const [activeTab, setActiveTab] = useState("All Expenses");
  const [viewingId, setViewingId] = useState<string|null>(null);

  const [records, setRecords] = useStoredState<Expense[]>("expenses", seed.map((e,i) => ({ id:`expense-${i}`, ...e, notes:"" })));
  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm]     = useState(blank());
  const picker = useRef<HTMLInputElement>(null);

  const set = (f: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: f==="amount"||f==="gst" ? Number(e.target.value) : e.target.value }));

  const openAdd  = () => { setForm(blank()); setEditId(null); setDrawer(true); };
  const openEdit = (r: Expense) => { setForm({ date:r.date,name:r.name,category:r.category,paidBy:r.paidBy,client:r.client,amount:r.amount,status:r.status,billable:r.billable,gst:r.gst,method:r.method,notes:r.notes }); setEditId(r.id); setDrawer(true); };
  const duplicate = (r: Expense) => setRecords((cur) => [{ ...r, id:`expense-${Date.now()}`, date:new Date().toISOString().slice(0,10) }, ...cur]);

  const handleSave = () => {
    if (!form.name.trim()||!form.amount) return;
    if (editId) setRecords((cur) => cur.map((r) => r.id===editId ? { ...r,...form } : r));
    else setRecords((cur) => [{ id:`expense-${Date.now()}`, ...form }, ...cur]);
    setDrawer(false);
  };

  const exportCsv = () => {
    const rows = ["Date,Expense,Paid by,Amount,Status",...records.map((r)=>[r.date,`"${r.name}"`,r.paidBy,r.amount,r.status].join(","))].join("\n");
    const link = document.createElement("a"); link.href=URL.createObjectURL(new Blob([rows],{type:"text/csv"})); link.download="enkel-expenses.csv"; link.click(); URL.revokeObjectURL(link.href);
  };

  const total    = records.reduce((s,r)=>s+r.amount,0);
  const pending  = records.filter((r)=>r.status!=="Paid"&&r.status!=="Reimbursed").reduce((s,r)=>s+r.amount,0);
  const billable = records.filter((r)=>r.billable).reduce((s,r)=>s+r.amount,0);
  const needsAttn = records.filter((r)=>r.status==="Pending review"||r.status==="Unpaid");

  const filtered = records
    .filter((r) => !ownerView ? r.paidBy===CURRENT_USER : true)
    .filter((r) => `${r.name} ${r.paidBy} ${r.status} ${r.client}`.toLowerCase().includes(q.toLowerCase()))
    .filter((r) => {
      if (activeTab==="All Expenses") return true;
      if (activeTab==="Needs Attention") return r.status==="Pending review"||r.status==="Unpaid";
      if (activeTab==="Reimbursements")  return r.paidBy!=="Business";
      return true;
    });

  const tabs = [
    { label:`All Expenses ${records.length}`,                                                     key:"All Expenses"    },
    { label:`Needs Attention ${needsAttn.length}`,                                                 key:"Needs Attention" },
    { label:`Reimbursements ${records.filter((r)=>r.paidBy!=="Business").length}`,                key:"Reimbursements"  },
    { label:"Recurring 5",                                                                          key:"Recurring"       },
    { label:"Reports",                                                                              key:"Reports"         },
  ];

  const viewingRecord = viewingId ? records.find((r)=>r.id===viewingId) : null;

  return (
    <div className="page">
      <PageHeader
        kicker="EXPENSES · Northline Studio"
        title="Track spend"
        description="See what the business has spent, find any expense, and act on what needs attention."
        action={
          <div className="header-actions">
            <div className="mode-switch">
              <button className={ownerView?"active":""} onClick={()=>setOwnerView(true)}>Owner view</button>
              <button className={!ownerView?"active":""} onClick={()=>setOwnerView(false)}>My expenses</button>
            </div>
            <Button onClick={openAdd}><Icon name="plus" size={15}/> New expense</Button>
          </div>
        }
      />
      <div className="metrics metrics-4">
        <Metric value={`₹${total.toLocaleString("en-IN")}`}    label="Spent this month"/>
        <Metric value={`₹${pending.toLocaleString("en-IN")}`}  label="Pending reimbursements" tone="amber"/>
        <Metric value={`₹${billable.toLocaleString("en-IN")}`} label="Billable expenses"/>
        <Metric value="₹38,999/mo"                              label="Upcoming recurring"/>
      </div>
      <div className="tabs">
        {tabs.map((t)=><button key={t.key} className={activeTab===t.key?"active":""} onClick={()=>setActiveTab(t.key)}>{t.label}</button>)}
      </div>
      <h2 style={{marginBottom:8}}>{ownerView?"All expenses":`My expenses (${CURRENT_USER})`}</h2>
      <p className="subtle" style={{margin:"0 0 14px"}}>Every expense logged this month, newest first.</p>
      <div className="toolbar">
        <Search placeholder="Search vendor, client, employee, note" value={q} onChange={setQ}/>
        <Button variant="secondary" onClick={exportCsv}>↑ Export</Button>
      </div>

      {viewingRecord && (
        <div style={{border:"1px solid var(--line)",borderRadius:10,padding:20,marginBottom:16,background:"var(--soft)",position:"relative"}}>
          <button onClick={()=>setViewingId(null)} style={{position:"absolute",top:12,right:12,border:0,background:"transparent",cursor:"pointer",color:"var(--muted)",fontSize:18}}>×</button>
          <p className="eyebrow" style={{marginBottom:8}}>EXPENSE DETAIL</p>
          <strong style={{fontSize:15}}>{viewingRecord.name}</strong>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12,fontSize:13}}>
            {[["Date",viewingRecord.date],["Amount",`₹${viewingRecord.amount.toLocaleString("en-IN")}`],["Status",viewingRecord.status],["Paid by",viewingRecord.paidBy],["Category",viewingRecord.category],["Method",viewingRecord.method]].map(([l,v])=>(
              <div key={l}><span style={{color:"var(--muted)"}}>{l}</span><br/><strong>{v}</strong></div>
            ))}
            {viewingRecord.notes&&<div style={{gridColumn:"1/-1"}}><span style={{color:"var(--muted)"}}>Notes</span><br/><strong>{viewingRecord.notes}</strong></div>}
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>DATE</th><th>EXPENSE</th><th>PAID BY</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead>
          <tbody>
            {filtered.map((r)=>(
              <tr key={r.id}>
                <td style={{color:"var(--muted)",fontSize:12}}>{r.date}</td>
                <td>
                  <div style={{fontWeight:500}}>{r.name}</div>
                  <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                    <span className="tag">{r.category}</span>
                    {r.client&&<span className="tag" style={{color:"var(--teal)"}}>{r.client}</span>}
                    {r.billable&&<span className="tag" style={{color:"var(--teal)"}}>Billable</span>}
                  </div>
                </td>
                <td>
                  {r.paidBy==="Business"
                    ? <span style={{fontSize:13}}>{r.paidBy}</span>
                    : <div style={{display:"flex",alignItems:"center",gap:6}}><span className="owner-chip" title={r.paidBy}>{r.paidBy.split(" ").map((n)=>n[0]).join("").slice(0,2)}</span><span style={{fontSize:13}}>{r.paidBy}</span></div>
                  }
                </td>
                <td><strong>₹{r.amount.toLocaleString("en-IN")}</strong></td>
                <td>
                  <span className={`status ${r.status==="Paid"||r.status==="Reimbursed"?"status-good":r.status==="Unpaid"?"status-danger":"status-warn"}`}>{r.status}</span>
                  {r.status==="Pending review"&&<span className="overdue-text">Pending reimbursement</span>}
                </td>
                <td>
                  <div className="exp-actions">
                    <ExpIcon icon="search" title="View details" onClick={()=>setViewingId(viewingId===r.id?null:r.id)}/>
                    <ExpIcon icon="plus"   title="Edit"          onClick={()=>openEdit(r)}/>
                    <ExpIcon icon="arrow"  title="Duplicate"     onClick={()=>duplicate(r)}/>
                    {r.status!=="Paid"&&r.status!=="Reimbursed"
                      ? <ExpIcon icon="x" danger title="Delete" onClick={()=>window.confirm("Delete this expense?")&&setRecords((cur)=>cur.filter((x)=>x.id!==r.id))}/>
                      : <span style={{fontSize:10,color:"var(--faint)",padding:"0 4px"}}>Locked</span>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <input ref={picker} className="hidden-input" type="file" accept="image/*,.pdf" onChange={()=>{}}/>

      {drawer&&(
        <DrawerPanel title={editId?"Edit expense":"New expense"} subtitle="NEW EXPENSE" onClose={()=>setDrawer(false)} onSubmit={handleSave} submitLabel="Save expense" width={480}>
          <div onClick={()=>picker.current?.click()} style={{border:"1px dashed var(--line)",borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",marginBottom:20,color:"var(--muted)",fontSize:13}}>
            <Icon name="folder" size={20}/><p style={{margin:"8px 0 0"}}>Attach a receipt (optional)</p>
            <small>Drag a photo or PDF here, or <span style={{color:"var(--orange)"}}>browse</span></small>
          </div>
          <Field label="Amount (₹) *"><input autoFocus style={{...inputStyle,fontSize:18,height:52}} placeholder="₹ 0" type="number" value={form.amount||""} onChange={set("amount")}/></Field>
          <Field label="Date & category" row>
            <input style={{...inputStyle,flex:1}} type="date" value={form.date} onChange={set("date")}/>
            <select style={{...selectStyle,flex:1}} value={form.category} onChange={set("category")}>
              <option value="">Select category</option>
              {CATEGORIES.map((c)=><option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Vendor / payee"><input style={inputStyle} placeholder='e.g. "Adobe"' value={form.name} onChange={set("name")}/></Field>
          <Field label="Paid by"><ChipGroup options={TEAM_MEMBERS} value={form.paidBy} onChange={(v)=>setForm((p)=>({...p,paidBy:v}))}/></Field>
          <DrawerSection label="BUSINESS CONTEXT"/>
          <Field label="Client / project"><input style={inputStyle} placeholder="Search clients…" value={form.client} onChange={set("client")}/></Field>
          <Field label=""><label style={{display:"flex",alignItems:"center",gap:10,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={form.billable} onChange={(e)=>setForm((p)=>({...p,billable:e.target.checked}))}/> Billable to client</label></Field>
          <Field label="Payment method"><select style={selectStyle} value={form.method} onChange={set("method")}>{["Cash","Card","UPI","NEFT","Cheque"].map((m)=><option key={m}>{m}</option>)}</select></Field>
          <DrawerSection label="TAX / GST"/>
          <Field label="GST rate & tax amount" row>
            <select style={{...selectStyle,flex:1}} value={`${form.gst}%`} onChange={(e)=>setForm((p)=>({...p,gst:Number(e.target.value.replace("%",""))}))}>{GST_RATES.map((r)=><option key={r}>{r}</option>)}</select>
            <input style={{...inputStyle,flex:1,background:"var(--soft)",color:"var(--muted)"}} readOnly value={form.gst>0?`₹${Math.round(form.amount*form.gst/100).toLocaleString("en-IN")}`:"—"}/>
          </Field>
          <DrawerSection label="STATUS"/>
          <Field label=""><select style={selectStyle} value={form.status} onChange={set("status")}>{["Pending review","Paid","Unpaid","Reimbursed"].map((s)=><option key={s}>{s}</option>)}</select></Field>
          <DrawerSection label="NOTES"/>
          <textarea style={textareaStyle} placeholder="Internal note…" value={form.notes} onChange={set("notes")}/>
        </DrawerPanel>
      )}
    </div>
  );
}
