import { Navigate } from "react-router-dom";

const ProRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based check (optional)
  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default ProRoute;
