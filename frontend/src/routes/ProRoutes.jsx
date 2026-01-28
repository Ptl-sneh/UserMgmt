import { Navigate } from "react-router-dom";
import { hasModulePermission } from "../Components/Permissions";

const ProRoute = ({ children, allowedRoles, requiredPermission }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based restriction (optional)
  if (
    allowedRoles &&
    !allowedRoles.some((role) => user.roles?.includes(role))
  ) {
    return <Navigate to="/home" replace />;
  }

  // Module-based permission restriction
  if (requiredPermission) {
    const { module, action } = requiredPermission;

    if (!hasModulePermission(module, action)) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProRoute;
