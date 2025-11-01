const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/* MySQL code only --
// Get fixtures + pitches for the logged-in bookmaker
//router.get('/my-fixtures', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
router.get('/my-corporate-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitNo; // from JWT

    try {
        const [results] = await db.query (
            `SELECT 
                f.fixtureId,
                f.corporateAreaAvailable,
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.racecourseId,
                r.name AS racecourseName,
                p.pitchId,
                p.pitchLabel,
                p.pitchNo,
            COALESCE(cfp.corporateStatus, 'Not Applying') AS corporateStatus   
            FROM users u
            JOIN Pitch p 
                ON u.permitNo = p.ownerPermitNo
            JOIN Racecourse r 
                ON p.racecourseId = r.racecourseId
            JOIN Fixture f
                ON r.racecourseId = f.racecourseId                
            LEFT JOIN corporateFixturePitch cfp
                ON cfp.fixtureId = f.fixtureId
                AND cfp.pitchId = p.pitchId
                AND cfp.permitNo = u.permitNo    
            WHERE u.permitNo = ?  AND f.corporateAreaAvailable = TRUE AND f.fixtureDate >= CURRENT_DATE 
            ORDER BY f.fixtureDate`,
            [permitNo]
        );
    // Left Join with FixturePitchStatus ensures we always see a row, even if no status has been set yet. WHERE u.permitNo = ?  AND f.fixtureDate >= CURDATE() AND f.corporateAreaAvailable = TRUE

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});
    }    

});

// Update pitch status for a fixture (Bookmaker version with time rules) - Used when bookmker select a meeting to indicate status - "Working/Not Working)"
// can be viewed on http://localhost:3000/my-corporate-pitches
router.put('/my-corporate-pitches/:fixtureId/:pitchId/:racecourseId/corporate-status',authenticateToken,authorizeRoles('bookmaker'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { corporateStatus } = req.body;
        const permitNo = req.user.permitNo; // from JWT

        const validStatuses = ['Not Applying', 'Applied'];
        if (!validStatuses.includes(corporateStatus)) {
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
            if (corporateStatus === 'Applied') {
                // Must be at least 7 days before fixture
                const minApplyDate = new Date(fixtureDate);
                minApplyDate.setDate(minApplyDate.getDate() - 2);
                if (now > minApplyDate) {
                    return res.status(400).json({
                        error: 'You must apply at least 2 days before the fixture date'
                    });
                }
            }

            if (corporateStatus === 'Not Applying') {
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
                `SELECT * FROM corporateFixturePitch WHERE fixtureId = ? AND pitchId = ? AND racecourseId = ?`,
                [fixtureId, pitchId, racecourseId]
            );

            if (existing.length === 0) {
                // Create it if not found
                await db.query(
                    `INSERT INTO corporateFixturePitch (fixtureId, pitchId, racecourseId, permitNo, corporateStatus, updatedAt)
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [fixtureId, pitchId, racecourseId, permitNo, corporateStatus]
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE corporateFixturePitch
                     SET corporateStatus = ?, updatedAt = NOW()
                     WHERE fixtureId = ? AND pitchId = ? AND racecourseId = ?`,
                    [corporateStatus, fixtureId, pitchId, racecourseId]
                );
            }

            res.json({
                message: `Status updated to '${corporateStatus}' for your pitch ${pitchId} at racecourse ${racecourseId} in fixture ${fixtureId}`
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
           
                SELECT f.fixtureId, f.numberOfcorporatePitches,
                CAST(f.fixtureDate AS DATE) AS fixtureDate,
                r.name
                FROM Fixture f
                JOIN Racecourse r ON f.racecourseId = r.racecourseId
                WHERE f.fixtureDate >= CURRENT_DATE AND f.corporateAreaAvailable = TRUE 
                ORDER BY f.fixtureDate ASC`
            );

            res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
    }
);
// Get pitches for a corporate fixture (this is what setPitches returns in corporateAttendancePage - pitches can then be mapped through with these props)
router.get('/:fixtureId/corporate-pitches', async (req, res) => {
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
        COALESCE(cfp.corporateStatus, 'Not Applying') AS corporateStatus,
        COALESCE(cfp.location, 'Main Ring') AS location
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN corporateFixturePitch cfp
              ON cfp.pitchId = p.pitchId AND cfp.fixtureId = f.fixtureId
       WHERE f.fixtureId = ? AND u.name !='Vacant' AND cfp.corporateStatus = 'Applied'
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
        COALESCE(cfp.location, 'Main Ring') AS location,
        COALESCE(cfp.corporateStatus, 'Not Applying') AS corporateStatus
       FROM Pitch p
       JOIN Users u ON u.permitNo = p.ownerPermitNo
       JOIN Fixture f ON f.racecourseId = p.racecourseId
       JOIN Racecourse r ON r.racecourseId = f.racecourseId
       LEFT JOIN corporateFixturePitch cfp
              ON cfp.pitchId = p.pitchId AND cfp.fixtureId = f.fixtureId
       WHERE f.fixtureId = ? AND u.name !='Vacant' AND cfp.location ='Main Ring & Corporate Area'
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
        const validOption = ['Main Ring', 'Main Ring & Corporate Area'];
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
                `INSERT INTO corporateFixturePitch (fixtureId, pitchId, racecourseId, location)
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

 // ---- This is the code used for the corporateFixturePage ----------

   // Get all corporate fixtures with racecourse name
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
             WHERE f.fixtureDate >= CURRENT_DATE AND f.corporateAreaAvailable = TRUE
             ORDER BY f.fixtureDate ASC`
             );
   
         res.json(results);
            } catch (err) {
             console.error("Error fetching fixtures:", err);
              res.status(500).json({ error: err.message });
          }
    });

    //corporateAttendeesPage (Part 1) - (props are stored in a variable called attendees in corporateAttendeesPage)

    router.get("/:racecourseId/attendance-list", async (req, res) => {
          const { racecourseId } = req.params;  
            try {
                 // Get all attendees for a particular fixture (Note ca.id is used for the unique key in attendees)
                 const [results] = await db.query(
                `SELECT
                    ca.id,
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
                    JOIN corporateAttendance ca
                            ON ca.pitchId = p.pitchId AND ca.fixtureId = f.fixtureId            
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
                `DELETE FROM corporateAttendance WHERE fixtureId = ?`,
                [fixtureId]
                );
              // Insert all attendees
            for (const a of attendees) {
            await db.query(
                `INSERT INTO corporateAttendance (fixtureId, pitchId, bookmakerPermitNo, attendedAt)
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


// Update corporateArea for a fixture (Admin only)
    router.put('/:fixtureId/corporateArea',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { corporateAreaAvailable } = req.body;
        
        //const { numberOfcorporatePitches } = req.body;
    

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
                 SET corporateAreaAvailable = ?
                 
                 WHERE fixtureId = ?`,
                [corporateAreaAvailable, fixtureId ]
            );
            
            res.json({message: `Corporate Area Avaiable updated to '${corporateAreaAvailable}' and number of preium pitches avaiable is at Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);  

// Update corporateArea for a fixture (Admin only)
    router.put('/:fixtureId/corporatePitches',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { numberOfcorporatePitches } = req.body;      
    

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
                 SET numberOfcorporatePitches = ?
                 WHERE fixtureId = ?`,
                [numberOfcorporatePitches, fixtureId ]
            );
            
            res.json({message: `Corporate Area Avaiable updated to '${numberOfcorporatePitches}' in Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);    
*/   


