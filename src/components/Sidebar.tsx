import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/vendors", label: "Vendors", icon: "🏪" },
  { to: "/deals", label: "Deals", icon: "🏷️" },
  { to: "/users", label: "Users", icon: "👥" },
  { to: "/issues", label: "Issues", icon: "🚨" },
];

type Props = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const linkClass = (isActive: boolean) =>
  [
    "flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-semibold no-underline transition-colors",
    isActive
      ? "bg-white text-[#1DB954] shadow-sm ring-1 ring-gray-200 dark:bg-[#252B3B] dark:text-[#1DB954] dark:ring-0"
      : "text-gray-600 hover:bg-white/80 hover:text-gray-900 dark:text-[#8A93A8] dark:hover:bg-[#252B3B]/60 dark:hover:text-gray-200",
  ].join(" ");

const Sidebar = ({ mobileOpen, onCloseMobile }: Props) => (
  <>
    <button
      type="button"
      aria-label="Close menu"
      className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity md:hidden ${
        mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onCloseMobile}
    />

    <aside
      className={[
        "flex h-full max-h-[100dvh] min-h-screen w-[min(280px,88vw)] shrink-0 flex-col overflow-y-auto bg-gray-100 px-4 py-6 text-gray-900 dark:bg-[#1A1F2E] dark:text-white",
        "border-r border-gray-200 dark:border-[#252B3B] md:border-r-0",
        "fixed left-0 top-0 z-50 transition-transform duration-200 ease-out md:static md:z-0 md:max-h-none md:w-[220px] md:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      <div className="mb-6 flex items-center justify-between gap-2 md:mb-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DB954] shadow-[0_4px_12px_rgba(29,185,84,0.4)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22V12h6v10"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="truncate text-xl font-extrabold tracking-tight">
            Grabbit
          </span>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-[#252B3B] md:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>

      <p className="mb-2 pl-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-[#5A6478]">
        MENU
      </p>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onCloseMobile()}
            className={({ isActive }) => linkClass(isActive)}
          >
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="min-h-4 flex-1" aria-hidden />

      <div className="-mx-1 border-t border-gray-200 pt-3 dark:border-[#252B3B]">
        <NavLink
          to="/settings"
          onClick={() => onCloseMobile()}
          className={({ isActive }) => linkClass(isActive)}
        >
          <span className="text-lg leading-none">⚙️</span>
          Settings
        </NavLink>
      </div>
    </aside>
  </>
);

export default Sidebar;
