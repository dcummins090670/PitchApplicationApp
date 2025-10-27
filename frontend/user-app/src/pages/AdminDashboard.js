import React from "react";
import { useNavigate } from "react-router-dom";


function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>


       <section className="flex justify-start ...">
        <article>
          <button
            onClick={() => navigate("/attendance")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Bookmaker Attendance List
          </button>
        </article> 
        

        <article>
          <button
            onClick={() => navigate("/prem-attendance")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Allocate Premium Pitches
          </button>
        </article>

        <article>
          <button
            onClick={() => navigate("/corp-attendance")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Allocate Corporate Pitches
          </button>
        </article>

         <article>
          <button
            onClick={() => navigate("/admin-fixtures")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Manage Fixture List
          </button>
        </article>

         <article>
          <button
            onClick={() => navigate("/admin-bookmakers")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Remove a Bookmaker 
          </button>
        </article>

        <article>
          <button
            onClick={() => navigate("/admin-pitches")}
            className="bg-blue-600 text-white m-8 px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Pitch Ownership 
          </button>
        </article>

      </section>
    
    </div>
  
    
  );
}

export default AdminDashboard;

