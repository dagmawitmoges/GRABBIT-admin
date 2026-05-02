import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { AuthContext } from "../Contexts/authContext";

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
        .from("users")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // 🚫 3. ONLY ADMIN ALLOWED
      if (profile.role?.toLowerCase() !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Only admin accounts can log in.");
      }

      // 💾 4. SAVE SESSION
      login({
        accessToken: data.session?.access_token,
        user: {
          id: user.id,
          email: user.email,
          role: profile.role,
          full_name: profile.full_name,
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
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Admin Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  </div>
);
};

export default Login;