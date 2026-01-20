import { useEffect, useState } from "react";
import AdminLayout from "./Admin";
import RoleForm from "../Components/RoleForm";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole
} from "../services/RoleService";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);

  const loadRoles = async () => {
    const res = await fetchRoles();
    setRoles(res.data);
  };

  useEffect(() => {
    loadRoles();
  }, []);

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Roles</h1>
        <button
          onClick={() => setEditingRole({})}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Role
        </button>
      </div>

      {editingRole && (
        <RoleForm
          initialData={editingRole._id ? editingRole : null}
          onSubmit={editingRole._id ? handleUpdate : handleCreate}
          onCancel={() => setEditingRole(null)}
        />
      )}

      <table className="w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Permissions</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role._id}>
              <td className="p-2 border">{role.name}</td>
              <td className="p-2 border text-sm">
                {role.permissions.join(", ")}
              </td>
              <td className="p-2 border">{role.status}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => setEditingRole(role)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default Roles;
