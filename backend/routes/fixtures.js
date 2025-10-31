const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/* This is the code used for mysql only 

// Get fixtures + pitches for the logged-in bookmaker
router.get('/my-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitNo; // from JWT

    try {
        const [results] = await db.query (
            `SELECT 	
                f.fixtureId,
                p.pitchId,	
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.name AS racecourseName,	
	            p.pitchLabel,	
                p.pitchNo,	
                COALESCE(fps.status, 'Not Working') AS status	
                FROM users u	
                JOIN Pitch p 	
                ON u.permitNo = p.ownerPermitNo	
                JOIN Racecourse r 	
                ON p.racecourseId = r.racecourseId	
                JOIN Fixture f	
                ON r.racecourseId = f.racecourseId 
                LEFT JOIN fixturePitchStatus fps	
                ON fps.fixtureId = f.fixtureId	
                AND fps.pitchId = p.pitchId	
                AND fps.permitNo = u.permitNo 
                WHERE u.permitNo = ? AND f.fixtureDate >= CURRENT_DATE
                ORDER BY f.fixtureDate`,	
                [permitNo]	
                );	
    // Left Join with FixturePitchStatus ensures we always see a row, even if no status has been set yet.

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});

    }    

});

// Update pitch status for a fixture (Bookmaker version with time rules) - Used when bookmker select a meeting to indicate status - "Working/Not Working)"
router.put('/my-pitches/:fixtureId/:pitchId/status',authenticateToken,authorizeRoles('bookmaker'),async (req, res) => {
        const { fixtureId, pitchId } = req.params;
        const { status } = req.body;
        const permitNo = req.user.permitNo; // from JWT

        const validStatuses = ['Not Working', 'Applied'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status for bookmaker' });
        }

        try {
            // Get fixture date for time checks
            const [fixtureRows] = await db.query(
                `SELECT f.fixtureDate
                 FROM Fixture f
                 JOIN Pitch p ON p.racecourseId = f.racecourseId
                 WHERE f.fixtureId = ? AND p.pitchId = ? AND p.ownerPermitNo = ?`,
                [fixtureId, pitchId, permitNo]
            );

            if (fixtureRows.length === 0) {
                return res.status(404).json({ error: 'Fixture or pitch not found for this bookmaker' });
            }

            const fixtureDate = new Date(fixtureRows[0].fixtureDate);
            const now = new Date();

            // Time rules
            if (status === 'Applied') {
                // Must be at least 1 days before fixture
                const minApplyDate = new Date(fixtureDate);
                minApplyDate.setDate(minApplyDate.getDate() +1);
                if (now > minApplyDate) {
                    return res.status(400).json({
                        error: 'You must apply at least 5 days before the fixture date'
                    });
                }
            }

            if (status === 'Not Working') {
                // Must be before 9am on fixture date
                const deadline = new Date(fixtureDate);
                deadline.setHours(18, 0, 0, 0);
                if (now > deadline) {
                    return res.status(400).json({
                        error: 'You can only change to Not Working before 9am on fixture day'
                    });
                }
            }

            // Ensure FixturePitchStatus record exists
            const [existing] = await db.query(
                `SELECT * FROM FixturePitch WHERE fixtureId = ? AND pitchId = ?`,
                [fixtureId, pitchId]
            );

            if (existing.length === 0) {
                // Create it if not found
                await db.query(
                    `INSERT INTO FixturePitch (fixtureId, pitchId, permitNo, status, updatedAt)
                     VALUES (?, ?, ?, ?, NOW())`,
                    [fixtureId, pitchId, permitNo, status]
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE FixturePitch
                     SET status = ?, updatedAt = NOW()
                     WHERE fixtureId = ? AND pitchId = ?`,
                    [status, fixtureId, pitchId]
                );
            }

            res.json({
                message: `Status updated`
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);


// Get all pitches for this years fixture (Bookmaker/SIS/Admin)
router.get('/currentyear', async (req, res) => {
       // const fixtureId = req.params.fixtureId;

        try {
            const [results] = await db.query(`
           
                SELECT f.fixtureId, 
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.name
                FROM Fixture f
                JOIN Racecourse r ON f.racecourseId = r.racecourseId
                WHERE f.fixtureDate BETWEEN '2025-01-01' AND '2025-12-31'
                ORDER BY f.fixtureDate ASC`
            );

            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);

router.get('/upcoming', async (req, res) => {
       // const fixtureId = req.params.fixtureId;

        try {
            const [results] = await db.query(`
           
                SELECT f.fixtureId, 
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.racecourseId,
                r.name,
                f.premiumAreaAvailable,
                f.corporateAreaAvailable
                FROM Fixture f
                JOIN Racecourse r ON f.racecourseId = r.racecourseId
                WHERE f.fixtureDate >= CURRENT_DATE 
                ORDER BY f.fixtureDate ASC`
            );

            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);

// Get attended pitches for a specific fixture
router.get('/:fixtureId/pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT 
        p.pitchId, 
        p.pitchLabel, 
        p.pitchNo, 
        u.name AS bookmakerName,
        u.permitNo,
        r.name AS racecourse,
        r.racecourseId,
        COALESCE(fp.status, 'Not Working') AS status,
        COALESCE(fp.attendance, 'Did Not Attend') AS attendance
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN FixturePitch fp
              ON fp.pitchId = p.pitchId AND fp.fixtureId = f.fixtureId
       WHERE f.fixtureId = ? AND u.name !='Vacant'
       ORDER BY p.pitchId`,
      [fixtureId]
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Get attended pitches for a specific fixture
router.get('/:fixtureId/attended-pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT 
        p.pitchId, 
        p.pitchLabel, 
        p.pitchNo, 
        u.name AS bookmakerName,
        u.permitNo,
        r.name AS racecourse,
        r.racecourseId,
        CAST(f.fixtureDate AS DATE) AS fixtureDate,
        COALESCE(fp.status, 'Not Working') AS status,
        COALESCE(fp.attendance, 'Did Not Attend') AS attendance
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN FixturePitch fp
              ON fp.pitchId = p.pitchId AND fp.fixtureId = f.fixtureId
       WHERE f.fixtureId = ? AND u.name !='Vacant' AND attendance = 'Attended'
       ORDER BY p.pitchId`,
      [fixtureId]
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Update pitch attendance for a fixture (SIS/Admin only)
router.put('/:fixtureId/:pitchId/attendance',authenticateToken,authorizeRoles('sis', 'admin'),async (req, res) => {
        const { fixtureId, pitchId } = req.params;
        const { attendance } = req.body;      
    

        // Simple validation
        const validOption = ['Did Not Attend', 'Attended'];
        if (!validOption.includes(attendance)) {
            return res.status(400).json({ error: 'Invalid attendance option' });
        }
     
             // Insert new row if not exists, else update
            await db.query(
                `INSERT INTO FixturePitch (fixtureId, pitchId, attendance)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE attendance = VALUES(attendance)`,
                [fixtureId, pitchId, attendance]
            );
            
            res.json({ message: `Attendance updated`});
    
    }
);

     // Get all fixtures with racecourse name
    router.get('/', async (req, res) => {
        //const fixtureId = req.params.fixtureId;

        try {
            const [results] = await db.query(
            `SELECT f.fixtureId, 
            CAST(f.fixtureDate AS DATE) AS fixtureDate,
            r.racecourseId,
            r.name,
            f.premiumAreaAvailable
            FROM Fixture f
            JOIN Racecourse r ON f.racecourseId = r.racecourseId
            WHERE f.fixtureDate > CURRENT_DATE 
            ORDER BY f.fixtureDate ASC`
            );

        res.json(results);
        } catch (err) {
            console.error("Error fetching fixtures:", err);
            res.status(500).json({ error: err.message });
        }
    });

    router.get("/:racecourseId/attendance-list", async (req, res) => {
              const { racecourseId } = req.params;  
                try {
                     // Get all attendees for a particular fixture (Note pa.id is used for the unique key in attendees)
                     const [results] = await db.query(
                    `SELECT
                        pa.id,
                        CAST(f.fixtureDate AS DATE) AS fixtureDate,
                        r.racecourseId,
                        r.name AS racecourse,
                        p.pitchLabel AS location,
                        p.pitchNo,
                        u.name
                        FROM Pitch p
                        JOIN Users u ON u.permitNo = p.ownerPermitNo
                        JOIN Fixture f ON f.racecourseId = p.racecourseId
                        JOIN Racecourse r ON r.racecourseId = f.racecourseId
                        JOIN PitchAttendance pa
                                ON pa.pitchId = p.pitchId AND pa.fixtureId = f.fixtureId            
                        WHERE r.racecourseId = ?
                        ORDER BY f.fixtureDate ASC`,
                        [racecourseId]
                    );
                            
                    res.json(results);
                } catch (err) {
                     console.error(err);
                    res.status(500).json({ error: "Database error" });
                }
        });
       
// Get all racecourses so that we can use racecourse.name rather than id to add a new fixture
    router.get('/racecourses',async (req, res) => { 
           
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
    });

   // Add new fixture
    router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { fixtureDate, racecourseId } = req.body;
         try {
            await db.query(
             `INSERT INTO Fixture (fixtureDate, racecourseId) VALUES (?, ?)`,
             [fixtureDate, racecourseId]
             );
             res.json({ message: 'Fixture added successfully' });
         } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    });

    // Delete fixture
     router.delete('/:fixtureId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { fixtureId } = req.params;
            try {
                await db.query(`DELETE FROM Fixture WHERE fixtureId = ?`, [fixtureId]);
                res.json({ message: 'Fixture deleted successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });

     router.post("/:fixtureId/attendance-list", async (req, res) => {
        const { fixtureId } = req.params;
        const { attendees } = req.body;

        if (!Array.isArray(attendees) || attendees.length === 0) {
            return res.status(400).json({ error: "No attendees provided" });
        }

        try {
            // First delete existing attendees for this fixture
            await db.query(
                `DELETE FROM PitchAttendance WHERE fixtureId = ?`,
            [fixtureId]
                            );
            // Insert all attendees
            for (const a of attendees) {
            await db.query(
                `INSERT INTO PitchAttendance (fixtureId, pitchId, bookmakerPermitNo, attendedAt)
                VALUES (?, ?, ?, NOW())`,
                [fixtureId, a.pitchId, a.bookmakerPermitNo]
            );
            }

            res.json({ message: "Attendees stored successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
        });   

*/


