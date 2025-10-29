const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get fixtures + pitches for the logged-in bookmaker
//router.get('/my-fixtures', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
router.get('/my-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitNo; // from JWT

    try {
        const [results] = await db.query (
            `
            `,
            [permitNo]
        );
    // Left Join with FixturePitchStatus ensures we always see a row, even if no status has been set yet.

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});

    }    

});
/*
// GET: All pitches for a specific fixture for the logged-in bookmaker
router.get('/my-pitches/:fixtureId', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
    const permitNo = req.user.permitNo; // from JWT
    const fixtureId = req.params.fixtureId;

    try {
        const [results] = await db.query(
            `SELECT 
                f.fixtureId,
                DATE_FORMAT(f.fixtureDate, '%Y-%m-%d') AS fixtureDate,
                r.name AS racecourseName,
                p.pitchId,
                p.pitchLabel,
                p.pitchNo,
                fp.status
            FROM Fixture f
            JOIN Racecourse r 
                ON f.racecourseId = r.racecourseId
            JOIN Pitch p 
                ON p.racecourseId = r.racecourseId
            JOIN Users u
                ON u.permitNo = p.ownerPermitNo
            LEFT JOIN fixturePitch fp
                ON fp.fixtureId = f.fixtureId 
                AND fp.pitchId = p.pitchId
            WHERE u.permitNo = ?
              AND f.fixtureId = ?
            ORDER BY p.pitchNo
        `, [permitNo, fixtureId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No pitches found for this fixture' });
        }

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
*/
// Update pitch status for a fixture (Bookmaker version with time rules) - Used when bookmker select a meeting to indicate status - "Working/Not Working)"
// can be viewed on http://localhost:3000/my-pitches
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




/*
// POST or PUT: Update work status for a pitch in a fixture
router.put('/update-status', authenticateToken, authorizeRoles('bookmaker', 'sis', 'admin'), async (req, res) => {
    const { fixtureId, pitchId, status } = req.body;
    //const permitNo = req.user.permitNo;
    const role = req.user.role;
    let permitNo = req.user.permitNo;

    if (!fixtureId || !pitchId || !status) {
        return res.status(400).json({ error: "Missing fixtureId, pitchId, or status" });
    }

    try {
        // If SIS or Admin, find the pitch owner's permitNo so that Admin do not need to enter it manually
            if (role === 'admin' || role === 'sis') {
                const [pitchRows] = await db.query(
                    'SELECT ownerPermitNo FROM Pitch WHERE pitchId = ?',
                    [pitchId]
                );
                if (pitchRows.length === 0) {
                    return res.status(404).json({ error: 'Pitch not found' });
                }
                permitNo = pitchRows[0].ownerPermitNo;
            }
            
        // Prevent bookmakers from updating after 9 AM on fixture day
            if (role === 'bookmaker') {
                //Get the fixture Date
                const [fixtureRows] = await db.query(
                    'SELECT fixtureDate FROM Fixture WHERE fixtureId = ?',
                    [fixtureId]
                );
                if (fixtureRows.length === 0) {
                    return res.status(404).json({ error: 'Fixture not found' });
                }

                const fixtureDateTime = new Date(fixtureRows[0].fixtureDate);
                fixtureDateTime.setHours(9, 0, 0, 0); // set cutoff to 9am

                if (new Date() > fixtureDateTime) {
                    return res.status(403).json({ error: 'Cannot update after 9am on fixture day' });
                }
            }
            

            // Insert or update fixturePitchStatus in Database
            await db.query(
                `INSERT INTO fixturePitchStatus (fixtureId, pitchId, permitNo, status)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE status = VALUES(status)`,
                [fixtureId, pitchId, permitNo, status]
            );

            res.json({ message: "Status updated successfully" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
});
*/

