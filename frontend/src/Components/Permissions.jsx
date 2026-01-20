export const hasPermission = (permission) => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User from localStorage:", user);

  if (!user || !Array.isArray(user.permissions)) return false;

  return user.permissions.includes(permission);
};