// This is the code used for postgreSQL only 

// 
// PostgreSQL: Get fixtures + pitches for the logged-in bookmaker
router.get('/my-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitNo; // from JWT

    try {
        const result = await db.query (
            `SELECT 	
                f.fixtureid,
                p.pitchid,	
                CAST(f.fixturedate AS DATE) AS fixturedate,
                r.name AS racecoursename,	
	            p.pitchlabel,	
                p.pitchno,	
                COALESCE(fps.status, 'Not Working') AS status	
                FROM users u	
                JOIN pitch p 	
                ON u.permitno = p.ownerpermitno	
                JOIN racecourse r 	
                ON p.racecourseId = r.racecourseId	
                JOIN fixture f	
                ON r.racecourseid = f.racecourseid 
                LEFT JOIN fixturepitch fps	
                ON fps.fixtureid = f.fixtureid	
                AND fps.pitchid = p.pitchid	
                AND fps.permitno = u.permitno 
                WHERE u.permitno = $1 AND f.fixturedate >= CURRENT_DATE
                ORDER BY f.fixturedate`,	
                [permitNo]	
                );	
                // Left Join with FixturePitch ensures we always see a row, even if no status has been set yet.

        const results = result.rows;
        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});

    }    

});

// PostgreSQL: Update pitch status for a fixture - when bookmker select a meeting to indicate status - "Working/Not Working)"
router.put('/my-pitches/:fixtureId/:pitchId/status',authenticateToken,authorizeRoles('bookmaker' ), async (req, res) => {
        const { fixtureId, pitchId } = req.params;
        const { status } = req.body;
        const permitNo = req.user.permitNo; // from JWT

        const validStatuses = ['Not Working', 'Applied'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status for bookmaker' });
        }

        console.log("Status update:", { fixtureId, pitchId, permitNo, status });

        try {
            // Get fixture date for time checks
            const fixtureResult = await db.query(
                `SELECT f.fixturedate
                 FROM fixture f
                 JOIN pitch p ON p.racecourseid = f.racecourseid
                 WHERE f.fixtureid = $1 AND p.pitchid = $2 AND p.ownerpermitno = $3`,
                [fixtureId, pitchId, permitNo]
            );
            const fixtureRows = fixtureResult.rows;

            if (fixtureRows.length === 0) {
                return res.status(404).json({ error: 'Fixture or pitch not found for this bookmaker' });
            }

            const fixtureDate = new Date(fixtureRows[0].fixturedate);
            const now = new Date();

            // Time rules
            if (status === 'Applied') {
                // Must be at least 1 days before fixture
                const minApplyDate = new Date(fixtureDate);
                minApplyDate.setDate(minApplyDate.getDate() +1);
                if (now > minApplyDate) {
                    return res.status(400).json({
                        error: 'You must apply at least 5 days before the fixture date'
                    });
                }
            }

            if (status === 'Not Working') {
                // Must be before 9am on fixture date
                const deadline = new Date(fixtureDate);
                deadline.setHours(18, 0, 0, 0);
                if (now > deadline) {
                    return res.status(400).json({
                        error: 'You can only change to Not Working before 9am on fixture day'
                    });
                }
            }

            // Ensure FixturePitchStatus record exists
            const existingPitch = await db.query(
                `SELECT * FROM fixturepitch WHERE fixtureid = $1 AND pitchid = $2`,
                [fixtureId, pitchId]
            );

            const existing = existingPitch.rows;
            if (existing.length === 0) {
                // Create it if not found
                await db.query(
                    `INSERT INTO fixturepitch (fixtureid, pitchid, permitno, status, updatedat)
                     VALUES ($1, $2, $3, $4, now())`,
                    [fixtureId, pitchId, permitNo, status]
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE fixturepitch
                     SET status = $3, updatedat = now()
                     WHERE fixtureid = $1 AND pitchid = $2`,
                    [fixtureId, pitchId, status]
                );
            }

            res.json({
                message: `Status updated`
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);


// Get all pitches for this years fixture (Bookmaker/SIS/Admin)
router.get('/currentyear', async (req, res) => {
       // const fixtureId = req.params.fixtureId;

        try {
            const result = await db.query(`
           
                SELECT f.fixtureid, 
                CAST(f.fixturedate AS DATE) AS fixturedate,
                r.name
                FROM fixture f
                JOIN racecourse r ON f.racecourseid = r.racecourseid
                WHERE f.fixturedate >= CURRENT_DATE
                ORDER BY f.fixturedate ASC`
            );
            const results = result.rows;
            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);

router.get('/upcoming', async (req, res) => {
       // const fixtureId = req.params.fixtureId;

        try {
            const result = await db.query(`
           
                SELECT f.fixtureid, 
                        CAST(f.fixturedate AS DATE) AS fixturedate,
                        r.racecourseid,
                        r.name,
                        f.premiumareaavailable,
                        f.corporateareaavailable
                FROM fixture f
                JOIN racecourse r ON f.racecourseid = r.racecourseid
                WHERE f.fixturedate >= CURRENT_DATE 
                ORDER BY f.fixturedate ASC`
            );

            const results = result.rows;
            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);

// Get attended pitches for a specific fixture
router.get('/:fixtureId/pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const result = await db.query(
      `SELECT 
            p.pitchid, 
            p.pitchlabel, 
            p.pitchno, 
            u.name AS bookmakername,
            u.permitno,
            r.name AS racecourse,
            r.racecourseid,
            COALESCE(fp.status, 'Not Working') AS status,
            COALESCE(fp.attendance, 'Did Not Attend') AS attendance
       FROM pitch p
       JOIN users u ON u.permitno = p.ownerpermitno
       JOIN fixture f ON f.racecourseid = p.racecourseid
       JOIN racecourse r ON r.racecourseid = f.racecourseid
       LEFT JOIN fixturepitch fp
              ON fp.pitchid = p.pitchid AND fp.fixtureid = f.fixtureid
       WHERE f.fixtureid = $1 AND u.name !='Vacant'
       ORDER BY p.pitchid`,
      [fixtureId]
    );
    const results = result.rows;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Get attended pitches for a specific fixture
router.get('/:fixtureId/attended-pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const result = await db.query(
      `SELECT 
            p.pitchid, 
            p.pitchlabel, 
            p.pitchno, 
            u.name AS bookmakername,
            u.permitno,
            r.name AS racecourse,
            r.racecourseid,
            CAST(f.fixturedate AS DATE) AS fixturedate,
            COALESCE(fp.status, 'Not Working') AS status,
            COALESCE(fp.attendance, 'Did Not Attend') AS attendance
       FROM pitch p
       JOIN users u ON u.permitno = p.ownerpermitno
       JOIN fixture f ON f.racecourseid = p.racecourseid
       JOIN racecourse r ON r.racecourseid = f.racecourseid
       LEFT JOIN fixturepitch fp
              ON fp.pitchid = p.pitchid AND fp.fixtureid = f.fixtureid
       WHERE f.fixtureid = $1 AND u.name !='Vacant' AND attendance = 'Attended'
       ORDER BY p.pitchid`,
      [fixtureId]
    );

    const results = result.rows;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Update pitch attendance for a fixture (SIS/Admin only)
router.put('/:fixtureId/:pitchId/attendance',authenticateToken,authorizeRoles('sis', 'admin'),async (req, res) => {
        const { fixtureId, pitchId } = req.params;
        const { attendance } = req.body;      
    

        // Simple validation
        const validOption = ['Did Not Attend', 'Attended'];
        if (!validOption.includes(attendance)) {
            return res.status(400).json({ error: 'Invalid attendance option' });
        }
     
             // Insert new row if not exists, else update
            await db.query(
                `INSERT INTO FixturePitch (fixtureId, pitchId, attendance)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE attendance = VALUES(attendance)`,
                [fixtureId, pitchId, attendance]
            );
            
            res.json({ message: `Attendance updated`});
    
    }
);

     // Get all fixtures with racecourse name
    router.get('/', async (req, res) => {
        //const fixtureId = req.params.fixtureId;

        try {
            const result = await db.query(
            `SELECT f.fixtureid, 
                    CAST(f.fixturedate AS DATE) AS fixturedate,
                    r.racecourseid,
                    r.name,
                    f.premiumareaavailable
            FROM fixture f
            JOIN racecourse r ON f.racecourseid = r.racecourseid
            WHERE f.fixturedate > CURRENT_DATE 
            ORDER BY f.fixturedate ASC`
            );

        const results = result.rows;
        res.json(results);
        } catch (err) {
            console.error("Error fetching fixtures:", err);
            res.status(500).json({ error: err.message });
        }
    });

        router.get("/:racecourseid/attendance-list", async (req, res) => {
              const { racecourseId } = req.params;  
                try {
                     // Get all attendees for a particular fixture (Note pa.id is used for the unique key in attendees)
                     const result = await db.query(
                    `SELECT
                            pa.id,
                            CAST(f.fixturedate AS DATE) AS fixturedate,
                            r.racecourseid,
                            r.name AS racecourse,
                            p.pitchlabel AS location,
                            p.pitchno,
                            u.name
                        FROM pitch p
                        JOIN users u ON u.permitno = p.ownerpermitno
                        JOIN fixture f ON f.racecourseid = p.racecourseid
                        JOIN racecourse r ON r.racecourseid = f.racecourseid
                        JOIN pitchattendance pa
                                ON pa.pitchid = p.pitchid AND pa.fixtureid = f.fixtureid            
                        WHERE r.racecourseid = $1
                        ORDER BY f.fixturedate ASC`,
                        [racecourseId]
                    );
                    
                    const results = result.rows;
                    res.json(results);
                    } catch (err) {
                     console.error(err);
                    res.status(500).json({ error: "Database error" });
                    }
            });
       
// Get all racecourses so that we can use racecourse.name rather than id to add a new fixture
    router.get('/racecourses',async (req, res) => { 
           
        try {
            const result = await db.query(`

                SELECT racecourseid,
                name 
                FROM racecourse 
                ORDER BY name ASC`
            );

        const results = result.rows;    
        res.json(results);
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    });

   // Add new fixture
    router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { fixtureDate, racecourseId } = req.body;
         try {
            await db.query(
             `INSERT INTO fixture (fixturedate, racecourseid) VALUES ($1, $2)`,
             [fixtureDate, racecourseId]
             );
             res.json({ message: 'Fixture added successfully' });
         } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    });

    // Delete fixture
     router.delete('/:fixtureId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { fixtureId } = req.params;
            try {
                await db.query(`DELETE FROM fixture WHERE fixtureid = $1`, [fixtureId]);
                res.json({ message: 'Fixture deleted successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });

     router.post("/:fixtureId/attendance-list", async (req, res) => {
        const { fixtureId } = req.params;
        const { attendees } = req.body;

        if (!Array.isArray(attendees) || attendees.length === 0) {
            return res.status(400).json({ error: "No attendees provided" });
        }

        try {
            // First delete existing attendees for this fixture
            await db.query(
                `DELETE FROM pitchattendance WHERE fixtureid = $1`,
            [fixtureId]
                            );
            // Insert all attendees
            for (const a of attendees) {
            await db.query(
                `INSERT INTO pitchattendance (fixtureid, pitchid, bookmakerpermitno, attendedat)
                VALUES ($1, $2, $3, now())`,
                [fixtureId, a.pitchId, a.bookmakerPermitNo]
            );
            }

            res.json({ message: "Attendees stored successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
        });   






   

module.exports = router;