// Get all pitches for the next 3 weeks fixture (Bookmaker/SIS/Admin)
//router.get('/upcoming',authenticateToken,async (req, res) => {
router.get('/currentyear', async (req, res) => {
        const fixtureId = req.params.fixtureId;

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
        const fixtureId = req.params.fixtureId;

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
                WHERE f.fixtureDate > CURRENT_DATE 
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


/*
// Update pitch status for a fixture (SIS/Admin only)
router.put('/fixtures/:fixtureId/:pitchId/status',authenticateToken,authorizeRoles('sis', 'admin'),async (req, res) => {
        const { fixtureId, pitchId } = req.params;
        const { status } = req.body;

        // Simple validation
        const validStatuses = ['Not Working', 'Applied'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        try {
            // Get fixture date
            const [fixtureRows] = await db.query(
                `SELECT fixtureDate FROM Fixture WHERE fixtureId = ?`,
                [fixtureId]
            );

            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            const fixtureDate = fixtureRows[0].fixtureDate;
            const now = new Date();
            const  updateStartTime= new Date(fixtureDate);
            updateStartTime.setHours(9, 0, 0, 0); // 9:00:00 on fixture day

            // Only allow update if current time is 9am or later on fixture day
            if (now < updateStartTime) {
                return res.status(400).json({ 
                    error: 'Cannot confirm attendance before 9am on the fixture day' 
                });
            }

            // Ensure row exists before updating
            const [existing] = await db.query(
                `SELECT * FROM fixturePitch WHERE fixtureId = ? AND pitchId = ?`,
                [fixtureId, pitchId]
            );

            if (existing.length === 0) {
                return res.status(404).json({ error: 'Fixture/Pitch record not found' });
            }

            // Update status
            await db.query(
                `UPDATE fixturePitch 
                 SET status = ?, updatedAt = NOW()
                 WHERE fixtureId = ? AND pitchId = ?`,
                [status, fixtureId, pitchId]
            );

            res.json({
                message: `Status updated to '${status}' for Pitch ${pitchId} in Fixture ${fixtureId}`
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);

//module.exports = router;
*/

// Update pitch attendance for a fixture (SIS/Admin only)
router.put('/:fixtureId/:pitchId/attendance',authenticateToken,authorizeRoles('sis', 'admin'),async (req, res) => {
        const { fixtureId, pitchId } = req.params;
        const { attendance } = req.body;      
    

        // Simple validation
        const validOption = ['Did Not Attend', 'Attended'];
        if (!validOption.includes(attendance)) {
            return res.status(400).json({ error: 'Invalid attendance option' });
        }

      //  try {
            // Get fixture date
      //      const [fixtureRows] = await db.query(
      //          `SELECT fixtureDate FROM Fixture WHERE fixtureId = ?`,
      //          [fixtureId]
      //      );
            
      //      if (fixtureRows.length === 0) {
      //      return res.status(404).json({ error: 'Fixture not found' });
      //  }

            //const fixtureDate = fixtureRows[0].fixtureDate;
            //const now = new Date();
            //const  updateStartTime= new Date(fixtureDate);
            //updateStartTime.setHours(9, 0, 0, 0); // 9:00:00 on fixture day

            // Only allow update if current time is 9am or later on fixture day
            //if (now < updateStartTime) {
                //return res.status(400).json({ 
                    //error: 'Cannot confirm attendance before 9am on the fixture day' 
                //});
            //}

             // Insert new row if not exists, else update
            await db.query(
                `INSERT INTO FixturePitch (fixtureId, pitchId, attendance)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE attendance = VALUES(attendance)`,
                [fixtureId, pitchId, attendance]
            );
            /*
            // Ensure row exists before updating
            const [existing] = await db.query(
                `SELECT * FROM fixturePitch WHERE fixtureId = ? AND pitchId = ?`,
                [fixtureId, pitchId, ]
            );

            


            if (existing.length === 0) {
                return res.status(404).json({ error: 'Fixture/Pitch record not found' });
            }

            // Update attendance
            await db.query(
                `UPDATE fixturePitch 
                 SET attendance = ?
                 WHERE fixtureId = ? AND pitchId = ?`,
                [attendance, fixtureId, pitchId, ]
            );
            */
            res.json({ message: `Attendance updated`});
    //    } catch (err) {
    //        console.error(err);
    //        res.status(500).json({ error: "More problems" });
    //    }
    }
);

    // ---- This is the code used for the AdminFixturePage ----------

    // Get all fixtures with racecourse name
    router.get('/', async (req, res) => {
        const fixtureId = req.params.fixtureId;

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


   

module.exports = router;


 // DATE_FORMAT(f.fixtureDate, '%Y-%m-%d') AS fixtureDate,
// CAST(f.fixtureDate AS DATE) AS fixtureDate,

// WHERE f.fixtureDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 28 DAY)
// WHERE f.fixtureDate > CURRENT_DATE  