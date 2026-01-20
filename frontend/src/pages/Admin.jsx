import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />
        <main className="p-6 bg-gray-100 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
