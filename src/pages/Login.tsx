import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { AuthContext } from "../Contexts/authContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.user.role?.toLowerCase() !== "admin") {
        setError("Only admin accounts can log in.");
        return;
      }
      login(res.data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.logoText}>Grabbit</span>
        </div>

        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>Sign in to manage your platform</p>

        {error && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: 14 }}>⚠ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="admin@grabbit.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              onFocus={e => (e.target.style.borderColor = "#1DB954")}
              onBlur={e => (e.target.style.borderColor = "#E2E8E2")}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...styles.input, paddingRight: 44 }}
                onFocus={e => (e.target.style.borderColor = "#1DB954")}
                onBlur={e => (e.target.style.borderColor = "#E2E8E2")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={styles.eyeBtn}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
            onMouseEnter={e => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = "#17a347")}
            onMouseLeave={e => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = "#1DB954")}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F8F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: "#1DB954",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(29,185,84,0.35)",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0F1F0F",
    letterSpacing: "-0.5px",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0F1F0F",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7C6B",
    margin: "0 0 24px",
  },
  errorBox: {
    background: "#FFF0F0",
    border: "1px solid #FFCDD2",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#C62828",
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#3A4F3A",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #E2E8E2",
    borderRadius: 10,
    fontSize: 14,
    color: "#0F1F0F",
    backgroundColor: "#F5F8F5",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 0,
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#1DB954",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: 4,
  },
};

export default Login;