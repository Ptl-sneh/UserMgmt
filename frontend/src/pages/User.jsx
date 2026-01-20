import { useEffect, useState } from "react";
import AdminLayout from "./Admin";
import { fetchUsers, deleteUser, exportUsers } from "../services/UserService";
import UserForm from "../Components/UserForm";
import { createUser, updateUser } from "../services/UserService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    const res = await fetchUsers({ page, search });
    setUsers(res.data.users);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      <input
        type="text"
        placeholder="Search user..."
        className="border px-3 py-2 mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        onClick={() => setEditingUser({})}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add User
      </button>

      {editingUser && (
        <UserForm
          initialData={editingUser._id ? editingUser : null}
          onSubmit={editingUser._id ? handleUpdate : handleCreate}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <input
        type="text"
        placeholder="Search user..."
        className="border px-3 py-2 mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Roles</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">
                {user.roles.map((r) => r.name).join(", ")}
              </td>
              <td className="p-2 border">{user.status}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </AdminLayout>
  );
};

export default Users;
