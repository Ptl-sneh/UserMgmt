import { useEffect, useState } from "react";

const ALL_PERMISSIONS = [
  "USER_VIEW",
  "USER_CREATE",
  "USER_EDIT",
  "USER_DELETE",
  "USER_EXPORT",
  "ROLE_VIEW",
  "ROLE_CREATE",
  "ROLE_EDIT",
  "ROLE_DELETE",
];

const RoleForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
    status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const togglePermission = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="px-8 py-6 border-b bg-slate-50">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {initialData ? "Edit Role" : "Create Role"}
        </h2>
        <p className="text-slate-500 mt-1">
          {initialData
            ? "Update role details and permissions"
            : "Define a role and assign permissions"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">

        {/* Role Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Role Name
          </label>
          <input
            type="text"
            placeholder="Admin, Manager, Viewer..."
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            disabled={!!initialData}
            className="w-full px-4 py-3 rounded-xl border border-slate-200
            focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition
            disabled:bg-slate-100 disabled:cursor-not-allowed"
            required
          />
          {initialData && (
            <p className="text-xs text-slate-500 mt-1">
              Role name cannot be changed
            </p>
          )}
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Permissions
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_PERMISSIONS.map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-3 p-3 rounded-xl
                border border-slate-200 hover:border-indigo-300 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-slate-700">
                  {perm}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Nested Permissions Section */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Nested Permissions
          </label>
          
          <div className="space-y-4 border border-slate-200 rounded-xl p-4">
            
            {/* User Module Nested Permissions */}
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">User Module</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">View Sensitive Data</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">Export Data</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">Bulk Edit</span>
                </label>
              </div>
            </div>

            {/* Role Module Nested Permissions */}
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">Role Module</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">Assign Permissions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">Clone Role</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Status
          </label>
          <div className="flex gap-4">
            {["Active", "Inactive"].map((status) => (
              <label
                key={status}
                className="flex items-center gap-3 p-3 rounded-xl
                border border-slate-200 hover:border-indigo-300 transition cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={() =>
                    setFormData({ ...formData, status })
                  }
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white
            font-semibold shadow-lg hover:bg-indigo-500 transition"
          >
            {initialData ? "Update Role" : "Create Role"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-300
            text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm; 