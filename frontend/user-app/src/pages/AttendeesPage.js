import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
function AttendeesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
 
  // Fetch racecourses
    useEffect(() => {
       const fetchFixtures = async () => {
         try {
           const token = localStorage.getItem("token");
           const response = await fetch(`${API_BASE_URL}/api/fixtures/currentyear`,        
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
      const response = await fetch(`${API_BASE_URL}/api/fixtures/${fixtureId}/attended-pitches`,
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
    <h1 className="text-xl font-bold mb-4">2025 Fixtures</h1>
    
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
        
      pitches.length > 0 && (

      <div className="mt-6 overflow-x-auto">
            {/* Attendance Summary Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3">Attendance Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                

                {/* Total Pitches Attended */}
                <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                  <p className="text-2xl font-bold">Pitches Worked</p>
                  <p className="text-2xl font-bold">
                    {pitches.filter((p) => p.attendance === "Attended").length}
                  </p>
                </div>

                {/* Number of Bookmakers Attended */}
                <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                  <p className="text-2xl font-bold">Total Bookmakers</p>
                  <p className="text-2xl font-bold">
                    {
                      new Set(
                        pitches
                          .filter((p) => p.attendance === "Attended")
                          .map((p) => p.bookmaker_name)
                      ).size
                    }
                  </p>
                </div>
              </div>
            </div>  
        
        
        
        
        
        {/* Table of pitches */}
        
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-blue-800">
              <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
               <th className="border px-2 sm:px-4 py-2 text-left">Pitch </th>
            </tr>
          </thead>
          <tbody>
            {pitches.map((p) => (
              <tr key={p.pitch_id} className="hover:bg-red-200">
                <td className="border px-4 py-2">{p.pitch_label}</td> 
                <td className="border px-4 py-2">{p.bookmaker_name}</td> 
                <td className="border px-4 py-2">{p.pitch_no}</td>               
              </tr>
            ))}
          </tbody>
        </table>
       </div> 
      )
    )}
    </div>
  );
}

export default AttendeesPage;    