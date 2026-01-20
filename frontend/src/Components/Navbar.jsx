const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="font-semibold text-lg">Admin Panel</h1>
      <span className="text-gray-600 text-sm">{user?.name}</span>
    </div>
  );
};

export default Navbar;
