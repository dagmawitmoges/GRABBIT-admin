import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/vendors", label: "Vendors", icon: "🏪" },
  { to: "/deals", label: "Deals", icon: "🏷️" },
  { to: "/users", label: "Users", icon: "👥" },
  { to: "/issues", label: "Issues", icon: "🚨" },
];

const Sidebar = () => (
  <div className="flex h-full min-h-screen w-[220px] shrink-0 flex-col bg-gray-100 px-4 py-6 text-gray-900 dark:bg-[#1A1F2E] dark:text-white">
    <div className="mb-8 flex items-center gap-2.5">
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
      <span className="text-xl font-extrabold tracking-tight">Grabbit</span>
    </div>

    <p className="mb-2 pl-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-[#5A6478]">
      MENU
    </p>

    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-semibold no-underline transition-colors",
              isActive
                ? "bg-white text-[#1DB954] shadow-sm ring-1 ring-gray-200 dark:bg-[#252B3B] dark:text-[#1DB954] dark:ring-0"
                : "text-gray-600 hover:bg-white/80 hover:text-gray-900 dark:text-[#8A93A8] dark:hover:bg-[#252B3B]/60 dark:hover:text-gray-200",
            ].join(" ")
          }
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
        className={({ isActive }) =>
          [
            "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-semibold no-underline transition-colors",
            isActive
              ? "bg-white text-[#1DB954] shadow-sm ring-1 ring-gray-200 dark:bg-[#252B3B] dark:text-[#1DB954] dark:ring-0"
              : "text-gray-600 hover:bg-white/80 hover:text-gray-900 dark:text-[#8A93A8] dark:hover:bg-[#252B3B]/60 dark:hover:text-gray-200",
          ].join(" ")
        }
      >
        <span className="text-lg leading-none">⚙️</span>
        Settings
      </NavLink>
    </div>
  </div>
);

export default Sidebar;
