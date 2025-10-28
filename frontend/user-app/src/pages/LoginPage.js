import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgImage from "../assets/bettingRing.png";


function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [permitNo, setPermitNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // to allow for testing locally and online
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    try {
      //const response = await fetch('http://localhost:5000/api/auth/login', {
       // const response = await fetch('/api/auth/login', {
       const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permitNo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Handle 4xx or 5xx errors
        throw new Error(errorData.message || 'Login failed');
      }
     

      const data = await response.json();
      localStorage.setItem('token', data.token);
      //localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user', JSON.stringify({role:data.role})); // *1 -user object contains 'role' see above
      login(data.token, data.user);  // call Context Login for token and user
      login(data.token, {role: data.role});  // *2 - update version - see above
            
      // Optional: store user role if returned
      // localStorage.setItem('role', data.role);


      // Navigate based on role
      if (data.role === "bookmaker") {
        navigate("/my-pitches");
      } else if (data.role === "sis") {
        navigate("/attendance");
      } else if (data.role === "admin") {
        navigate("/fixtures");
      }

      /* 
      navigate('/my-pitches');  // redirect after login
      */  
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  }
  
 return (
    
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
        {/* Overlay (non-blocking) */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-50 pointer-events-none"></div>

        {/* Login Card */}
      <div className="relative bg-white/80 backdrop-blur-md w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl shadow-xl p-6 sm:p-8 z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6">
          Login
        </h1>

          {error && (
            <p className="text-center text-red-600 bg-red-100 rounded-md p-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Permit No */}
            <div>
              <label
                htmlFor="permitNo"
                className="block text-gray-700 font-medium mb-1"
              >
                Permit No
              </label>
              <input
                id="permitNo"
                type="text"
                placeholder="Enter Permit No"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={permitNo}
                onChange={(e) => setPermitNo(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              Log In
            </button>
          </form>

         <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
         </p>      
        </div>
      </div>
   
  );
}

export default LoginPage;

//<div className="container mx-auto p-2 max-w-md">
/*
<section className="relative bg-cover bg-center bg-[url('./assets/bettingRing.jpg')] flex items-center justify-center text-center bg-blue-500 py-80">
   
    
      
      
      <form onSubmit={handleSubmit} className="space-y-2">
             
        <div>
          
          <input id="permitNo"
            type="text"
            placeholder='Permit No.'
            className="w-full p-2 border border-blue-800 rounded"
            value={permitNo}
            onChange={e => setPermitNo(e.target.value)}
            required
          />
        </div>
        <div>
          
          <input id="password"
            type="password"
            placeholder='Password'
            className="w-full p-2 border border-blue-800 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-800"
        >
          Log In
        </button>
        {error && <p className="text-white bg-red-600 mb-8">{error}</p>}
      </form>
     </section> 

     */