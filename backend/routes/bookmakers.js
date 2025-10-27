const express = require('express');
const router = express.Router();
const db = require('../config/db');


// GET all bookmakers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE role_id = 1');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;