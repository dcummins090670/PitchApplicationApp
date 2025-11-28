const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

/* This is for mySql database
// REGISTER Route
router.post('/register', async (req, res) => {
   const { permitNo, name, phone, email, password, role } = req.body;

    if (!permitNo || !name || !phone || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if permitNo already exists
         const [existing] = await db.query('SELECT * FROM users WHERE permitNo = ?', [permitNo]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bookmaker already exists' });
        }
        // Check if email already exists
        const [existingByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingByEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db.query(
            'INSERT INTO users (permitNo, name, phone, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?, ?)',
            [permitNo, name, phone, email, hashedPassword, role] // Assuming role is the role_id
        );

        // Optional auto-login the user after registering, generate and return a token
        const token = jwt.sign(
           { permitNo, role: role },
                  process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGIN Route
router.post('/login', async (req, res) => {
    const { permitNo, password } = req.body;

    try {
        console.log('Received login request:', { permitNo, password });

        //1. Look up the user in MySQL by permitNo
        const [rows] = await db.query(
            'SELECT u.permitNo, u.name, u.email, u.password_hash, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE permitNo = ?',
            [permitNo]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid permitNo' });
        }

        const user = rows[0];
        console.log('Fetched user:', user);



        // 2. Check the password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // 3. Create a JWT token
        const token = jwt.sign(
            { permitNo: user.permitNo, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Send token back to React
        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
*/

// This is for postgreSql database
// REGISTER Route
router.post('/register', async (req, res) => {
   const { permitNo, name, phone, email, password, role } = req.body;

    if (!permitNo || !name || !phone || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if permitNo already exists
         const existingNo = await db.query('SELECT * FROM users WHERE permitno = $1', [permitNo]);
         const existing = existingNo.rows;
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bookmaker already exists' });
        }
        // Check if email already exists
        const existingEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const existingByEmail = existingEmail.rows;
        if (existingByEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db.query(
            'INSERT INTO users (permitno, name, phone, email, password_hash, role_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [permitNo, name, phone, email, hashedPassword, role] // Assuming role is the role_id
        );

        // Optional auto-login the user after registering, generate and return a token
        const token = jwt.sign(
           { permitNo, role: role },
             process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'User registered successfully',token }); // token is not included this in sql part yet
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGIN Route
router.post('/login', async (req, res) => {
    const { permitNo, password } = req.body;

    try {
        console.log('Received login request:', { permitNo, password });
        //1. Look up the user in MySQL by permitNo
        const result = await db.query(
            'SELECT u.permitno, u.name, u.email, u.password_hash, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE LOWER(permitno) = LOWER($1)',
            [permitNo]
        );
        

        const users = result.rows;
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid permitNo' });
        }

        const user = users[0];
        console.log('Fetched user:', user);



        // 2. Check the password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // 3. Create a JWT token
        const token = jwt.sign(
            { permitNo: user.permitno, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Send token back to React
        res.json({ token, role: user.role });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
        }
});


module.exports = router;
