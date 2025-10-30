require ('dotenv').config();
const express  = require('express');
const cors  = require ('cors');

const mysql  = require('mysql2');

const pkg = require('pg');


//import users from "./user.js"
//const users = require('./user');

const db = require('./config/db');


const app = express();
app.use(cors());
app.use(express.json());

// Routes

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const bookmakerRoutes = require('./routes/bookmakers');
app.use('/api/bookmakers', bookmakerRoutes);

const fixtureRoutes = require('./routes/fixtures');
app.use('/api/fixtures', fixtureRoutes);

const premiumFixtureRoutes = require('./routes/premiumFixtures');
app.use('/api/premiumFixtures', premiumFixtureRoutes);

const corporateFixtureRoutes = require('./routes/corporateFixtures');
app.use('/api/corporateFixtures', corporateFixtureRoutes);

const userrRoutes = require('./routes/users');
app.use('/api/users', userrRoutes);

const pitchRoutes = require('./routes/pitches');
app.use('/api/pitches', pitchRoutes);

const returnsRoutes = require('./routes/hriReturns');
app.use('/api/hriReturns', returnsRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// add a simple test route:
app.get('/ping', (req, res) => {
    res.send('Server is pinging!');
});

// add a simple test route:
app.get('/', (req, res) => {
    res.send('Server is ready!');
});

/*
// add a simple test route to frontend using the user.js data:
app.get('/api/user', (req, res) => {
    res.send(users)
});
*/


// add a simple test routes requiring authentication:
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');

app.get('/secret', authenticateToken, authorizeRoles('admin'), (req, res) => {
    res.json({ message: `Welcome Admin ${req.user.permitNo}, you made it!` });
});

app.get('/bookie', authenticateToken, authorizeRoles('bookmaker'), (req, res) => {
    res.json({ message: `Welcome Bookie ${req.user.permitNo}, you made it!` });
});


