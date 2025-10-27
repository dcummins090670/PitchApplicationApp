import React, { useEffect, useState } from "react";

function AdminBookmakerPage() {
  const [bookmakers, setBookmakers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch bookmakers
  const fetchBookmakers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/bookmakers", 
        {headers: {Authorization: `Bearer ${token}` }  }
      );

      if (!response.ok) throw new Error("Failed to fetch bookmakers");
      const data = await response.json();
      setBookmakers(data);
    } catch (error) {
      console.error("Error fetching bookmakers:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  // Add Bookmaker
  const handleAddBookmaker= async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/bookmakers", 
        {         
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permitNo,
          UserName,
        }),
      });

      const data = await response.json(); // read the response

      if (!response.ok) throw new Error("Failed to add bookmaker");

      setMessage(data.message); // set success message
      
      
      fetchBookmakers();
    } catch (error) {
      console.error("Error adding bookmaker:", error);
      setMessage(error.message); // show error too
    }
  };
  */

  // Delete fixture
  const handleDeleteBookmaker = async (permitNo) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/bookmakers/${permitNo}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json(); // read backend response

      if (!response.ok) throw new Error("Failed to delete bookmaker");

      setMessage(data.message); // success message
      fetchBookmakers();
    } catch (error) {
      console.error("Error deleting bookmaker:", error);
      setMessage(error.message);
    }
  };

  // Load fixtures + racecourses on mount
    useEffect(() => {
    fetchBookmakers();
    
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4"> Manage Bookmakers</h1>

      
        {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
            {message}
          </div>
        )}
      {loading ? (
        <p>Loading bookmakers...</p>
      ) : (
        
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-blue-800">
              <th className="border px-2 sm:px-4 py-2 text-left">Permit No</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Name</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookmakers.map((b) => (
              <tr key={b.permitNo} className="hover:bg-gray-50">
                <td className="border px-2 sm:px-4 py-2">{b.permitNo}</td>
                <td className="border px-2 sm:px-4 py-2">{b.name}</td>
                <td className="border px-2 sm:px-4 py-2">
                  <button
                    onClick={() => handleDeleteBookmaker(b.permitNo)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}



export default AdminBookmakerPage;
/*

// Add Bookmaker form 


      <form onSubmit={handleAddBookmaker} className="mb-6 space-x-2">
        <input
          type="text"
          value={permitNo}
          className="border px-2 py-1 rounded"
          required
        />

        <input
          type="text"
          value={UserName}
          className="border px-2 py-1 rounded"
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Bookmaker
        </button>
      </form>

                            // Bookmakers table 

      // REGISTER Route
router.post('/register', async (req, res) => {
   const { permitNo, name, phone, email, password, role } = req.body;

    if (!permitNo || !name || !phone || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if permitNo already exists
         const [existing] = await db.query('SELECT * FROM users WHERE permitNo = ?', [permitNo]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bookmaker already exists' });
        }
        // Check if email already exists
        const [existingByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingByEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db.query(
            'INSERT INTO users (permitNo, name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            [permitNo, name, phone, email, hashedPassword, role] // Assuming role is the role_id
        );

        // Optional auto-login the user after registering, generate and return a token
        const token = jwt.sign(
           { permitNo, role: role },
                  process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

*/