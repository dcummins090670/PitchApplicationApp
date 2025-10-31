import React, { useState } from "react";
function RegistrationPage() {

  const [formData, setFormData] = useState({permitNo: "",name: "",phone: "",email: "",password: "",role_id: "",});
  const [message, setMessage] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registered successfully. You can now log in!");
        setFormData({permitNo: "",name: "",phone: "",email: "",password: "",role_id: "",});
      } else {
        setMessage(`${data.error || data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="p-4">
       <h1 className="text-xl font-bold mb-4">Register</h1>

      {message && <p>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="permitNo"
          placeholder="Permit No"
          value={formData.permitNo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        {/* Role dropdown if you want fixed roles */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Role --</option>
          <option value="1">Bookmaker</option>
          <option value="2">Sis</option>
          <option value="3">Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationPage;





/*
function RegistrationPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [permitNo, setPermitNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        navigate("/dashboard/bookmaker");
      } else if (data.role === "sis") {
        navigate("/dashboard/sis");
      } else if (data.role === "admin") {
        navigate("/dashboard/admin");
      }


      //navigate('/');  // redirect after login
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  }
  
 return (
    <div className="container mx-auto p-2 max-w-md">
      
      <section className="relative bg-cover bg-center bg-[url('./assets/bettingRing.jpg')] flex items-center justify-center text-center bg-blue-500 py-80">
   
    
      
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          
          <input
            type="text"
            placeholder='Permit No.'
            className="w-full p-2 border border-blue-800 rounded"
            value={permitNo}
            onChange={e => setPermitNo(e.target.value)}
            required
          />
        </div>
        <div>
          
          <input
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
    </div>
  );
}

export default RegistrationPage;
*/
