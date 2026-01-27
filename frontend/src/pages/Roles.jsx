import { useEffect, useState } from "react";
import AdminLayout from "./Admin";
import RoleForm from "../Components/RoleForm";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../services/RoleService";
import { hasPermission, hasModulePermission } from "../Components/Permissions";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await fetchRoles({ page, search });
      setRoles(res.data.roles);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error loading roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      await createRole(data);
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateRole(editingRole._id, data);
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(id);
        loadRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
        alert("Failed to delete role");
      }
    }
  };

  // Helper to count permissions in a role
  const countPermissions = (role) => {
    if (!role.permissions || !Array.isArray(role.permissions))
      return { modules: 0, actions: 0 };

    let actions = 0;

    role.permissions.forEach((module) => {
      if (module.actions && Array.isArray(module.actions)) {
        actions += module.actions.length;
      }
    });

    return {
      modules: role.permissions.length,
      actions: actions,
    };
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900">Roles</h1>
              <p className="text-slate-500 mt-1">
                Manage roles and permissions using the new module-based system
              </p>
            </div>

            {(hasPermission("ROLE_CREATE") ||
              hasModulePermission("RoleManagement", "create")) && (
              <button
                onClick={() => setEditingRole({})}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white
                font-semibold shadow-lg shadow-indigo-600/25
                hover:bg-indigo-500 hover:scale-[1.02] transition"
              >
                Add Role
              </button>
            )}
          </div>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search by role name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full md:max-w-md px-5 py-4 rounded-2xl
              border border-slate-200 bg-white
              focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
              transition"
              disabled={loading}
            />
          </div>

          {/* Modal */}
          {editingRole && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setEditingRole(null)}
              />

              {/* Modal Container */}
              <div className="relative w-full max-w-4xl my-10 mx-4 z-60">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden">
                  {/* Scrollable Content */}
                  <div className="max-h-[90vh] overflow-y-auto">
                    <RoleForm
                      initialData={editingRole._id ? editingRole : null}
                      onSubmit={editingRole._id ? handleUpdate : handleCreate}
                      onCancel={() => setEditingRole(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-slate-500">Loading roles...</p>
            </div>
          )}

          {/* Roles Table */}
          {!loading && roles.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      Modules & Permissions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {roles.map((role) => {
                    const permCount = countPermissions(role);
                    return (
                      <tr
                        key={role._id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {role.name}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {role.permissions?.length || 0} modules
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Permission Summary */}
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-indigo-600">
                                  {permCount.modules}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Modules
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-emerald-600">
                                  {permCount.actions}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Actions
                                </div>
                              </div>
                            </div>

                            {/* Module List */}
                            <div className="flex flex-wrap gap-2 max-w-md">
                              {role.permissions?.slice(0, 3).map((perm, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 text-xs rounded-full
                                  bg-slate-100 text-slate-700 font-medium"
                                  title={`Actions: ${perm.actions?.join(", ") || "None"}`}
                                >
                                  {perm.moduleName}
                                </span>
                              ))}
                              {role.permissions?.length > 3 && (
                                <span className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-600 font-semibold">
                                  +{role.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {role.createdAt
                              ? new Date(role.createdAt).toLocaleDateString()
                              : "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {role.createdAt
                              ? new Date(role.createdAt).toLocaleTimeString()
                              : ""}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              role.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {role.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {(hasPermission("ROLE_EDIT") ||
                              hasModulePermission(
                                "RoleManagement",
                                "update",
                              )) && (
                              <button
                                onClick={() => setEditingRole(role)}
                                className="px-4 py-2 rounded-lg text-indigo-600
                                bg-indigo-50 hover:bg-indigo-100 font-semibold transition"
                              >
                                Edit
                              </button>
                            )}

                            {(hasPermission("ROLE_DELETE") ||
                              hasModulePermission(
                                "RoleManagement",
                                "delete",
                              )) && (
                              <button
                                onClick={() => handleDelete(role._id)}
                                className="px-4 py-2 rounded-lg text-rose-600
                                bg-rose-50 hover:bg-rose-100 font-semibold transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-slate-100">
                  <span className="font-semibold text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-3">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-white transition"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-white transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !loading ? (
            /* Empty State */
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-16 text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No roles found
              </h3>
              <p className="text-slate-500 mb-6">
                Create roles to manage permissions across your system
              </p>
              <div className="mb-8">
                <p className="text-sm text-slate-600 mb-4">
                  With the new module-based system, you can:
                </p>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>
                    • Assign specific modules (UserManagement, RoleManagement,
                    etc.)
                  </li>
                  <li>• Grant basic actions (create, read, update, delete)</li>
                </ul>
              </div>
              {(hasPermission("ROLE_CREATE") ||
                hasModulePermission("RoleManagement", "create")) && (
                <button
                  onClick={() => setEditingRole({})}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white
                  font-semibold shadow-lg hover:bg-indigo-500 transition"
                >
                  Create First Role
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Roles;
