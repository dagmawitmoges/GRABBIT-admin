import React, { useContext, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Contexts/authContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
