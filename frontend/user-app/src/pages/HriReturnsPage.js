import { useEffect, useState } from "react";


function HriReturns({token}) {

  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  const [values, setValues] = useState({
    euroTotalStakeAway: 0,
    euroTrackLaidOffAway: 0,
    euroTotalHoldAway: 0,
    euroTotalVoidAway: 0,

    euroTotalStakeHome: 0,
    euroTrackLaidOffHome: 0,
    euroTotalHoldHome: 0,
    euroTotalVoidHome: 0,

    stgTotalStakeAway: 0,
    stgTrackLaidOffAway: 0,
    stgTotalHoldAway: 0,
    stgTotalVoidAway: 0,

    stgTotalStakeHome: 0,
    stgTrackLaidOffHome: 0,
    stgTotalHoldHome: 0,
    stgTotalVoidHome: 0,

    exchangeLaid: 0,
    exchangeBacked: 0,
  });


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
    const fixture = fixtures.find((f) => f.fixtureId.toString() === fixtureId);
    setSelectedFixture(fixture || null);
    // if (fixtureId) {
    //  await fetchHriReturns(fixtureId);
    //} else {
    //  setSelectedFixture();
    //}
  };
    

    const handleChange = (field, value) => {
    const updated = {
      ...values,
      [field]: parseFloat(value) || 0,
    };

    // recalc Total Hold = Total Stake - Track Laid Off
    updated.euroTotalHoldAway = (updated.euroTotalStakeAway || 0) - (updated.euroTrackLaidOffAway || 0);
    updated.euroTotalHoldHome = (updated.euroTotalStakeHome || 0) - (updated.euroTrackLaidOffHome || 0);
    updated.stgTotalHoldAway = (updated.stgTotalStakeAway || 0) - (updated.stgTrackLaidOffAway || 0);
    updated.stgTotalHoldHome = (updated.stgTotalStakeHome || 0) - (updated.stgTrackLaidOffHome || 0);

    setValues(updated);
  };

    

   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFixture) {
      alert("Please select a fixture first.");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      fixtureId: selectedFixture.fixtureId,
      ...values,
    };

    try {
     const response = await fetch(`${API_BASE_URL}/api/hriReturns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
     if (response.ok) {
       alert(`Return submitted for ${selectedFixture.name} (${selectedFixture.fixtureDate})`);

    setValues({ 
        euroTotalStakeAway: 0,
        euroTrackLaidOffAway: 0,
        euroTotalVoidAway: 0,

        euroTotalStakeHome: 0,
        euroTrackLaidOffHome: 0,
        euroTotalVoidHome: 0,

        stgTotalStakeAway: 0,
        stgTrackLaidOffAway: 0,
        stgTotalVoidAway: 0,

        stgTotalStakeHome: 0,
        stgTrackLaidOffHome: 0,
        stgTotalVoidHome: 0,

        exchangeLaid: 0,
        exchangeBacked: 0,

     });

     } else {
      const errorData = await response.json();
      alert("Failed to submit: " + errorData.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred");
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

              
      {selectedFixture && (
        
         
     <form onSubmit={handleSubmit} className="max-w-md mx-auto" >
        
      <h2 className="text-xl font-bold mb-4">HRI Return for {selectedFixture.name} ({selectedFixture.fixtureDate})</h2>
      <div className="border rounded-lg shadow p-4">

        {/*Euro - Away Section*/}
        <h2 className="text-xl font-bold mb-4">Euro (€) — Away</h2>
        <div className="space-y-4">
       
          {/* Total Stake */}
         <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Stake:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalStakeAway || ""}
              onChange={(e) => handleChange("euroTotalStakeAway", e.target.value)}
            />
          </div>

          {/* Track Laid Off */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Track Laid Off:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTrackLaidOffAway || ""}
              onChange={(e) => handleChange("euroTrackLaidOffAway", e.target.value)}
            />
          </div>

          {/* Total Hold (calculated) */}
          <div className="flex items-center justify-between">
           <label className="text-sm font-medium w-1/2">Total Hold:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.euroTotalHoldAway || 0}
              readOnly
            />
          </div>

          {/* Total Void (user input) */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Void:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalVoidAway || ""}
              onChange={(e) => handleChange("euroTotalVoidAway", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow p-4">

        {/*Euro - Home Section*/}
        <h2 className="text-xl font-bold mb-4">Euro (€) — Home</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Total Stake */}
         <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Stake</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalStakeHome || ""}
              onChange={(e) => handleChange("euroTotalStakeHome", e.target.value)}
            />
          </div>

          {/* Track Laid Off */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Track Laid Off</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTrackLaidOffHome || ""}
              onChange={(e) => handleChange("euroTrackLaidOffHome", e.target.value)}
            />
          </div>

          {/* Total Hold (calculated) */}
         <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Hold</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.euroTotalHoldHome || 0}
              readOnly
            />
          </div>

          {/* Total Void (user input) */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Void</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalVoidHome || ""}
              onChange={(e) => handleChange("euroTotalVoidHome", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow p-4">
        
        {/*Stg - Away Section*/}
        <h2 className="text-xl font-bold mb-4">STG (£) — Away</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Total Stake */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Stake</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalStakeAway || ""}
              onChange={(e) => handleChange("stgTotalStakeAway", e.target.value)}
            />
          </div>

          {/* Track Laid Off */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Track Laid Off</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTrackLaidOffAway || ""}
              onChange={(e) => handleChange("stgTrackLaidOffAway", e.target.value)}
            />
          </div>

          {/* Total Hold (calculated) */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Hold</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.stgTotalHoldAway || 0}
              readOnly
            />
          </div>

          {/* Total Void (user input) */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Void</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalVoidAway || ""}
              onChange={(e) => handleChange("stgTotalVoidAway", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow p-4">

        {/*Stg - Home Section*/}
        <h2 className="text-xl font-bold mb-4">Stg (£) — Home</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Total Stake */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Stake</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalStakeHome || ""}
              onChange={(e) => handleChange("stgTotalStakeHome", e.target.value)}
            />
          </div>

          {/* Track Laid Off */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Track Laid Off</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTrackLaidOffHome || ""}
              onChange={(e) => handleChange("stgTrackLaidOffHome", e.target.value)}
            />
          </div>

          {/* Total Hold (calculated) */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Hold</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.stgTotalHoldHome || 0}
              readOnly
            />
          </div>

          {/* Total Void (user input) */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium w-1/2">Total Void</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalVoidHome || ""}
              onChange={(e) => handleChange("stgTotalVoidHome", e.target.value)}
            />
          </div>
         </div> 
        </div>

        <div className="border rounded-lg shadow p-4">
         <h2 className="text-xl font-bold mb-4">Exchange Bets:</h2>
           <div className="space-y-4">
            {/* Exchange */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium w-1/2">Total Laid Bets</label>
                <input
                type="number"
                className="w-full p-2 border rounded bg-yellow-100 font-semibold"
                value={values.exchangeLaid || ""}
                onChange={(e) => handleChange("exchangeLaid", e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between">
                <label className="text-sm font-medium w-1/2">Total Backed Bets</label>
                <input
                type="number"
                className="w-full p-2 border rounded bg-yellow-100 font-semibold"
                value={values.exchangeBacked || ""}
                onChange={(e) => handleChange("exchangeBacked", e.target.value)}
                />
            </div>
         </div>
       </div>

       <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
        Submit Return
       </button>

    </form>    
     )}
      
  </div> 
  )
};



/*

function HriReturns({ fixtureId, token }) {

  const [values, setValues] = useState({
    euroTotalStakeAway: 0,
    euroTrackLaidOffAway: 0,
    euroTotalHoldAway: 0,
    euroTotalVoidAway: 0,

    euroTotalStakeHome: 0,
    euroTrackLaidOffHome: 0,
    euroTotalHoldHome: 0,
    euroTotalVoidHome: 0,

    stgTotalStakeAway: 0,
    stgTrackLaidOffAway: 0,
    stgTotalHoldAway: 0,
    stgTotalVoidAway: 0,

    stgTotalStakeHome: 0,
    stgTrackLaidOffHome: 0,
    stgTotalHoldHome: 0,
    stgTotalVoidHome: 0,

    exchangeLaid: 0,
    exchangeBacked: 0,
  });

  const handleChange = (field, value) => {
    const updated = {
      ...values,
      [field]: parseFloat(value) || 0,
    };

    // recalc Total Hold = Total Stake - Track Laid Off
    updated.euroTotalHoldAway = (updated.euroTotalStakeAway || 0) - (updated.euroTrackLaidOffAway || 0);
    updated.euroTotalHoldHome = (updated.euroTotalStakeHome || 0) - (updated.euroTrackLaidOffHome || 0);
    updated.stgTotalHoldAway = (updated.stgTotalStakeAway || 0) - (updated.stgTrackLaidOffAway || 0);
    updated.stgTotalHoldHome = (updated.stgTotalStakeHome || 0) - (updated.stgTrackLaidOffHome || 0);

    setValues(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      fixtureId,
      ...values,
    };

    await fetch("/api/hriReturns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([payload]),
    });

    alert("Return submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto" >
      <div className="border rounded-lg shadow p-4">

       
        <h2 className="text-xl font-bold mb-4">Euro (€) — Away</h2>
        <div className="space-y-4">
       
          
         <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Stake:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalStakeAway || ""}
              onChange={(e) => handleChange("euroTotalStakeAway", e.target.value)}
            />
          </div>

         
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Track Laid Off:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTrackLaidOffAway || ""}
              onChange={(e) => handleChange("euroTrackLaidOffAway", e.target.value)}
            />
          </div>

          
          <div className="flex items-center justify-between">
           <label class="text-sm font-medium w-1/2">Total Hold:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.euroTotalHoldAway || 0}
              readOnly
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Void:</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalVoidAway || ""}
              onChange={(e) => handleChange("euroTotalVoidAway", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow p-4">

        
        <h2 className="text-xl font-bold mb-4">Euro (€) — Home</h2>
        <div className="grid grid-cols-1 gap-4">
          
         <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Stake</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalStakeHome || ""}
              onChange={(e) => handleChange("euroTotalStakeHome", e.target.value)}
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Track Laid Off</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTrackLaidOffHome || ""}
              onChange={(e) => handleChange("euroTrackLaidOffHome", e.target.value)}
            />
          </div>

          
         <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Hold</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.euroTotalHoldHome || 0}
              readOnly
            />
          </div>

         
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Void</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.euroTotalVoidHome || ""}
              onChange={(e) => handleChange("euroTotalVoidHome", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow p-4">
        
       
        <h2 className="text-xl font-bold mb-4">STG (£) — Away</h2>
        <div className="grid grid-cols-1 gap-4">
          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Stake</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalStakeAway || ""}
              onChange={(e) => handleChange("stgTotalStakeAway", e.target.value)}
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Track Laid Off</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTrackLaidOffAway || ""}
              onChange={(e) => handleChange("stgTrackLaidOffAway", e.target.value)}
            />
          </div>

         
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Hold</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.stgTotalHoldAway || 0}
              readOnly
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Void</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalVoidAway || ""}
              onChange={(e) => handleChange("stgTotalVoidAway", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow p-4">

        
        <h2 className="text-xl font-bold mb-4">Stg (£) — Home</h2>
        <div className="grid grid-cols-1 gap-4">
         
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Stake</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalStakeHome || ""}
              onChange={(e) => handleChange("stgTotalStakeHome", e.target.value)}
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Track Laid Off</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTrackLaidOffHome || ""}
              onChange={(e) => handleChange("stgTrackLaidOffHome", e.target.value)}
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Hold</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100 font-semibold"
              value={values.stgTotalHoldHome || 0}
              readOnly
            />
          </div>

          
          <div className="flex items-center justify-between">
            <label class="text-sm font-medium w-1/2">Total Void</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-yellow-100 font-semibold"
              value={values.stgTotalVoidHome || ""}
              onChange={(e) => handleChange("stgTotalVoidHome", e.target.value)}
            />
          </div>

        <div className="border rounded-lg shadow p-4">
         <h2 className="text-xl font-bold mb-4">Exchange Bets:</h2>
          <div className="space-y-4">
           
            <div className="flex items-center justify-between">
                <label class="text-sm font-medium w-1/2">Total Laid Bets</label>
                <input
                type="number"
                className="w-full p-2 border rounded bg-yellow-100 font-semibold"
                value={values.exchangeLaid || ""}
                onChange={(e) => handleChange("exchangeLaid", e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between">
                <label class="text-sm font-medium w-1/2">Total Backed Bets</label>
                <input
                type="number"
                className="w-full p-2 border rounded bg-yellow-100 font-semibold"
                value={values.exchangeBacked || ""}
                onChange={(e) => handleChange("exchangeBacked", e.target.value)}
                />
            </div>
          </div>
        </div>

        </div>
      </div>

      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
        Submit Return
      </button>
    </form>
  );
}
*/
export default HriReturns
