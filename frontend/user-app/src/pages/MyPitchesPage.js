import React, { useEffect, useState } from "react";
//import { Link } from "react-router-dom";

function MyPitchesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
   
  

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/fixtures/my-pitches", {
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
      const response = await fetch(`http://localhost:5000/api/fixtures/my-pitches/${fixtureId}/${pitchId}/status`,        
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

    
  /* Before using resposiveness css      

 return (
  <div className="p-4">
          <h1 className="text-xl font-bold p-2 mb-4">Upcoming Fixtures - Please click to Apply</h1>
    {loading ? (
      <p>Loading fixtures...</p>
    ) : fixtures.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="border-separate border-gray-300 rounded-lg">
          <thead>
            <tr className="text-white bg-blue-800">
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Racecourse</th>
              <th className="border px-4 py-2 text-left">Pitch Label</th>
              <th className="border px-4 py-2 text-left">Pitch No</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture, index) => (
              <tr key={index} className={`hover:bg-gray-100 ${
              fixture.status === "Applied" ? "bg-yellow-200" : "bg-gray-300"
            }`} // Change background colour of the row to yellow if fixture.status has applied to work
          >
                <td className="border px-4 py-2">{fixture.fixtureDate}</td>
                <td className="border px-4 py-2">{fixture.racecourseName}</td>
                <td className="border px-4 py-2">{fixture.pitchLabel}</td>
                <td className="border px-4 py-2">{fixture.pitchNo}</td>
                <td className="border px-4 py-2"> 
                    <select value={fixture.status || ""}
                      onChange={(e) => handleStatusChange(
                          fixture.fixtureId,
                          fixture.pitchId,
                          e.target.value,
                          fixture.status // keep old value in case backend rejects
                        )}className="border rounded px-2 py-1" >
                      <option value="">-- Select Option --</option>
                      <option value="Not Working">Not Working</option>
                      <option value="Applied">Apply to Work</option>
                    </select>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No fixtures found.</p>
    )}
  </div>
);
*/
// Using responsiveness css
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

export default MyPitchesPage;

/* This works but cant change status value
import React, { useEffect, useState } from "react";

function MyPitchesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/fixtures/my-pitches", {
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

 return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Pitches</h1>

    {loading ? (
      <p>Loading fixtures...</p>
    ) : fixtures.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Racecourse</th>
              <th className="border px-4 py-2 text-left">Pitch Label</th>
              <th className="border px-4 py-2 text-left">Pitch No</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{fixture.fixtureDate}</td>
                <td className="border px-4 py-2">{fixture.racecourseName}</td>
                <td className="border px-4 py-2">{fixture.pitchLabel}</td>
                <td className="border px-4 py-2">{fixture.pitchNo}</td>
                <td className="border px-4 py-2">{fixture.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No fixtures found.</p>
    )}
  </div>
);
}

export default MyPitchesPage;
*/

/* returns a list
import React, { useEffect, useState } from "react";

function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/fixtures/my-fixtures", {
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Fixtures</h1>

      {loading ? (
        <p>Loading fixtures...</p>
      ) : fixtures.length > 0 ? (
            <ul className="mt-4">
            {fixtures.map((fixture, index) => (
            <li key={index} className="border-b py-2">
                {fixture.fixtureDate} – {fixture.racecourseName} – {fixture.pitchLabel} – {fixture.pitchNo}  – {fixture.pitchStatus}
            </li>
            ))}
            </ul>
      ) : (
        <p>No fixtures found.</p>
      )}
    </div>
  );
}

export default FixturesPage;

*/
