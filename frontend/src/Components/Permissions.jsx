// export const hasPermission = (permission) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   console.log("User from localStorage:", user);

//   if (!user || !Array.isArray(user.permissions)) return false;

//   return user.permissions.includes(permission);
// };

export const hasModulePermission = (moduleName, action) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !Array.isArray(user.permissions)) return false;

  const modulePermission = user.permissions.find(
    (perm) => perm.moduleName === moduleName
  );

  if (!modulePermission) return false;

  // Check if actions array exists and includes the action
  return Array.isArray(modulePermission.actions) && 
         modulePermission.actions.includes(action);
};

export const hasPermission = (permission) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !Array.isArray(user.permissions)) return false;

  const permissionMap = {
    "USER_VIEW": { module: "UserManagement", action: "read" },
    "USER_CREATE": { module: "UserManagement", action: "create" },
    "USER_EDIT": { module: "UserManagement", action: "update" },
    "USER_DELETE": { module: "UserManagement", action: "delete" },
    "USER_EXPORT": { module: "UserManagement", action: "Export CSV" },
    
    "ROLE_VIEW": { module: "RoleManagement", action: "read" },
    "ROLE_CREATE": { module: "RoleManagement", action: "create" },
    "ROLE_EDIT": { module: "RoleManagement", action: "update" },
    "ROLE_DELETE": { module: "RoleManagement", action: "delete" },
    
    "PERMISSION_VIEW": { module: "PermissionManagement", action: "read" },
    
    "DASHBOARD_VIEW": { module: "Dashboard", action: "view" },
    "DASHBOARD_REFRESH": { module: "Dashboard", action: "refresh status" }
  };

  // If it's a mapped permission, use new system
  if (permissionMap[permission]) {
    const { module, action } = permissionMap[permission];
    return hasModulePermission(module, action);
  }

  // Fallback to old flat permission check (temporary)
  return user.permissions?.some(perm => 
    typeof perm === 'string' && perm === permission
  );
};

// Export both functions
export default {
  hasPermission,
  hasModulePermission
};