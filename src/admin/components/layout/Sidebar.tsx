import { NavLink } from "react-router-dom";
import { Logomark } from "@/shared/theme/Logomark";

/**
 * Nav destinations don't all exist yet — DB Management (F5), Pages (F6),
 * Brand (F7), SEO (F7), and Commerce (F8) land in later parts. The slots
 * are wired now so those parts only need to add a route, not touch nav.
 */
const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "DB Management", to: "/admin/db-management" },
  { label: "Pages", to: "/admin/pages" },
  { label: "Brand", to: "/admin/brand" },
  { label: "SEO", to: "/admin/seo" },
  { label: "Commerce", to: "/admin/commerce" },
] as const;

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-paper">
      <div className="flex items-center gap-3 border-b border-line px-5 py-5">
        <Logomark variant="dark-on-light" size={26} />
        <div className="leading-none">
          <p className="font-display text-sm font-semibold tracking-tight text-ink">Kekal Living</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Admin</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-2.5 px-2.5 py-2 font-body text-sm transition-colors",
                isActive ? "text-ink" : "text-muted hover:text-ink",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={["h-1.5 w-1.5 shrink-0", isActive ? "bg-ink" : "bg-transparent"].join(" ")}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
