const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


/* This is for mySQL only -  
// Get fixtures + pitches for the logged-in bookmaker
//router.get('/my-fixtures', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
router.get('/my-premium-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitNo; // from JWT

    try {
        const [results] = await db.query (
            `SELECT 
                f.fixtureId,
                f.premiumAreaAvailable,
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.racecourseId,
                r.name AS racecourseName,
                p.pitchId,
                p.pitchLabel,
                p.pitchNo,
            COALESCE(pfp.premiumStatus, 'Not Applying') AS premiumStatus   
            FROM users u
            JOIN Pitch p 
                ON u.permitNo = p.ownerPermitNo
            JOIN Racecourse r 
                ON p.racecourseId = r.racecourseId
            JOIN Fixture f
                ON r.racecourseId = f.racecourseId                
            LEFT JOIN premiumFixturePitch pfp
                ON pfp.fixtureId = f.fixtureId
                AND pfp.pitchId = p.pitchId
                AND pfp.permitNo = u.permitNo    
            WHERE u.permitNo = ?  AND f.premiumAreaAvailable = TRUE AND f.fixtureDate >= CURRENT_DATE  
            ORDER BY f.fixtureDate`,
            [permitNo]
        );
    // Left Join with FixturePitchStatus ensures we always see a row, even if no status has been set yet. WHERE u.permitNo = ?  AND f.fixtureDate >= CURDATE() AND f.premiumAreaAvailable = TRUE

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});
    }    

});

// Update pitch status for a fixture (Bookmaker version with time rules) - Used when bookmker select a meeting to indicate status - "Working/Not Working)"
router.put('/my-premium-pitches/:fixtureId/:pitchId/:racecourseId/premium-status',authenticateToken,authorizeRoles('bookmaker'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { premiumStatus } = req.body;
        const permitNo = req.user.permitNo; // from JWT

        const validStatuses = ['Not Applying', 'Applied'];
        if (!validStatuses.includes(premiumStatus)) {
            return res.status(400).json({ error: 'Invalid status for bookmaker' });
        }

        try {
            // Get fixture date for time checks
            const [fixtureRows] = await db.query(
                `SELECT f.fixtureDate
                 FROM Fixture f
                 JOIN Pitch p ON p.racecourseId = f.racecourseId
                 WHERE f.fixtureId = ? AND p.pitchId = ? AND p.racecourseId = ? AND p.ownerPermitNo = ?`,
                [fixtureId, pitchId, racecourseId, permitNo]
            );

            if (fixtureRows.length === 0) {
                return res.status(404).json({ error: 'Fixture or pitch not found for this bookmaker' });
            }

            const fixtureDate = new Date(fixtureRows[0].fixtureDate);
            const now = new Date();

            // Time rules
            if (premiumStatus === 'Applied') {
                // Must be at least 7 days before fixture
                const minApplyDate = new Date(fixtureDate);
                minApplyDate.setDate(minApplyDate.getDate() - 2);
                if (now > minApplyDate) {
                    return res.status(400).json({
                        error: 'You must apply at least 2 days before the fixture date'
                    });
                }
            }

            if (premiumStatus === 'Not Applying') {
                // Must be before 9am on fixture date
                const deadline = new Date(fixtureDate);
                deadline.setHours(9, 0, 0, 0);
                if (now > deadline) {
                    return res.status(400).json({
                        error: 'You can only change to Not Working before 9am on fixture day'
                    });
                }
            }

            // Ensure FixturePitchStatus record exists
            const [existing] = await db.query(
                `SELECT * FROM PremiumFixturePitch WHERE fixtureId = ? AND pitchId = ? AND racecourseId = ?`,
                [fixtureId, pitchId, racecourseId]
            );

            if (existing.length === 0) {
                // Create it if not found
                await db.query(
                    `INSERT INTO PremiumFixturePitch (fixtureId, pitchId, racecourseId, permitNo, premiumStatus, updatedAt)
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [fixtureId, pitchId, racecourseId, permitNo, premiumStatus]
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE PremiumFixturePitch
                     SET premiumStatus = ?, updatedAt = NOW()
                     WHERE fixtureId = ? AND pitchId = ? AND racecourseId = ?`,
                    [premiumStatus, fixtureId, pitchId, racecourseId]
                );
            }

            res.json({
                message: `Status updated to '${premiumStatus}' for your pitch ${pitchId} at racecourse ${racecourseId} in fixture ${fixtureId}`
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);




// Get all pitches for the next 3 weeks fixture (Bookmaker/SIS/Admin)
router.get('/upcoming' ,async (req, res) => {
//router.get('/',authenticateToken,authorizeRoles('bookmaker','sis', 'admin'),async (req, res) => {
        const fixtureId = req.params.fixtureId;

        try {
            const [results] = await db.query(`
           
                SELECT f.fixtureId, f.numberOfPremiumPitches,
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.name
                FROM Fixture f
                JOIN Racecourse r ON f.racecourseId = r.racecourseId
                WHERE f.fixtureDate >= CURRENT_DATE AND f.premiumAreaAvailable = TRUE 
                ORDER BY f.fixtureDate ASC`
            );

            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);
// Get pitches for a premium fixture (this is what setPitches returns in PremiumAttendancePage - pitches can then be mapped through with these props)
router.get('/:fixtureId/premium-pitches', async (req, res) => {
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
        COALESCE(pfp.premiumStatus, 'Not Applying') AS premiumStatus,
        COALESCE(pfp.location, 'Main Ring') AS location
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN PremiumFixturePitch pfp
              ON pfp.pitchId = p.pitchId AND pfp.fixtureId = f.fixtureId
       WHERE f.fixtureId = ? AND u.name !='Vacant' AND pfp.premiumStatus = 'Applied'
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
router.get('/:fixtureId/awarded-pitches', async (req, res) => {
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
        COALESCE(pfp.location, 'Main Ring') AS location,
        COALESCE(pfp.premiumStatus, 'Not Applying') AS premiumStatus
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN PremiumFixturePitch pfp
              ON pfp.pitchId = p.pitchId AND pfp.fixtureId = f.fixtureId
       WHERE f.fixtureId = ? AND u.name !='Vacant' AND pfp.location ='Premium Area'
       ORDER BY p.pitchId`,
      [fixtureId]
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Update pitch location for a fixture (SIS/Admin only)
    router.put('/:fixtureId/:pitchId/:racecourseId/attendance',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { location } = req.body;      
    

        // Simple validation
        const validOption = ['Main Ring', 'Premium Area'];
        if (!validOption.includes(location)) {
            return res.status(400).json({ error: 'Invalid location option' });
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
                `INSERT INTO PremiumFixturePitch (fixtureId, pitchId, racecourseId, location)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE location = VALUES(location)`,
                [fixtureId, pitchId, racecourseId, location]
            );
            
            res.json({message: `Location updated to '${location}' for Pitch ${pitchId} at racecourse ${racecourseId} in Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);

 // ---- This is the code used for the premiumFixturePage ----------

   // Get all premium fixtures with racecourse name
    router.get('/', async (req, res) => {
        const fixtureId = req.params.fixtureId;
   
         try {
             const [results] = await db.query(
             `SELECT f.fixtureId, 
             CAST(f.fixtureDate AS DATE) AS fixtureDate,
             r.racecourseId,
             r.name 
             FROM Fixture f
             JOIN Racecourse r ON f.racecourseId = r.racecourseId
             WHERE f.fixtureDate >= CURRENT_DATE AND f.premiumAreaAvailable = TRUE
             ORDER BY f.fixtureDate ASC`
             );
   
         res.json(results);
            } catch (err) {
             console.error("Error fetching fixtures:", err);
              res.status(500).json({ error: err.message });
          }
    });

    //PremiumAttendeesPage (Part 1) - (props are stored in a variable called attendees in PremiumAttendeesPage)

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
                    JOIN PremiumAttendance pa
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
    router.get('/racecourses', async (req, res) => { 
           
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
                `DELETE FROM PremiumAttendance WHERE fixtureId = ?`,
                [fixtureId]
                );
              // Insert all attendees
            for (const a of attendees) {
            await db.query(
                `INSERT INTO PremiumAttendance (fixtureId, pitchId, bookmakerPermitNo, attendedAt)
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


// Update premiumArea for a fixture (Admin only)
    router.put('/:fixtureId/premiumArea',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { premiumAreaAvailable } = req.body;
        
        //const { numberOfPremiumPitches } = req.body;
    

        try {
            // Get fixture date
            const [fixtureRows] = await db.query(
                `SELECT *
                    FROM Fixture f
                    JOIN Racecourse r ON r.racecourseId = f.racecourseId
                    WHERE f.fixtureId = ?`,
                [fixtureId]
            );
            
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            // Insert new row if not exists, else update
             await db.query(
                `UPDATE fixture 
                 SET premiumAreaAvailable = ?
                 
                 WHERE fixtureId = ?`,
                [premiumAreaAvailable, fixtureId ]
            );
            
            res.json({message: `Premium Area Avaiable updated to '${premiumAreaAvailable}' and number of preium pitches avaiable is at Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);  

// Update premiumArea for a fixture (Admin only)
    router.put('/:fixtureId/premiumPitches',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { numberOfPremiumPitches } = req.body;      
    

        try {
            // Get fixture date
            const [fixtureRows] = await db.query(
                `SELECT *
                    FROM Fixture f
                    JOIN Racecourse r ON r.racecourseId = f.racecourseId
                    WHERE f.fixtureId = ?`,
                [fixtureId]
            );
            
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            // Insert new row if not exists, else update
             await db.query(
                `UPDATE fixture 
                 SET numberOfPremiumPitches = ?
                 WHERE fixtureId = ?`,
                [numberOfPremiumPitches, fixtureId ]
            );
            
            res.json({message: `Premium Area Avaiable updated to '${numberOfPremiumPitches}' in Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);    
 */   
    
  
