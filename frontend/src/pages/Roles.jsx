import { useEffect, useState } from "react";
import AdminLayout from "./Admin";
import RoleForm from "../Components/RoleForm";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../services/RoleService";
import { hasPermission } from "../Components/Permissions";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRole, setEditingRole] = useState(null);

  const loadRoles = async () => {
    const res = await fetchRoles({ page, search });
    setRoles(res.data.roles);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    loadRoles();
  }, [page, search]);

  const handleCreate = async (data) => {
    await createRole(data);
    setEditingRole(null);
    loadRoles();
  };

  const handleUpdate = async (data) => {
    await updateRole(editingRole._id, data);
    setEditingRole(null);
    loadRoles();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this role?")) {
      await deleteRole(id);
      loadRoles();
    }
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
                Manage roles and permissions
              </p>
            </div>

            {hasPermission("ROLE_CREATE") && (
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
            />
          </div>

          {/* Modal */}
          {editingRole && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setEditingRole(null)}
              />

              {/* Modal Container */}
              <div className="relative w-full max-w-2xl my-10 mx-4">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden">
                  {/* Scrollable Content */}
                  <div className="max-h-[90vh] overflow-y-auto p-8">
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

          {/* Roles Table */}
          {roles.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-100">
                  <tr>
                    {["Role", "Permissions", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {roles.map((role) => (
                    <tr key={role._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {role.name}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {role.permissions.slice(0, 3).map((perm, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs rounded-full
                              bg-slate-200 text-slate-700 font-semibold"
                            >
                              {perm}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold">
                              +{role.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            role.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {role.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 flex gap-2">
                        {hasPermission("ROLE_EDIT") && (
                          <button
                            onClick={() => setEditingRole(role)}
                            className="px-4 py-2 rounded-lg text-indigo-600
                            bg-indigo-50 hover:bg-indigo-100 font-semibold transition"
                          >
                            Edit
                          </button>
                        )}

                        {hasPermission("ROLE_DELETE") && (
                          <button
                            onClick={() => handleDelete(role._id)}
                            className="px-4 py-2 rounded-lg text-rose-600
                            bg-rose-50 hover:bg-rose-100 font-semibold transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
                      className="px-4 py-2 rounded-lg border disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 rounded-lg border disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-16 text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No roles found
              </h3>
              <p className="text-slate-500 mb-8">
                Create roles to manage permissions across your system
              </p>
              {hasPermission("ROLE_CREATE") && (
                <button
                  onClick={() => setEditingRole({})}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white
                  font-semibold shadow-lg hover:bg-indigo-500 transition"
                >
                  Create First Role
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Roles;