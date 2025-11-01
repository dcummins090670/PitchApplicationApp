import React, { useEffect, useState } from "react";

function CorporateFixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/upcoming`,        
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
    //const fixture = fixtures.find(f => f.fixtureId === parseInt(fixtureId));
   //await fetchPitches(fixtureId);
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
      const response = await fetch(`${API_BASE_URL}/api/corporateFixtures/${fixtureId}/corporate-pitches`,
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


  
 return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Corporate Area Applicants</h1>
    

    <select
        onChange={handleFixtureChange}
        className="border p-2 rounded mb-4"
        defaultValue="" >
        <option value="" disabled>-- Choose a Fixture --</option>
        {fixtures.map((f) => (
          <option key={f.fixtureid} value={f.fixtureid}>
            {f.fixturedate} – {f.name}
          </option>
        ))}
      </select>

      {/*<h2 className="text-lg font-semibold mb-2">Pitches at Fixture</h2>*/}

    {loading ? (
        <p>Loading pitches...</p>
    ) : ( 
    /* Table of pitches */
      pitches.length > 0 && (

      
        

        <div className="mt-6 overflow-x-auto">
              {/* Application Summary Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Applicants Summary</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {/* Total Pitches */}
                  <div className="bg-red-300 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Corporate Pitches Available</p>
                    <p className="text-2xl">{fixtures.map((f)=> (f.numberofcorporatepitches))}</p> 
                  </div>
                  

                  {/* Number of Pitches applied to work at */}
                  <div className="bg-red-700 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Corporate Pitch Applicants</p>
                    <p className="text-2xl">
                      {pitches.filter((p) => p.corporatestatus === "Applied").length}
                    </p>
                  </div>

                  {/* Number of Bookmakers Applying */}
                  <div className="bg-red-700 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Bookmaker Applicants</p>
                    <p className="text-2xl">
                      {
                        new Set(
                          pitches
                            .filter((p) => p.corporatestatus === "Applied")
                            .map((p) => p.bookmakername)
                        ).size
                      }
                    </p>
                  </div>
                </div>
              </div>  


          <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
            <thead>
              <tr className="text-white bg-red-600">
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch Label</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch No</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {pitches.map((p) => (
                <tr key={p.pitchid} className={`hover:bg-gray-50 ${
                p.corporatestatus === "Applied" ? "bg-red-100" : "bg-gray-300"
                }`} // Change background colour of the row to yellow if fixture.status has applied to work
                > 
                  <td className="border px-4 py-2">{p.pitchlabel}</td>
                  <td className="border px-4 py-2">{p.bookmakername}</td>
                  <td className="border px-4 py-2">{p.pitchno}</td>
                  <td className="border px-4 py-2">{p.corporatestatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )}
    </div>
  );
};

export default CorporateFixturesPage;



