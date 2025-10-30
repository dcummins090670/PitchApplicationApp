const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/*
// ---- This is the code used for the MYSQL ----------

// Get all racecourses so that we can use racecourse.name rather than id to add a new fixture
router.get('/racecourses',authenticateToken,authorizeRoles('admin'),async (req, res) => { 
           
        try {
            const [results] = await db.query(`

                SELECT racecourseId,
                name 
                FROM Racecourse 
                ORDER BY name ASC`
            );

        res.json(results);
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    }
    );

// Get pitches for a particular racecourse
router.get('/:racecourseId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { racecourseId } = req.params;
    try {
            const [results] = await db.query(`

            SELECT p.pitchId,
            u.name, 
            CAST(p.seniorityDate AS DATE) AS seniority,
            p.pitchLabel,
            p.pitchNo
            FROM Pitch p
            JOIN Users u ON p.ownerPermitNo = u.permitNo
            WHERE racecourseId = ?`, [racecourseId]
           
            );
          

        res.json(results);
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
});

// Update transfer of pitch
     router.put('/:pitchId/transfer', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { pitchId } = req.params;
        const { newOwnerPermitNo, transferValue } = req.body;

         if (!newOwnerPermitNo) {
            return res.status(400).json({ error: "newOwnerPermitNo is required" });
        }

            try {

                // Get current owner first
                const [current] = await db.query(
                "SELECT ownerPermitNo FROM Pitch WHERE pitchId = ?",
                [pitchId]
                );

                if (current.length === 0) {
                return res.status(404).json({ error: "Pitch not found" });
                }
                const oldOwnerPermitNo = current[0].ownerPermitNo;

                // Update pitch owner
                await db.query(`
                    UPDATE Pitch 
                    SET ownerPermitNo = ?
                    WHERE pitchId = ?`, 
                    [newOwnerPermitNo, pitchId]);

                // Log transfer
                await db.query(`
                    INSERT INTO PitchTransfer 
                    (pitchId, oldOwnerPermitNo, newOwnerPermitNo, transferValue) VALUES (?, ?, ?, ?)`,
                    [pitchId, oldOwnerPermitNo, newOwnerPermitNo, transferValue ?? null]
                    );

                res.json({ message: 'Pitch transferred successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });




// SIS-only route
router.post('/:permitNo/attendance', authenticateToken, authorizeRoles('sis'), (req, res) => {
    res.json({ message: `Attendance confirmed for pitch ${req.params.permitNo}` });
});
*/


// ---- This is the code used for the MYSQL ----------

// Get all racecourses so that we can use racecourse.name rather than id to add a new fixture
router.get('/racecourses',authenticateToken,authorizeRoles('admin'),async (req, res) => { 
           
        try {
            const result = await db.query(`

                SELECT racecourseId,
                name 
                FROM Racecourse 
                ORDER BY name ASC`
            );

        const results = result.rows;    
        res.json(results);
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    }
    );

// Get pitches for a particular racecourse
router.get('/:racecourseId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { racecourseId } = req.params;
    try {
            const result = await db.query(`

            SELECT p.pitchId,
            u.name, 
            CAST(p.seniorityDate AS DATE) AS seniority,
            p.pitchLabel,
            p.pitchNo
            FROM Pitch p
            JOIN Users u ON p.ownerPermitNo = u.permitNo
            WHERE racecourseId = $1`, [racecourseId]
           
            );
          
        const results = result.rows;
        res.json(results);
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
});

// Update transfer of pitch
     router.put('/:pitchId/transfer', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { pitchId } = req.params;
        const { newOwnerPermitNo, transferValue } = req.body;

         if (!newOwnerPermitNo) {
            return res.status(400).json({ error: "newOwnerPermitNo is required" });
        }

            try {

                // Get current owner first
                const currentResult = await db.query(
                "SELECT ownerPermitNo FROM Pitch WHERE pitchId = $1",
                [pitchId]
                );
                const current = currentResult.rows;
                if (current.length === 0) {
                return res.status(404).json({ error: "Pitch not found" });
                }
                const oldOwnerPermitNo = current[0].ownerPermitNo;

                // Update pitch owner
                await db.query(`
                    UPDATE Pitch 
                    SET ownerPermitNo = $1
                    WHERE pitchId = $2`, 
                    [newOwnerPermitNo, pitchId]);

                // Log transfer
                await db.query(`
                    INSERT INTO PitchTransfer 
                    (pitchId, oldOwnerPermitNo, newOwnerPermitNo, transferValue) VALUES ($1, $2, $3, $4)`,
                    [pitchId, oldOwnerPermitNo, newOwnerPermitNo, transferValue ?? null]
                    );

                res.json({ message: 'Pitch transferred successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });




    // SIS-only route
    router.post('/:permitNo/attendance', authenticateToken, authorizeRoles('sis'), (req, res) => {
        res.json({ message: `Attendance confirmed for pitch ${req.params.permitNo}` });
    });


module.exports = router;


// DATE_FORMAT(p.seniorityDate, '%Y-%m-%d') AS seniority,
// CAST(p.seniorityDate AS DATE) AS seniority,