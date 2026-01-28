import { useState, useEffect } from "react";
import { hasModulePermission } from "../Components/Permissions";
import { fetchModules } from "../services/ModuleService";
import AdminLayout from "./Admin";
import { Link } from "react-router-dom";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName = user.name || "User";
  const userRoles = user.roles || [];
  const userPermissions = user.permissions || [];
  const [modules, setModules] = useState([]);

  const totalModules = userPermissions.length;
  const totalActions = userPermissions.reduce(
    (sum, module) => sum + module.actions.length,
    0,
  );

  useEffect(() => {
    const loadModules = async () => {
      try {
        const modulesData = await fetchModules();
        setModules(modulesData);
      } catch (error) {
        console.error("Error loading modules:", error);
      }
    };
    loadModules();
  }, []);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Welcome Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900">
              Welcome back, {userName}!
            </h1>
            <p className="text-slate-500 mt-2">
              Here's a quick overview of your access and available modules
            </p>
          </div>

          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Roles
                  </h3>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {userRoles.length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {userRoles.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Module Access
                  </h3>
                  <div className="flex items-baseline gap-4 mt-1">
                    <p className="text-2xl font-extrabold text-slate-900">
                      {totalModules} modules
                    </p>
                    <p className="text-sm text-slate-500">
                      {totalActions} actions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module Cards Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Available Modules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Management */}
              {hasModulePermission("UserManagement", "read") && (
                <div className="group bg-white rounded-2xl border border-slate-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                      U
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        User Management
                      </h2>
                      <p className="text-sm text-slate-500">
                        Manage users and their access
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Available Actions:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hasModulePermission("UserManagement", "create") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          Create
                        </span>
                      )}
                      {hasModulePermission("UserManagement", "read") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          View
                        </span>
                      )}
                      {hasModulePermission("UserManagement", "update") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          Edit
                        </span>
                      )}
                      {hasModulePermission("UserManagement", "delete") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          Delete
                        </span>
                      )}
                      {hasModulePermission("UserManagement", "Export CSV") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                          Export
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/users"
                    className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-500 transition"
                  >
                    Go to Users →
                  </Link>
                </div>
              )}

              {/* Role Management */}
              {hasModulePermission("RoleManagement", "read") && (
                <div className="group bg-white rounded-2xl border border-slate-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                      R
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Role Management
                      </h2>
                      <p className="text-sm text-slate-500">
                        Control roles and permissions
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Available Actions:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hasModulePermission("RoleManagement", "create") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                          Create
                        </span>
                      )}
                      {hasModulePermission("RoleManagement", "read") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                          View
                        </span>
                      )}
                      {hasModulePermission("RoleManagement", "update") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                          Edit
                        </span>
                      )}
                      {hasModulePermission("RoleManagement", "delete") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                          Delete
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/roles"
                    className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-500 transition"
                  >
                    Go to Roles →
                  </Link>
                </div>
              )}

              {/* Permission Management */}
              {hasModulePermission("PermissionManagement", "read") && (
                <div className="group bg-white rounded-2xl border border-slate-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xl">
                      P
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Permission Management
                      </h2>
                      <p className="text-sm text-slate-500">
                        View and analyze permissions
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Available Actions:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hasModulePermission("PermissionManagement", "read") && (
                        <span className="px-3 py-1 text-xs rounded-full bg-cyan-100 text-cyan-700 font-semibold">
                          View
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/permissions"
                    className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-500 transition"
                  >
                    View Permissions →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {!hasModulePermission("UserManagement", "read") &&
            !hasModulePermission("RoleManagement", "read") &&
            !hasModulePermission("PermissionManagement", "read") && (
              <div className="mt-16 max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  No Access Assigned
                </h3>
                <p className="text-slate-500 mb-6">
                  You currently do not have permissions to view any modules.
                  Please contact your administrator.
                </p>
              </div>
            )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Home;
