import React, { useEffect, useState } from "react";
import { useLocation, useNavigate,Link } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [display, setDisplay] = useState(path === '/main');

  useEffect(() => {
    setDisplay(path === '/main')
  }, [path]);

  const handleLogout = () => {
    setDisplay(false);
    navigate('/');
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("LoggedInUser");
  }

  return (
    <header className="bg-black text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              {display && <Link to="/" className="hover:text-gray-300" onClick={handleLogout}>
                Logout
              </Link>}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
