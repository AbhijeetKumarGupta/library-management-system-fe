import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Repeat2,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/cards", label: "Library Cards", icon: CreditCard },
  { to: "/transactions", label: "Transactions", icon: Repeat2 },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-text"
            }`
          }
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <BookOpen className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Library</p>
                <p className="text-xs text-text-muted">Management Portal</p>
              </div>
            </div>
          </div>
          <NavItems />
          <div className="mt-auto rounded-xl bg-brand-50 p-4 text-xs text-brand-800">
            Connected to Spring Boot API at{" "}
            <code className="font-mono">/api/v1</code>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-semibold text-text">Menu</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-surface-muted"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <p className="text-sm font-semibold text-text">
              Library Management
            </p>
            <div className="size-9" />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