// This is for postgreSQL only -  
// Get fixtures + pitches for the logged-in bookmaker
//router.get('/my-fixtures', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
router.get('/my-premium-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitno; // from JWT

    try {
        const result
         = await db.query (
            `SELECT 
                f.fixtureId,
                f.premiumAreaAvailable,
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.racecourseId,
                r.name AS racecourseName,
                p.pitchId,
                p.pitchLabel,
                p.pitchNo,
            COALESCE(pfp.premiumStatus, 'Not Applying') AS premiumStatus   
            FROM users u
            JOIN Pitch p 
                ON u.permitNo = p.ownerPermitNo
            JOIN Racecourse r 
                ON p.racecourseId = r.racecourseId
            JOIN Fixture f
                ON r.racecourseId = f.racecourseId                
            LEFT JOIN premiumFixturePitch pfp
                ON pfp.fixtureId = f.fixtureId
                AND pfp.pitchId = p.pitchId
                AND pfp.permitNo = u.permitNo    
            WHERE u.permitNo = $1  AND f.premiumAreaAvailable = TRUE AND f.fixtureDate >= CURRENT_DATE  
            ORDER BY f.fixtureDate`,
            [permitNo]
        );
    // Left Join with FixturePitchStatus ensures we always see a row, even if no status has been set yet. WHERE u.permitNo = ?  AND f.fixtureDate >= CURDATE() AND f.premiumAreaAvailable = TRUE
        const results = result.rows;
        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});
    }    

});

