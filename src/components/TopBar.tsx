import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/authContext";
import { useTheme } from "../Contexts/ThemeContext";
import { supabase } from "../utils/supabase";

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  open: boolean
) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [ref, onOutside, open]);
}

type TopBarProps = {
  onOpenMobileNav?: () => void;
};

const TopBar = ({ onOpenMobileNav }: TopBarProps) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setNotifOpen(false), notifOpen);
  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);
  useClickOutside(themeRef, () => setThemeOpen(false), themeOpen);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setProfileOpen(false);
    await supabase.auth.signOut().catch(() => {});
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
      <div className="flex w-full min-w-0 items-center gap-1 px-2 sm:px-4">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 md:hidden"
          aria-label="Open menu"
          onClick={() => onOpenMobileNav?.()}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => {
            setNotifOpen((o) => !o);
            setProfileOpen(false);
            setThemeOpen(false);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-expanded={notifOpen}
          aria-haspopup="true"
          aria-label="Notifications"
        >
          <span className="relative text-xl leading-none">
            🔔
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#1DB954] ring-2 ring-white dark:ring-gray-900" />
          </span>
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 mt-1 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            role="menu"
          >
            <p className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Notifications
            </p>
            <div className="max-h-72 overflow-y-auto">
              <button
                type="button"
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => navigate("/issues")}
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Vendor requests
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Review pending vendor approvals
                </span>
              </button>
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No new alerts. Connect backend events here later.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme: light / dark / system */}
      <div className="relative" ref={themeRef}>
        <button
          type="button"
          onClick={() => {
            setThemeOpen((o) => !o);
            setNotifOpen(false);
            setProfileOpen(false);
          }}
          className="flex h-10 items-center gap-1 rounded-lg px-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-expanded={themeOpen}
          aria-haspopup="true"
          aria-label="Theme menu"
          title="Appearance"
        >
          {theme === "system" ? (
            <span className="text-lg leading-none" title="Using system theme">
              🖥️
            </span>
          ) : resolvedTheme === "dark" ? (
            <span className="text-lg leading-none">🌙</span>
          ) : (
            <span className="text-lg leading-none">☀️</span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">▾</span>
        </button>

        {themeOpen && (
          <div
            className="absolute right-0 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            role="menu"
          >
            <p className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Appearance
            </p>
            {(
              [
                { id: "light" as const, label: "Light", hint: "White background" },
                { id: "dark" as const, label: "Dark", hint: "Dimmed UI" },
                {
                  id: "system" as const,
                  label: "System",
                  hint: "Match device setting",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="menuitemradio"
                aria-checked={theme === opt.id}
                className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => {
                  setTheme(opt.id);
                  setThemeOpen(false);
                }}
              >
                <span className="mt-0.5 w-4 text-center text-gray-500 dark:text-gray-400">
                  {theme === opt.id ? "✓" : ""}
                </span>
                <span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                    {opt.hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => {
            setProfileOpen((o) => !o);
            setNotifOpen(false);
            setThemeOpen(false);
          }}
          className="flex items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-expanded={profileOpen}
          aria-haspopup="true"
          aria-label="Account menu"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954] text-sm font-bold text-white">
            {initial}
          </span>
          <span className="hidden max-w-[140px] truncate text-left text-sm font-medium text-gray-800 dark:text-gray-200 sm:block">
            {displayName}
          </span>
          <span className="text-gray-400 dark:text-gray-500">▾</span>
        </button>

        {profileOpen && (
          <div
            className="absolute right-0 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            role="menu"
          >
            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              {user?.role && (
                <p className="mt-1 text-xs font-medium uppercase text-[#1DB954]">
                  {String(user.role)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
