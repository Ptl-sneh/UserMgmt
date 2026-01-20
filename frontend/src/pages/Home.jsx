import { hasPermission } from "../Components/Permissions";
import AdminLayout from "./Admin";

const Home = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Welcome</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasPermission("USER_VIEW") && (
          <div className="border p-4 rounded bg-white">
            <h2 className="font-semibold mb-2">User Management</h2>
            <p className="text-sm text-gray-600">
              View users and their details
            </p>
            <a href="/users" className="text-blue-600 text-sm">
              Go to Users
            </a>
          </div>
        )}

        {hasPermission("ROLE_VIEW") && (
          <div className="border p-4 rounded bg-white">
            <h2 className="font-semibold mb-2">Role Management</h2>
            <p className="text-sm text-gray-600">
              View roles and permissions
            </p>
            <a href="/roles" className="text-blue-600 text-sm">
              Go to Roles
            </a>
          </div>
        )}

        {!hasPermission("USER_VIEW") &&
          !hasPermission("ROLE_VIEW") && (
            <p className="text-gray-600">
              You currently have no permissions assigned.
            </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default Home;
