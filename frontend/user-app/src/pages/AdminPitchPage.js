import React, { useEffect, useState } from "react";

function AdminPitchPage() {
  const [racecourses, setRacecourses] = useState([]);
  const [racecourseId] = useState("");
  const [pitches, setPitches] = useState([]);
  const [bookmakers, setBookmakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message] = useState("");
  const [selectedOwners, setSelectedOwners] = useState({});   // { [pitchId]: permitNo }
  const [transferValues, setTransferValues] = useState({});   // { [pitchId]: "123.45" }
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  
  // Fetch racecourses
  const fetchRacecourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pitches/racecourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch racecourses");
      const data = await response.json();
      setRacecourses(data);
    } catch (error) {
      console.error("Error fetching racecourses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pitches for racecourse
  const fetchPitches = async (racecourseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pitches/${racecourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch pitches");
      const data = await response.json();
      setPitches(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmakers
  const fetchBookmakers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/bookmakers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch bookmakers");
      const data = await response.json();
      setBookmakers(data);
    } catch (error) {
      console.error("Error fetching bookmakers:", error);
    }
  };

  useEffect(() => {
    fetchRacecourses();
    fetchBookmakers();
  }, []);

  const handleRacecourseChange = async (e) => {
    const racecourseId = e.target.value;
    //setRacecourseId(racecourseId);
    if (racecourseId) {
      await fetchPitches(racecourseId);
    } else {
      setPitches([]);
    }
  };

/*
 const handleValueChange = (pitchId, value) => {
  setTransferValues((prev) => ({
    ...prev,
    [pitchId]: value,
  }));
}; 
*/

  const handlePitchTransfer = async (pitchId, newOwnerPermitNo) => {

    if (!newOwnerPermitNo) {
      alert("Please select a new owner first.");
      return;
    }

    const transferValue = transferValues[pitchId] || null; // optional

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pitches/${pitchId}/transfer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newOwnerPermitNo, transferValue }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update transfer");

      //setMessage(data.message);
      await fetchPitches(racecourseId); // make sure racecourseId is set when selecting
      // optional: clear inputs for that row
        setSelectedOwners(prev => ({ ...prev, [pitchId]: "" }));
        setTransferValues(prev => ({ ...prev, [pitchId]: "" }));
    } catch (error) {
      console.error("Error updating transfer:", error);
      //setMessage(error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pitch Transfer Update</h1>

      <select onChange={handleRacecourseChange}
        className="border p-2 rounded mb-4">
        <option value="">Select Racecourse</option>
        {racecourses.map((r) => (
          <option key={r.racecourseid} value={r.racecourseid}>
            {r.name}
          </option>
        ))}
      </select>

      {/* Fixtures table */}
      {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
            {message}
          </div>

        )}
          {loading ? (
            <p>Loading pitches...</p>
      ) : (
                
       <table className="hidden sm:table border-separate bg-gray-300 rounded-lg w-full">
          <thead>
            <tr className="text-white bg-blue-800">
            <th className="border px-2 sm:px-4 py-2 text-left">Location</th>
            <th className="border px-2 sm:px-4 py-2 text-left">Current Owner</th>
            <th className="border px-2 sm:px-4 py-2 text-left">Transfer To</th>
            <th className="border px-2 sm:px-4 py-2 text-left">Transfer Value (€)</th>
            <th className="border px-2 sm:px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {pitches.map((p) => (
            <tr key={p.pitchid} className="hover:bg-gray-50">
              <td className="border px-2 sm:px-4 py-2">{p.pitchlabel}</td>
              <td className="border px-2 sm:px-4 py-2">{p.name}</td>
              <td className="border px-2 sm:px-4 py-2">
                <select
                  value={selectedOwners[p.pitchid] ?? ""}  // controlled
                  onChange={(e) =>
                    setSelectedOwners(prev => ({ ...prev, [p.pitchid]: e.target.value }))
                    //handlePitchTransfer(p.pitchId, e.target.value)
                  }
                >
                  <option value="">Select Bookmaker</option>
                  {bookmakers.map((b) => (
                    <option key={b.permitno} value={b.permitno}>
                      {b.name} ({b.permitno})
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  placeholder="€"
                  value={transferValues[p.pitchid] || ""}
                  onChange={(e) => 
                  setTransferValues(prev => ({ ...prev, [p.pitchid]: e.target.value })) 
                  //handleValueChange(p.pitchId, e.target.value)
                  }
                />
              </td>
              <td>
                <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                disabled={!selectedOwners[p.pitchid]} // prevent null owner
                  onClick={() =>
                    handlePitchTransfer(
                      p.pitchid,
                      selectedOwners[p.pitchid],
                      transferValues[p.pitchid]
                      //p.newOwnerPermitNo // set in dropdown
                    )
                  }
                >
                  Confirm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    </div>
  );
}

export default AdminPitchPage;
