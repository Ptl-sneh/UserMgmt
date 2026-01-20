import { hasPermission } from "../Components/Permissions";
import AdminLayout from "./Admin";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Quick access to your management tools
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {hasPermission("USER_VIEW") && (
              <div className="group bg-white rounded-3xl border border-slate-200 shadow-xl p-6
              hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600
                  flex items-center justify-center font-bold text-xl">
                    U
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    User Management
                  </h2>
                </div>

                <p className="text-slate-500 mb-6">
                  View, create, and manage users and their roles.
                </p>

                <Link
                  to="/users"
                  className="inline-flex items-center gap-2 text-indigo-600 font-semibold
                  hover:text-indigo-500 transition"
                >
                  Go to Users →
                </Link>
              </div>
            )}

            {hasPermission("ROLE_VIEW") && (
              <div className="group bg-white rounded-3xl border border-slate-200 shadow-xl p-6
              hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600
                  flex items-center justify-center font-bold text-xl">
                    R
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Role Management
                  </h2>
                </div>

                <p className="text-slate-500 mb-6">
                  Control roles, permissions, and access levels.
                </p>

                <Link
                  to="/roles"
                  className="inline-flex items-center gap-2 text-indigo-600 font-semibold
                  hover:text-indigo-500 transition"
                >
                  Go to Roles →
                </Link>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!hasPermission("USER_VIEW") && !hasPermission("ROLE_VIEW") && (
            <div className="mt-16 max-w-xl mx-auto bg-white rounded-3xl shadow-xl border
            border-slate-200 p-10 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No Access Assigned
              </h3>
              <p className="text-slate-500">
                You currently do not have permissions to view any modules.
                Please contact your administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Home;
