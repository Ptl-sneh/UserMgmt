import { useEffect, useState } from "react";
import { fetchModules } from "../services/ModuleService";

const RoleForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    permissions: [], // This will store selected module IDs
    status: "Active",
  });

  const [availableModules, setAvailableModules] = useState([]);
  const [groupedModules, setGroupedModules] = useState({}); // Grouped by moduleName for display
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch modules from backend on component mount
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        // Fetch individual modules (not grouped)
        const modules = await fetchModules(false); // false = get all individual modules
        
        console.log("Raw modules from API:", modules);
        
        // Group modules by moduleName for display
        const grouped = {};
        modules.forEach(module => {
          if (!grouped[module.moduleName]) {
            grouped[module.moduleName] = {
              moduleName: module.moduleName,
              displayName: formatModuleName(module.moduleName),
              description: getModuleDescription(module.moduleName),
              entries: [] // Array of individual module entries
            };
          }
          grouped[module.moduleName].entries.push({
            _id: module._id,
            action: module.actions,
            isActive: module.isActive
          });
        });
        
        setGroupedModules(grouped);
        
        // Convert grouped object to array for rendering
        const modulesArray = Object.values(grouped).map(group => ({
          moduleName: group.moduleName,
          displayName: group.displayName,
          description: group.description,
          entries: group.entries
        }));
        
        setAvailableModules(modulesArray);
        
      } catch (error) {
        console.error("Error loading modules:", error);
        setAvailableModules([]);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  // Helper function to format module names
  const formatModuleName = (moduleName) => {
    return moduleName.replace(/([A-Z])/g, " $1").trim();
  };

  // Helper function to get module descriptions
  const getModuleDescription = (moduleName) => {
    const descriptions = {
      Dashboard: "System overview and analytics",
      UserManagement: "Manage users and their accounts",
      RoleManagement: "Manage roles and permissions",
      PermissionManagement: "View and analyze permissions",
    };
    return descriptions[moduleName] || `Manage ${formatModuleName(moduleName)}`;
  };

  // Initialize form with initialData
  useEffect(() => {
    if (initialData && initialData._id) {
      console.log("Initial role data:", initialData);
      
      // Backend sends array of module IDs in initialData.permissions
      // We need to convert this to an array of selected module IDs
      const selectedModuleIds = initialData.permissions?.map(p => p._id) || [];
      
      setFormData({
        name: initialData.name || "",
        permissions: selectedModuleIds, // Array of module IDs
        status: initialData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        permissions: [], // Empty array of module IDs
        status: "Active",
      });
    }
    setErrors({});
  }, [initialData]);

  // Toggle module permission selection
  const togglePermission = (moduleId, action) => {
    setFormData((prev) => {
      const currentPermissions = [...prev.permissions];
      
      if (currentPermissions.includes(moduleId)) {
        // Remove permission
        return {
          ...prev,
          permissions: currentPermissions.filter(id => id !== moduleId)
        };
      } else {
        // Add permission
        return {
          ...prev,
          permissions: [...currentPermissions, moduleId]
        };
      }
    });
  };

  // Toggle all permissions for a module
  const toggleAllPermissions = (moduleName, e) => {
    e.stopPropagation();
    const moduleGroup = groupedModules[moduleName];
    if (!moduleGroup) return;

    const moduleEntries = moduleGroup.entries;
    const allModuleIds = moduleEntries.map(entry => entry._id);
    const currentSelectedIds = formData.permissions;
    
    // Check if all permissions for this module are already selected
    const allSelected = allModuleIds.every(id => currentSelectedIds.includes(id));
    
    setFormData((prev) => {
      let newPermissions = [...prev.permissions];
      
      if (allSelected) {
        // Remove all permissions for this module
        newPermissions = newPermissions.filter(id => !allModuleIds.includes(id));
      } else {
        // Add all permissions for this module
        allModuleIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  // Check if a specific permission is selected
  const isPermissionSelected = (moduleId) => {
    return formData.permissions.includes(moduleId);
  };

  // Check if all permissions for a module are selected
  const areAllPermissionsSelected = (moduleName) => {
    const moduleGroup = groupedModules[moduleName];
    if (!moduleGroup) return false;
    
    const moduleEntries = moduleGroup.entries;
    const allModuleIds = moduleEntries.map(entry => entry._id);
    
    return allModuleIds.length > 0 && 
           allModuleIds.every(id => formData.permissions.includes(id));
  };

  // Check if any permission for a module is selected
  const isAnyPermissionSelected = (moduleName) => {
    const moduleGroup = groupedModules[moduleName];
    if (!moduleGroup) return false;
    
    const moduleEntries = moduleGroup.entries;
    const allModuleIds = moduleEntries.map(entry => entry._id);
    
    return allModuleIds.some(id => formData.permissions.includes(id));
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

    // Prepare data for backend
    const roleData = {
      name: formData.name,
      permissions: formData.permissions, // Already array of module IDs
      status: formData.status
    };

    console.log("Submitting role data:", roleData);
    onSubmit(roleData);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b bg-slate-50">
          <h2 className="text-2xl font-extrabold text-slate-900">
            {initialData ? "Edit Role" : "Create Role"}
          </h2>
        </div>
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500">Loading modules...</p>
        </div>
      </div>
    );
  }

  // Show error state if no modules loaded
  if (availableModules.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b bg-slate-50">
          <h2 className="text-2xl font-extrabold text-slate-900">
            {initialData ? "Edit Role" : "Create Role"}
          </h2>
        </div>
        <div className="p-16 text-center">
          <p className="text-slate-500 mb-6">
            No modules found. Please create modules first in the backend.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
        <div className="mt-2 text-sm text-slate-600">
          <span className="font-medium">
            {formData.permissions.length} permissions selected across {availableModules.length} modules
          </span>
        </div>
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

        {/* Module Permissions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-bold text-slate-900">
              Module Permissions
            </label>
            <div className="text-sm text-slate-500">
              {formData.permissions.length} permissions selected
            </div>
          </div>

          <div className="space-y-6">
            {availableModules.map((module) => {
              const isModulePartiallySelected = isAnyPermissionSelected(module.moduleName);
              const isModuleFullySelected = areAllPermissionsSelected(module.moduleName);

              return (
                <div
                  key={module.moduleName}
                  className={`border rounded-2xl p-6 transition-all ${
                    isModulePartiallySelected
                      ? "border-indigo-300 bg-indigo-50/50"
                      : "border-slate-200"
                  }`}
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {module.displayName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {module.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleAllPermissions(module.moduleName, e)}
                      className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      {isModuleFullySelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* Module Permissions */}
                  <div className="space-y-3">
                    {module.entries.map((entry) => (
                      <label
                        key={entry._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          isPermissionSelected(entry._id)
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isPermissionSelected(entry._id)}
                          onChange={() => togglePermission(entry._id, entry.action)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {entry.action}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({module.moduleName})
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
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
              {availableModules
                .filter(module => isAnyPermissionSelected(module.moduleName))
                .map((module) => {
                  const selectedEntries = module.entries.filter(
                    entry => formData.permissions.includes(entry._id)
                  );
                  
                  return (
                    <div
                      key={module.moduleName}
                      className="border-b border-slate-200 pb-4 last:border-0"
                    >
                      <div className="font-medium text-slate-900 mb-2">
                        {module.displayName}
                        <span className="text-sm text-slate-500 ml-2">
                          ({selectedEntries.length} of {module.entries.length} actions)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntries.map((entry) => (
                          <span
                            key={entry._id}
                            className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium capitalize"
                          >
                            {entry.action}
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