// PostgreSQL code only --
// Get fixtures + pitches for the logged-in bookmaker
//router.get('/my-fixtures', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {
router.get('/my-corporate-pitches', authenticateToken, authorizeRoles('bookmaker'), async (req, res) => {    
    const permitNo = req.user.permitNo; // from JWT

    try {
        const result = await db.query (
            `SELECT 
                f.fixtureid,
                f.corporateareaavailable,
                CAST(f.fixturedate AS DATE) AS fixturedate,
                r.racecourseid,
                r.name AS racecoursename,
                p.pitchid,
                p.pitchlabel,
                p.pitchno,
            COALESCE(cfp.corporatestatus 'Not Applying') AS corporatestatus   
            FROM users u
            JOIN pitch p 
                ON u.permitno = p.ownerpermitno
            JOIN racecourse r 
                ON p.racecourseid = r.racecourseid
            JOIN fixture f
                ON r.racecourseid = f.racecourseid                
            LEFT JOIN corporatefixturepitch cfp
                ON cfp.fixtureid = f.fixtureid
                AND cfp.pitchid = p.pitchid
                AND cfp.permitno = u.permitno    
            WHERE u.permitno = $1  AND f.corporateareaavailable = TRUE AND f.fixturedate >= CURRENT_DATE 
            ORDER BY f.fixtureDate`,
            [permitNo]
        );
    // Left Join with FixturePitchStatus ensures we always see a row, even if no status has been set yet. WHERE u.permitNo = ?  AND f.fixtureDate >= CURDATE() AND f.corporateAreaAvailable = TRUE
        const results = result.rows;
        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({error:err.message});
    }    

});

// Update pitch status for a fixture (Bookmaker version with time rules) - Used when bookmker select a meeting to indicate status - "Working/Not Working)"

