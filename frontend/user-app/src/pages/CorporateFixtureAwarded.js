import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
function CorporateFixtureAwarded() {
  const [fixtures, setFixtures] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/upcoming`,        
        {    
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch fixtures");

        const data = await response.json();
        setFixtures(data);
      } catch (error) {
        console.error(error);
      }
    };
  fetchFixtures();
  }, []);

    
   const handleFixtureChange = async (e) => {
    const fixtureId = e.target.value;
    //const fixture = fixtures.find(f => f.fixtureId === parseInt(fixtureId));
   //await fetchPitches(fixtureId);
    if (fixtureId) {
      await fetchPitches(fixtureId);
    } else {
      setPitches([]);
    }
  };
    

    // This will use the fixtureId to fetch the pitches
    const fetchPitches = async (fixtureId) => {
    setLoading (true); 
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/${fixtureId}/awarded-pitches`,
         { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to fetch pitches");
        const data = await response.json();
        setPitches(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        }
    };


  
 return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Corporate Area Pitches</h1>
    

    <select
        onChange={handleFixtureChange}
        className="border p-2 rounded mb-4"
        defaultValue="" >
        <option value="" disabled>-- Choose a Fixture --</option>
        {fixtures.map((f) => (
          <option key={f.fixture_id} value={f.fixture_id}>
            {formatDate(f.fixture_date)} – {f.name}
          </option>
        ))}
      </select>

      {/*<h2 className="text-lg font-semibold mb-2">Pitches at Fixture</h2>*/}

    {loading ? (
        <p>Loading pitches...</p>
    ) : ( 
    /* Table of pitches */
      pitches.length > 0 && (
        /*<div className="mt-6 overflow-x-auto">
            <h2 className="text-lg font-bold mb-2">Pitches at Fixture</h2>*/
          <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
            <thead>
              <tr className="text-white bg-red-600">
                <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch Awarded</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
                
              </tr>
            </thead>
            <tbody>
              {pitches.map((p) => (
                <tr key={p.pitchid} className={`hover:bg-gray-50 ${
                p.corporatestatus === "Applied" ? "bg-red-100" : "bg-gray-300"
                }`} // Change background colour of the row to yellow if fixture.status has applied to work
                > 
                  <td className="border px-4 py-2">{p.bookmaker_name}</td>
                  <td className="border px-4 py-2">{p.pitch_label}</td>
                  <td className="border px-4 py-2">{p.location}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        /*</div>*/
      )
    )}
    </div>
  );
};

export default CorporateFixtureAwarded;



