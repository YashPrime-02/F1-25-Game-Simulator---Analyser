import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token && window.location.pathname === "/") {
    return <Navigate to="/mode" replace />;
  }

  return children;
}