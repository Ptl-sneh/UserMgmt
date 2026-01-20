import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-60 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>

      <nav className="space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-gray-700" : "hover:bg-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-gray-700" : "hover:bg-gray-700"
            }`
          }
        >
          Users
        </NavLink>

        <NavLink
          to="/roles"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-gray-700" : "hover:bg-gray-700"
            }`
          }
        >
          Roles
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
