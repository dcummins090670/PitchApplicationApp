import React from "react";
import { useNavigate } from "react-router-dom";

function BookmakerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 ">
    
      <h1 className="text-xl font-bold mb-4">Bookmaker Dashboard</h1>
      <div className="flex justify-start ...">
        <div>
          <button
            onClick={() => navigate("/my-pitches")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply To Work Pitch
          </button>
        </div>
       

        <div>
          <button
            onClick={() => navigate("/my-premium-pitches")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply To Work Premium
          </button>
        </div>

        <div>
          <button
            onClick={() => navigate("/my-corporate-pitches")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply To Work Corporate
          </button>
        </div>

      </div>

    </div>

    
  );
}

export default BookmakerDashboard;


/*
import React, { useState } from "react";

function BookmakerDashboard() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFixtures = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
      const response = await fetch("http://localhost:5000/api/fixtures/my-fixtures", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch fixtures");
      }

      const data = await response.json();
      setFixtures(data);
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bookmaker Dashboard</h1>

      <button
        onClick={fetchFixtures}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Get My Fixtures
      </button>

      {loading && <p>Loading...</p>}

      <ul className="mt-4">
        {fixtures.map((fixture, index) => (
          <li key={index} className="border-b py-2">
            {fixture.fixtureId} – {fixture.fixtureDate} @ {fixture.racecourseName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookmakerDashboard;
*/