router.put('/my-corporate-pitches/:fixtureId/:pitchId/:racecourseId/corporate-status',authenticateToken,authorizeRoles('bookmaker'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { corporateStatus } = req.body;
        const permitNo = req.user.permitNo; // from JWT

        const validStatuses = ['Not Applying', 'Applied'];
        if (!validStatuses.includes(corporateStatus)) {
            return res.status(400).json({ error: 'Invalid status for bookmaker' });
        }

        try {
            // Get fixture date for time checks
            const fixture = await db.query (
                `SELECT f.fixturedate
                 FROM fixture f
                 JOIN pitch p ON p.racecourseid = f.racecourseid
                 WHERE f.fixtureid = $1 AND p.pitchid = $2 AND p.racecourseid = $3 AND p.ownerpermitno = $4`,
                [fixtureId, pitchId, racecourseId, permitNo]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
                return res.status(404).json({ error: 'Fixture or pitch not found for this bookmaker' });
            }

            const fixtureDate = new Date(fixtureRows[0].fixturedate);
            const now = new Date();

            // Time rules
            if (corporateStatus === 'Applied') {
                // Must be at least 7 days before fixture
                const minApplyDate = new Date(fixtureDate);
                minApplyDate.setDate(minApplyDate.getDate() - 2);
                if (now > minApplyDate) {
                    return res.status(400).json({
                        error: 'You must apply at least 2 days before the fixture date'
                    });
                }
            }

            if (corporateStatus === 'Not Applying') {
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
                `SELECT * FROM corporatefixturePitch WHERE fixtureid = $1 AND pitchid = $2 AND racecourseid = $3`,
                [fixtureId, pitchId, racecourseId]
            );
            const existing = result.rows;
            if (existing.length === 0) {
                // Create it if not found
                await db.query(
                    `INSERT INTO corporatefixturepitch (fixtureid, pitchid, racecourseid, permitno, corporatestatus, updatedat)
                     VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [fixtureId, pitchId, racecourseId, permitNo, corporateStatus]
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE corporatefixturepitch
                     SET corporatestatus = $4, updatedat = NOW()
                     WHERE fixtureid = $1 AND pitchid = $2 AND racecourseid = $3`,
                    [fixtureId, pitchId, racecourseId, corporateStatus]
                );
            }

            res.json({
                message: `Status updated to '${corporateStatus}' for your pitch ${pitchId} at racecourse ${racecourseId} in fixture ${fixtureId}`
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
           
                SELECT f.fixtureid, f.numberofcorporatepitches,
                CAST(f.fixturedate AS DATE) AS fixturedate,
                r.name
                FROM fixture f
                JOIN racecourse r ON f.racecourseid = r.racecourseid
                WHERE f.fixturedate >= CURRENT_DATE AND f.corporateareaavailable = TRUE 
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
// Get pitches for a corporate fixture (this is what setPitches returns in corporateAttendancePage - pitches can then be mapped through with these props)
router.get('/:fixtureId/corporate-pitches', async (req, res) => {
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
        COALESCE(cfp.corporatestatus, 'Not Applying') AS corporatestatus,
        COALESCE(cfp.location, 'Main Ring') AS location
       FROM pitch p
       JOIN users u ON u.permitno = p.ownerpermitno
       JOIN fixture f ON f.racecourseid = p.racecourseid
       JOIN racecourse r ON r.racecourseid = f.racecourseid
       LEFT JOIN corporatefixturepitch cfp
              ON cfp.pitchid = p.pitchid AND cfp.fixtureid = f.fixtureid
       WHERE f.fixtureid = $1 AND u.name !='Vacant' AND cfp.corporatestatus = 'Applied'
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
router.get('/:fixtureId/awarded-pitches', async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        p.pitchid, 
        p.pitchlabel, 
        p.pitchNo, 
        u.name AS bookmakername,
        u.permitno,
        r.name AS racecourse,
        r.racecourseId,
        CAST(f.fixturedate AS DATE) AS fixturedate,
        COALESCE(cfp.location, 'Main Ring') AS location,
        COALESCE(cfp.corporatestatus, 'Not Applying') AS corporatestatus
       FROM pitch p
       JOIN users u ON u.permitno = p.ownerpermitno
       JOIN fixture f ON f.racecourseid = p.racecourseid
       JOIN racecourse r ON r.racecourseid = f.racecourseid
       LEFT JOIN corporatefixturepitch cfp
              ON cfp.pitchid = p.pitchid AND cfp.fixtureid = f.fixtureid
       WHERE f.fixtureid = $1 AND u.name !='Vacant' AND cfp.location ='Main Ring & Corporate Area'
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

// Update pitch location for a fixture (SIS/Admin only)
    router.put('/:fixtureId/:pitchId/:racecourseId/attendance',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId, pitchId, racecourseId } = req.params;
        const { location } = req.body;      
    

        // Simple validation
        const validOption = ['Main Ring', 'Main Ring & Corporate Area'];
        if (!validOption.includes(location)) {
            return res.status(400).json({ error: 'Invalid location option' });
        }

        try {
            // Get fixture date
            const fixture = await db.query(
                `SELECT fixturedate FROM fixture WHERE fixtureid = $1`,
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
                `INSERT INTO corporatefixturepitch (fixtureid, pitchid, racecourseid, location)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (fixtureid, pitchid, racecourseid)
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

 // ---- This is the code used for the corporateFixturePage ----------

   // Get all corporate fixtures with racecourse name
    router.get('/', async (req, res) => {
        const fixtureId = req.params.fixtureId;
   
         try {
             const result = await db.query(
             `SELECT f.fixtureid, 
             CAST(f.fixturedate AS DATE) AS fixturedate,
             r.racecourseid,
             r.name 
             FROM fixture f
             JOIN racecourse r ON f.racecourseid = r.racecourseid
             WHERE f.fixturedate >= CURRENT_DATE AND f.corporateareaavailable = TRUE
             ORDER BY f.fixturedate ASC`
             );

         const results = result.rows;   
         res.json(results);
            } catch (err) {
             console.error("Error fetching fixtures:", err);
              res.status(500).json({ error: err.message });
          }
    });

    //corporateAttendeesPage (Part 1) - (props are stored in a variable called attendees in corporateAttendeesPage)

    router.get("/:racecourseId/attendance-list", async (req, res) => {
          const { racecourseId } = req.params;  
            try {
                 // Get all attendees for a particular fixture (Note ca.id is used for the unique key in attendees)
                 const result = await db.query(
                `SELECT
                    ca.id,
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
                    JOIN corporateattendance ca
                            ON ca.pitchid = p.pitchid AND ca.fixtureid = f.fixtureid            
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
    router.get('/racecourses', async (req, res) => { 
           
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
                `DELETE FROM corporateattendance WHERE fixtureid = $1`,
                [fixtureId]
                );
              // Insert all attendees
            for (const a of attendees) {
            await db.query(
                `INSERT INTO corporateattendance (fixtureid, pitchid, bookmakerpermitno, attendedat)
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


// Update corporateArea for a fixture (Admin only)
    router.put('/:fixtureId/corporateArea',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { corporateAreaAvailable } = req.body;
        
        //const { numberOfcorporatePitches } = req.body;
    

        try {
            // Get fixture date
            const fixture = await db.query(
                `SELECT *
                    FROM fixture f
                    JOIN racecourse r ON r.racecourseid = f.racecourseid
                    WHERE f.fixtureid = $1`,
                [fixtureId]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            // Insert new row if not exists, else update
             await db.query(
                `UPDATE fixture 
                 SET corporateareaavailable = $1
                 
                 WHERE fixtureid = $2`,
                [corporateAreaAvailable, fixtureId ]
            );
            
            res.json({message: `Corporate Area Avaiable updated to '${corporateAreaAvailable}' and number of preium pitches avaiable is at Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);  

// Update corporateArea for a fixture (Admin only)
    router.put('/:fixtureId/corporatePitches',authenticateToken,authorizeRoles('admin'),async (req, res) => {
        const { fixtureId } = req.params;
        const { numberOfcorporatePitches } = req.body;      
    

        try {
            // Get fixture date
            const fixture = await db.query(
                `SELECT *
                    FROM fixture f
                    JOIN racecourse r ON r.racecourseid = f.racecourseid
                    WHERE f.fixtureid = $1`,
                [fixtureId]
            );
            const fixtureRows = fixture.rows;
            if (fixtureRows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

            // Insert new row if not exists, else update
             await db.query(
                `UPDATE fixture 
                 SET numberofcorporatepitches = $2
                 WHERE fixtureId = $1`,
                [fixtureId , numberOfcorporatePitches]
            );
            
            res.json({message: `Corporate Area Avaiable updated to '${numberOfcorporatePitches}' in Fixture ${fixtureId}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err});
        }
    }
);    
   
    
  

module.exports = router;

// DATE_FORMAT(f.fixtureDate, '%Y-%m-%d') AS fixtureDate,
// CAST(f.fixtureDate AS DATE) AS fixtureDate,

// WHERE f.fixtureDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 28 DAY)
// WHERE f.fixtureDate >= CURRENT_DATE  
