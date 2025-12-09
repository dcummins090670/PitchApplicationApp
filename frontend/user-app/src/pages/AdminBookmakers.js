import React, { useEffect, useState } from "react";

function AdminBookmakerPage() {
  const [bookmakers, setBookmakers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  // Fetch bookmakers
  const fetchBookmakers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/bookmakers`, 
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

  

  // Delete Bookmaker
  const handleDeleteBookmaker = async (permitNo) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/bookmakers/${permitNo}`,
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
              <tr key={b.permit_no} className="hover:bg-gray-50">
                <td className="border px-2 sm:px-4 py-2">{b.permit_no}</td>
                <td className="border px-2 sm:px-4 py-2">{b.name}</td>
                <td className="border px-2 sm:px-4 py-2">
                  <button
                    onClick={() => handleDeleteBookmaker(b.permit_no)}
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
