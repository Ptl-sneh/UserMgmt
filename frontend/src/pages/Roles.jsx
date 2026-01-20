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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage roles and permissions for your organization
            </p>
          </div>
          {hasPermission("ROLE_CREATE") && (
            <button
              onClick={() => setEditingRole({})}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Add Role
            </button>
          )}
        </div>

        {/* Role Form Modal */}
        {editingRole && (
          <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRole._id ? "Edit Role" : "Create New Role"}
            </h2>
            <RoleForm
              initialData={editingRole._id ? editingRole : null}
              onSubmit={editingRole._id ? handleUpdate : handleCreate}
              onCancel={() => setEditingRole(null)}
            />
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {role.name}
                      </h3>
                      <span
                        className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          role.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {role.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body - Permissions */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <svg
                      className="w-4 h-4 text-gray-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Permissions
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {role.permissions.length > 0 ? (
                      role.permissions.map((permission, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        No permissions assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer - Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-center justify-end gap-3">
                  {hasPermission("ROLE_EDIT") && (
                    <button
                      onClick={() => setEditingRole(role)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  )}
                  {hasPermission("ROLE_DELETE") && (
                    <button
                      onClick={() => handleDelete(role._id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {roles.length === 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No roles found
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Get started by creating your first role
              </p>
              {hasPermission("ROLE_CREATE") && (
                <button
                  onClick={() => setEditingRole({})}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Create Role
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Roles;