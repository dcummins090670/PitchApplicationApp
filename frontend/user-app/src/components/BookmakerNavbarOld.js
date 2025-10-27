import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



function BookmakerNavBar() {
     const { isLoggedIn, logout } = useAuth();
        const navigate = useNavigate();
    
    
    
        function handleLogout() {
            //localStorage.removeItem('token');
            logout();
            navigate('/login');
        } 
   
    return (
    <nav className="bg-blue-600 text-white p-4">
      <h1>Bookmaker Navbar</h1>  
      <div className="container mx-auto flex space-x-4">
            <Link to="/home" className="hover:underline">Home</Link>
            {/* Pitches dropdown */}
            <section className="relative group">
              <button className="hover:underline">Pitches</button>
                <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded shadow-lg">
                  <Link to="/my-pitches" className="block px-4 py-2 hover:bg-gray-200">Apply</Link>
                  <Link to="/fixtures" className="block px-4 py-2 hover:bg-gray-200">Applicants</Link>
                   <Link to="/attendees" className="block px-4 py-2 hover:bg-gray-200">Attended</Link>
                </div>
            </section>
            {/* Premium dropdown */}
            <section className="relative group">
              <button className="hover:underline">Premium</button>
                <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded shadow-lg">
                  <Link to="/my-premium-pitches" className="block px-4 py-2 hover:bg-gray-200">Apply</Link>
                  <Link to="/premium-fixtures" className="block px-4 py-2 hover:bg-gray-200">Applicants</Link>
                  <Link to="/prem-awarded" className="block px-4 py-2 hover:bg-gray-200">Awarded</Link>
                  <Link to="/prem-attendees" className="block px-4 py-2 hover:bg-gray-200">Previous</Link>
                </div>
            </section>
            {/* Premium dropdown */}
            <section className="relative group">
              <button className="hover:underline">Corporate</button>
                <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded shadow-lg">
                  <Link to="/my-corporate-pitches" className="block px-4 py-2 hover:bg-gray-200">Apply</Link>
                  <Link to="/corporate-fixtures" className="block px-4 py-2 hover:bg-gray-200">Applicants</Link>
                  <Link to="/corp-awarded" className="block px-4 py-2 hover:bg-gray-200">Awarded</Link>
                  <Link to="/corp-attendees" className="block px-4 py-2 hover:bg-gray-200">Previous</Link>
                </div>
            </section>
            <Link to="/hri-returns" className="hover:underline">HRI Returns</Link>
           
            {isLoggedIn ? (
            <button onClick={handleLogout}  className="bg-white text-black rounded-full px-4 py-2 shadow hover:bg-gray-100 transition">Logout</button>
            ) : (
            <Link to="/login"  className="bg-white text-black rounded-full px-2 py-2 shadow hover:bg-gray-100 transition">Login</Link>
            )}
      </div>
    </nav>
    );
}

export default BookmakerNavBar;
