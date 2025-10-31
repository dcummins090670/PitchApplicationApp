import React, { useEffect, useState } from "react";

function AdminFixturePage() {
  const [fixtures, setFixtures] = useState([]);
  const [racecourses, setRacecourses] = useState([]);
  const [fixtureDate, setFixtureDate] = useState("");
  const [racecourseId, setRacecourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  
  // Fetch fixtures
  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/fixtures`, 
        {headers: {Authorization: `Bearer ${token}` }  }
      );

      if (!response.ok) throw new Error("Failed to fetch fixtures");
      const data = await response.json();
      setFixtures(data);
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch racecourses
  const fetchRacecourses = async () => {
    try {
      const token = localStorage.getItem("token");
     const response = await fetch(`${API_BASE_URL}/api/fixtures/racecourses`, 
          { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch racecourses");
      const data = await response.json();
      setRacecourses(data);
    } catch (error) {
      console.error("Error fetching racecourses:", error);
    }
  };

  // Add fixture
  const handleAddFixture = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/fixtures`, 
        {         
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fixtureDate,
          racecourseId:parseInt(racecourseId, 10),
        }),
      });

      const data = await response.json(); // read the response

      if (!response.ok) throw new Error("Failed to add fixture");

      setMessage(data.message); // set success message
      setFixtureDate("");
      setRacecourseId("");
      fetchFixtures();
    } catch (error) {
      console.error("Error adding fixture:", error);
      setMessage(error.message); // show error too
    }
  };

  // Delete fixture
  const handleDeleteFixture = async (fixtureId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/fixtures/${fixtureId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json(); // read backend response

      if (!response.ok) throw new Error("Failed to delete fixture");

      setMessage(data.message); // success message
      fetchFixtures();
    } catch (error) {
      console.error("Error deleting fixture:", error);
      setMessage(error.message);
    }
  };

  // Load fixtures + racecourses on mount
  useEffect(() => {
    fetchFixtures();
    fetchRacecourses();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin – Manage Fixtures</h1>

      {/* Add fixture form */}
      <form onSubmit={handleAddFixture} className="mb-6 space-x-2">
        <input
          type="date"
          value={fixtureDate}
          onChange={(e) => setFixtureDate(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />

        <select
          value={racecourseId}
          onChange={(e) => setRacecourseId(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        >
          <option value="">-- Select Racecourse --</option>
          {racecourses.map((r) => (
            <option key={r.racecourseId} value={r.racecourseId}>
              {r.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Fixture
        </button>
      </form>

      {/* Fixtures table */}
        {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
            {message}
          </div>
        )}
      {loading ? (
        <p>Loading fixtures...</p>
      ) : (
        
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-blue-800">
              <th className="border px-2 sm:px-4 py-2 text-left">Fixture Date</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Racecourse</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((f) => (
              <tr key={f.fixtureId} className="hover:bg-gray-50">
                <td className="border px-2 sm:px-4 py-2">{f.fixtureDate}</td>
                <td className="border px-2 sm:px-4 py-2">{f.name}</td>
                <td className="border px-2 sm:px-4 py-2">
                  <button
                    onClick={() => handleDeleteFixture(f.fixtureId)}
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

export default AdminFixturePage;
