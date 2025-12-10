import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminNavBar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = (section) => {
    setOpenDropdown(openDropdown === section ? null : section);
  };

  const sections = [
    {
      name: "Pitches",
      links: [
        { label: "Confirm Attendance", to: "/attendance" },
        { label: "View Applicants", to: "/fixtures" },
        { label: "Attendance List", to: "/attendees" },
      ],
    },
    {
      name: "Premium Area",
      links: [
        { label: "Add a Premium Fixture", to: "/premium-area" },
        { label: "View Applicants", to: "/premium-fixtures" },
        { label: "Assign Premium Pitches", to: "/prem-attendance" },
        { label: "Historical List", to: "/prem-attendees" },
      ],
    },
    {
      name: "Corporate Area",
      links: [
        { label: "Add a Corporate Fixture", to: "corporate-area" },
        { label: "View Applicants", to: "/corporate-fixtures" },
        { label: "Assign Corporate Pitches", to: "/corp-attendance" },
        { label: "Historical List", to: "/corp-attendees" },
      ],
    },
    {
      name: "Admin",
      links: [
        { label: "Edit Fixture List", to: "/test" },
        { label: "Edit Bookmaker List", to: "/test" },
        { label: "Update Pitch Ownership", to: "/test" }, 
      ],
    },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/*<h1 className="text-xl font-bold">Admin</h1>*/}

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive ? "border-b-2 border-white pb-1" : "hover:text-blue-200"
            }
          >
            Home
          </NavLink>

          {sections.map((section) => (
            <div key={section.name} className="relative">
              <button
                onClick={() => toggleDropdown(section.name)}
                className="flex items-center hover:text-blue-200 focus:outline-none"
                aria-expanded={openDropdown === section.name}
              >
                {section.name}
                {/* simple chevron */}
                <svg
                  className={`ml-1 transition-transform ${
                    openDropdown === section.name ? "transform rotate-180" : ""
                  }`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {openDropdown === section.name && (
                <div className="absolute left-0 mt-2 bg-white text-black rounded shadow-lg w-40 z-50">
                  {section.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
         

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-white text-black rounded-full px-4 py-1.5 shadow hover:bg-gray-100 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-black rounded-full px-4 py-1.5 shadow hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button (simple icon toggles) */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            // X icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            // Hamburger icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-blue-700 px-6 pb-3 space-y-2">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive ? "block py-2 border-b-2 border-white" : "block py-2 hover:text-blue-200"
            }
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>

          {sections.map((section) => (
            <div key={section.name}>
              <button
                onClick={() => toggleDropdown(section.name)}
                className="w-full flex justify-between items-center py-2"
                aria-expanded={openDropdown === section.name}
              >
                {section.name}
                <svg
                  className={`transition-transform ${
                    openDropdown === section.name ? "transform rotate-180" : ""
                  }`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {openDropdown === section.name && (
                <div className="pl-4 space-y-1">
                  {section.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block py-1 text-sm hover:text-blue-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <NavLink
            to="/hri-returns"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? "block py-2 border-b-2 border-white" : "block py-2 hover:text-blue-200"
            }
          >
            HRI Returns
          </NavLink>

          {isLoggedIn ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="bg-white text-black rounded-full px-4 py-1.5 shadow hover:bg-gray-100 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-white text-black rounded-full px-4 py-1.5 shadow hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default AdminNavBar;









