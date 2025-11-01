import React, { useEffect, useState } from "react";

function CorporatePitchPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  
  useEffect(() => {
    const fetchCorporateFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/my-corporate-pitches`, {
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

    fetchCorporateFixtures();
  }, []);

  // Extra code to handle status change
  const handleCorporateStatusChange = async (fixtureId, pitchId, racecourseId, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/my-corporate-pitches/${fixtureId}/${pitchId}/${racecourseId}/corporate-status`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ corporateStatus: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update status");

        // revert to old status if backend rejects
        setFixtures((prevFixtures) =>
          prevFixtures.map((fixture) =>
            fixture.fixtureid === fixtureId && fixture.pitchid === pitchId
              ? { ...fixture, corporatestatus: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixtureid === fixtureId && fixture.pitchid === pitchId
            ? { ...fixture, corporatestatus: newStatus }
            : fixture
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating corporate-status:", error);
      alert("Error updating corporate-status");

      
    }
  };

        

 return (
  <div className="p-4">
        <h1 className="text-xl font-bold p-2 mb-4">Corporate Pitches Avaiable - Please click to Apply</h1>
      {loading ? (
      <p>Loading corporate fixtures...</p>
    ) : fixtures.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-red-600">
              <th className="border px-2 sm:px-4 py-2 text-left">Date</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Racecourse</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Pitch No.</th>
              <th className="border px-2 sm:px-4 py-2 text-left">Pitch Location</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture, index) => (
            <tr key={index} className={`hover:bg-gray-100 ${
              fixture.corporatestatus === "Applied" ? "bg-red-100" : "bg-gray-300"
            }`} // Change background colour of the row to orange if fixture.status has applied to work
            >
                <td className="border px-2 sm:px-4 py-2">{fixture.fixturedate}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.racecoursename}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchlabel}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchno}</td>
                <td className="border px-2 sm:px-4 py-2"> 
                    <select value={fixture.corporatestatus || ""}
                      onChange={(e) => handleCorporateStatusChange(
                          fixture.fixtureid,
                          fixture.pitchid,
                          fixture.racecourseid,
                          e.target.value,
                          fixture.corporatestatus // keep old value in case backend rejects
                        )}className="border px-2 sm:px-4 py-2" >
                      <option value="">-- Select Option--</option>
                      <option value="Not Applying">Stay in Main Ring</option>
                      <option value="Applied">Apply to Work Corporate</option>
                    </select>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No corporate fixtures found.</p>
    )}
  </div>
);
}

export default CorporatePitchPage;

