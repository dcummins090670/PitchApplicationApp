import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
function PremiumAttendeesPage() {
  const [racecourses, setRacecourses] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
 
  // Fetch racecourses
    useEffect(() => {
    const fetchRacecourses = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/api/premiumFixtures/racecourses`, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch racecourses");
        const data = await response.json();
        console.log(data);
        setRacecourses(data);
        } catch (error) {
        console.error("Error fetching racecourses:", error);
        }
    };
    fetchRacecourses();
    }, []);

  const handleRacecourseChange = async (e) => {
    const racecourseId = e.target.value;
    if (racecourseId) {
      await fetchAttendees(racecourseId);
    } else {
      setAttendees([]);
    }
  };

  
  // Fetch racecourses
  const fetchAttendees = async (racecourseId) => {
    setLoading(true);  
    try {
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/premiumFixtures/${racecourseId}/attendance-list`, 
          { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch attendees");
      const data = await response.json();
      console.log(data);
      setAttendees(data);
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setLoading(false);
    }
  };

   
    return (
    <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Previous Premium Area Attendees</h1>

    <select
        onChange={handleRacecourseChange}
        className="border p-2 rounded mb-4"
        defaultValue="" >
        <option value="" disabled>-- Choose a Racecourse --</option>
        {racecourses.map((r) => (
          <option key={r.racecourse_id} value={r.racecourse_id}>
            {r.name}
          </option>
        ))}
    </select>
    
          {/*<h2 className="text-lg font-semibold mb-2">Pitches at Fixture</h2>*/}

        {loading ? (
        <p>Loading attendees...</p>
      ) : (
        /* Table of pitches */
      attendees.length > 0 && (
      <div className="mt-6 overflow-x-auto"> 

      {/* Mobile Pitch Cards */}
            <div className="sm:hidden space-y-4 mt-4">
              {attendees.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-xl shadow border bg-orange-100`}
                >
                  <p className="text-lg font-semibold"> {formatDate(a.fixture_date)} - {a.name}</p>
                  <p className="text-medium text-gray-700">
                    <span className="font-medium">Pitch:</span> {a.location}
                  </p>
                </div>
              ))}
            </div>

        {/* Table of pitches */} 
        <table className="hidden sm:table border-separate bg-orange-100 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-orange-900">
              <th className="border px-2 sm:px-4 py-2 text-left">Fixture Date</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
               <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch </th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.id} className="hover:bg-gray-200">
                <td className="border px-2 sm:px-4 py-2">{formatDate(a.fixture_date)}</td>
                <td className="border px-2 sm:px-4 py-2">{a.name}</td> 
                <td className="border px-2 sm:px-4 py-2">{a.location}</td> 
                <td className="border px-2 sm:px-4 py-2">{a.pitch_no}</td>               
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

export default PremiumAttendeesPage;    