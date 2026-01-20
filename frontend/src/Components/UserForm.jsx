import { useEffect, useState } from "react";
import { fetchRoles } from "../services/RoleService";

const UserForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roles: [],
    hobbies: [],
    status: "Active"
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        roles: initialData.roles?.map(r => r._id) || []
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

  const handleRoleChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, o => o.value);
    setFormData({ ...formData, roles: selected });
  };

  const handleHobbyChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, o => o.value);
    setFormData({ ...formData, hobbies: selected });
  };

  const submitForm = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded border mb-6">
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? "Edit User" : "Create User"}
      </h2>

      <form onSubmit={submitForm} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          className="border p-2 w-full"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={!!initialData}
        />

        {!initialData && (
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border p-2 w-full"
            value={formData.password}
            onChange={handleChange}
            required
          />
        )}

        {/* Roles */}
        <select
          multiple
          className="border p-2 w-full"
          value={formData.roles}
          onChange={handleRoleChange}
        >
          {roles.map(role => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>

        {/* Hobbies */}
        <select
          multiple
          className="border p-2 w-full"
          value={formData.hobbies}
          onChange={handleHobbyChange}
        >
          <option value="music">Music</option>
          <option value="sports">Sports</option>
          <option value="gaming">Gaming</option>
          <option value="reading">Reading</option>
        </select>

        {/* Status */}
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="status"
              value="Active"
              checked={formData.status === "Active"}
              onChange={handleChange}
            /> Active
          </label>

          <label>
            <input
              type="radio"
              name="status"
              value="Inactive"
              checked={formData.status === "Inactive"}
              onChange={handleChange}
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

export default UserForm;
