import { useEffect, useState } from "react";
import AdminLayout from "./Admin";
import { hasPermission, hasModulePermission } from "../Components/Permissions";
import axios from "axios";

const Permissions = () => {
  const [permissionSummary, setPermissionSummary] = useState([]);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [usersWithPermission, setUsersWithPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary"); // summary, module, users

  // Fetch permission summary
  const fetchPermissionSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/permissions/summary", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissionSummary(response.data.data || []);
    } catch (error) {
      console.error("Error fetching permission summary:", error);
      alert("Failed to load permission summary");
    } finally {
      setLoading(false);
    }
  };

  // Fetch module details
  const fetchModuleDetails = async (moduleName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/permissions/module/${moduleName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModuleDetails(response.data);
      setActiveTab("module");
    } catch (error) {
      console.error("Error fetching module details:", error);
      alert("Failed to load module details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users with specific permission
  const fetchUsersWithPermission = async (moduleName, action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/permissions/users?moduleName=${moduleName}&action=${action}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersWithPermission(response.data);
      setActiveTab("users");
    } catch (error) {
      console.error("Error fetching users with permission:", error);
      alert("Failed to load users with permission");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission("PERMISSION_VIEW") || hasModulePermission("PermissionManagement", "read")) {
      fetchPermissionSummary();
    }
  }, []);

  // Check if user has access
  if (!hasPermission("PERMISSION_VIEW") && !hasModulePermission("PermissionManagement", "read")) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-10 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Access Denied
            </h3>
            <p className="text-slate-500">
              You don't have permission to view this module.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900">
              Permission Management
            </h1>
            <p className="text-slate-500 mt-2">
              View and analyze permissions across your system
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => {
                  setActiveTab("summary");
                  setModuleDetails(null);
                  setUsersWithPermission(null);
                }}
                className={`px-6 py-3 font-semibold border-b-2 transition ${
                  activeTab === "summary"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Module Summary
              </button>
              {moduleDetails && (
                <button
                  onClick={() => setActiveTab("module")}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === "module"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {moduleDetails.moduleName}
                </button>
              )}
              {usersWithPermission && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === "users"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Users with Permission
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-slate-500">Loading data...</p>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <>
              {/* Module Summary Tab */}
              {activeTab === "summary" && permissionSummary.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                          Module
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                          Roles with Access
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                          Total Roles
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {permissionSummary.map((module) => (
                        <tr key={module.moduleName} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{module.moduleName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {module.roles.map((role, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-medium"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-indigo-600">
                              {module.totalRoles}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => fetchModuleDetails(module.moduleName)}
                                className="px-4 py-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-semibold transition text-sm"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Module Details Tab */}
              {activeTab === "module" && moduleDetails && (
                <div className="space-y-8">
                  {/* Module Header */}
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{moduleDetails.moduleName}</h2>
                        <p className="text-slate-500 mt-1">
                          Showing permissions for {moduleDetails.data?.length || 0} roles
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setModuleDetails(null);
                          setActiveTab("summary");
                        }}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                      >
                        Back to Summary
                      </button>
                    </div>

                    {/* Role Permissions */}
                    <div className="space-y-6">
                      {moduleDetails.data && moduleDetails.data.length > 0 ? (
                        moduleDetails.data.map((role, index) => (
                          <div key={index} className="border border-slate-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-slate-900">{role.roleName}</h3>
                              <div className="text-sm text-slate-500">
                                {role.actions.length} actions
                              </div>
                            </div>

                            {/* Basic Actions */}
                            {role.actions.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Basic Actions:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {role.actions.map((action, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium capitalize"
                                    >
                                      {action}
                                      <button
                                        onClick={() => fetchUsersWithPermission(moduleDetails.moduleName, action)}
                                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                                        title="View users with this permission"
                                      >
                                        👁
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {role.actions.length === 0 && (
                              <p className="text-slate-500 text-sm">No permissions assigned for this role</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-500">No roles have permissions for this module</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Users with Permission Tab */}
              {activeTab === "users" && usersWithPermission && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Users with "{usersWithPermission.action}" permission
                      </h2>
                      <p className="text-slate-500 mt-1">
                        Module: {usersWithPermission.moduleName} • Total Users: {usersWithPermission.totalUsers}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUsersWithPermission(null);
                        setActiveTab("module");
                      }}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Module
                    </button>
                  </div>

                  {/* Roles with this permission */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Roles with this permission ({usersWithPermission.roles.length}):
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {usersWithPermission.roles.map((role, i) => (
                        <div key={i} className="px-4 py-3 rounded-xl bg-slate-100">
                          <span className="font-medium text-slate-900">{role.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Users with this permission */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Users ({usersWithPermission.users.length}):
                    </h3>
                    {usersWithPermission.users.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {usersWithPermission.users.map((user, i) => (
                          <div key={i} className="border border-slate-200 rounded-xl p-4">
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-600 mt-1">{user.email}</div>
                            <div className="text-xs text-slate-500 mt-2">
                              Status: <span className={`font-medium ${user.status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {user.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No users have this permission</p>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State for Summary */}
              {activeTab === "summary" && permissionSummary.length === 0 && !loading && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-16 text-center max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    No Permission Data
                  </h3>
                  <p className="text-slate-500 mb-6">
                    No modules have been assigned permissions yet.
                  </p>
                  <p className="text-sm text-slate-500">
                    Create roles with permissions to see data here.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Permissions;