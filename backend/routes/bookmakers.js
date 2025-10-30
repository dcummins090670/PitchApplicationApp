const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Code for mySQL
// GET all bookmakers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE role_id = 1');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Code for PostgreSQL
// GET all bookmakers
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE role_id = 1');
        
        const results = result.rows;
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;