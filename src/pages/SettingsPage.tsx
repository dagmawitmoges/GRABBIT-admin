import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/authContext";
import { useTheme, type ThemePreference } from "../Contexts/ThemeContext";
import { adminUi } from "../constants/adminUi";
import { supabase } from "../utils/supabase";

const supabaseHost = (() => {
  try {
    const u = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!u) return "Not configured";
    return new URL(u).host;
  } catch {
    return import.meta.env.VITE_SUPABASE_URL || "Not configured";
  }
})();

const themeOptions: {
  id: ThemePreference;
  label: string;
  description: string;
}[] = [
  { id: "light", label: "Light", description: "Bright background, best in daylight." },
  { id: "dark", label: "Dark", description: "Easier on the eyes in low light." },
  {
    id: "system",
    label: "System",
    description: "Follows your device light or dark mode.",
  },
];

function splitDisplayName(name: string): {
  first_name: string | null;
  last_name: string | null;
} {
  const t = name.trim();
  if (!t) return { first_name: null, last_name: null };
  const i = t.indexOf(" ");
  if (i === -1) return { first_name: t, last_name: null };
  return {
    first_name: t.slice(0, i).trim() || null,
    last_name: t.slice(i + 1).trim() || null,
  };
}

const SettingsPage = () => {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const applyUserToForm = useCallback(() => {
    if (!user) return;
    const fn = user.first_name?.trim() ?? "";
    const ln = user.last_name?.trim() ?? "";
    if (fn || ln) {
      setFirstName(fn);
      setLastName(ln);
    } else if (user.full_name?.trim()) {
      const { first_name, last_name } = splitDisplayName(user.full_name);
      setFirstName(first_name ?? "");
      setLastName(last_name ?? "");
    } else {
      setFirstName("");
      setLastName("");
    }
    setPhone(user.phone?.trim() ?? "");
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoadErr(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, full_name")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      if (error) {
        setLoadErr(error.message);
        applyUserToForm();
        return;
      }
      if (data) {
        const fn = (data.first_name as string | null)?.trim() ?? "";
        const ln = (data.last_name as string | null)?.trim() ?? "";
        if (fn || ln) {
          setFirstName(fn);
          setLastName(ln);
        } else {
          const sp = splitDisplayName(String(data.full_name ?? ""));
          setFirstName(sp.first_name ?? "");
          setLastName(sp.last_name ?? "");
        }
        setPhone((data.phone as string | null)?.trim() ?? "");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.full_name, user?.first_name, user?.last_name, user?.phone, applyUserToForm]);

  const handleSignOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    logout();
    navigate("/login", { replace: true });
  };

  const validate = () => {
    const p = phone.replace(/\s/g, "");
    if (p && !/^\+?[0-9]{7,15}$/.test(p)) {
      return "Phone must be 7–15 digits, optional leading +.";
    }
    return null;
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    const v = validate();
    if (v) {
      setSaveErr(v);
      setSaveOk(false);
      return;
    }

    setSaving(true);
    setSaveErr(null);
    setSaveOk(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        phone: phone.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setSaveErr(error.message);
      return;
    }

    await refreshUser();
    setSaveOk(true);
    setEditing(false);
    setTimeout(() => setSaveOk(false), 4000);
  };

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    user?.full_name?.trim() ||
    "—";

  return (
    <div className={adminUi.contentWide}>
      <div className="mb-8">
        <h1 className={adminUi.h1}>Settings</h1>
        <p className={adminUi.subtitle}>
          Appearance, account, and connection details for this admin console.
        </p>
      </div>

      <section className={`${adminUi.card} mb-6`}>
        <h2 className={adminUi.sectionTitle}>Appearance</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Current look:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {resolvedTheme === "dark" ? "Dark" : "Light"}
          </span>
          {theme === "system" && (
            <span className="text-gray-500 dark:text-gray-500">
              {" "}
              (from system)
            </span>
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                theme === opt.id
                  ? "border-[#1DB954] bg-[#1DB954]/10 ring-2 ring-[#1DB954]/30"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <span className="block font-semibold text-gray-900 dark:text-gray-100">
                {opt.label}
                {theme === opt.id && (
                  <span className="ml-2 text-[#1DB954]">✓</span>
                )}
              </span>
              <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={`${adminUi.card} mb-6`}>
        <h2 className={adminUi.sectionTitle}>Account</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Update how your name and phone appear in this admin app. Your
          profile row is stored in Supabase{" "}
          <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">
            profiles
          </code>
          ; generated display names in the database update from first and last
          name when configured.
        </p>

        {loadErr && (
          <div className={`${adminUi.globalError} mb-4`} role="alert">
            {loadErr}
          </div>
        )}
        {saveErr && (
          <div className={`${adminUi.globalError} mb-4`} role="alert">
            {saveErr}
          </div>
        )}
        {saveOk && (
          <div
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            role="status"
          >
            Profile saved.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={adminUi.label}>Email</span>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
              {user?.email ?? "—"}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              To change email, use Supabase Auth or your account recovery flow.
            </p>
          </div>
          <div>
            <span className={adminUi.label}>Role</span>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium uppercase text-[#1DB954] dark:border-gray-700 dark:bg-gray-950">
              {user?.role ? String(user.role) : "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={adminUi.label} htmlFor="settings-first">
              First name
            </label>
            <input
              id="settings-first"
              disabled={!editing}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`${adminUi.input} ${!editing ? "bg-gray-50 dark:bg-gray-900" : ""}`}
            />
          </div>
          <div>
            <label className={adminUi.label} htmlFor="settings-last">
              Last name
            </label>
            <input
              id="settings-last"
              disabled={!editing}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`${adminUi.input} ${!editing ? "bg-gray-50 dark:bg-gray-900" : ""}`}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={adminUi.label} htmlFor="settings-phone">
            Phone
          </label>
          <input
            id="settings-phone"
            disabled={!editing}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251… or local digits"
            className={`${adminUi.input} ${!editing ? "bg-gray-50 dark:bg-gray-900" : ""}`}
          />
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Preview name:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {displayName}
          </span>
        </p>

        <div className={`${adminUi.toolbarRow} mt-6 flex-wrap border-t border-gray-100 pt-6 dark:border-gray-800`}>
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setSaveErr(null);
                applyUserToForm();
              }}
              className={adminUi.primaryBtn}
            >
              Edit profile
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  applyUserToForm();
                  setSaveErr(null);
                }}
                className={adminUi.secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveProfile()}
                className={adminUi.primaryBtn}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
          <button
            type="button"
            onClick={handleSignOut}
            className={adminUi.secondaryBtn}
          >
            Sign out
          </button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Ends your session on this device. You will need to log in again.
          </p>
        </div>
      </section>

      <section className={`${adminUi.card} mb-12`}>
        <h2 className={adminUi.sectionTitle}>Backend</h2>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          This app talks to your Supabase project (URL is public; keys stay in
          env).
        </p>
        <div className="rounded-lg bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 dark:bg-gray-950 dark:text-gray-200">
          {supabaseHost}
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
