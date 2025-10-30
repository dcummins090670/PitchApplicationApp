import React, { useEffect, useState } from "react";

/*
function MyPitchesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/fixtures/my-pitches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch fixtures");

        const data = await response.json();
        setFixtures(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  // Extra code to handle status change
  const handleStatusChange = async (fixtureId, pitchId, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/fixtures/my-pitches/${fixtureId}/${pitchId}/status`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update status");

        // revert to old status if backend rejects
        setFixtures((prevFixtures) =>
          prevFixtures.map((fixture) =>
            fixture.fixtureId === fixtureId && fixture.pitchId === pitchId
              ? { ...fixture, status: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixtureId === fixtureId && fixture.pitchId === pitchId
            ? { ...fixture, status: newStatus }
            : fixture
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");

      
    }
  };

return (
  <div className="p-2 sm:p-4">
          <h1 className="text-lg sm:text-xl font-bold mb-4">Upcoming Fixtures - Please click to Apply</h1>
    {loading ? (
      <p className="text-center">Loading fixtures...</p>
    ) : fixtures.length > 0 ? (
      <div className="overflow-x-auto">

        // --- TABLE VIEW (for tablets & desktops) --- 
        //<table className="min-w-[700px] border border-gray-300 rounded-lg text-sm sm:text-base">

        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-blue-800">
              <th className="border px-2 sm:px-4 py-2 text-left">Date</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Racecourse</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Pitch No</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture, index) => (
              <tr key={index} className={`hover:bg-red-100 ${
              fixture.status === "Applied" ? "bg-green-300": "bg-gray-300"
            }`} // Change background colour of the row to green if fixture.status has applied to work
          >
                <td className="border px-2 sm:px-4 py-2">{fixture.fixtureDate}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.racecourseName}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchLabel}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchNo}</td>
                <td className="border px-2 sm:px-4 py-2"> 
                    <select value={fixture.status || ""}
                      onChange={(e) => handleStatusChange(
                          fixture.fixtureId,
                          fixture.pitchId,
                          e.target.value,
                          fixture.status // keep old value in case backend rejects
                        )}className="border rounded px-2 py-1 text-sm sm:text-base" >
                      <option value="">-- Select Option --</option>
                      <option value="Not Working">Not Working</option>
                      <option value="Applied">Apply to Work</option>
                    </select>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>


        // --- CARD VIEW (for mobile phones) --- 
        
        <div className="block sm:hidden space-y-4">
          {fixtures.map((fixture, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 shadow ${
                fixture.status === "Applied"
                  ? "bg-green-200"
                  : "bg-gray-300"
              }`}
            >
              <div className="flex justify-between">
                <h2 className="font-semibold text-lg">{fixture.racecourseName} 
                  <span className="text-lg text-gray-800">: {fixture.fixtureDate}</span>
                </h2>
                
              </div>

              <p className="text-gray-700 mt-1">
                <strong>Location:</strong> {fixture.pitchLabel}
              </p>
              <p className="text-gray-700">
                <strong>Pitch No:</strong> {fixture.pitchNo}
              </p>

              <div className="mt-2">
                <label className="block text-sm text-gray-700 font-semibold mb-1">
                  Status:
                </label>
                <select
                  value={fixture.status || ""}
                  onChange={(e) =>
                    handleStatusChange(
                      fixture.fixtureId,
                      fixture.pitchId,
                      e.target.value,
                      fixture.status
                    )
                  }
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">-- Select Status --</option>
                  <option value="Not Working">Not Working</option>
                  <option value="Applied">Apply to Work</option>
                </select>
              </div>
            </div>
          ))}
        </div>   
      </div>
    ) : (
      <p>No fixtures found.</p>
    )}
  </div>
);
}
*/

// For postgreSQL only---
function MyPitchesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
 
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/fixtures/my-pitches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch fixtures");

        const data = await response.json();
        setFixtures(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  // Extra code to handle status change
  const handleStatusChange = async (fixtureid, pitchid, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/fixtures/my-pitches/${fixtureid}/${pitchid}/status`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update status");

        // revert to old status if backend rejects
        setFixtures((prevFixtures) =>
          prevFixtures.map((fixture) =>
            fixture.fixtureid === fixtureid && fixture.pitchid === pitchid
              ? { ...fixture, status: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixtureid === fixtureid && fixture.pitchid === pitchid
            ? { ...fixture, status: newStatus }
            : fixture
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");

      
    }
  };

return (
  <div className="p-2 sm:p-4">
          <h1 className="text-lg sm:text-xl font-bold mb-4">Upcoming Fixtures - Please click to Apply</h1>
    {loading ? (
      <p className="text-center">Loading fixtures...</p>
    ) : fixtures.length > 0 ? (
      <div className="overflow-x-auto">

        {/* --- TABLE VIEW (for tablets & desktops) --- */}
        {/*<table className="min-w-[700px] border border-gray-300 rounded-lg text-sm sm:text-base">*/}
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-blue-800">
              <th className="border px-2 sm:px-4 py-2 text-left">Date</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Racecourse</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Pitch No</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture, index) => (
              <tr key={index} className={`hover:bg-red-100 ${
              fixture.status === "Applied" ? "bg-green-300": "bg-gray-300"
            }`} // Change background colour of the row to green if fixture.status has applied to work
          >
                <td className="border px-2 sm:px-4 py-2">{fixture.fixturedate}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.racecoursename}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchlabel}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchno}</td>
                <td className="border px-2 sm:px-4 py-2"> 
                    <select value={fixture.status || ""}
                      onChange={(e) => handleStatusChange(
                          fixture.fixtureid,
                          fixture.pitchid,
                          e.target.value,
                          fixture.status // keep old value in case backend rejects
                        )}className="border rounded px-2 py-1 text-sm sm:text-base" >
                      <option value="">-- Select Option --</option>
                      <option value="Not Working">Not Working</option>
                      <option value="Applied">Apply to Work</option>
                    </select>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>


        {/* --- CARD VIEW (for mobile phones) --- */}
        <div className="block sm:hidden space-y-4">
          {fixtures.map((fixture, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 shadow ${
                fixture.status === "Applied"
                  ? "bg-green-200"
                  : "bg-gray-300"
              }`}
            >
              <div className="flex justify-between">
                <h2 className="font-semibold text-lg">{fixture.racecoursename} 
                  <span className="text-lg text-gray-800">: {fixture.fixturedate}</span>
                </h2>
                
              </div>

              <p className="text-gray-700 mt-1">
                <strong>Location:</strong> {fixture.pitchlabel}
              </p>
              <p className="text-gray-700">
                <strong>Pitch No:</strong> {fixture.pitchno}
              </p>

              <div className="mt-2">
                <label className="block text-sm text-gray-700 font-semibold mb-1">
                  Status:
                </label>
                <select
                  value={fixture.status || ""}
                  onChange={(e) =>
                    handleStatusChange(
                      fixture.fixtureid,
                      fixture.pitchid,
                      e.target.value,
                      fixture.status
                    )
                  }
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">-- Select Status --</option>
                  <option value="Not Working">Not Working</option>
                  <option value="Applied">Apply to Work</option>
                </select>
              </div>
            </div>
          ))}
        </div>   
      </div>
    ) : (
      <p>No fixtures found.</p>
    )}
  </div>
);
}

export default MyPitchesPage;

