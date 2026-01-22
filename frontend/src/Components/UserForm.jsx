import { useState, useEffect } from "react";
import { fetchRoles } from "../services/RoleService";

const UserForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roles: [],
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

  useEffect(() => {
    if (initialData && initialData._id) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        roles: initialData.roles?.map((r) => r._id) || [],
        hobbies: initialData.hobbies || [],
        status: initialData.status || "Active",
      });
    } else if (initialData === null || initialData === undefined) {
      setFormData({
        name: "",
        email: "",
        password: "",
        roles: [],
        hobbies: [],
        status: "Active",
      });
    }
    // Clear errors when data changes
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const res = await fetchRoles();
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            setRoles(res.data);
          } else if (res.data.roles && Array.isArray(res.data.roles)) {
            setRoles(res.data.roles);
          } else if (res.data.data && Array.isArray(res.data.data)) {
            setRoles(res.data.data);
          } else {
            console.error("Unexpected roles response structure:", res);
            setRoles([]);
          }
        } else {
          console.error("No data in roles response:", res);
          setRoles([]);
        }
      } catch (error) {
        console.error("Error loading roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCheckboxChange = (name, value) => {
    const values = formData[name];
    setFormData({
      ...formData,
      [name]: values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(formData);
      // If successful, errors will be cleared and modal will close
    } catch (error) {
      // Handle validation errors from backend
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Handle general error message
        console.error("Error:", error.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Form */}
      <div className="p-8 space-y-8">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-xl border transition
              ${
                errors.name
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!initialData}
            placeholder="user@example.com"
            className={`w-full px-4 py-3 rounded-xl border transition
              ${
                errors.email
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              }
              ${initialData ? "disabled:bg-slate-100" : ""}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.email}
            </p>
          )}
          {initialData && !errors.email && (
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          )}
        </div>

        {/* Password */}
        {!initialData && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl border transition
                ${
                  errors.password
                    ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.password}
              </p>
            )}
          </div>
        )}

        {/* Roles */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Roles
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
              {roles.map((role) => (
                <label
                  key={role._id || role.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer
                    ${
                      errors.roles
                        ? "border border-rose-300 hover:border-rose-400"
                        : "border border-slate-200 hover:border-indigo-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role._id || role.id)}
                    onChange={() =>
                      handleCheckboxChange("roles", role._id || role.id)
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {role.name}
                  </span>
                </label>
              ))}
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

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={submitForm}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white
            font-semibold shadow-lg hover:bg-indigo-500 transition
            disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex-1 py-3 rounded-xl border border-slate-300
            text-slate-700 font-semibold hover:bg-slate-50 transition
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
