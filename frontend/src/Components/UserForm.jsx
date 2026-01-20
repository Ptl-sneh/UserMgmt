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

  const hobbiesOptions = [
    { value: "music", label: "Music" },
    { value: "sports", label: "Sports" },
    { value: "gaming", label: "Gaming" },
    { value: "reading", label: "Reading" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        roles: initialData.roles?.map((r) => r._id) || [],
      });
    }
  }, [initialData]);

  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetchRoles();
      setRoles(res.data);
    };
    loadRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (name, value) => {
    const values = formData[name];
    setFormData({
      ...formData,
      [name]: values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    });
  };

  const submitForm = () => {
    onSubmit(formData);
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
            Full Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl border border-slate-200
            focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!initialData}
            placeholder="user@example.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200
            focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition
            disabled:bg-slate-100"
            required
          />
          {initialData && (
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          )}
        </div>

        {/* Password */}
        {!initialData && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200
              focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              required
            />
          </div>
        )}

        {/* Roles */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Roles
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {roles.map((role) => (
              <label
                key={role._id}
                className="flex items-center gap-3 p-3 rounded-xl
                border border-slate-200 hover:border-indigo-300 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role._id)}
                  onChange={() => handleCheckboxChange("roles", role._id)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-slate-700">
                  {role.name}
                </span>
              </label>
            ))}
          </div>
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
                  onChange={() =>
                    handleCheckboxChange("hobbies", hobby.value)
                  }
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
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white
            font-semibold shadow-lg hover:bg-indigo-500 transition"
          >
            {initialData ? "Update User" : "Create User"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-300
            text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
