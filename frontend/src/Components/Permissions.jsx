export const hasModulePermission = (moduleName, action) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !Array.isArray(user.permissions)) return false;

  const modulePermission = user.permissions.find(
    (perm) => perm.moduleName === moduleName
  );

  if (!modulePermission) return false;

  return (
    Array.isArray(modulePermission.actions) &&
    modulePermission.actions.includes(action)
  );
};
