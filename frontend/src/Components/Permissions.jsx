export const hasPermission = (permission) => {
  const user = JSON.parse(localStorage.getItem("user"));
  {console.log(user)}
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};
