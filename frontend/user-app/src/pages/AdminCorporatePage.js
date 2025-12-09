import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";

function AdminCorporatePage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editPitches, setEditPitches] = useState({});
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/fixtures/upcoming`,        
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
      } finally {
        setLoading(false);
      }
    };
  fetchFixtures();
  }, []);

    
   const handleCorporateArea = async (fixtureId, newStatus, oldStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/${fixtureId}/corporateArea`,        
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ corporateAreaAvailable: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update Corporate Area");

        // revert to old status if backend rejects
        setFixtures((prevFixtures) =>
          prevFixtures.map((fixture) =>
            fixture.fixture_id === fixtureId
              ? { ...fixture, corporate_area_available: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixture_id === fixtureId
            ? { ...fixture, corporate_area_available: newStatus }
            : fixture
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating Corporate Area Available:", error);
      alert("Error updating Corporate Area Available");

      
    }
  };

  const handleNumberOfPitches = async (fixtureId, newValue) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/api/corporateFixtures/${fixtureId}/corporateArea`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numberOfCorporatePitches: newValue,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to update pitch count");
      return;
    }

    // Update the list visually
    setFixtures((prev) =>
      prev.map((fx) =>
        fx.fixture_id === fixtureId
          ? { ...fx, number_of_corporate_pitches: newValue }
          : fx
      )
    );

    alert("Number of Corporate pitches updated.");
  } catch (err) {
    console.error(err);
    alert("Error updating number of Corporate pitches");
  }
};



 return (
  <div className="p-4">
          <h1 className="text-xl font-bold p-2 mb-4">Update Corporate Area Fixtures</h1>
    {loading ? (
      <p>Loading fixtures...</p>
    ) : fixtures.length > 0 ? (
        <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
            <thead>
              <tr className="text-white bg-red-600">
                <th className="border px-2 sm:px-4 py-2 text-left">Date</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Racecourse</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Corporate Area Avaiable</th>
                <th className="border px-2 sm:px-4 py-2 text-left">No. of Pitches</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f) => (
                 <tr key={f.fixture_id} className={`hover:bg-gray-100 ${
                    f.corporate_area_available ? "bg-red-200" : "bg-gray-300"
                    }`} // Change background colour of the row to orange if fixture.status has applied to work
                  >   
                  <td className="border px-2 sm:px-4 py-2">{formatDate(f.fixture_date)}</td>
                  <td className="border px-2 sm:px-4 py-2">{f.name}</td>
                  <td className="border px-2 sm:px-4 py-2">
                   <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!f.corporate_area_available}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          handleCorporateArea(
                            f.fixture_id,
                            newValue,
                            f.corporate_area_available // keep old value in case backend rejects
                            
                          );
                        }}
                        className="w-5 h-5 accent-green-600"
                      />
                      <span>{f.corporate_area_available ? "Yes" : " "}</span>
                    </label>

                    </td>
                   <td className="border px-2 sm:px-4 py-2">
                      <select
                        className="border rounded p-1"
                        value={editPitches[f.fixture_id] ?? f.number_of_corporate_pitches ?? 0}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);

                          // save temp value locally
                          setEditPitches((prev) => ({
                            ...prev,
                            [f.fixture_id]: newValue,
                          }));

                          // send update to backend
                          handleNumberOfPitches(f.fixture_id, newValue);
                        }}
                      >
                        {[...Array(11).keys()].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
        ) : (
      <p>No fixtures found.</p>
    )}
    
    
  </div>
  );
};

export default AdminCorporatePage;

