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
            fixture.fixture_id === fixtureId && fixture.pitch_id === pitchId
              ? { ...fixture, premium_status: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixture_id === fixtureId && fixture.pitch_id === pitchId
            ? { ...fixture, premium_status: newStatus }
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
        <h1 className="text-xl font-bold p-2 mb-4">Premium Pitches Available - Please click to Apply</h1>
      {loading ? (
      <p>Loading premium fixtures...</p>
    ) : fixtures.length > 0 ? (
     <div className="mt-6 overflow-x-auto">  

            {/* Mobile Pitch Cards */}
            <div className="sm:hidden space-y-4 mt-4">
              {fixtures.map((fixture, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl shadow border 
                  ${fixture.premium_status === "Applied" ? "bg-orange-200" : "bg-gray-300"}`}
                >
                  <p className="text-lg font-semibold">{fixture.racecourse_name} - {formatDate(fixture.fixture_date)}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Location:</span> {fixture.pitch_label}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Pitch No:</span> {fixture.pitch_no}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium"></span> <select value={fixture.premium_status || ""}
                      onChange={(e) => handlePremiumStatusChange(
                          fixture.fixture_id,
                          fixture.pitch_id,
                          fixture.racecourse_id,
                          e.target.value,
                          fixture.premium_status // keep old value in case backend rejects
                        )}className="border px-2 sm:px-4 py-2" >
                      <option value="">-- Select Option--</option>
                      <option value="Not Applying">Stay in Main Ring</option>
                      <option value="Applied">Apply to Work Premium</option>
                    </select>
                  </p>
                </div>
              ))}
            </div>

         {/* Table of pitches */} 
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
            <tr key={index} className={`hover:bg-gray-200 ${
              fixture.premium_status === "Applied" ? "bg-orange-200" : "bg-gray-300"
            }`} // Change background colour of the row to orange if fixture.status has applied to work
            >
                <td className="border px-2 sm:px-4 py-2">{formatDate(fixture.fixture_date)}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.racecourse_name}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitch_label}</td>
                <td className="border px-2 sm:px-4 py-2">{fixture.pitch_no}</td>
                <td className="border px-2 sm:px-4 py-2"> 
                    <select value={fixture.premium_status || ""}
                      onChange={(e) => handlePremiumStatusChange(
                          fixture.fixture_id,
                          fixture.pitch_id,
                          fixture.racecourse_id,
                          e.target.value,
                          fixture.premium_status // keep old value in case backend rejects
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

