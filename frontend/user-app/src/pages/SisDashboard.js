import React from "react";
import { useNavigate } from "react-router-dom";


function SisDashboard() {
  const navigate = useNavigate();

  return (

    <div className="p-4 ">
      <h1 className="text-xl font-bold mb-4">SIS Dashboard</h1>
      
        <div className="flex justify-start ...">
          <div>
            <button
              onClick={() => navigate("/attendance")}
              className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Bookmaker Attendance List
            </button>
          </div> 
        

        <div>
          <button
            onClick={() => navigate("/prem-attendance")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Bookmaker Premium Attendance
          </button>
        </div>

        <div>
          <button
            onClick={() => navigate("/corp-attendance")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Bookmaker Corporate Attendance
          </button>
        </div>

      </div>
    
    </div>




    
  );
}

export default SisDashboard;