import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VendorsPage from "./pages/VendorsPage";
import VendorDetailsPage from "./pages/VendorDetailsPage";
import AddVendorPage from "./pages/AddVendorPage";
import UsersPage from "./pages/UsersPage";
import IssuesPage from "./pages/IssuesPage";
import SettingsPage from "./pages/SettingsPage";
import DealsPage from "./pages/DealsPage";
import AdminLayout from "./layouts/AdminLayout";
import { useContext } from "react";
import { AuthContext } from "./Contexts/authContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AuthContext);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/vendors/new" element={<AddVendorPage />} />
        <Route path="/vendors/:id" element={<VendorDetailsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="*"
        element={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              backgroundColor: "#F5F8F5",
              fontFamily: "'DM Sans','Segoe UI',sans-serif",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 64 }}>🔍</div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0F1F0F",
                margin: 0,
              }}
            >
              404
            </h1>
            <p style={{ color: "#6B7C6B", margin: 0 }}>Page not found</p>
            <a
              href="/dashboard"
              style={{
                marginTop: 8,
                padding: "10px 20px",
                backgroundColor: "#1DB954",
                color: "#fff",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Go to Dashboard
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
