import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProRoute from "./routes/ProRoutes";
import './App.css';

const Users = () => <h1 className="p-6">Users Page</h1>;
const Roles = () => <h1 className="p-6">Roles Page</h1>;
const Welcome = () => <h1 className="p-6">Welcome User</h1>;

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
          path="/users"
          element={
            <ProRoute allowedRoles={["Admin"]}>
              <Users />
            </ProRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProRoute allowedRoles={["Admin"]}>
              <Roles />
            </ProRoute>
          }
        />

        <Route
          path="/welcome"
          element={
            <ProRoute>
              <Welcome />
            </ProRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
