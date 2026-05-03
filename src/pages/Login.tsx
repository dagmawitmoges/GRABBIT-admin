import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { AuthContext } from "../Contexts/authContext";
import { adminUi } from "../constants/adminUi";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 1. LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("Login failed");

      // 👤 2. GET ROLE
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name, first_name, last_name, phone, email")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // 🚫 3. ONLY ADMIN ALLOWED (user_role enum, e.g. ADMIN)
      if (String(profile.role).toLowerCase() !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Only admin accounts can log in.");
      }

      // 💾 4. SAVE SESSION
      login({
        accessToken: data.session?.access_token,
        user: {
          id: user.id,
          email: profile.email ?? user.email ?? "",
          role: profile.role,
          full_name: profile.full_name ?? undefined,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        },
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
    <div className={`w-full max-w-md ${adminUi.card}`}>

      <h2 className={`${adminUi.h1} text-center mb-1`}>
        Admin login
      </h2>
      <p className={`${adminUi.subtitle} text-center mb-6`}>
        Grabbit admin console
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className={adminUi.label}>Email</label>
          <input
            className={adminUi.input}
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className={adminUi.label}>Password</label>
          <input
            className={adminUi.input}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className={`${adminUi.errorText} text-center`}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${adminUi.primaryBtn} w-full`}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

      </form>
    </div>
  </div>
);
};

export default Login;