import { useEffect, useState } from "react";

// Available modules with their possible actions and nested permissions
const AVAILABLE_MODULES = [
  {
    moduleName: "UserManagement",
    displayName: "User Management",
    description: "Manage users and their accounts",
    basicActions: ["create", "read", "update", "delete"],
    nestedPermissions: [
      "export",
      "import",
      "bulk_delete",
      "view_sensitive_data",
    ],
  },
  {
    moduleName: "RoleManagement",
    displayName: "Role Management",
    description: "Manage roles and permissions",
    basicActions: ["create", "read", "update", "delete"],
    nestedPermissions: ["export", "clone", "assign_permissions"],
  },
  {
    moduleName: "PermissionManagement",
    displayName: "Permission Management",
    description: "View and analyze permissions",
    basicActions: ["read", "view", "analyze"],
    nestedPermissions: ["export_report", "audit_logs", "generate_stats"],
  },
  {
    moduleName: "Dashboard",
    displayName: "Dashboard",
    description: "System overview and analytics",
    basicActions: ["view"],
    nestedPermissions: ["refresh_status", "customize", "notifications"],
  },
];

const RoleForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        permissions: initialData.permissions || [],
        status: initialData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        permissions: [],
        status: "Active",
      });
    }
    setErrors({});
  }, [initialData]);

  // Toggle entire module selection
  const toggleModule = (moduleName) => {
    const existingModule = formData.permissions.find(
      (p) => p.moduleName === moduleName,
    );

    if (existingModule) {
      // Remove module
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (p) => p.moduleName !== moduleName,
        ),
      }));
    } else {
      // Add module with no permissions selected
      setFormData((prev) => ({
        ...prev,
        permissions: [
          ...prev.permissions,
          {
            moduleName,
            actions: [],
            nestedPermissions: [],
          },
        ],
      }));
    }
  };

  // Toggle basic action within a module
  const toggleAction = (moduleName, action) => {
    setFormData((prev) => {
      const permissions = prev.permissions.map((p) => {
        if (p.moduleName !== moduleName) return p;

        return {
          ...p,
          actions: p.actions.includes(action)
            ? p.actions.filter((a) => a !== action)
            : [...p.actions, action],
        };
      });

      return { ...prev, permissions };
    });
  };

  // Toggle nested permission within a module
  const toggleNestedPermission = (moduleName, nestedPerm) => {
    setFormData((prev) => {
      const permissions = prev.permissions.map((p) => {
        if (p.moduleName !== moduleName) return p;

        return {
          ...p,
          nestedPermissions: p.nestedPermissions.includes(nestedPerm)
            ? p.nestedPermissions.filter((n) => n !== nestedPerm)
            : [...p.nestedPermissions, nestedPerm],
        };
      });

      return { ...prev, permissions };
    });
  };

  // Select all basic actions for a module
  const selectAllBasicActions = (moduleName, e) => {
    e.stopPropagation(); // Prevent triggering module toggle
    const module = AVAILABLE_MODULES.find((m) => m.moduleName === moduleName);
    if (!module) return;

    setFormData((prev) => {
      const newPermissions = [...prev.permissions];
      const moduleIndex = newPermissions.findIndex(
        (p) => p.moduleName === moduleName,
      );

      if (moduleIndex === -1) {
        // Add module with all basic actions
        newPermissions.push({
          moduleName,
          actions: [...module.basicActions],
          nestedPermissions: [],
        });
      } else {
        // Replace all basic actions
        newPermissions[moduleIndex].actions = [...module.basicActions];
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  // Get current module data from form
  const getModuleFormData = (moduleName) => {
    return (
      formData.permissions.find((p) => p.moduleName === moduleName) || {
        moduleName,
        actions: [],
        nestedPermissions: [],
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Filter out modules with no permissions selected
    const filteredPermissions = formData.permissions.filter(
      (perm) => perm.actions.length > 0 || perm.nestedPermissions.length > 0,
    );

    onSubmit({
      ...formData,
      permissions: filteredPermissions,
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b bg-slate-50">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {initialData ? "Edit Role" : "Create Role"}
        </h2>
        <p className="text-slate-500 mt-1">
          {initialData
            ? "Update role details and permissions"
            : "Define a role and assign module-based permissions"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Role Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Role Name *
          </label>
          <input
            type="text"
            placeholder="Admin, Manager, Viewer..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!!initialData}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? "border-rose-500" : "border-slate-200"
            } focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition
            disabled:bg-slate-100 disabled:cursor-not-allowed`}
            required
          />
          {errors.name && (
            <p className="text-sm text-rose-600 mt-1">{errors.name}</p>
          )}
          {initialData && (
            <p className="text-xs text-slate-500 mt-1">
              Role name cannot be changed
            </p>
          )}
        </div>

        {/* Module Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-bold text-slate-900">
              Module Permissions
            </label>
            <div className="text-sm text-slate-500">
              {
                formData.permissions.filter(
                  (p) => p.actions.length > 0 || p.nestedPermissions.length > 0,
                ).length
              }{" "}
              modules selected
            </div>
          </div>

          <div className="space-y-6">
            {AVAILABLE_MODULES.map((module) => {
              const moduleFormData = getModuleFormData(module.moduleName);
              const isModuleSelected = formData.permissions.some(
                (p) => p.moduleName === module.moduleName,
              );

              return (
                <div
                  key={module.moduleName}
                  className={`border rounded-2xl p-6 transition-all ${
                    isModuleSelected
                      ? "border-indigo-300 bg-indigo-50/50"
                      : "border-slate-200"
                  }`}
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isModuleSelected}
                        onChange={() => toggleModule(module.moduleName)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {module.displayName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {module.description}
                        </p>
                      </div>
                    </label>
                    {isModuleSelected && (
                      <button
                        type="button"
                        onClick={(e) =>
                          selectAllBasicActions(module.moduleName, e)
                        }
                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        Select All Basic
                      </button>
                    )}
                  </div>

                  {/* Basic Actions */}
                  {isModuleSelected && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Basic Actions
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {module.basicActions.map((action) => (
                          <label
                            key={action}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              moduleFormData.actions.includes(action)
                                ? "border-indigo-300 bg-indigo-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={moduleFormData.actions.includes(action)}
                              onChange={(e) =>
                                toggleAction(module.moduleName, action, e)
                              }
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {action}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nested Permissions */}
                  {isModuleSelected && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Nested Permissions (Extra Access)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {module.nestedPermissions.map((nestedPerm) => {
                          const displayName = nestedPerm
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ");

                          return (
                            <label
                              key={nestedPerm}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                moduleFormData.nestedPermissions.includes(
                                  nestedPerm,
                                )
                                  ? "border-purple-300 bg-purple-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={moduleFormData.nestedPermissions.includes(
                                  nestedPerm,
                                )}
                                onChange={() =>
                                  toggleNestedPermission(
                                    module.moduleName,
                                    nestedPerm,
                                  )
                                }
                                className="w-4 h-4 text-purple-600 rounded"
                              />
                              <span className="text-sm font-medium text-slate-700">
                                {displayName}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={() => setFormData({ ...formData, status })}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        {formData.permissions.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 mb-3">
              Permission Summary
            </h3>
            <div className="space-y-4">
              {formData.permissions
                .filter(
                  (p) => p.actions.length > 0 || p.nestedPermissions.length > 0,
                )
                .map((perm) => {
                  const module = AVAILABLE_MODULES.find(
                    (m) => m.moduleName === perm.moduleName,
                  );
                  return (
                    <div
                      key={perm.moduleName}
                      className="border-b border-slate-200 pb-4 last:border-0"
                    >
                      <div className="font-medium text-slate-900 mb-2">
                        {module?.displayName || perm.moduleName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {perm.actions.map((action) => (
                          <span
                            key={action}
                            className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium capitalize"
                          >
                            {action}
                          </span>
                        ))}
                        {perm.nestedPermissions.map((nested) => (
                          <span
                            key={nested}
                            className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium"
                          >
                            {nested.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

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
