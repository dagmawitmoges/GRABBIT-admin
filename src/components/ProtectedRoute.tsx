import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Contexts/authContext";

export default function ProtectedRoute({ children }: any) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") return <Navigate to="/unauthorized" />;

  return children;
}