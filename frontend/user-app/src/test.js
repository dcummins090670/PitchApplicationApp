const express  = require('express');
const cors  = require ('cors');
const mysql  = require('mysql2');
const db = require('./config/db');


//import users from "./user.js"
const users = require('./user');

const app = express();

app.use(cors());
app.use(express.json());



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// add a simple test route:
app.get('/', (req, res) => {
    res.send('Server is ready!');
});


// add a simple test route to frontend using the user.js data:
app.get('/api/user', (req, res) => {
    res.send(users)
});



