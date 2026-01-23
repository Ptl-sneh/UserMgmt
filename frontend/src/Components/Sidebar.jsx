import { NavLink, useNavigate } from "react-router-dom";
import { hasPermission, hasModulePermission } from "./Permissions";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("SuperAdmin");
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Get user's name for display
  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen p-6 shadow-2xl border-r border-slate-700/50 backdrop-blur-xl">
      {/* User Profile Section */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{userName}</h3>
          <p className="text-slate-400 text-sm truncate">{userEmail}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-xs text-slate-300">
              {user?.roles?.join(", ") || "No roles"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {/* Dashboard Link - Always visible if user has dashboard permission */}
        {(hasPermission("DASHBOARD_VIEW") || hasModulePermission("Dashboard", "view")) && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10 backdrop-blur-sm"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md hover:shadow-slate-500/25 border border-transparent"
              }`
            }
          >
            <svg className="w-6 h-6 mr-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NavLink>
        )}

        {/* Users Link - Show if user has UserManagement read permission */}
        {(hasPermission("USER_VIEW") || hasModulePermission("UserManagement", "read")) && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/10 backdrop-blur-sm"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md hover:shadow-slate-500/25 border border-transparent"
              }`
            }
          >
            <svg className="w-6 h-6 mr-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </NavLink>
        )}

        {/* Roles Link - Show if user has RoleManagement read permission */}
        {(hasPermission("ROLE_VIEW") || hasModulePermission("RoleManagement", "read")) && (
          <NavLink
            to="/roles"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-white border border-orange-500/30 shadow-lg shadow-orange-500/10 backdrop-blur-sm"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md hover:shadow-slate-500/25 border border-transparent"
              }`
            }
          >
            <svg className="w-6 h-6 mr-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Roles
          </NavLink>
        )}

        {/* Permissions Link - Show if user has PermissionManagement read permission */}
        {(hasPermission("PERMISSION_VIEW") || hasModulePermission("PermissionManagement", "read")) && (
          <NavLink
            to="/permissions"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md hover:shadow-slate-500/25 border border-transparent"
              }`
            }
          >
            <svg className="w-6 h-6 mr-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Permissions
          </NavLink>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-slate-300 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-red-500/20 hover:text-white hover:border hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/10 backdrop-blur-sm font-medium mt-8"
        >
          <svg className="w-6 h-6 mr-4 transition-transform group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </nav>

      {/* Status Indicator */}
      <div className="absolute bottom-6 left-6 right-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse' : 'bg-gradient-to-r from-emerald-400 to-teal-400'}`} />
            <span className="text-sm text-slate-400 font-medium">
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