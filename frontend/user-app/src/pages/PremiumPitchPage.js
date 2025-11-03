import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
function PremiumPitchPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  
  useEffect(() => {
    const fetchPremiumFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/premiumFixtures/my-premium-pitches`, {
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

    fetchPremiumFixtures();
  }, []);

  // Extra code to handle status change
  const handlePremiumStatusChange = async (fixtureId, pitchId, racecourseId, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/premiumFixtures/my-premium-pitches/${fixtureId}/${pitchId}/${racecourseId}/premium-status`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ premiumStatus: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update status");

        // revert to old status if backend rejects
        setFixtures((prevFixtures) =>
          prevFixtures.map((fixture) =>
            fixture.fixtureid === fixtureId && fixture.pitchid === pitchId
              ? { ...fixture, premiumstatus: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixtureid === fixtureId && fixture.pitchid === pitchId
            ? { ...fixture, premiumstatus: newStatus }
            : fixture
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating premium-status:", error);
      alert("Error updating premium-status");

      
    }
  };

        

 return (
  <div className="p-4">
        <h1 className="text-xl font-bold p-2 mb-4">Premium Pitches Avaiable - Please click to Apply</h1>
      {loading ? (
      <p>Loading premium fixtures...</p>
    ) : fixtures.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-orange-900">
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
              fixture.premiumstatus === "Applied" ? "bg-orange-200" : "bg-gray-300"
            }`} // Change background colour of the row to orange if fixture.status has applied to work
            >
                <td className="border px-2 sm:px-4 py-2">{formatDate(fixture.fixturedate)}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.racecoursename}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchlabel}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitchno}</td>
                <td className="border px-2 sm:px-4 py-2"> 
                    <select value={fixture.premiumstatus || ""}
                      onChange={(e) => handlePremiumStatusChange(
                          fixture.fixtureid,
                          fixture.pitchid,
                          fixture.racecourseid,
                          e.target.value,
                          fixture.premiumstatus // keep old value in case backend rejects
                        )}className="border px-2 sm:px-4 py-2" >
                      <option value="">-- Select Option--</option>
                      <option value="Not Applying">Stay in Main Ring</option>
                      <option value="Applied">Apply to Work Premium</option>
                    </select>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No premium fixtures found.</p>
    )}
  </div>
);
}

export default PremiumPitchPage;

