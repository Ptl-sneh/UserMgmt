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
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProRoute allowedRoles={["Admin"]}>
              <Dashboard />
            </ProRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProRoute>
              <Home />
            </ProRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProRoute requiredPermission="USER_VIEW">
              <Users />
            </ProRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProRoute requiredPermission="ROLE_VIEW">
              <Roles />
            </ProRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
