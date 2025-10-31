const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


 /*This is the code for MySQL only --
// Get fixtures for this bookmaker
router.get('/fixtures', authenticateToken, authorizeRoles('bookmaker'), (req, res) => {
    const permitNo = req.user.permitNo;

    const sql = `
        SELECT DISTINCT f.id, f.fixture_date, f.location
        FROM fixture f
        JOIN fixturePitch fp ON f.id = fp.fixture_id
        JOIN pitch p ON p.id = fp.pitch_id
        WHERE p.permitNo = ?
        ORDER BY f.fixture_date ASC
    `;

    db.query(sql, [permitNo], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Get pitches for a specific fixture
router.get('/fixtures/:fixtureId/pitches', authenticateToken, authorizeRoles('bookmaker'), (req, res) => {
    const fixtureId = req.params.fixtureId;
    const permitNo = req.user.permitNo;

    const sql = `
        SELECT p.id, p.pitch_name
        FROM pitch p
        JOIN fixturePitch fp ON p.id = fp.pitch_id
        WHERE fp.fixture_id = ? AND p.permitNo = ?
    `;

    db.query(sql, [fixtureId, permitNo], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Set intention for a pitch
router.post('/fixtures/:fixtureId/pitches/:pitchId/intention', authenticateToken, authorizeRoles('bookmaker'), (req, res) => {
    const fixtureId = req.params.fixtureId;
    const pitchId = req.params.pitchId;
    const permitNo = req.user.permitNo;
    const { intends_to_work } = req.body; // Boolean

    const sql = `
        INSERT INTO bookmaker_intentions (fixture_id, pitch_id, permitNo, intends_to_work, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE intends_to_work = VALUES(intends_to_work)
    `;

    db.query(sql, [fixtureId, pitchId, permitNo, intends_to_work], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Intention saved successfully' });
    });
});

// View all bookmakers who indicated their intention
router.get('/intentions', authenticateToken, authorizeRoles('bookmaker'), (req, res) => {
    // DB query to fetch intentions
    res.json({ intentions: [] });
});

// Confirm attendance on the day
router.post('/attendance', authenticateToken, authorizeRoles('bookmaker'), (req, res) => {
    // DB code to mark attendance
    res.json({ message: 'Attendance confirmed' });
});
*/

// PostgreSQL code

//Get fixtures for this bookmaker
router.get('/fixtures', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
    const permitNo = req.user.permitno;

    const sql = `
        SELECT DISTINCT f.id, f.fixturedate, f.location
        FROM fixture f
        JOIN fixturePitch fp ON f.id = fp.fixtureid
        JOIN pitch p ON p.id = fp.pitchid
        WHERE p.permitNo = $1
        ORDER BY f.fixturedate ASC
    `;
    try {
    const result = await db.query(sql, [permitNo]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching fixtures:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get pitches for a specific fixture
router.get('/fixtures/:fixtureId/pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
    const fixtureId = req.params.fixtureId;
    const permitNo = req.user.permitno;

    const sql = `
        SELECT p.id, p.pitchname
        FROM pitch p
        JOIN fixturePitch fp ON p.id = fp.pitchid
        WHERE fp.fixtureid = $1 AND p.permitNo = $2
    `;

    try {
      const result = await db.query(sql, [fixtureId, permitNo]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching pitches:', err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);



module.exports = router;
