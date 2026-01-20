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
  "ROLE_DELETE"
];

const RoleForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
    status: "Active"
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white border p-6 rounded mb-6">
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? "Edit Role" : "Create Role"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Role name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
          disabled={!!initialData}
        />

        <div>
          <p className="font-medium mb-2">Permissions</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map(p => (
              <label key={p} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(p)}
                  onChange={() => togglePermission(p)}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              checked={formData.status === "Active"}
              onChange={() =>
                setFormData({ ...formData, status: "Active" })
              }
            /> Active
          </label>

          <label>
            <input
              type="radio"
              checked={formData.status === "Inactive"}
              onChange={() =>
                setFormData({ ...formData, status: "Inactive" })
              }
            /> Inactive
          </label>
        </div>

        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
