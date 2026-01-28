import { NavLink, useNavigate } from "react-router-dom";
import { hasModulePermission } from "./Permissions";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin =
    user?.roles?.includes("Admin") ||
    user?.roles?.includes("SuperAdmin");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen p-6 shadow-2xl border-r border-slate-700/50 backdrop-blur-xl">
      {/* User Profile */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate">{userName}</h3>
          <p className="text-slate-400 text-sm truncate">{userEmail}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-xs text-slate-300">
              {user?.roles?.join(", ") || "No roles"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {/* Dashboard */}
        {hasModulePermission("Dashboard", "view") && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-indigo-500/20 text-white border border-indigo-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <span className="mr-4">🏠</span>
            Dashboard
          </NavLink>
        )}

        {/* Users */}
        {hasModulePermission("UserManagement", "read") && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-emerald-500/20 text-white border border-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <span className="mr-4">👤</span>
            Users
          </NavLink>
        )}

        {/* Roles */}
        {hasModulePermission("RoleManagement", "read") && (
          <NavLink
            to="/roles"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-orange-500/20 text-white border border-orange-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <span className="mr-4">🧩</span>
            Roles
          </NavLink>
        )}

        {/* Permissions */}
        {hasModulePermission("PermissionManagement", "read") && (
          <NavLink
            to="/permissions"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-cyan-500/20 text-white border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <span className="mr-4">🔐</span>
            Permissions
          </NavLink>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-rose-500/20 hover:text-white mt-8"
        >
          <span className="mr-4">🚪</span>
          Logout
        </button>
      </nav>

      {/* Status */}
      <div className="absolute bottom-6 left-6 right-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isAdmin
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-emerald-400"
              }`}
            />
            <span className="text-sm text-slate-400">
              {isAdmin ? "Admin Mode" : "User Mode"}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {user?.permissions?.length || 0} modules
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
