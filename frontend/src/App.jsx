import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProRoute from "./routes/ProRoutes";
import Users from "./pages/User";
import Roles from "./pages/Roles";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Dashboard (role-based only) */}
        <Route
          path="/dashboard"
          element={
            <ProRoute allowedRoles={["Admin"]}>
              <Dashboard />
            </ProRoute>
          }
        />

        {/* Home (authenticated users) */}
        <Route
          path="/home"
          element={
            <ProRoute>
              <Home />
            </ProRoute>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <ProRoute
              requiredPermission={{ module: "UserManagement", action: "read" }}
            >
              <Users />
            </ProRoute>
          }
        />

        {/* Roles */}
        <Route
          path="/roles"
          element={
            <ProRoute
              requiredPermission={{ module: "RoleManagement", action: "read" }}
            >
              <Roles />
            </ProRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
