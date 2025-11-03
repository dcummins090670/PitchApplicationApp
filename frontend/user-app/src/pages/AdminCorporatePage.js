import React, { useEffect, useState } from "react";

function AdminCorporatePage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
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
            fixture.fixtureid === fixtureId
              ? { ...fixture, corporateareaavailable: oldStatus }
              : fixture
          )
        );

        return;
      }

      // update UI with new status if successful
      setFixtures((prevFixtures) =>
        prevFixtures.map((fixture) =>
          fixture.fixtureid === fixtureId
            ? { ...fixture, corporateareaavailable: newStatus }
            : fixture
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Error updating corporateAreaAvailable:", error);
      alert("Error updating corporateAreaAvailable");

      
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
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f) => (
                 <tr key={f.fixtureid} className={`hover:bg-gray-100 ${
                    f.corporateareaavailable ? "bg-red-200" : "bg-gray-300"
                    }`} // Change background colour of the row to orange if fixture.status has applied to work
                  >   
                  <td className="border px-2 sm:px-4 py-2">{f.fixturedate}</td>
                  <td className="border px-2 sm:px-4 py-2">{f.name}</td>
                  <td className="border px-2 sm:px-4 py-2">
                   <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!f.corporateareaavailable}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          handleCorporateArea(
                            f.fixtureid,
                            newValue,
                            f.corporateareaavailable // keep old value in case backend rejects
                            
                          );
                        }}
                        className="w-5 h-5 accent-green-600"
                      />
                      <span>{f.corporateareaavailable ? "Yes" : " "}</span>
                    </label>
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

