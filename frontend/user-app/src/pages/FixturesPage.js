import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";

/*
function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  //const [selectedFixture, setSelectedFixture] = useState("");
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  // to allow for testing locally and online
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
      
      const response = await fetch(`${API_BASE_URL}/api/fixtures/${fixtureId}/pitches`,
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
    <h1 className="text-xl font-bold mb-4">Please select a fixture</h1>
    

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

      //<h2 className="text-lg font-semibold mb-2">Pitches at Fixture</h2>

    {loading ? (
        <p>Loading pitches...</p>
    ) : ( 
    // Table of pitches 
      pitches.length > 0 && (

        //<div className="mt-6 overflow-x-auto">
          //  <h2 className="text-lg font-bold mb-2">Pitches at Fixture</h2>

            <div className="mt-6 overflow-x-auto">
              // Application Summary Section //
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Applicants Summary</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  // Total Pitches 
                  <div className="bg-blue-600 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Total Pitches</p>
                    <p className="text-2xl">{pitches.length}</p>
                  </div>

                  // Number of Pitches applied to work at 
                  <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Pitch Applicants</p>
                    <p className="text-2xl">
                      {pitches.filter((p) => p.status === "Applied").length}
                    </p>
                  </div>

                  // Number of Bookmakers Applying 
                  <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Bookmaker Applicants</p>
                    <p className="text-2xl">
                      {
                        new Set(
                          pitches
                            .filter((p) => p.status === "Applied")
                            .map((p) => p.bookmakerName)
                        ).size
                      }
                    </p>
                  </div>
                </div>
              </div>  
        



          // Table of pitches 
          <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
            <thead>
              <tr className="text-white bg-blue-800">
                <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch No</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {pitches.map((p) => (
                <tr key={p.pitchId} className={`hover:bg-red-200 ${
                p.status === "Applied" ? "bg-green-300" : "bg-gray-300"
                }`} // Change background colour of the row to green if fixture.status has applied to work
                > 
                  <td className="border px-4 py-2">{p.pitchLabel}</td>
                  <td className="border px-4 py-2">{p.bookmakerName}</td>
                  <td className="border px-4 py-2">{p.pitchNo}</td>
                  <td className="border px-4 py-2">{p.status}</td>
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

*/

function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  //const [selectedFixture, setSelectedFixture] = useState("");
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  // to allow for testing locally and online
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
      
      const response = await fetch(`${API_BASE_URL}/api/fixtures/${fixtureId}/pitches`,
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
    <h1 className="text-xl font-bold mb-4">Please select a fixture</h1>
    

    <select
        onChange={handleFixtureChange}
        className="border p-2 rounded mb-4"
        defaultValue="" >
        <option value="" disabled>-- Choose a Fixture --</option>
        {fixtures.map((f) => (
          <option key={f.fixtureid} value={f.fixtureid}>
            {formatDate(f.fixturedate)} – {f.name}
          </option>
        ))}
    </select>

      {/*<h2 className="text-lg font-semibold mb-2">Pitches at Fixture</h2>*/}

    {loading ? (
        <p>Loading pitches...</p>
    ) : ( 
    /* Table of pitches */
      pitches.length > 0 && (

        /*<div className="mt-6 overflow-x-auto">
            <h2 className="text-lg font-bold mb-2">Pitches at Fixture</h2>*/

            <div className="mt-6 overflow-x-auto">
              {/* Application Summary Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Applicants Summary</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Pitches */}
                  <div className="bg-blue-600 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Total Pitches</p>
                    <p className="text-2xl">{pitches.length}</p>
                  </div>

                  {/* Number of Pitches applied to work at */}
                  <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Pitch Applicants</p>
                    <p className="text-2xl">
                      {pitches.filter((p) => p.status === "Applied").length}
                    </p>
                  </div>

                  {/* Number of Bookmakers Applying */}
                  <div className="bg-green-600 text-blue-100 p-4 rounded-xl shadow">
                    <p className="text-2xl font-bold">Bookmaker Applicants</p>
                    <p className="text-2xl">
                      {
                        new Set(
                          pitches
                            .filter((p) => p.status === "Applied")
                            .map((p) => p.bookmakername)
                        ).size
                      }
                    </p>
                  </div>
                </div>
              </div>  
        



          {/* Table of pitches */} 
          <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
            <thead>
              <tr className="text-white bg-blue-800">
                <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Bookmaker</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Pitch No</th>
                <th className="border px-2 sm:px-4 py-2 text-left">Status</th>
                
              </tr>
            </thead>
            <tbody>
              {pitches.map((p) => (
                <tr key={p.pitchid} className={`hover:bg-red-200 ${
                p.status === "Applied" ? "bg-green-300" : "bg-gray-300"
                }`} // Change background colour of the row to green if fixture.status has applied to work
                > 
                  <td className="border px-4 py-2">{p.pitchlabel}</td>
                  <td className="border px-4 py-2">{p.bookmakername}</td>
                  <td className="border px-4 py-2">{p.pitchno}</td>
                  <td className="border px-4 py-2">{p.status}</td>
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


export default FixturesPage;



