// ─────────────────────────────────────────────────────────────
// App.tsx — root component: routing + app shell layout
//
// Structure:
//   Landing page  → shown at /  (before sign-in)
//   App shell     → shown at #app/<page>
//     Sidebar     → left navigation
//     <Page>      → one of 13 modules rendered in <main>
//     AskEnkel    → floating assistant button (bottom-right)
//
// Navigation is hash-based: #app/home, #app/clients, etc.
// All module state is persisted to localStorage via useStoredState.
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { Icon, Logo } from "./components/ui";
import Sidebar  from "./components/Sidebar";
import Landing  from "./components/Landing";
import { Page } from "./types";

// ── Page imports ──────────────────────────────────────────────
import Home       from "./pages/Home";
import Reminders  from "./pages/Reminders";
import Clients    from "./pages/Clients";
import Leads      from "./pages/Leads";
import Tasks      from "./pages/Tasks";
import Catalogue  from "./pages/Catalogue";
import Creative   from "./pages/Creative";
import Notes      from "./pages/Notes";
import HR         from "./pages/HR";
import Attendance from "./pages/Attendance";
import Sales      from "./pages/Sales";
import Expenses   from "./pages/Expenses";
import Files      from "./pages/Files";

// ── URL slug helpers ──────────────────────────────────────────
// Converts a page name to a URL slug: "Design & Creative" → "design-creative"
const toSlug = (page: Page) =>
  page.toLowerCase().replaceAll(" & ", "-").replaceAll(" / ", "-").replaceAll(" ", "-");

// Reads the current hash and returns the matching Page (defaults to Home)
const pageFromHash = (): Page => {
  const slug = window.location.hash.replace("#app/", "");
  const pages: Page[] = [
    "Home", "Reminders", "Clients", "Leads", "Tasks",
    "Catalogue", "Design & Creative", "Notes / Ideas",
    "HR", "Attendance", "Sales", "Expenses", "Files",
  ];
  return pages.find((p) => toSlug(p) === slug) ?? "Home";
};

// ── App ───────────────────────────────────────────────────────
export default function App() {
  // inApp = whether the user has passed the landing page
  const [inApp,    setInApp]    = useState(() => window.location.hash.startsWith("#app/"));
  const [page,     setPage]     = useState<Page>(() => pageFromHash());
  const [menuOpen, setMenuOpen] = useState(false); // mobile sidebar drawer

  // Navigate to a page: update state + URL hash + scroll to top
  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    window.history.pushState({}, "", `#app/${toSlug(nextPage)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Enter the app from the landing page
  const enterApp = () => {
    setInApp(true);
    setPage("Home");
    window.history.pushState({}, "", "#app/home");
  };

  // Keep state in sync with browser back/forward
  useEffect(() => {
    const sync = () => {
      const isApp = window.location.hash.startsWith("#app/");
      setInApp(isApp);
      if (isApp) setPage(pageFromHash());
    };
    window.addEventListener("popstate",   sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate",   sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  // Map each page name to its component (memoized — re-renders only when page changes)
  const content = useMemo(() => {
    const pages: Record<Page, React.ReactNode> = {
      "Home":             <Home />,
      "Reminders":        <Reminders />,
      "Clients":          <Clients />,
      "Leads":            <Leads />,
      "Tasks":            <Tasks />,
      "Catalogue":        <Catalogue />,
      "Design & Creative":<Creative />,
      "Notes / Ideas":    <Notes />,
      "HR":               <HR />,
      "Attendance":       <Attendance />,
      "Sales":            <Sales />,
      "Expenses":         <Expenses />,
      "Files":            <Files />,
    };
    return pages[page];
  }, [page]);

  // Show landing page if not in the app yet
  if (!inApp) return <Landing enterApp={enterApp} />;

  return (
    <div className="app-shell">
      {/* Left sidebar navigation */}
      <Sidebar
        page={page}
        setPage={navigate}
        open={menuOpen}
        close={() => setMenuOpen(false)}
      />

      {/* Mobile: scrim behind open sidebar */}
      {menuOpen && (
        <button
          className="sidebar-scrim"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Mobile: top bar with hamburger + logo */}
      <div className="mobile-bar">
        <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <Logo />
        <span className="avatar avatar-teal">N</span>
      </div>

      {/* Main content area */}
      <main>{content}</main>
    </div>
  );
}