// Update pitch status for a fixture (Bookmaker version with time rules) - Used when bookmker select a meeting to indicate status - "Working/Not Working)"
router.put('/my-premium-pitches/:fixtureId/:pitchId/:racecourseId/premium-status',authenticateToken,authorizeRoles('bookmaker'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { premiumStatus } = req.body;
        const permitNo = req.user.permitno; // from JWT

        const validStatuses = ['Not Applying', 'Applied'];
        if (!validStatuses.includes(premiumStatus)) {
            return res.status(400).json({ error: 'Invalid status for bookmaker' });
        }

        try {
            // Get fixture date for time checks
            const fixture = await db.query(
                `SELECT f.fixtureDate
                 FROM Fixture f
                 JOIN Pitch p ON p.racecourseId = f.racecourseId
                 WHERE f.fixtureId = $1 AND p.pitchId = $2 AND p.racecourseId = $3 AND p.ownerPermitNo = $4`,
                [fixtureId, pitchId, racecourseId, permitNo]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
                return res.status(404).json({ error: 'Fixture or pitch not found for this bookmaker' });
            }

            const fixtureDate = new Date(fixtureRows[0].fixtureDate);
            const now = new Date();

            // Time rules
            if (premiumStatus === 'Applied') {
                // Must be at least 7 days before fixture
                const minApplyDate = new Date(fixtureDate);
                minApplyDate.setDate(minApplyDate.getDate() - 2);
                if (now > minApplyDate) {
                    return res.status(400).json({
                        error: 'You must apply at least 2 days before the fixture date'
                    });
                }
            }

            if (premiumStatus === 'Not Applying') {
                // Must be before 9am on fixture date
                const deadline = new Date(fixtureDate);
                deadline.setHours(9, 0, 0, 0);
                if (now > deadline) {
                    return res.status(400).json({
                        error: 'You can only change to Not Working before 9am on fixture day'
                    });
                }
            }

            // Ensure FixturePitchStatus record exists
            const result = await db.query(
                `SELECT * FROM PremiumFixturePitch WHERE fixtureId = $1 AND pitchId = $2 AND racecourseId = $3`,
                [fixtureId, pitchId, racecourseId]
            );
            const existing = result.rows;
            if (existing.length === 0) {
                // Create it if not found
                await db.query(
                    `INSERT INTO PremiumFixturePitch (fixtureId, pitchId, racecourseId, permitNo, premiumStatus, updatedAt)
                     VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [fixtureId, pitchId, racecourseId, permitNo, premiumStatus]
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE PremiumFixturePitch
                     SET premiumStatus = $1, updatedAt = NOW()
                     WHERE fixtureId = $2 AND pitchId = $3 AND racecourseId = $4`,
                    [premiumStatus, fixtureId, pitchId, racecourseId]
                );
            }

            res.json({
                message: `Status updated to '${premiumStatus}' for your pitch ${pitchId} at racecourse ${racecourseId} in fixture ${fixtureId}`
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);




// Get all pitches for the next 3 weeks fixture (Bookmaker/SIS/Admin)
router.get('/upcoming' ,async (req, res) => {
//router.get('/',authenticateToken,authorizeRoles('bookmaker','sis', 'admin'),async (req, res) => {
        const fixtureId = req.params.fixtureId;

        try {
            const result = await db.query(`
           
                SELECT f.fixtureId, f.numberOfPremiumPitches,
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.name
                FROM Fixture f
                JOIN Racecourse r ON f.racecourseId = r.racecourseId
                WHERE f.fixtureDate >= CURRENT_DATE AND f.premiumAreaAvailable = TRUE 
                ORDER BY f.fixtureDate ASC`
            );
            const results = result.rows;
            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);
// Get pitches for a premium fixture (this is what setPitches returns in PremiumAttendancePage - pitches can then be mapped through with these props)
router.get('/:fixtureId/premium-pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        p.pitchId, 
        p.pitchLabel, 
        p.pitchNo, 
        u.name AS bookmakerName,
        u.permitNo,
        r.name AS racecourse,
        r.racecourseId,
        COALESCE(pfp.premiumStatus, 'Not Applying') AS premiumStatus,
        COALESCE(pfp.location, 'Main Ring') AS location
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN PremiumFixturePitch pfp
              ON pfp.pitchId = p.pitchId AND pfp.fixtureId = f.fixtureId
       WHERE f.fixtureId = $1 AND u.name !='Vacant' AND pfp.premiumStatus = 'Applied'
       ORDER BY p.pitchId`,
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
router.get('/:fixtureId/awarded-pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        p.pitchId, 
        p.pitchLabel, 
        p.pitchNo, 
        u.name AS bookmakerName,
        u.permitNo,
        r.name AS racecourse,
        r.racecourseId,
        CAST(f.fixtureDate AS DATE) AS fixtureDate,
        COALESCE(pfp.location, 'Main Ring') AS location,
        COALESCE(pfp.premiumStatus, 'Not Applying') AS premiumStatus
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN PremiumFixturePitch pfp
              ON pfp.pitchId = p.pitchId AND pfp.fixtureId = f.fixtureId
       WHERE f.fixtureId = $1 AND u.name !='Vacant' AND pfp.location ='Premium Area'
       ORDER BY p.pitchId`,
      [fixtureId]
    );
    const results = result.rows;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Update pitch location for a fixture (SIS/Admin only)
    router.put('/:fixtureId/:pitchId/:racecourseId/attendance',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { location } = req.body;      
    

        // Simple validation
        const validOption = ['Main Ring', 'Premium Area'];
        if (!validOption.includes(location)) {
            return res.status(400).json({ error: 'Invalid location option' });
        }

        try {
            // Get fixture date
            const fixture = await db.query(
                `SELECT fixtureDate FROM Fixture WHERE fixtureId = $1`,
                [fixtureId]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

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
                `INSERT INTO PremiumFixturePitch (fixtureId, pitchId, racecourseId, location)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (fixtureId, pitchId, racecourseId)
                DO UPDATE SET location = EXCLUDED.location`,
                [fixtureId, pitchId, racecourseId, location]
            );
            
            res.json({message: `Location updated to '${location}' for Pitch ${pitchId} at racecourse ${racecourseId} in Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);

 // ---- This is the code used for the premiumFixturePage ----------

   // Get all premium fixtures with racecourse name
    router.get('/', async (req, res) => {
        const fixtureId = req.params.fixtureId;
   
         try {
             const result = await db.query(
             `SELECT f.fixtureId, 
             CAST(f.fixtureDate AS DATE) AS fixtureDate,
             r.racecourseId,
             r.name 
             FROM Fixture f
             JOIN Racecourse r ON f.racecourseId = r.racecourseId
             WHERE f.fixtureDate >= CURRENT_DATE AND f.premiumAreaAvailable = TRUE
             ORDER BY f.fixtureDate ASC`
             );
         const results = result.rows;    
         res.json(results);
            } catch (err) {
             console.error("Error fetching fixtures:", err);
              res.status(500).json({ error: err.message });
          }
    });

    //PremiumAttendeesPage (Part 1) - (props are stored in a variable called attendees in PremiumAttendeesPage)

    router.get("/:racecourseId/attendance-list", async (req, res) => {
          const { racecourseId } = req.params;  
            try {
                 // Get all attendees for a particular fixture (Note pa.id is used for the unique key in attendees)
                 const result = await db.query(
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
                    JOIN PremiumAttendance pa
                            ON pa.pitchId = p.pitchId AND pa.fixtureId = f.fixtureId            
                    WHERE r.racecourseId = $1
                    ORDER BY f.fixtureDate ASC`,
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
    router.get('/racecourses', async (req, res) => { 
           
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
    });

   // Add new fixture
    router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { fixtureDate, racecourseId } = req.body;
         try {
            await db.query(
             `INSERT INTO Fixture (fixtureDate, racecourseId) VALUES ($1, $2)`,
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
                await db.query(`DELETE FROM Fixture WHERE fixtureId = $1`, [fixtureId]);
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
                `DELETE FROM PremiumAttendance WHERE fixtureId = $1`,
                [fixtureId]
                );
              // Insert all attendees
            for (const a of attendees) {
            await db.query(
                `INSERT INTO PremiumAttendance (fixtureId, pitchId, bookmakerPermitNo, attendedAt)
                VALUES ($1, $2, $3, NOW())`,
                [fixtureId, a.pitchId, a.bookmakerPermitNo]
            );
            }
        
            res.json({ message: "Attendees stored successfully" });
        } catch (err) {
                console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    }); 


// Update premiumArea for a fixture (Admin only)
    router.put('/:fixtureId/premiumArea',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { premiumAreaAvailable } = req.body;
        
        //const { numberOfPremiumPitches } = req.body;
    

        try {
            // Get fixture date
            const fixture = await db.query(
                `SELECT *
                    FROM Fixture f
                    JOIN Racecourse r ON r.racecourseId = f.racecourseId
                    WHERE f.fixtureId = $1`,
                [fixtureId]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            // Insert new row if not exists, else update
             await db.query(
                `UPDATE fixture 
                 SET premiumAreaAvailable = $1
                 
                 WHERE fixtureId = $2`,
                [premiumAreaAvailable, fixtureId ]
            );
            
            res.json({message: `Premium Area Avaiable updated to '${premiumAreaAvailable}' and number of preium pitches avaiable is at Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);  

// Update premiumArea for a fixture (Admin only)
    router.put('/:fixtureId/premiumPitches',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { numberOfPremiumPitches } = req.body;      
    

        try {
            // Get fixture date
            const fixture = await db.query(
                `SELECT *
                    FROM Fixture f
                    JOIN Racecourse r ON r.racecourseId = f.racecourseId
                    WHERE f.fixtureId = $1`,
                [fixtureId]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            // Insert new row if not exists, else update
             await db.query(
                `UPDATE fixture 
                 SET numberOfPremiumPitches = $1
                 WHERE fixtureId = $2`,
                [numberOfPremiumPitches, fixtureId ]
            );
            
            res.json({message: `Premium Area Avaiable updated to '${numberOfPremiumPitches}' in Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);    
   

module.exports = router;
