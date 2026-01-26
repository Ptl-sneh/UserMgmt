import { useState, useEffect } from "react";
import { fetchRoles } from "../services/RoleService";

const validateForm = (data, isEdit = false) => {
  const errors = {};

  // Name
  if (!data.name || !data.name.trim()) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z\s]+$/.test(data.name.trim())) {
    errors.name = "Name must contain only alphabets and spaces";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (data.name.trim().length > 50) {
    errors.name = "Name must not exceed 50 characters";
  }

  // Email (create only)
  if (!isEdit) {
    if (!data.email || !data.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())
    ) {
      errors.email = "Please enter a valid email address";
    }
  }

  // Password (create only)
  if (!isEdit) {
    if (!data.password) {
      errors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(
        data.password
      )
    ) {
      errors.password =
        "Password must contain uppercase, lowercase, number and special character";
    }
  }

  // Roles - must select at least one role
  if (!data.roles || data.roles.length === 0) {
    errors.roles = "Please select a role";
  }

  return errors;
};

const UserForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roles: [], // Will contain single role ID as array for backend compatibility
    hobbies: [],
    status: "Active",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hobbiesOptions = [
    { value: "music", label: "Music" },
    { value: "sports", label: "Sports" },
    { value: "gaming", label: "Gaming" },
    { value: "reading", label: "Reading" },
  ];

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (initialData && initialData._id) {
      // Get first role if multiple exist (for backward compatibility)
      const userRoles = initialData.roles?.map((r) => r._id) || [];
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        roles: userRoles.length > 0 ? [userRoles[0]] : [], // Only first role
        hobbies: initialData.hobbies || [],
        status: initialData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        roles: [],
        hobbies: [],
        status: "Active",
      });
    }
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const res = await fetchRoles();
        setRoles(res?.data?.roles || res?.data || []);
      } catch (error) {
        console.error("Error loading roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleCheckboxChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: formData[name].includes(value)
        ? formData[name].filter((v) => v !== value)
        : [...formData[name], value],
    });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleRoleChange = (roleId) => {
    setFormData({
      ...formData,
      roles: [roleId], // Single role as array for backend compatibility
    });
    if (errors.roles) setErrors({ ...errors, roles: "" });
  };

  /* ================= SUBMIT ================= */
  const submitForm = async () => {
    setIsSubmitting(true);
    setErrors({});

    // FRONTEND VALIDATION
    const validationErrors = validateForm(formData, !!initialData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // BACKEND VALIDATION ERRORS
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        console.error("Error:", error.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= JSX ================= */
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b bg-slate-50">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {initialData ? "Edit User" : "Create User"}
        </h2>
        <p className="text-slate-500 mt-1">
          {initialData
            ? "Update user information"
            : "Fill in the details to create a new user"}
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* NAME */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Full Name *
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? "border-rose-500" : "border-slate-200"
            }`}
          />
          {errors.name && (
            <p className="text-sm text-rose-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Email *
          </label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!initialData}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email ? "border-rose-500" : "border-slate-200"
            }`}
          />
          {errors.email && (
            <p className="text-sm text-rose-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        {!initialData && (
          <div>
            <label className="block text-sm font-semibold mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.password ? "border-rose-500" : "border-slate-200"
              }`}
            />
            {errors.password && (
              <p className="text-sm text-rose-600 mt-1">
                {errors.password}
              </p>
            )}
          </div>
        )}

        {/* Roles */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Role *
          </label>
          {loading ? (
            <div className="text-center py-4 text-slate-500">
              Loading roles...
            </div>
          ) : !Array.isArray(roles) || roles.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              No roles available
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {roles.map((role) => {
                const roleId = role._id || role.id;
                const isSelected = formData.roles.includes(roleId);
                return (
                  <label
                    key={roleId}
                    className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer
                      ${
                        errors.roles
                          ? "border border-rose-300 hover:border-rose-400"
                          : isSelected
                          ? "border border-indigo-500 bg-indigo-50"
                          : "border border-slate-200 hover:border-indigo-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleId}
                      checked={isSelected}
                      onChange={() => handleRoleChange(roleId)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {role.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {errors.roles && (
            <p className="mt-2 text-sm text-rose-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.roles}
            </p>
          )}
        </div>

        {/* Hobbies */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Hobbies
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {hobbiesOptions.map((hobby) => (
              <label
                key={hobby.value}
                className="flex items-center gap-3 p-3 rounded-xl
                border border-slate-200 hover:border-indigo-300 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.hobbies.includes(hobby.value)}
                  onChange={() => handleCheckboxChange("hobbies", hobby.value)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-slate-700">
                  {hobby.label}
                </span>
              </label>
            ))}
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
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={submitForm}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
          >
            {isSubmitting
              ? initialData
                ? "Updating..."
                : "Creating..."
              : initialData
              ? "Update User"
              : "Create User"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
