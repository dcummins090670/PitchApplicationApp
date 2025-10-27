import './App.css'
import React, { useEffect, useState } from 'react'



function App () {
  
//This is for testing if the user.js file can be accessed without the use of ROUTES
 

  const getUser = () => {
    // in the package.json file I used ("proxy": "http://localhost:5000") to avoid writing the full URL
    fetch ("/api/user")
    .then (res => res.json())
    .then (json => console.log(json))
  }

  useEffect ( () => {
    getUser()
  },[])

  return (
    <div>
      App
    </div>
  );
}
  
export default App;

import { Routes, Route } from 'react-router-dom';

 const [user, setUser] = useState([])


 {user.map((data)=>{
        return <>
        <div style={{border:"1px solid gray", width:"500px"}}>
        <h1>Name:{data.name}</h1>
        <h1>Username:{data.username}</h1>
        <h1>Email: {data.email}</h1>
        </div>
        </>
      })}
