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
import { hasPermission } from "../Components/Permissions";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const loadUsers = async () => {
    const res = await fetchUsers({
      page,
      search,
      status: statusFilter,
      sortBy,
      order: sortOrder,
    });
    setUsers(res.data.users);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [page, search, statusFilter, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      await deleteUser(id);
      loadUsers();
    }
  };

  const handleExport = async () => {
    const res = await exportUsers();
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  const handleCreate = async (data) => {
    await createUser(data);
    setEditingUser(null);
    loadUsers();
  };

  const handleUpdate = async (data) => {
    await updateUser(editingUser._id, data);
    setEditingUser(null);
    loadUsers();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (editingUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
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
                Manage user accounts and access
              </p>
            </div>

            <div className="flex gap-3">
              {hasPermission("USER_CREATE") && (
                <button
                  onClick={() => setEditingUser("create")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  bg-indigo-600 text-white font-semibold
                  hover:bg-indigo-500 hover:scale-[1.02]
                  shadow-lg shadow-indigo-600/25 transition"
                >
                  Add User
                </button>
              )}

              {hasPermission("USER_EXPORT") && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  bg-emerald-500 text-white font-semibold
                  hover:bg-emerald-400 hover:scale-[1.02]
                  shadow-lg shadow-emerald-500/25 transition"
                >
                  Export CSV
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
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 py-4 rounded-2xl border border-slate-200 bg-white
              focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
              transition font-semibold"
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
              hover:bg-slate-50 font-semibold transition"
            >
              {sortOrder === "desc" ? "↓ Desc" : "↑ Asc"}
            </button>
          </div>

          {/* Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
              {/* Overlay - IMPORTANT: Add pointer-events-none to container */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setEditingUser(null)}
              />

              {/* Modal Container - IMPORTANT: Prevent click from bubbling */}
              <div 
                className="relative w-full max-w-4xl my-10 mx-4 z-60"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden">
                  {/* Scrollable Content */}
                  <div className="max-h-[90vh] overflow-y-auto p-8">
                    <UserForm
                      initialData={editingUser !== "create" ? editingUser : null}
                      onSubmit={editingUser !== "create" ? handleUpdate : handleCreate}
                      onCancel={() => setEditingUser(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  {["Name", "Email", "Roles", "Status", "Actions"].map((h) => (
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
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold">{user.name}</td>

                    <td className="px-6 py-4 text-slate-600">{user.email}</td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((r, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs rounded-full
                            bg-slate-200 text-slate-700 font-semibold"
                          >
                            {r.name}
                          </span>
                        ))}
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

                    <td className="px-6 py-4 flex gap-2">
                      {hasPermission("USER_EDIT") && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-4 py-2 rounded-lg text-indigo-600
                          bg-indigo-50 hover:bg-indigo-100 font-semibold transition"
                        >
                          Edit
                        </button>
                      )}

                      {hasPermission("USER_DELETE") && (
                        <button
                          onClick={() => handleDelete(user._id)}
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;