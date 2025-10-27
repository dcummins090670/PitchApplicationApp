import React, { useEffect, useState } from "react";

function AttendancePage() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState("");
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/fixtures/upcoming",        
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
    setSelectedFixture(fixtureId); // Save it in state
    
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
      const response = await fetch(`http://localhost:5000/api/fixtures/${fixtureId}/pitches`,
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


     // Extra code to handle attendance change
  const handleAttendance = async (fixtureId, pitchId, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/fixtures/${fixtureId}/${pitchId}/attendance`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ attendance: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update attendance");

        // revert if it fails 
        setPitches((prevPitches) =>
          prevPitches.map((pitch) =>
            pitch.pitchId === pitchId
              ? { ...pitch, attendance: oldStatus }
              : pitch
          )
        );

        return;
      }

      // update UI with new pitch attendance if successful
      setPitches((prevPitches) =>
        prevPitches.map((pitch) =>
          pitch.pitchId === pitchId
            ? { ...pitch, attendance: newStatus }
            : pitch
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Error updating attendance");
      
    }
  };

  // This will be the result when we click the "confirmAttendee"s button
      const confirmAttendees = async () => {
        if (!selectedFixture) {
            alert("Please select a fixture first.");
            return;
  }
      const attendees = pitches
      .filter((p) => p.attendance === "Attended")
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
        `http://localhost:5000/api/fixtures/${selectedFixture}/attendance-list`,
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
    } catch (err) {
      console.error("Error storing attendees:", err);
      alert("Error storing attendees");
    }
  };
      
 return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Upcoming Fixtures</h1>
    
    <select
        onChange={handleFixtureChange}
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

    
      pitches.length > 0 && (
        /*<div className="mt-6 overflow-x-auto">
            <h2 className="text-lg font-bold mb-2">Pitches at Fixture</h2>*/



          <div className="mt-6 overflow-x-auto">
            {/* Attendance Summary Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3">Attendance Summary</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Pitches */}
                <div className="bg-blue-500 text-white p-4 rounded-xl shadow">
                  <p className="text-2xl font-bold">Total Pitches</p>
                  <p className="text-2xl">{pitches.length}</p>
                </div>

                {/* Total Pitches Attended */}
                <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                  <p className="text-2xl font-bold">Pitches Worked</p>
                  <p className="text-2xl">
                    {pitches.filter((p) => p.attendance === "Attended").length}
                  </p>
                </div>

                {/* Number of Bookmakers Attended */}
                <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                  <p className="text-2xl font-bold">Total Bookmakers</p>
                  <p className="text-2xl">
                    {
                      new Set(
                        pitches
                          .filter((p) => p.attendance === "Attended")
                          .map((p) => p.bookmakerName)
                      ).size
                    }
                  </p>
                </div>
              </div>
            </div>  
        

            
          {/* Table of pitches */}  
          <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
            <thead>
              <tr className="text-white bg-blue-900">
                <th className="border px-2 sm:px-4 py-4 text-left">Pitch Label</th>
                <th className="border px-2 sm:px-4 py-4 text-leftt">Bookmaker</th>
                <th className="border px-2 sm:px-4 py-4 text-left">Pitch No</th>
                
                <th className="border px-2 sm:px-4 py-4 text-left">Confirm Attendance</th>
              </tr>
            </thead>
            <tbody>
              {pitches.map((p) => (
                <tr key={p.pitchId} className={`hover:bg-red-50 ${
                  p.attendance === "Attended" ? "bg-green-200" : "bg-gray-300"
                  }`} // Change background colour of the row to green if fixture.status has applied to work
                >
                  <td className="border px-2 sm:px-4">{p.pitchLabel}</td>
                  <td className="border px-2 sm:px-4">{p.bookmakerName}</td>
                  <td className="border px-2 sm:px-4">{p.pitchNo}</td>
                  
                  <td className="border px-2 sm:px-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.attendance === "Attended"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "Attended" : "Did Not Attend";
                          handleAttendance(
                            selectedFixture,
                            p.pitchId,
                            newValue,
                            p.attendance // keep old value in case of API failure
                          );
                        }}
                        className="w-5 h-5 accent-green-600"
                      />
                      <span>{p.attendance === "Attended" ? "Attended" : " "}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

         </div> 
        )
    )}
    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
     
      onClick={confirmAttendees} >
      Store Attendees List
    </button>
  </div>
  );
};

export default AttendancePage;



