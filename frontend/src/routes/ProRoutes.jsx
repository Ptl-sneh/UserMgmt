import { Navigate } from "react-router-dom";
import { hasPermission, hasModulePermission } from "../Components/Permissions";

const ProRoute = ({ children, allowedRoles, requiredPermission }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based restriction
  if (allowedRoles && !allowedRoles.some(role => user.roles?.includes(role))) {
    return <Navigate to="/home" replace />;
  }

  // Permission-based restriction (both old and new system)
  if (requiredPermission) {
    // Check old permission system
    const hasOldPermission = hasPermission(requiredPermission);
    
    // Map old permissions to new system for checking
    const permissionMap = {
      "USER_VIEW": { module: "UserManagement", action: "read" },
      "USER_CREATE": { module: "UserManagement", action: "create" },
      "USER_EDIT": { module: "UserManagement", action: "update" },
      "USER_DELETE": { module: "UserManagement", action: "delete" },
      "USER_EXPORT": { module: "UserManagement", action: "export", isNested: true },
      "ROLE_VIEW": { module: "RoleManagement", action: "read" },
      "ROLE_CREATE": { module: "RoleManagement", action: "create" },
      "ROLE_EDIT": { module: "RoleManagement", action: "update" },
      "ROLE_DELETE": { module: "RoleManagement", action: "delete" },
      "PERMISSION_VIEW": { module: "PermissionManagement", action: "read" },
      "DASHBOARD_VIEW": { module: "Dashboard", action: "view" }
    };

    let hasNewPermission = false;
    if (permissionMap[requiredPermission]) {
      const { module, action, isNested } = permissionMap[requiredPermission];
      hasNewPermission = hasModulePermission(module, action, isNested);
    }

    // If user doesn't have permission in either system
    if (!hasOldPermission && !hasNewPermission) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProRoute;