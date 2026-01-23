import { useEffect, useState } from "react";
import AdminLayout from "./Admin";
import {
  fetchUsers,
  deleteUser,
  exportUsers,
  createUser,
  updateUser,
} from "../services/UserService";
import UserForm from "../Components/UserForm";
import { hasPermission, hasModulePermission } from "../Components/Permissions";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({
        page,
        search,
        status: statusFilter,
        sortBy,
        order: sortOrder,
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [page, search, statusFilter, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await exportUsers({
        search,
        status: statusFilter,
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createUser(data);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateUser(editingUser._id, data);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      throw error;
    }
  };

  // Count user's permissions
  const countUserPermissions = (user) => {
    if (!user.roles || !Array.isArray(user.roles))
      return { modules: 0, actions: 0 };

    let totalModules = new Set();
    let totalActions = 0;

    user.roles.forEach((role) => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((perm) => {
          totalModules.add(perm.moduleName);
          if (perm.actions && Array.isArray(perm.actions)) {
            totalActions += perm.actions.length;
          }
        });
      }
    });

    return {
      modules: totalModules.size,
      actions: totalActions,
    };
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (editingUser) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingUser]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900">Users</h1>
              <p className="text-slate-500 mt-1">
                Manage user accounts and their module-based access
              </p>
            </div>

            <div className="flex gap-3">
              {(hasPermission("USER_CREATE") ||
                hasModulePermission("UserManagement", "create")) && (
                <button
                  onClick={() => setEditingUser("create")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  bg-indigo-600 text-white font-semibold
                  hover:bg-indigo-500 hover:scale-[1.02]
                  shadow-lg shadow-indigo-600/25 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add User
                </button>
              )}

              {(hasPermission("USER_EXPORT") ||
                hasModulePermission("UserManagement", "export", true)) && (
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  bg-emerald-500 text-white font-semibold
                  hover:bg-emerald-400 hover:scale-[1.02]
                  shadow-lg shadow-emerald-500/25 transition
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export CSV
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 md:max-w-md px-5 py-4 rounded-2xl
              border border-slate-200 bg-white
              focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
              transition"
              disabled={loading}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 py-4 rounded-2xl border border-slate-200 bg-white
              focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
              transition font-semibold"
              disabled={loading}
            >
              <option value="">All Users</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-4 rounded-2xl border border-slate-200 bg-white
              focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
              transition font-semibold"
              disabled={loading}
            >
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="px-5 py-4 rounded-2xl border border-slate-200 bg-white
              hover:bg-slate-50 font-semibold transition disabled:opacity-50"
              disabled={loading}
            >
              {sortOrder === "desc" ? "↓ Desc" : "↑ Asc"}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-slate-500">Loading users...</p>
            </div>
          )}

          {/* Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setEditingUser(null)}
              />

              {/* Modal Container */}
              <div
                className="relative w-full max-w-4xl my-10 mx-4 z-60"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden">
                  {/* Scrollable Content */}
                  <div className="max-h-[90vh] overflow-y-auto p-8">
                    <UserForm
                      initialData={
                        editingUser !== "create" ? editingUser : null
                      }
                      onSubmit={
                        editingUser !== "create" ? handleUpdate : handleCreate
                      }
                      onCancel={() => setEditingUser(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && users.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">
                      Roles & Permissions
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
                  {users.map((user) => {
                    const permCount = countUserPermissions(user);

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {user.name}
                          </div>
                          <div className="text-slate-600 text-sm mt-1">
                            {user.email}
                          </div>
                          {user.hobbies && user.hobbies.length > 0 && (
                            <div className="text-xs text-slate-500 mt-2">
                              Hobbies: {user.hobbies.join(", ")}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Roles */}
                            <div>
                              <div className="text-sm font-semibold text-slate-700 mb-2">
                                Roles:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {user.roles.map((role, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-medium"
                                  >
                                    {role.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Permission Summary */}
                            <div>
                              <div className="text-sm font-semibold text-slate-700 mb-2">
                                Access Summary:
                              </div>
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
                                <div className="text-center">
                                  <div className="text-lg font-bold text-slate-900">
                                    {user.roles.length}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Roles
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleTimeString()
                              : ""}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {(hasPermission("USER_EDIT") ||
                              hasModulePermission(
                                "UserManagement",
                                "update",
                              )) && (
                              <button
                                onClick={() => setEditingUser(user)}
                                className="px-4 py-2 rounded-lg text-indigo-600
                                bg-indigo-50 hover:bg-indigo-100 font-semibold transition"
                              >
                                Edit
                              </button>
                            )}

                            {(hasPermission("USER_DELETE") ||
                              hasModulePermission(
                                "UserManagement",
                                "delete",
                              )) && (
                              <button
                                onClick={() => handleDelete(user._id)}
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
                No users found
              </h3>
              <p className="text-slate-500 mb-8">
                {search || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Create users to manage access to your system"}
              </p>
              {(hasPermission("USER_CREATE") ||
                hasModulePermission("UserManagement", "create")) && (
                <button
                  onClick={() => setEditingUser("create")}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white
                  font-semibold shadow-lg hover:bg-indigo-500 transition"
                >
                  Create First User
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
