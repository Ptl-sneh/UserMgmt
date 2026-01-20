import { Navigate } from "react-router-dom";

const ProRoute = ({ children, allowedRoles, requiredPermission }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based restriction
  if (
    allowedRoles &&
    !allowedRoles.some(role => user.roles.includes(role))
  ) {
    return <Navigate to="/home" replace />;
  }

  // Permission-based restriction (ONLY BLOCK, NO REDIRECT TO FEATURE)
  if (
    requiredPermission &&
    !user.permissions?.includes(requiredPermission)
  ) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProRoute;
