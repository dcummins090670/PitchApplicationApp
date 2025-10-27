import './App.css'
import React from 'react'
//import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import RoleBasedNavbar from "./components/RoleBasedNavbar";
//import Navbar from './components/Navbar'
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import SisDashboard from './pages/SisDashboard';
import BookmakerDashboard from './pages/BookmakerDashboard';
import MyPitchesPage from "./pages/MyPitchesPage";
import FixturesPage from "./pages/FixturesPage";
import PremiumFixturesPage from './pages/PremiumFixturePage';
import CorporateFixturesPage from './pages/CorporateFixturePage';
import AttendancePage from './pages/AttendancePage';
import PremiumPitchPage from './pages/PremiumPitchPage';
import CorporatePitchPage from './pages/CorporatePitchPage';
import PremiumAttendancePage from './pages/PremiumAttendancePage';
import CorporateAttendancePage from './pages/CorporateAttendancePage';
import AdminFixturePage from './pages/AdminFixturePage';
import AdminBookmakerPage from './pages/AdminBookmakers';
import AdminPitchPage from './pages/AdminPitchPage';
import AttendeesPage from './pages/AttendeesPage';
import PremiumAttendeesPage from './pages/PremiumAttendeesPage';
import CorporateAttendeesPage from './pages/CorporateAttendeesPage';
import PremiumFixtureAwarded from './pages/PremiumFixtureAwarded';
import CorporateFixtureAwarded from './pages/CorporateFixtureAwarded';
import HriReturnsPage from './pages/HriReturnsPage';
import AdminPremiumPage from './pages/AdminPremiumPage';
import AdminCorporatePage from './pages/AdminCorporatePage';

//import RegisterPage from './pages/RegistrationPage';

function App () {
  const { user } = useAuth(); // pull user (and role) from context

  // Optional loading guard
  if (user === undefined) {
    return <div>Loading...</div>; 
  }

/* This is for testing if the user.js file can be accessed without the use of ROUTES
  const [user, setUser] = useState([])

  const getUser = () => {
    // in the package.json file I used ("proxy": "http://localhost:5000") to avoid writing the full URL
    fetch ("/api/user")
    .then (res => res.json())
    .then (json => setUser(json))
  }

  useEffect ( () => {
    getUser()
  },[])

  return (
    <div>
      {user.map((data)=>{
        return <>
        <div style={{border:"1px solid gray", width:"500px"}}>
        <h1>Name:{data.name}</h1>
        <h1>Username:{data.username}</h1>
        <h1>Email: {data.email}</h1>
        </div>
        </>
      })}
    </div>
  );
}
  */

 return (

  <div className="flex flex-col min-h-screen">
    <RoleBasedNavbar user ={user}/>
   
    <main className="flex-grow bg-blue-100">
     
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/register" element={<RegistrationPage/>}/>
          <Route path="/fixtures" element={ <FixturesPage /> } />
          <Route path="/premium-fixtures" element={ <PremiumFixturesPage /> } />
          <Route path="/corporate-fixtures" element={ <CorporateFixturesPage /> } />
          <Route path="/my-pitches" element={ <MyPitchesPage /> } />
          <Route path="/my-premium-pitches" element={ <PremiumPitchPage /> } />
          <Route path="/my-corporate-pitches" element={ <CorporatePitchPage /> } />
          <Route path="/attendance" element={ <AttendancePage /> } />
          <Route path="/prem-attendance" element={ <PremiumAttendancePage /> } />
          <Route path="/corp-attendance" element={ <CorporateAttendancePage /> } />
          <Route path="/admin-fixtures" element={ <AdminFixturePage /> } />
          <Route path="/admin-bookmakers" element={ <AdminBookmakerPage /> } />
          <Route path="/admin-pitches" element={ <AdminPitchPage /> } />
          <Route path="/prem-attendees" element={ <PremiumAttendeesPage /> } />
          <Route path="/corp-attendees" element={ <CorporateAttendeesPage /> } />
          <Route path="/attendees" element={ <AttendeesPage /> } />
          <Route path="/prem-awarded" element={ <PremiumFixtureAwarded/> } />
          <Route path="/corp-awarded" element={ <CorporateFixtureAwarded/> } />
          <Route path="/hri-returns" element={ <HriReturnsPage/> } />
          <Route path="/premium-area" element={ <AdminPremiumPage/> } />
          <Route path="/corporate-area" element={ <AdminCorporatePage/> } />


          <Route path="/dashboard/bookmaker" element={<BookmakerDashboard />} />
          <Route path="/dashboard/admin" element={ <AdminDashboard />}  />
          <Route path="/dashboard/sis" element={ <SisDashboard /> } />
        </Routes>
      
    </main>
    <Footer/>
    
  </div>
  
  );
}


export default App;



