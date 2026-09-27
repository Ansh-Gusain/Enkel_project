// ─────────────────────────────────────────────────────────────
// Sidebar.tsx — left navigation sidebar
// ─────────────────────────────────────────────────────────────
import { Icon, Logo } from "./ui";
import { Page } from "../types";

// Navigation items: page name + icon key
const nav: { page: Page; icon: string }[] = [
  { page: "Home",            icon: "home"    },
  { page: "Reminders",       icon: "clock"   },
  { page: "Clients",         icon: "user"    },
  { page: "Leads",           icon: "chart"   },
  { page: "Tasks",           icon: "check"   },
  { page: "Catalogue",       icon: "grid"    },
  { page: "Design & Creative", icon: "spark" },
  { page: "Notes / Ideas",   icon: "note"    },
  { page: "HR",              icon: "users"   },
  { page: "Attendance",      icon: "scan"    },
  { page: "Sales",           icon: "receipt" },
  { page: "Expenses",        icon: "wallet"  },
  { page: "Files",           icon: "folder"  },
];

type SidebarProps = {
  page: Page;
  setPage: (p: Page) => void;
  open: boolean;     // mobile: whether drawer is visible
  close: () => void; // mobile: close the drawer
};

export default function Sidebar({ page, setPage, open, close }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      {/* Logo + mobile close button */}
      <div className="side-top">
        <Logo />
        <button className="mobile-close" onClick={close} aria-label="Close menu">
          <Icon name="x" />
        </button>
      </div>

      {/* Workspace switcher */}
      <button className="workspace">
        <span className="avatar avatar-teal">N</span>
        <span>
          <strong>Northline Studio</strong>
          <small>SOFTWARE AGENCY</small>
        </span>
        <span className="chevron">⌄</span>
      </button>

      <p className="eyebrow side-label">MODULES</p>

      {/* Navigation links */}
      <nav>
        {nav.map((item) => (
          <button
            key={item.page}
            className={[
              "nav-item",
              page === item.page ? "active" : "",
              item.page === "Attendance" ? "attendance-nav" : "",
            ].join(" ")}
            onClick={() => { setPage(item.page); close(); }}
          >
            <Icon name={item.icon} />
            <span>{item.page}</span>
            {item.page === "Attendance" && (
              <span className="new-badge">NEW</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
