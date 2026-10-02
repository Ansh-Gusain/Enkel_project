import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// ── Data migration ────────────────────────────────────────────
// v2 changed the shape of employees and clients records.
// If the stored data is the old shape, wipe it so the new seed
// loads correctly. A version flag prevents this running twice.
const MIGRATION_KEY = 'enkel:data-version';
const CURRENT_VERSION = 2;

const storedVersion = Number(localStorage.getItem(MIGRATION_KEY) ?? '0');
if (storedVersion < CURRENT_VERSION) {
  // employees: old shape had { id, name, role, status, joined }
  const rawEmp = localStorage.getItem('enkel:employees');
  if (rawEmp) {
    try {
      const arr = JSON.parse(rawEmp) as Record<string, unknown>[];
      if (arr.length > 0 && !arr[0].firstName) {
        localStorage.removeItem('enkel:employees');
      }
    } catch { localStorage.removeItem('enkel:employees'); }
  }

  // clients: old shape had tags as a "·"-joined string, not an array
  const rawCli = localStorage.getItem('enkel:clients');
  if (rawCli) {
    try {
      const arr = JSON.parse(rawCli) as Record<string, unknown>[];
      if (arr.length > 0 && !Array.isArray(arr[0].tags)) {
        localStorage.removeItem('enkel:clients');
      }
    } catch { localStorage.removeItem('enkel:clients'); }
  }

  localStorage.setItem(MIGRATION_KEY, String(CURRENT_VERSION));
}
// ─────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
