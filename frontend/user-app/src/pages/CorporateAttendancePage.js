import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
//import { ping } from "../../../../backend/config/db";

function CorporateAttendancePage() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState("");
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchCorporateFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/corporateFixtures",        
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
  fetchCorporateFixtures();
  }, []);


   const handleCorporateFixtureChange = async (e) => {
    const fixtureId = e.target.value;
    setSelectedFixture(fixtureId); // Save it in state
    
    
    if (fixtureId) {
      await fetchCorporatePitches(fixtureId);
    } else {
      setPitches([]);
    }
  };
    

    // This will use the fixtureId to fetch the pitches
    const fetchCorporatePitches = async (fixtureId) => {
    setLoading (true); 
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/corporateFixtures/${fixtureId}/corporate-pitches`,
         { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch pitches");
        const data = await response.json();
        console.log(data);  
        setPitches(data);
        } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        }
      };


     // Extra code to handle attendance change
  const handleCorporateAttendance = async (fixtureId, pitchId, racecourseId, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/corporateFixtures/${fixtureId}/${pitchId}/${racecourseId}/attendance`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ location: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update location");

        // revert if it fails 
        setPitches((prevPitches) =>
          prevPitches.map((pitch) =>
            pitch.pitchId === pitchId
              ? { ...pitch, location: oldStatus }
              : pitch
          )
        );

        return;
      }

      // update UI with new pitch location if successful
      setPitches((prevPitches) =>
        prevPitches.map((pitch) =>
          pitch.pitchId === pitchId
            ? { ...pitch, location: newStatus }
            : pitch
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Error updating location");
      
    }
  };

 // This will be the result when we click the "storeAttendee"s button
      const storeAttendees = async () => {
        if (!selectedFixture) {
            alert("Please select a fixture first.");
            return;
  }
      const attendees = pitches
      .filter((p) => p.location === "Main Ring & Corporate Area")
      .map((p) => ({
        pitchId: p.pitchId,
        bookmakerPermitNo: p.permitNo, 
      }));

      if (attendees.length === 0) {
      alert("No attendees to store.");
      return;
      }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/corporateFixtures/${selectedFixture}/attendance-list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ attendees }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to store attendees");

      alert("Attendees stored successfully!");
      navigate("/prem-attendees"); 
    } catch (err) {
      console.error("Error storing attendees:", err);
      alert("Error storing attendees");
    }
  };

        
 return (

  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Select Pitches to move to Corporate</h1>
    
    <select
        onChange={handleCorporateFixtureChange}
        className="border p-2 rounded mb-4"
        defaultValue="" >
        <option value="" disabled>-- Choose a Fixture --</option>
        {fixtures.map((f) => (
          <option key={f.fixtureId} value={f.fixtureId}>
            {f.fixtureDate} – {f.name}
          </option>
        ))}
      </select>

      

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
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch No</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Status</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Select Corporate Pitches</th>
              </tr>
            </thead>
            <tbody>
              {pitches.map((p) => (
                <tr key={p.pitchId} className={`hover:bg-gray-100 ${
                  p.location === "Main Ring & Corporate Area" ? "bg-red-100" : "bg-gray-300"
                  }`} // Change background colour of the row to red if fixture.status has applied to work in corporate area
                >
                  <td className="border px-2 sm:px-4 py-2">{p.pitchLabel}</td>
                  <td className="border px-2 sm:px-4 py-2">{p.bookmakerName}</td>
                  <td className="border px-2 sm:px-4 py-2">{p.pitchNo}</td>
                  <td className="border px-2 sm:px-4 py-2">{p.corporateStatus}</td>
                  <td className="border px-2 sm:px-4 py-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.location === "Main Ring & Corporate Area"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "Main Ring & Corporate Area" : "Main Ring";
                          handleCorporateAttendance(
                            selectedFixture,
                            p.pitchId,
                            p.racecourseId,
                            newValue,
                            p.location // keep old value in case of API failure
                          );
                        }}
                        className="w-5 h-5 accent-green-600"
                      />
                      <span>{p.location === "Main Ring & Corporate Area" ? "Main Ring & Corporate Area" : " "}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        /*</div>*/
      )
    )}
    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"     
      onClick={storeAttendees} >
      Store Corporate Attendees
    </button>
   </div>
  );
};

export default CorporateAttendancePage;



